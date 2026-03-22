import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APIFY_ACTOR_ID = "REcGj6dyoIJ9Z7aE6";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapPropertyType(type: string): string {
  const map: Record<string, string> = {
    flat: "apartment",
    penthouse: "penthouse",
    duplex: "duplex",
    studio: "studio",
    chalet: "villa",
    countryHouse: "country_house",
    terraced: "townhouse",
  };
  return map[type] || type || "apartment";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const APIFY_TOKEN = Deno.env.get("APIFY_API_TOKEN");
  if (!APIFY_TOKEN) {
    return new Response(JSON.stringify({ error: "APIFY_API_TOKEN not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // 1. Pick the oldest pending job
    const { data: job, error: jobError } = await supabase
      .from("scrape_jobs")
      .select("*, zones(*)")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ message: "No pending jobs" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Mark as running
    await supabase
      .from("scrape_jobs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", job.id);

    const zone = job.zones;
    if (!zone?.idealista_location) {
      await supabase.from("scrape_jobs").update({
        status: "failed",
        error_message: "Zone has no idealista_location configured",
        completed_at: new Date().toISOString(),
      }).eq("id", job.id);
      return new Response(JSON.stringify({ error: "No idealista_location" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Start Apify run
    const operation = zone.idealista_operation || "sale";
    const maxItems = zone.max_items || 500;

    const startRes = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: zone.idealista_location,
          operation,
          propertyType: "homes",
          country: "es",
          maxItems,
          proxyConfiguration: {
            useApifyProxy: true,
            apifyProxyGroups: ["RESIDENTIAL"],
          },
        }),
      }
    );

    if (!startRes.ok) {
      const text = await startRes.text();
      throw new Error(`Apify start failed [${startRes.status}]: ${text}`);
    }

    const runData = await startRes.json();
    const runId = runData.data?.id;
    const datasetId = runData.data?.defaultDatasetId;

    await supabase.from("scrape_jobs").update({ apify_run_id: runId }).eq("id", job.id);

    // 4. Poll for completion (max 5 min)
    let status = "RUNNING";
    for (let i = 0; i < 60; i++) {
      await delay(5000);
      const checkRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
      );
      if (checkRes.ok) {
        const check = await checkRes.json();
        status = check.data?.status;
        console.log(`Apify run ${runId} status: ${status} (poll ${i + 1})`);
        if (status === "SUCCEEDED" || status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
          break;
        }
      }
    }

    if (status !== "SUCCEEDED") {
      throw new Error(`Apify run ended with status: ${status}`);
    }

    // 5. Fetch results
    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&format=json`
    );
    if (!itemsRes.ok) throw new Error(`Failed to fetch dataset: ${itemsRes.status}`);
    const items = await itemsRes.json();

    // 6. Upsert into properties table
    const tableName = operation === "rent" ? "properties_for_rent" : "properties_for_sale";
    let upsertCount = 0;
    const batchSize = 50;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
        .map((item: any) => {
          const externalId = String(item.propertyCode || item.adid || item.id || "");
          if (!externalId) return null;
          const price = Number(item.price || 0);
          if (price <= 0) return null;
          const builtSize = Number(item.size || item.constructedArea || 0) || null;

          if (operation === "rent") {
            return {
              external_id: externalId,
              source: "idealista",
              title: item.suggestedTexts?.title || item.title || null,
              property_type: mapPropertyType(item.typology || item.propertyType || ""),
              monthly_rent: price,
              rent_per_sqm: builtSize && builtSize > 0 ? Math.round((price / builtSize) * 100) / 100 : null,
              built_size_sqm: builtSize,
              bedrooms: Number(item.rooms || item.bedrooms || 0) || null,
              bathrooms: Number(item.bathrooms || 0) || null,
              address: item.address || item.street || null,
              city: zone.name,
              latitude: Number(item.latitude || 0) || null,
              longitude: Number(item.longitude || 0) || null,
              description: item.description || null,
              features: item.features ? Object.keys(item.features).filter((k: string) => item.features[k]) : null,
              image_urls: item.multimedia?.images?.map((img: any) => img.url || img.src) || null,
              listing_url: item.url ? `https://www.idealista.com${item.url}` : null,
              zone_id: zone.id,
              is_active: true,
              scraped_at: new Date().toISOString(),
            };
          } else {
            return {
              external_id: externalId,
              source: "idealista",
              title: item.suggestedTexts?.title || item.title || null,
              property_type: mapPropertyType(item.typology || item.propertyType || ""),
              price,
              price_per_sqm: builtSize && builtSize > 0 ? Math.round(price / builtSize) : null,
              built_size_sqm: builtSize,
              plot_size_sqm: Number(item.plotSize || 0) || null,
              terrace_size_sqm: Number(item.terraceSize || 0) || null,
              bedrooms: Number(item.rooms || item.bedrooms || 0) || null,
              bathrooms: Number(item.bathrooms || 0) || null,
              address: item.address || item.street || null,
              city: zone.name,
              latitude: Number(item.latitude || 0) || null,
              longitude: Number(item.longitude || 0) || null,
              description: item.description || null,
              features: item.features ? Object.keys(item.features).filter((k: string) => item.features[k]) : null,
              image_urls: item.multimedia?.images?.map((img: any) => img.url || img.src) || null,
              listing_url: item.url ? `https://www.idealista.com${item.url}` : null,
              zone_id: zone.id,
              is_active: true,
              scraped_at: new Date().toISOString(),
            };
          }
        })
        .filter(Boolean);

      if (batch.length > 0) {
        const { error } = await supabase
          .from(tableName)
          .upsert(batch, { onConflict: "external_id,source" });
        if (!error) upsertCount += batch.length;
        else console.error(`Upsert batch error:`, error.message);
      }
    }

    // 7. Update job and zone
    await supabase.from("scrape_jobs").update({
      status: "completed",
      items_found: items.length,
      items_upserted: upsertCount,
      completed_at: new Date().toISOString(),
    }).eq("id", job.id);

    await supabase.from("zones").update({
      last_scraped_at: new Date().toISOString(),
      last_scrape_count: items.length,
      last_scrape_status: "success",
      total_properties: upsertCount,
    }).eq("id", zone.id);

    return new Response(JSON.stringify({
      success: true,
      job_id: job.id,
      zone: zone.name,
      items_found: items.length,
      items_upserted: upsertCount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("process-scrape-job error:", error);

    // Try to update the job as failed
    try {
      const supabase2 = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      // We can't easily get job.id here if it failed before assignment,
      // but the running job will be the one that failed
      await supabase2.from("scrape_jobs").update({
        status: "failed",
        error_message: error.message,
        completed_at: new Date().toISOString(),
      }).eq("status", "running").order("started_at", { ascending: false }).limit(1);
    } catch (_) { /* ignore cleanup errors */ }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

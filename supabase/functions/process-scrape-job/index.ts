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

function extractBooleanFeatures(item: any): Record<string, boolean> {
  const features = item.features || {};
  const desc = (item.description || "").toLowerCase();
  return {
    has_pool: !!features.hasSwimmingPool || desc.includes("piscina") || desc.includes("pool"),
    has_garage: !!features.hasGarage || !!features.hasParkingSpace || desc.includes("garaje") || desc.includes("garage"),
    has_terrace: !!features.hasTerrace || desc.includes("terraza") || desc.includes("terrace"),
    has_garden: !!features.hasGarden || desc.includes("jardín") || desc.includes("garden"),
    has_lift: !!features.hasLift || desc.includes("ascensor") || desc.includes("elevator"),
    has_ac: !!features.hasAirConditioning || desc.includes("aire acondicionado") || desc.includes("air conditioning"),
    has_sea_views: !!features.hasSeaViews || desc.includes("vista al mar") || desc.includes("sea view"),
    has_balcony: !!features.hasBalcony || desc.includes("balcón") || desc.includes("balcony"),
    has_storage: !!features.hasStorageRoom || desc.includes("trastero") || desc.includes("storage"),
    is_exterior: !!features.isExterior || !!item.exterior,
  };
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
    let manualZoneId: string | null = null;
    try {
      const body = await req.json();
      if (body?.zone_id) manualZoneId = body.zone_id;
    } catch (_) { /* no body */ }

    if (manualZoneId) {
      await supabase.from("scrape_jobs").insert({ zone_id: manualZoneId, status: "pending" });
    }

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

    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&format=json`
    );
    if (!itemsRes.ok) throw new Error(`Failed to fetch dataset: ${itemsRes.status}`);
    const items = await itemsRes.json();

    // Upsert into unified properties table
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
          const boolFeatures = extractBooleanFeatures(item);

          return {
            property_code: externalId,
            operation,
            source: "idealista",
            price,
            price_per_m2: builtSize && builtSize > 0 ? Math.round(price / builtSize) : null,
            property_type: mapPropertyType(item.typology || item.propertyType || ""),
            size_m2: builtSize,
            rooms: Number(item.rooms || item.bedrooms || 0) || null,
            bathrooms: Number(item.bathrooms || 0) || null,
            floor: item.floor || null,
            condition: item.condition || null,
            address: item.address || item.street || null,
            municipality: zone.name,
            province: zone.province || null,
            district: item.district || null,
            location_id: zone.idealista_location,
            latitude: Number(item.latitude || 0) || null,
            longitude: Number(item.longitude || 0) || null,
            description: item.description || null,
            thumbnail_url: item.thumbnail || item.multimedia?.images?.[0]?.url || null,
            images: item.multimedia?.images?.map((img: any) => img.url || img.src) || null,
            idealista_url: item.url ? `https://www.idealista.com${item.url}` : null,
            agency_name: item.agencyName || null,
            agency_logo: item.agencyLogo || null,
            zone_id: zone.id,
            scraped_at: new Date().toISOString(),
            ...boolFeatures,
          };
        })
        .filter(Boolean);

      if (batch.length > 0) {
        const { error } = await supabase
          .from("properties")
          .upsert(batch, { onConflict: "property_code,source" });
        if (!error) upsertCount += batch.length;
        else console.error(`Upsert batch error:`, error.message);
      }
    }

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

    try {
      const supabase2 = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
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

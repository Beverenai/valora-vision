import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Helpers ──────────────────────────────────────────────
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapPropertyType(idealistaType: string): string {
  const map: Record<string, string> = {
    flat: "apartment",
    penthouse: "penthouse",
    duplex: "duplex",
    studio: "studio",
    chalet: "villa",
    countryHouse: "country_house",
    terraced: "townhouse",
  };
  return map[idealistaType] || idealistaType || "apartment";
}

// ─── Apify Actor for Idealista ───────────────────────────
const APIFY_ACTOR_ID = "REcGj6dyoIJ9Z7aE6";

async function fetchIdealistaViaApify(
  apifyToken: string,
  locationId: string,
  operation: "sale" | "rent",
  maxItems: number = 50
): Promise<any[]> {
  // 1. Start the Actor run
  const input = {
    maxItems,
    operation,
    propertyType: "homes",
    country: "es",
    location: locationId,
    propertyCodes: [],
    sortBy: "mostRecent",
    fetchDetails: false,
    fetchStats: false,
    minPrice: "0",
    maxPrice: "0",
    minSize: "0",
    maxSize: "0",
    publicationDate: "",
    airConditioning: false,
    fittedWardrobes: false,
    lift: false,
    balcony: false,
    terrace: false,
    exterior: false,
    garage: false,
    garden: false,
    swimmingPool: false,
    storageRoom: false,
    accessible: false,
    seaViews: false,
    luxury: false,
    plan: false,
    virtualTour: false,
    agency: "",
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"],
    },
  };

  console.log(`Starting Apify Actor for ${operation} in ${locationId}`);

  const startRes = await fetch(
    `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${apifyToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!startRes.ok) {
    const text = await startRes.text();
    console.error(`Apify start error [${startRes.status}]: ${text}`);
    throw new Error(`Failed to start Apify Actor: ${startRes.status}`);
  }

  const runData = await startRes.json();
  const runId = runData.data?.id;
  const datasetId = runData.data?.defaultDatasetId;

  if (!runId || !datasetId) {
    throw new Error("No runId or datasetId returned from Apify");
  }

  console.log(`Apify run started: ${runId}, dataset: ${datasetId}`);

  // 2. Poll for completion (max ~5 minutes)
  const maxPolls = 60;
  const pollInterval = 5000;

  for (let i = 0; i < maxPolls; i++) {
    await delay(pollInterval);

    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`
    );

    if (!statusRes.ok) {
      console.error(`Apify poll error [${statusRes.status}]`);
      continue;
    }

    const statusData = await statusRes.json();
    const status = statusData.data?.status;

    console.log(`Apify run ${runId} status: ${status} (poll ${i + 1}/${maxPolls})`);

    if (status === "SUCCEEDED") {
      break;
    } else if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Apify Actor run ${status}`);
    }
    // RUNNING or READY — keep polling
  }

  // 3. Fetch dataset items
  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}&format=json`
  );

  if (!itemsRes.ok) {
    const text = await itemsRes.text();
    console.error(`Apify dataset error [${itemsRes.status}]: ${text}`);
    throw new Error(`Failed to fetch Apify dataset: ${itemsRes.status}`);
  }

  const items = await itemsRes.json();
  console.log(`Apify returned ${items.length} items for ${operation}`);
  return items;
}

// ─── Airbnb via RapidAPI (unchanged) ─────────────────────
async function fetchAirbnbListings(
  rapidApiKey: string,
  city: string,
  maxPages: number = 2
): Promise<any[]> {
  const allListings: any[] = [];
  const host = "airbnb-search.p.rapidapi.com";

  for (let page = 1; page <= maxPages; page++) {
    const params = new URLSearchParams({
      location: city,
      page: String(page),
    });

    const url = `https://${host}/stays/search?${params.toString()}`;
    console.log(`Fetching Airbnb page ${page} for ${city}`);

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": host,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Airbnb API error [${res.status}]: ${text}`);
      break;
    }

    const data = await res.json();
    const listings = data?.results || data?.data || [];

    if (listings.length === 0) break;
    allListings.push(...listings);

    if (page < maxPages) await delay(1500);
  }

  return allListings;
}

// ─── Deactivate stale properties ─────────────────────────
async function deactivateStaleProperties(
  supabase: any,
  freshCodes: string[],
  zoneId: string,
  operation: string
): Promise<number> {
  if (freshCodes.length === 0 || !zoneId) return 0;

  const { data: existing, error: fetchErr } = await supabase
    .from("properties")
    .select("id, property_code")
    .eq("zone_id", zoneId)
    .eq("operation", operation)
    .eq("is_active", true);

  if (fetchErr || !existing) {
    console.error("Deactivation fetch error:", fetchErr?.message);
    return 0;
  }

  const freshSet = new Set(freshCodes);
  const staleIds = existing
    .filter((p: any) => !freshSet.has(p.property_code))
    .map((p: any) => p.id);

  if (staleIds.length === 0) return 0;

  let deactivated = 0;
  for (let i = 0; i < staleIds.length; i += 100) {
    const chunk = staleIds.slice(i, i + 100);
    const { error } = await supabase
      .from("properties")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in("id", chunk);
    if (!error) deactivated += chunk.length;
    else console.error("Deactivation batch error:", error.message);
  }

  console.log(`Deactivated ${deactivated} stale ${operation} properties in zone ${zoneId}`);
  return deactivated;
}

// ─── Upsert sale listings into unified properties ────────
async function upsertSaleListings(supabase: any, listings: any[], city: string, zoneId: string | null) {
  let count = 0;
  const freshCodes: string[] = [];
  for (const item of listings) {
    try {
      const externalId = String(item.propertyCode || item.adid || item.id || "");
      if (!externalId) continue;
      freshCodes.push(externalId);
      const price = Number(item.price || 0);
      if (price <= 0) continue;
      const builtSize = Number(item.size || item.constructedArea || 0) || null;

      const record = {
        property_code: externalId,
        operation: "sale",
        source: "idealista",
        is_active: true,
        price,
        price_per_m2: builtSize && builtSize > 0 ? Math.round(price / builtSize) : null,
        property_type: mapPropertyType(item.typology || item.propertyType || ""),
        size_m2: builtSize,
        rooms: Number(item.rooms || item.bedrooms || 0) || null,
        bathrooms: Number(item.bathrooms || 0) || null,
        address: item.address || item.street || null,
        municipality: city,
        latitude: Number(item.latitude || 0) || null,
        longitude: Number(item.longitude || 0) || null,
        description: item.description || null,
        thumbnail_url: item.thumbnail || item.multimedia?.images?.[0]?.url || null,
        images: item.multimedia?.images?.map((img: any) => img.url || img.src) || null,
        idealista_url: item.url ? `https://www.idealista.com${item.url}` : null,
        zone_id: zoneId,
        scraped_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("properties")
        .upsert(record, { onConflict: "property_code,source" });

      if (error) {
        console.error(`Upsert sale error for ${externalId}:`, error.message);
      } else {
        count++;
      }
    } catch (e) {
      console.error("Sale listing parse error:", e);
    }
  }
  return { count, freshCodes };
}

// ─── Upsert rental listings into unified properties ──────
async function upsertRentListings(supabase: any, listings: any[], city: string, zoneId: string | null) {
  let count = 0;
  const freshCodes: string[] = [];
  for (const item of listings) {
    try {
      const externalId = String(item.propertyCode || item.adid || item.id || "");
      if (!externalId) continue;
      freshCodes.push(externalId);
      const monthlyRent = Number(item.price || item.priceByArea || 0);
      if (monthlyRent <= 0) continue;
      const builtSize = Number(item.size || item.constructedArea || 0) || null;

      const record = {
        property_code: externalId,
        operation: "rent",
        source: "idealista",
        is_active: true,
        price: monthlyRent,
        price_per_m2: builtSize && builtSize > 0 ? Math.round((monthlyRent / builtSize) * 100) / 100 : null,
        property_type: mapPropertyType(item.typology || item.propertyType || ""),
        size_m2: builtSize,
        rooms: Number(item.rooms || item.bedrooms || 0) || null,
        bathrooms: Number(item.bathrooms || 0) || null,
        address: item.address || item.street || null,
        municipality: city,
        latitude: Number(item.latitude || 0) || null,
        longitude: Number(item.longitude || 0) || null,
        description: item.description || null,
        thumbnail_url: item.thumbnail || item.multimedia?.images?.[0]?.url || null,
        images: item.multimedia?.images?.map((img: any) => img.url || img.src) || null,
        idealista_url: item.url ? `https://www.idealista.com${item.url}` : null,
        zone_id: zoneId,
        scraped_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("properties")
        .upsert(record, { onConflict: "property_code,source" });

      if (error) {
        console.error(`Upsert rent error for ${externalId}:`, error.message);
      } else {
        count++;
      }
    } catch (e) {
      console.error("Rent listing parse error:", e);
    }
  }
  return { count, freshCodes };
}

// ─── Upsert short-term rental listings ───────────────────
async function upsertSTRListings(supabase: any, listings: any[], city: string, zoneId: string | null) {
  let count = 0;
  for (const item of listings) {
    try {
      const externalId = String(item.id || item.listingId || "");
      if (!externalId) continue;

      const pricePerNight = Number(item.price?.rate?.amount || item.price?.total || item.pricePerNight || 0);

      const record = {
        external_id: externalId,
        source: "airbnb",
        title: item.name || item.title || null,
        property_type: mapPropertyType(item.roomType || item.propertyType || "apartment"),
        city: city,
        bedrooms: Number(item.bedrooms || item.beds || 0) || null,
        bathrooms: Number(item.bathrooms || 0) || null,
        avg_daily_rate: pricePerNight || null,
        avg_weekly_rate: pricePerNight ? Math.round(pricePerNight * 7 * 0.9) : null,
        avg_monthly_rate: pricePerNight ? Math.round(pricePerNight * 30 * 0.75) : null,
        occupancy_rate: Number(item.occupancyRate || 0.65) || 0.65,
        high_season_daily_rate: pricePerNight ? Math.round(pricePerNight * 1.4) : null,
        low_season_daily_rate: pricePerNight ? Math.round(pricePerNight * 0.7) : null,
        annual_revenue: pricePerNight ? Math.round(pricePerNight * 365 * 0.65) : null,
        review_count: Number(item.reviewsCount || item.reviews?.count || 0) || null,
        rating: Number(item.avgRating || item.rating || item.starRating || 0) || null,
        latitude: Number(item.lat || item.coordinate?.latitude || 0) || null,
        longitude: Number(item.lng || item.coordinate?.longitude || 0) || null,
        zone_id: zoneId,
        scraped_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("short_term_rentals")
        .upsert(record, { onConflict: "external_id,source" });

      if (error) {
        console.error(`Upsert STR error for ${externalId}:`, error.message);
      } else {
        count++;
      }
    } catch (e) {
      console.error("STR listing parse error:", e);
    }
  }
  return count;
}

// ─── Main Handler ─────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const APIFY_TOKEN = Deno.env.get("APIFY_API_TOKEN");
    if (!APIFY_TOKEN) {
      throw new Error("APIFY_API_TOKEN is not configured");
    }

    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY"); // still used for Airbnb

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { zone_id, location_id, zone_name, scrape_sale, scrape_rent, scrape_str } = body;

    const doSale = scrape_sale !== false;
    const doRent = scrape_rent !== false;
    const doSTR = scrape_str !== false;

    const results: Record<string, any> = {};

    // 1. Idealista Sales via Apify
    if (doSale && location_id) {
      try {
        console.log(`=== Scraping Idealista SALES for ${zone_name} (${location_id}) via Apify ===`);
        const saleListings = await fetchIdealistaViaApify(APIFY_TOKEN, location_id, "sale", 50);
        console.log(`Found ${saleListings.length} sale listings`);
        const saleResult = await upsertSaleListings(supabase, saleListings, zone_name, zone_id || null);
        results.sale_count = saleResult.count;
        console.log(`Upserted ${results.sale_count} sale properties`);

        // Deactivate properties no longer in the fresh batch
        if (zone_id && saleResult.freshCodes.length > 0) {
          results.sale_deactivated = await deactivateStaleProperties(supabase, saleResult.freshCodes, zone_id, "sale");
        }
      } catch (e) {
        console.error("Sale scrape failed:", e);
        results.sale_error = String(e);
      }
    }

    // 2. Idealista Rentals via Apify
    if (doRent && location_id) {
      try {
        console.log(`=== Scraping Idealista RENTALS for ${zone_name} (${location_id}) via Apify ===`);
        const rentListings = await fetchIdealistaViaApify(APIFY_TOKEN, location_id, "rent", 50);
        console.log(`Found ${rentListings.length} rental listings`);
        const rentResult = await upsertRentListings(supabase, rentListings, zone_name, zone_id || null);
        results.rent_count = rentResult.count;
        console.log(`Upserted ${results.rent_count} rental properties`);

        // Deactivate properties no longer in the fresh batch
        if (zone_id && rentResult.freshCodes.length > 0) {
          results.rent_deactivated = await deactivateStaleProperties(supabase, rentResult.freshCodes, zone_id, "rent");
        }
      } catch (e) {
        console.error("Rent scrape failed:", e);
        results.rent_error = String(e);
      }
    }

    // 3. Airbnb STR (still via RapidAPI if key available)
    if (doSTR && RAPIDAPI_KEY) {
      try {
        console.log(`=== Scraping Airbnb STR for ${zone_name} ===`);
        const strListings = await fetchAirbnbListings(RAPIDAPI_KEY, zone_name, 2);
        console.log(`Found ${strListings.length} STR listings`);
        results.str_count = await upsertSTRListings(supabase, strListings, zone_name, zone_id || null);
        console.log(`Upserted ${results.str_count} STR properties`);
      } catch (e) {
        console.error("STR scrape failed:", e);
        results.str_error = String(e);
      }
    } else if (doSTR && !RAPIDAPI_KEY) {
      console.log("Skipping Airbnb STR — RAPIDAPI_KEY not configured");
      results.str_skipped = "RAPIDAPI_KEY not configured";
    }

    // 4. Refresh the active_listings materialized view
    try {
      console.log("Refreshing active_listings materialized view...");
      await supabase.rpc("refresh_active_listings");
      console.log("active_listings refreshed successfully");
    } catch (refreshErr) {
      console.error("Failed to refresh active_listings:", refreshErr);
    }

    // 5. Update scrape_zones.last_scraped_at
    if (zone_id) {
      const totalCount = (results.sale_count || 0) + (results.rent_count || 0) + (results.str_count || 0);
      await supabase
        .from("scrape_zones")
        .update({
          last_scraped_at: new Date().toISOString(),
          property_count: totalCount,
        })
        .eq("id", zone_id);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("scrape-properties error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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

// ─── Idealista via RapidAPI (idealista7 by scraperium) ────
async function fetchIdealistaListings(
  rapidApiKey: string,
  locationId: string,
  operation: "sale" | "rent",
  maxPages: number = 3
): Promise<any[]> {
  const allListings: any[] = [];
  const host = "idealista7.p.rapidapi.com";

  for (let page = 1; page <= maxPages; page++) {
    const params = new URLSearchParams({
      operation,
      locationId,
      maxItems: "40",
      numPage: String(page),
      location: "es",
      locale: "en",
      order: "relevance",
    });

    const url = `https://${host}/list?${params.toString()}`;
    console.log(`Fetching Idealista ${operation} page ${page}: ${url}`);

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": host,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Idealista API error [${res.status}]: ${text}`);
      break;
    }

    const data = await res.json();
    const listings = data?.elementList || data?.elements || [];

    if (listings.length === 0) break;
    allListings.push(...listings);

    // Rate limiting
    if (page < maxPages) await delay(1500);
  }

  return allListings;
}

// ─── Airbnb via RapidAPI (airbnb-search by ntd119) ────────
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

// ─── Upsert sale listings ─────────────────────────────────
async function upsertSaleListings(supabase: any, listings: any[], city: string, zoneId: string | null) {
  let count = 0;
  for (const item of listings) {
    try {
      const externalId = String(item.propertyCode || item.adid || item.id || "");
      if (!externalId) continue;

      const price = Number(item.price || 0);
      if (price <= 0) continue;

      const builtSize = Number(item.size || item.constructedArea || 0) || null;
      const pricePerSqm = builtSize && builtSize > 0 ? Math.round(price / builtSize) : null;

      const record = {
        external_id: externalId,
        source: "idealista",
        title: item.suggestedTexts?.title || item.title || null,
        property_type: mapPropertyType(item.typology || item.propertyType || ""),
        price,
        price_per_sqm: pricePerSqm,
        built_size_sqm: builtSize,
        plot_size_sqm: Number(item.plotSize || 0) || null,
        terrace_size_sqm: Number(item.terraceSize || 0) || null,
        bedrooms: Number(item.rooms || item.bedrooms || 0) || null,
        bathrooms: Number(item.bathrooms || 0) || null,
        address: item.address || item.street || null,
        city: city,
        latitude: Number(item.latitude || 0) || null,
        longitude: Number(item.longitude || 0) || null,
        description: item.description || null,
        features: item.features ? Object.keys(item.features).filter((k: string) => item.features[k]) : null,
        image_urls: item.multimedia?.images?.map((img: any) => img.url || img.src) || item.images || null,
        listing_url: item.url ? `https://www.idealista.com${item.url}` : null,
        listed_date: item.listingDate || null,
        zone_id: zoneId,
        is_active: true,
        scraped_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("properties_for_sale")
        .upsert(record, { onConflict: "external_id,source" });

      if (error) {
        console.error(`Upsert sale error for ${externalId}:`, error.message);
      } else {
        count++;
      }
    } catch (e) {
      console.error("Sale listing parse error:", e);
    }
  }
  return count;
}

// ─── Upsert rental listings ──────────────────────────────
async function upsertRentListings(supabase: any, listings: any[], city: string, zoneId: string | null) {
  let count = 0;
  for (const item of listings) {
    try {
      const externalId = String(item.propertyCode || item.adid || item.id || "");
      if (!externalId) continue;

      const monthlyRent = Number(item.price || item.priceByArea || 0);
      if (monthlyRent <= 0) continue;

      const builtSize = Number(item.size || item.constructedArea || 0) || null;
      const rentPerSqm = builtSize && builtSize > 0 ? Math.round((monthlyRent / builtSize) * 100) / 100 : null;

      const record = {
        external_id: externalId,
        source: "idealista",
        title: item.suggestedTexts?.title || item.title || null,
        property_type: mapPropertyType(item.typology || item.propertyType || ""),
        monthly_rent: monthlyRent,
        rent_per_sqm: rentPerSqm,
        built_size_sqm: builtSize,
        plot_size_sqm: Number(item.plotSize || 0) || null,
        terrace_size_sqm: Number(item.terraceSize || 0) || null,
        bedrooms: Number(item.rooms || item.bedrooms || 0) || null,
        bathrooms: Number(item.bathrooms || 0) || null,
        address: item.address || item.street || null,
        city: city,
        latitude: Number(item.latitude || 0) || null,
        longitude: Number(item.longitude || 0) || null,
        description: item.description || null,
        features: item.features ? Object.keys(item.features).filter((k: string) => item.features[k]) : null,
        image_urls: item.multimedia?.images?.map((img: any) => img.url || img.src) || item.images || null,
        listing_url: item.url ? `https://www.idealista.com${item.url}` : null,
        listed_date: item.listingDate || null,
        is_furnished: item.furnished ? "fully" : null,
        rental_type: "long_term",
        zone_id: zoneId,
        is_active: true,
        scraped_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("properties_for_rent")
        .upsert(record, { onConflict: "external_id,source" });

      if (error) {
        console.error(`Upsert rent error for ${externalId}:`, error.message);
      } else {
        count++;
      }
    } catch (e) {
      console.error("Rent listing parse error:", e);
    }
  }
  return count;
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
        avg_weekly_rate: pricePerNight ? Math.round(pricePerNight * 7 * 0.9) : null,  // ~10% weekly discount
        avg_monthly_rate: pricePerNight ? Math.round(pricePerNight * 30 * 0.75) : null,  // ~25% monthly discount
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
    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    if (!RAPIDAPI_KEY) {
      throw new Error("RAPIDAPI_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { zone_id, location_id, zone_name, scrape_sale, scrape_rent, scrape_str } = body;

    // Defaults: scrape everything
    const doSale = scrape_sale !== false;
    const doRent = scrape_rent !== false;
    const doSTR = scrape_str !== false;

    const results: Record<string, number> = {};

    // 1. Idealista Sales
    if (doSale && location_id) {
      try {
        console.log(`=== Scraping Idealista SALES for ${zone_name} (${location_id}) ===`);
        const saleListings = await fetchIdealistaListings(RAPIDAPI_KEY, location_id, "sale", 3);
        console.log(`Found ${saleListings.length} sale listings`);
        results.sale_count = await upsertSaleListings(supabase, saleListings, zone_name, zone_id || null);
        console.log(`Upserted ${results.sale_count} sale properties`);
      } catch (e) {
        console.error("Sale scrape failed:", e);
        results.sale_error = String(e);
      }
      await delay(2000);
    }

    // 2. Idealista Rentals
    if (doRent && location_id) {
      try {
        console.log(`=== Scraping Idealista RENTALS for ${zone_name} (${location_id}) ===`);
        const rentListings = await fetchIdealistaListings(RAPIDAPI_KEY, location_id, "rent", 3);
        console.log(`Found ${rentListings.length} rental listings`);
        results.rent_count = await upsertRentListings(supabase, rentListings, zone_name, zone_id || null);
        console.log(`Upserted ${results.rent_count} rental properties`);
      } catch (e) {
        console.error("Rent scrape failed:", e);
        results.rent_error = String(e);
      }
      await delay(2000);
    }

    // 3. Airbnb STR
    if (doSTR) {
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
    }

    // 4. Update scrape_zones.last_scraped_at
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

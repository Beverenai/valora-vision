import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const RESALES_BASE_URL = "https://webapi.resales-online.com/V6";

// ─── Types ───────────────────────────────────────────────
interface ResalesConfig {
  id: string;
  contact_id: string;
  api_key: string;
  filter_alias: string;
  filter_id: number;
  province: string;
}

// ─── API Calls ───────────────────────────────────────────
async function searchProperties(config: ResalesConfig, page = 1, pageSize = 50) {
  const params = new URLSearchParams({
    p1: config.contact_id,
    p2: config.api_key,
    p_agency_filterid: String(config.filter_id),
    P_Lang: "1,2",
    P_PageSize: String(pageSize),
    P_PageNo: String(page),
    P_SortType: "0",
    p_images: "3",
    P_Dimension: "1",
    P_Currency: "EUR",
    P_showdecree218: "YES",
  });

  const url = `${RESALES_BASE_URL}/SearchProperties?${params}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Resales API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

// ─── Data Transformation ─────────────────────────────────
function mapPropertyType(rolType: string, rolSubType: string): string {
  const typeMap: Record<string, string> = {
    "Apartment": "apartment",
    "Flat": "apartment",
    "Penthouse": "penthouse",
    "Duplex": "duplex",
    "Studio": "studio",
    "Ground Floor Apartment": "apartment",
    "Middle Floor Apartment": "apartment",
    "Top Floor Apartment": "apartment",
    "Garden Apartment": "apartment",
    "Villa": "villa",
    "Detached Villa": "villa",
    "Semi-Detached House": "townhouse",
    "Town House": "townhouse",
    "Terraced House": "townhouse",
    "Country House": "finca",
    "Finca": "finca",
    "Plot": "plot",
    "Commercial": "commercial",
  };
  return typeMap[rolSubType] || typeMap[rolType] || "other";
}

function extractFeatures(property: any): Record<string, boolean> {
  const features: Record<string, boolean> = {
    has_pool: false,
    has_garage: false,
    has_sea_views: false,
    has_terrace: false,
    has_garden: false,
    has_lift: false,
    has_ac: false,
    has_balcony: false,
    has_storage: false,
  };

  const featureText = JSON.stringify(property.Features || {}).toLowerCase();
  const description = (property.Description || "").toLowerCase();

  if (featureText.includes("pool") || description.includes("pool")) features.has_pool = true;
  if (featureText.includes("garage") || featureText.includes("parking")) features.has_garage = true;
  if (featureText.includes("sea view") || description.includes("sea view") || description.includes("vista al mar")) features.has_sea_views = true;
  if (featureText.includes("terrace") || property.Terrace > 0) features.has_terrace = true;
  if (featureText.includes("garden")) features.has_garden = true;
  if (featureText.includes("lift") || featureText.includes("elevator")) features.has_lift = true;
  if (featureText.includes("air conditioning") || featureText.includes("climate")) features.has_ac = true;
  if (featureText.includes("balcony")) features.has_balcony = true;
  if (featureText.includes("storage")) features.has_storage = true;

  return features;
}

function transformProperty(property: any, config: ResalesConfig) {
  const features = extractFeatures(property);
  const operation = config.filter_id === 1 ? "sale" : "rent";

  return {
    property_code: `ROL-${property.Reference}`,
    resales_reference: property.Reference,
    data_source: "resales_online",
    resales_filter_id: config.filter_id,
    operation,
    property_type: mapPropertyType(property.Type || "", property.SubType || property.ROLSubType || ""),
    price: parseFloat(property.Price) || null,
    price_per_m2: property.Built > 0 && property.Price > 0
      ? Math.round(parseFloat(property.Price) / parseFloat(property.Built))
      : null,
    size_m2: parseFloat(property.Built) ? Math.round(parseFloat(property.Built)) : null,
    rooms: parseInt(property.Bedrooms) || null,
    bathrooms: parseInt(property.Bathrooms) || null,
    address: property.Location || "",
    municipality: property.Area || "",
    district: property.Location || "",
    latitude: property.GPS_Lat ? parseFloat(property.GPS_Lat) : null,
    longitude: property.GPS_Lng ? parseFloat(property.GPS_Lng) : null,
    description: property.Description || "",
    thumbnail_url: property.Pictures?.Picture?.[0]?.PictureURL || property.MainImage || null,
    ...features,
    is_active: true,
    scraped_at: new Date().toISOString(),
  };
}

// ─── Sync Logic ──────────────────────────────────────────
async function syncFilter(config: ResalesConfig) {
  const { data: logEntry } = await supabase
    .from("resales_sync_log")
    .insert({
      config_id: config.id,
      filter_alias: config.filter_alias,
      status: "running",
    })
    .select()
    .single();

  const logId = logEntry?.id;
  const startTime = Date.now();

  try {
    let page = 1;
    let totalFetched = 0;
    let totalUpserted = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await searchProperties(config, page, 50);

      if (result.transaction?.status === "error") {
        throw new Error(`API Error: ${JSON.stringify(result.transaction.errordescription)}`);
      }

      const properties = result.Property || result.Properties?.Property || [];
      const propertyList = Array.isArray(properties) ? properties : [properties];

      if (propertyList.length === 0 || !propertyList[0]?.Reference) {
        hasMore = false;
        break;
      }

      const batch = propertyList
        .filter((p: any) => p.Reference)
        .map((p: any) => transformProperty(p, config));

      if (batch.length > 0) {
        const { error } = await supabase
          .from("properties")
          .upsert(batch, { onConflict: "property_code", ignoreDuplicates: false });

        if (error) {
          console.error(`Upsert error page ${page}:`, error);
        } else {
          totalUpserted += batch.length;
        }
      }

      totalFetched += propertyList.length;
      page++;

      const queryInfo = result.QueryInfo || result.transaction;
      const totalPages = parseInt(queryInfo?.PageCount || queryInfo?.TotalPages || "0");
      if (totalPages > 0 && page > totalPages) hasMore = false;
      if (propertyList.length < 50) hasMore = false;

      // Rate limiting
      await new Promise((r) => setTimeout(r, 200));
    }

    // Deactivate stale properties
    const { count: deactivated } = await supabase
      .from("properties")
      .update({ is_active: false })
      .eq("data_source", "resales_online")
      .eq("resales_filter_id", config.filter_id)
      .eq("is_active", true)
      .lt("scraped_at", new Date(startTime).toISOString())
      .select("id", { count: "exact", head: true });

    const duration = Math.round((Date.now() - startTime) / 1000);

    await supabase
      .from("resales_sync_log")
      .update({
        status: "completed",
        properties_fetched: totalFetched,
        properties_upserted: totalUpserted,
        properties_deactivated: deactivated || 0,
        completed_at: new Date().toISOString(),
        duration_seconds: duration,
      })
      .eq("id", logId);

    await supabase
      .from("resales_online_config")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: "completed",
      })
      .eq("id", config.id);

    return { totalFetched, totalUpserted, deactivated: deactivated || 0, duration };
  } catch (error: any) {
    const duration = Math.round((Date.now() - startTime) / 1000);

    await supabase
      .from("resales_sync_log")
      .update({
        status: "failed",
        error_message: error.message,
        completed_at: new Date().toISOString(),
        duration_seconds: duration,
      })
      .eq("id", logId);

    await supabase
      .from("resales_online_config")
      .update({ last_sync_status: "failed" })
      .eq("id", config.id);

    throw error;
  }
}

// ─── HTTP Handler ────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { filter_id, sync_all } = body;

    let configs: ResalesConfig[];

    if (sync_all) {
      const { data } = await supabase
        .from("resales_online_config")
        .select("*")
        .eq("is_active", true);
      configs = (data || []) as ResalesConfig[];
    } else if (filter_id) {
      const { data } = await supabase
        .from("resales_online_config")
        .select("*")
        .eq("id", filter_id)
        .single();
      configs = data ? [data as ResalesConfig] : [];
    } else {
      const { data } = await supabase
        .from("resales_online_config")
        .select("*")
        .eq("is_active", true);

      configs = ((data || []) as any[]).filter((c) => {
        if (!c.last_sync_at) return true;
        const hoursSinceSync = (Date.now() - new Date(c.last_sync_at).getTime()) / (1000 * 60 * 60);
        return hoursSinceSync >= c.sync_interval_hours;
      }) as ResalesConfig[];
    }

    const results = [];
    for (const config of configs) {
      try {
        const result = await syncFilter(config);
        results.push({ filter: config.filter_alias, ...result });
      } catch (error: any) {
        results.push({ filter: config.filter_alias, error: error.message });
      }
    }

    // Refresh materialized views
    await supabase.rpc("refresh_materialized_views").catch(() => {
      console.log("Materialized view refresh skipped");
    });

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

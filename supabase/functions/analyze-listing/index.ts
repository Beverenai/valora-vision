import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Feature adjustment multipliers (same as SELL)
const FEATURE_ADJUSTMENTS: Record<string, number> = {
  pool: 0.10, sea_views: 0.20, garage: 0.05, terrace: 0.04,
  garden: 0.03, lift: 0.03, ac: 0.02, balcony: 0.01,
};

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function filterOutliers(values: number[]): number[] {
  if (values.length < 5) return values;
  const med = median(values);
  const deviations = values.map((v) => Math.abs(v - med));
  const madRaw = median(deviations);
  const mad = madRaw === 0 ? 1 : madRaw;
  return values.filter((v) => Math.abs(v - med) / mad <= 3.5);
}

// URL parsing
function parseListingUrl(url: string): { platform: string; propertyCode: string | null } {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    if (host.includes("idealista")) {
      const match = url.match(/\/inmueble\/(\d+)/);
      return { platform: "idealista", propertyCode: match?.[1] || null };
    }
    if (host.includes("fotocasa")) {
      const match = url.match(/\/(\d+)\//);
      return { platform: "fotocasa", propertyCode: match?.[1] || null };
    }
    if (host.includes("kyero")) {
      const match = url.match(/\/(\d+)/);
      return { platform: "kyero", propertyCode: match?.[1] || null };
    }
    if (host.includes("spainhouses")) {
      const match = url.match(/\/(\d+)/);
      return { platform: "spainhouses", propertyCode: match?.[1] || null };
    }
    return { platform: "other", propertyCode: null };
  } catch {
    return { platform: "unknown", propertyCode: null };
  }
}

function getConfidenceLevel(count: number): string {
  if (count >= 15) return "high";
  if (count >= 8) return "medium";
  if (count >= 3) return "low";
  return "insufficient";
}

function getPriceScore(deviation: number): string {
  if (deviation < -15) return "below_market";
  if (deviation < -5) return "good_value";
  if (deviation <= 5) return "fair_price";
  if (deviation <= 15) return "slightly_above";
  return "above_market";
}

// Detect features from text/array and calculate adjustments
function calculateFeatureAdjustments(features: any, baseValue: number): { multiplier: number; adjustments: Record<string, number> } {
  const adjustments: Record<string, number> = {};
  let multiplier = 1.0;
  
  const featureText = Array.isArray(features) 
    ? features.join(" ").toLowerCase() 
    : typeof features === "string" 
      ? features.toLowerCase() 
      : "";

  const checks: [string, string[]][] = [
    ["pool", ["pool", "piscina", "swimming"]],
    ["sea_views", ["sea view", "vista al mar", "ocean view", "sea views"]],
    ["garage", ["garage", "parking", "garaje"]],
    ["terrace", ["terrace", "terraza", "roof"]],
    ["garden", ["garden", "jardin", "jardín"]],
    ["lift", ["lift", "elevator", "ascensor"]],
    ["ac", ["air conditioning", "aire acondicionado", "a/c", "climate"]],
    ["balcony", ["balcony", "balcón"]],
  ];

  for (const [key, keywords] of checks) {
    if (keywords.some(kw => featureText.includes(kw))) {
      const adj = FEATURE_ADJUSTMENTS[key] || 0;
      multiplier += adj;
      adjustments[key] = Math.round(baseValue * adj);
    }
  }

  return { multiplier, adjustments };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { url, email } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Parse URL
    const { platform, propertyCode } = parseListingUrl(url);

    // 2. Try to find property in our database first
    let propertyData: any = null;

    if (propertyCode) {
      const { data: existing } = await supabase
        .from("properties")
        .select("*")
        .eq("property_code", propertyCode)
        .eq("operation", "sale")
        .maybeSingle();

      if (existing) {
        propertyData = {
          address: existing.address,
          city: existing.municipality,
          latitude: existing.latitude ? Number(existing.latitude) : null,
          longitude: existing.longitude ? Number(existing.longitude) : null,
          property_type: existing.property_type,
          size_m2: existing.size_m2 ? Number(existing.size_m2) : null,
          rooms: existing.rooms,
          bathrooms: existing.bathrooms,
          asking_price: Number(existing.price),
          features: existing.images || [],
          image_urls: existing.images ? (Array.isArray(existing.images) ? existing.images : []) : [],
          thumbnail_url: existing.thumbnail_url || null,
        };
      }
    }

    // 3. If not in DB, try scraping via Apify
    if (!propertyData && platform === "idealista" && propertyCode) {
      const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
      if (APIFY_API_TOKEN) {
        try {
          // Start Apify actor run for single property
          const runRes = await fetch(
            `https://api.apify.com/v2/acts/maxcopell~idealista-scraper/runs?token=${APIFY_API_TOKEN}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                propertyCodes: [propertyCode],
                maxItems: 1,
              }),
            }
          );

          if (runRes.ok) {
            const runData = await runRes.json();
            const datasetId = runData.data?.defaultDatasetId;

            if (datasetId) {
              // Wait for results (poll up to 30 seconds)
              let attempts = 0;
              while (attempts < 10) {
                await new Promise(r => setTimeout(r, 3000));
                const itemsRes = await fetch(
                  `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}`
                );
                if (itemsRes.ok) {
                  const items = await itemsRes.json();
                  if (items.length > 0) {
                    const item = items[0];
                    propertyData = {
                      address: item.address || item.location || "",
                      city: item.municipality || item.province || "",
                      latitude: item.latitude || null,
                      longitude: item.longitude || null,
                      property_type: item.typology?.toLowerCase() || "apartment",
                      size_m2: item.size || null,
                      rooms: item.rooms || null,
                      bathrooms: item.bathrooms || null,
                      asking_price: item.price || 0,
                      features: item.features || [],
                      image_urls: item.images?.map((img: any) => img.url || img) || [],
                      thumbnail_url: item.thumbnail || item.images?.[0]?.url || null,
                    };
                    break;
                  }
                }
                attempts++;
              }
            }
          }
        } catch (scrapeError) {
          console.error("Apify scrape error:", scrapeError);
        }
      }
    }

    // If still no data, create a minimal entry with just the URL
    if (!propertyData) {
      // Insert as pending - user would need to provide more data
      const { data: analysis, error: insertError } = await supabase
        .from("buy_analyses")
        .insert({
          source_url: url,
          source_platform: platform,
          property_code: propertyCode,
          asking_price: 0,
          status: "error",
          email: email || null,
        })
        .select("id")
        .single();

      if (insertError) throw new Error(insertError.message);

      return new Response(
        JSON.stringify({
          analysis_id: analysis.id,
          status: "error",
          message: "Could not fetch property data. Please try a different listing URL.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sizeM2 = propertyData.size_m2 || 100;
    const askingPrice = propertyData.asking_price;
    const askingPricePerM2 = sizeM2 > 0 ? Math.round(askingPrice / sizeM2) : 0;

    // 4. Insert into buy_analyses with processing status
    const { data: analysis, error: insertError } = await supabase
      .from("buy_analyses")
      .insert({
        source_url: url,
        source_platform: platform,
        property_code: propertyCode,
        address: propertyData.address,
        city: propertyData.city,
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        property_type: propertyData.property_type,
        size_m2: sizeM2,
        rooms: propertyData.rooms,
        bathrooms: propertyData.bathrooms,
        asking_price: askingPrice,
        asking_price_per_m2: askingPricePerM2,
        features: propertyData.features,
        thumbnail_url: propertyData.thumbnail_url,
        image_urls: propertyData.image_urls,
        email: email || null,
        status: "processing",
      })
      .select("id")
      .single();

    if (insertError) throw new Error(insertError.message);
    const analysisId = analysis.id;

    // 5. Find comparables
    let comparables: any[] = [];
    if (propertyData.latitude && propertyData.longitude) {
      const { data: comps, error: compError } = await supabase.rpc("find_comparables", {
        p_lat: Number(propertyData.latitude),
        p_lng: Number(propertyData.longitude),
        p_operation: "sale",
        p_property_type: propertyData.property_type || "apartment",
        p_size_m2: sizeM2,
        p_rooms: propertyData.rooms || 2,
        p_radius_km: 5.0,
        p_limit: 20,
      });
      if (!compError && comps?.length > 0) {
        comparables = comps;
      }
    }

    // 6. Calculate valuation
    let estimatedValue = 0;
    let estimatedLow = 0;
    let estimatedHigh = 0;
    let estimatedPricePerM2 = 0;
    let areaMedianPricePerM2 = 0;

    if (comparables.length >= 3) {
      const pricesPerSqm = comparables
        .filter((c: any) => c.price_per_sqm && c.price_per_sqm > 0)
        .map((c: any) => Number(c.price_per_sqm));

      const filtered = filterOutliers(pricesPerSqm);
      areaMedianPricePerM2 = filtered.length > 0 ? Math.round(median(filtered)) : 3500;

      // Apply feature adjustments
      const baseValue = areaMedianPricePerM2 * sizeM2;
      const { multiplier, adjustments } = calculateFeatureAdjustments(propertyData.features, baseValue);

      estimatedPricePerM2 = Math.round(areaMedianPricePerM2 * multiplier);
      estimatedValue = Math.round(estimatedPricePerM2 * sizeM2);
      estimatedLow = Math.round(estimatedValue * 0.85);
      estimatedHigh = Math.round(estimatedValue * 1.15);

      // Calculate price deviation
      const priceDeviation = ((askingPrice - estimatedValue) / estimatedValue) * 100;
      const priceScore = getPriceScore(priceDeviation);
      const confidenceLevel = getConfidenceLevel(comparables.length);

      // Prepare comparable data for storage
      const comparableData = comparables.slice(0, 15).map((c: any) => ({
        id: c.id, price: c.price, price_per_sqm: c.price_per_sqm,
        built_size_sqm: c.built_size_sqm, bedrooms: c.bedrooms, bathrooms: c.bathrooms,
        property_type: c.property_type, address: c.address, city: c.city,
        distance_km: c.distance_km, image_urls: c.image_urls, listing_url: c.listing_url,
      }));

      // 7. Generate AI analysis
      let analysisText = "";
      let marketTrendsText = "";
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

      if (LOVABLE_API_KEY) {
        try {
          const propertyDesc = `${propertyData.property_type || "property"}, ${sizeM2}m², ${propertyData.rooms || "unknown"} bedrooms, in ${propertyData.city || "Spain"}`;
          const scoreLabel = priceScore.replace(/_/g, " ");
          const devDir = priceDeviation > 0 ? "above" : priceDeviation < 0 ? "below" : "in line with";

          const systemPrompt = `You are a neutral property market analyst for ValoraCasa. Write in English. Be data-driven and objective. NEVER say a property is "too expensive" or "a bad deal". Present facts neutrally. Do not use markdown formatting.`;

          const analysisPrompt = `Write a 3-paragraph price analysis for a buyer considering: ${propertyDesc}. Asking price: €${askingPrice.toLocaleString()}. Estimated market value: €${estimatedValue.toLocaleString()} (based on ${comparables.length} comparable properties). The asking price is ${Math.abs(Math.round(priceDeviation))}% ${devDir} market value. Price score: ${scoreLabel}. Area median: €${areaMedianPricePerM2}/m².

Be neutral and factual. Explain what the data shows, note any features that justify premiums, and give context about the local market. Keep it to 150-200 words.`;

          const trendsPrompt = `Write a 2-paragraph market context for ${propertyData.city || "Costa del Sol"}, Spain as of March 2026. Cover recent price movements and buyer demand. Keep it to 100-130 words. Do not use markdown.`;

          const [analysisRes, trendsRes] = await Promise.all([
            fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-lite",
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: analysisPrompt }],
              }),
            }),
            fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-lite",
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: trendsPrompt }],
              }),
            }),
          ]);

          if (analysisRes.ok) {
            const data = await analysisRes.json();
            analysisText = data.choices?.[0]?.message?.content || "";
          }
          if (trendsRes.ok) {
            const data = await trendsRes.json();
            marketTrendsText = data.choices?.[0]?.message?.content || "";
          }
        } catch (aiError) {
          console.error("AI error:", aiError);
        }
      }

      // 8. Update analysis with results
      await supabase.from("buy_analyses").update({
        estimated_value: estimatedValue,
        estimated_low: estimatedLow,
        estimated_high: estimatedHigh,
        estimated_price_per_m2: estimatedPricePerM2,
        area_median_price_per_m2: areaMedianPricePerM2,
        price_deviation_percent: Math.round(priceDeviation * 100) / 100,
        price_score: priceScore,
        confidence_level: confidenceLevel,
        comparables_count: comparables.length,
        comparable_properties: comparableData,
        feature_adjustments: adjustments,
        analysis: analysisText || null,
        market_trends: marketTrendsText || null,
        status: "ready",
      }).eq("id", analysisId);

      return new Response(
        JSON.stringify({ analysis_id: analysisId, status: "ready", comparables_count: comparables.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Insufficient comparables
      await supabase.from("buy_analyses").update({
        confidence_level: "insufficient",
        comparables_count: comparables.length,
        status: "ready",
        price_score: null,
      }).eq("id", analysisId);

      return new Response(
        JSON.stringify({ analysis_id: analysisId, status: "ready", comparables_count: comparables.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("analyze-listing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Hardcoded fallback feature adjustments
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

// Tool calling schema for BUY analysis
const BUY_ANALYSIS_TOOL = {
  type: "function",
  function: {
    name: "generate_buy_analysis",
    description: "Generate a structured buy analysis that is neutral and data-driven.",
    parameters: {
      type: "object",
      properties: {
        verdict: { type: "string", enum: ["below_market", "good_value", "fair_price", "slightly_above", "above_market"], description: "Overall price assessment" },
        summary: { type: "string", description: "2-3 sentence neutral overview of price vs market value" },
        price_context: { type: "string", description: "How this price compares to comparable properties in the area" },
        worth_noting: { type: "array", items: { type: "string" }, description: "3-5 neutral, factual observations about the property and its price position" },
        negotiation_context: { type: "string", description: "Neutral context about typical negotiation margins in the area" },
      },
      required: ["verdict", "summary", "price_context", "worth_noting", "negotiation_context"],
      additionalProperties: false,
    },
  },
};

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
          zone_id: existing.zone_id || null,
        };
      }
    }

    // 3. If not in DB, try scraping via Apify
    if (!propertyData && platform === "idealista" && propertyCode) {
      const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
      if (APIFY_API_TOKEN) {
        try {
          const runRes = await fetch(
            `https://api.apify.com/v2/acts/maxcopell~idealista-scraper/runs?token=${APIFY_API_TOKEN}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ propertyCodes: [propertyCode], maxItems: 1 }),
            }
          );

          if (runRes.ok) {
            const runData = await runRes.json();
            const datasetId = runData.data?.defaultDatasetId;

            if (datasetId) {
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
                      zone_id: null,
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

    // If still no data, return error
    if (!propertyData) {
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

    // 5. Find comparables + zone stats in parallel
    let comparables: any[] = [];
    let zoneStats: any = null;

    if (propertyData.latitude && propertyData.longitude) {
      const promises: Promise<any>[] = [
        supabase.rpc("find_comparables_with_fallback", {
          p_lat: Number(propertyData.latitude),
          p_lng: Number(propertyData.longitude),
          p_operation: "sale",
          p_property_type: propertyData.property_type || "apartment",
          p_size_m2: sizeM2,
          p_rooms: propertyData.rooms || 2,
          p_min_results: 8,
          p_limit: 30,
        }),
      ];

      // Get zone stats if we have zone_id
      if (propertyData.zone_id) {
        promises.push(
          supabase.rpc("get_zone_stats", {
            p_zone_id: propertyData.zone_id,
            p_operation: "sale",
            p_property_type: propertyData.property_type || "apartment",
          })
        );
      }

      const results = await Promise.all(promises);

      if (!results[0].error && results[0].data?.length > 0) {
        comparables = results[0].data;
      }
      if (results[1]?.data?.[0]) {
        zoneStats = results[1].data[0];
      }
    }

    // 6. Calculate valuation
    if (comparables.length >= 3) {
      const pricesPerSqm = comparables
        .filter((c: any) => c.price_per_m2 && c.price_per_m2 > 0)
        .map((c: any) => Number(c.price_per_m2));

      const filtered = filterOutliers(pricesPerSqm);
      const areaMedianPricePerM2 = filtered.length > 0 ? Math.round(median(filtered)) : 3500;

      const baseValue = areaMedianPricePerM2 * sizeM2;
      const { multiplier, adjustments } = calculateFeatureAdjustments(propertyData.features, baseValue);

      const estimatedPricePerM2 = Math.round(areaMedianPricePerM2 * multiplier);
      const estimatedValue = Math.round(estimatedPricePerM2 * sizeM2);
      const estimatedLow = Math.round(estimatedValue * 0.85);
      const estimatedHigh = Math.round(estimatedValue * 1.15);

      const priceDeviation = ((askingPrice - estimatedValue) / estimatedValue) * 100;
      const priceScore = getPriceScore(priceDeviation);
      const confidenceLevel = getConfidenceLevel(comparables.length);

      const comparableData = comparables.slice(0, 15).map((c: any) => ({
        id: c.id, price: c.price, price_per_sqm: c.price_per_m2,
        built_size_sqm: c.size_m2, bedrooms: c.rooms, bathrooms: c.bathrooms,
        property_type: c.property_type, address: c.address, city: c.municipality,
        distance_km: c.distance_km, image_urls: [], listing_url: c.idealista_url,
      }));

      // 7. AI analysis with structured tool calling
      let analysisText = "";
      let marketTrendsText = "";
      let aiStructured: any = null;

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY) {
        try {
          const scoreLabel = priceScore.replace(/_/g, " ");
          const devDir = priceDeviation > 0 ? "above" : priceDeviation < 0 ? "below" : "in line with";

          // Build structured data package
          const dataPackage = {
            type: "buy",
            property: {
              address: propertyData.address || propertyData.city || "Unknown",
              type: propertyData.property_type || "property",
              size_m2: sizeM2,
              rooms: propertyData.rooms || "unknown",
              bathrooms: propertyData.bathrooms || "unknown",
              features: Object.keys(adjustments).join(", ") || "none detected",
            },
            pricing: {
              asking_price: askingPrice,
              estimated_market_value: estimatedValue,
              estimated_low: estimatedLow,
              estimated_high: estimatedHigh,
              price_deviation_percent: Math.round(priceDeviation * 10) / 10,
              deviation_direction: devDir,
              price_score: scoreLabel,
              asking_price_per_m2: askingPricePerM2,
              estimated_price_per_m2: estimatedPricePerM2,
              area_median_per_m2: areaMedianPricePerM2,
            },
            comparables: {
              count: comparables.length,
              confidence: confidenceLevel,
              prices_below_asking: comparables.filter((c: any) => Number(c.price) < askingPrice).length,
              prices_similar: comparables.filter((c: any) => Math.abs(Number(c.price) - askingPrice) / askingPrice < 0.05).length,
              prices_above_asking: comparables.filter((c: any) => Number(c.price) > askingPrice).length,
            },
            zone_stats: zoneStats ? {
              listing_count: zoneStats.listing_count,
              median_price_m2: zoneStats.median_price_m2,
              pct_with_pool: zoneStats.pct_with_pool,
              pct_with_sea_views: zoneStats.pct_with_sea_views,
            } : null,
            feature_impacts: Object.keys(adjustments).length > 0
              ? Object.entries(adjustments).reduce((acc, [k, v]) => { acc[k] = { amount: v, premium_pct: Math.round((FEATURE_ADJUSTMENTS[k] || 0) * 100) }; return acc; }, {} as Record<string, any>)
              : null,
          };

          const systemPrompt = `You are a neutral property market analyst for ValoraCasa. You receive pre-computed data and INTERPRET it — you do not calculate. Write in English. Be data-driven and objective. NEVER say a property is "too expensive" or "a bad deal". Present price positions as "Above Market", "Fair Price", "Good Value" etc. Provide factual context that helps buyers make informed decisions. Do not use markdown formatting.`;

          const userPrompt = `Analyze this property listing based on the following pre-computed data:\n\n${JSON.stringify(dataPackage, null, 2)}`;

          const trendsPrompt = `Write a 2-paragraph market context for ${propertyData.city || "Costa del Sol"}, Spain as of March 2026. Cover recent price movements and buyer demand. Keep it to 100-130 words. Do not use markdown.`;

          const [analysisRes, trendsRes] = await Promise.all([
            fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                temperature: 0.3,
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
                tools: [BUY_ANALYSIS_TOOL],
                tool_choice: { type: "function", function: { name: "generate_buy_analysis" } },
              }),
            }),
            fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-lite",
                messages: [
                  { role: "system", content: "You are a property market analyst for ValoraCasa. Write in English. Be neutral. Do not use markdown." },
                  { role: "user", content: trendsPrompt },
                ],
              }),
            }),
          ]);

          if (analysisRes.ok) {
            const data = await analysisRes.json();
            const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall?.function?.arguments) {
              try {
                aiStructured = JSON.parse(toolCall.function.arguments);
                analysisText = [aiStructured.summary, aiStructured.price_context].filter(Boolean).join("\n\n");
              } catch (parseErr) {
                console.error("Failed to parse tool call response:", parseErr);
                analysisText = data.choices?.[0]?.message?.content || "";
              }
            } else {
              analysisText = data.choices?.[0]?.message?.content || "";
            }
          } else {
            const errText = await analysisRes.text();
            console.error("AI analysis error:", analysisRes.status, errText);
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
      const updatePayload: Record<string, unknown> = {
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
      };

      // Add structured AI fields
      if (aiStructured) {
        updatePayload.ai_verdict = aiStructured.verdict || null;
        updatePayload.ai_price_context = aiStructured.price_context || null;
        updatePayload.ai_worth_noting = aiStructured.worth_noting || null;
        updatePayload.ai_negotiation_context = aiStructured.negotiation_context || null;
      }

      await supabase.from("buy_analyses").update(updatePayload).eq("id", analysisId);

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

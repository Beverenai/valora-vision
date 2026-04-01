import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Hardcoded fallbacks — used only when zone_stats has insufficient data (<5 listings with feature)
const FALLBACK_ADJUSTMENTS: Record<string, number> = {
  pool: 0.10,
  sea_views: 0.20,
  garage: 0.05,
  terrace: 0.04,
  garden: 0.03,
  lift: 0.03,
  ac: 0.02,
  balcony: 0.01,
};

const CONDITION_ADJUSTMENTS: Record<string, number> = {
  "new-build": 0.08,
  "good": 0.0,
  "needs-renovation": -0.12,
  "newDevelopment": 0.08,
  "renew": -0.12,
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

/** Calculate dynamic feature premium from zone_stats, fallback to hardcoded */
function dynamicPremium(
  medianWith: number | null,
  medianWithout: number | null,
  countWith: number | null,
  fallbackKey: string,
): number {
  const MIN_SAMPLE = 5;
  if (
    countWith && countWith >= MIN_SAMPLE &&
    medianWith && medianWithout && medianWithout > 0
  ) {
    const premium = (medianWith - medianWithout) / medianWithout;
    return Math.max(-0.05, Math.min(0.50, premium));
  }
  return FALLBACK_ADJUSTMENTS[fallbackKey] ?? 0;
}

// Tool calling schemas
const SELL_ANALYSIS_TOOL = {
  type: "function",
  function: {
    name: "generate_sell_analysis",
    description: "Generate a structured property sale analysis with strengths, considerations, and pricing recommendations.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string", description: "2-3 sentence overview of the valuation result and market position" },
        detailed_analysis: { type: "string", description: "3-paragraph detailed analysis (150-200 words)" },
        strengths: { type: "array", items: { type: "string" }, description: "3-5 bullet points about property strengths that add value" },
        considerations: { type: "array", items: { type: "string" }, description: "2-4 bullet points about market context or things to be aware of" },
        recommended_listing_price: { type: "integer", description: "Recommended listing price in euros" },
        quick_sale_price: { type: "integer", description: "Price for a faster sale (typically 5-8% below estimated value)" },
      },
      required: ["summary", "detailed_analysis", "strengths", "considerations", "recommended_listing_price", "quick_sale_price"],
      additionalProperties: false,
    },
  },
};

const RENT_ANALYSIS_TOOL = {
  type: "function",
  function: {
    name: "generate_rent_analysis",
    description: "Generate a structured rental income analysis with strengths and considerations.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string", description: "2-3 sentence overview of rental income potential" },
        detailed_analysis: { type: "string", description: "3-paragraph detailed analysis (150-200 words)" },
        strengths: { type: "array", items: { type: "string" }, description: "3-5 bullet points about rental income strengths" },
        considerations: { type: "array", items: { type: "string" }, description: "2-4 bullet points about rental market context" },
      },
      required: ["summary", "detailed_analysis", "strengths", "considerations"],
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
    const {
      valuation_type,
      full_name, email, phone,
      address, city, latitude, longitude,
      property_type, built_size_sqm, plot_size_sqm, terrace_size_sqm,
      bedrooms, bathrooms, condition, orientation, views,
      year_built, energy_certificate, features_text,
      has_pool, has_garage, has_sea_views, has_terrace, has_garden,
      has_lift, has_ac, has_balcony,
      is_furnished, property_features, rental_preference,
      wants_to_sell, selling_timeline, interested_in_refinancing,
    } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const isSell = valuation_type === "sell";
    const table = isSell ? "leads_sell" : "leads_rent";

    // 1. Insert lead
    const leadData: Record<string, unknown> = {
      full_name, email,
      phone: phone || null,
      address: address || city || "Unknown",
      city: city || null,
      property_type: property_type || null,
      built_size_sqm: built_size_sqm || null,
      bedrooms: bedrooms || null,
      bathrooms: bathrooms || null,
      latitude: latitude || null,
      longitude: longitude || null,
      status: "processing",
    };

    if (isSell) {
      leadData.plot_size_sqm = plot_size_sqm || null;
      leadData.terrace_size_sqm = terrace_size_sqm || null;
      leadData.orientation = orientation || null;
      leadData.views = views || null;
      leadData.condition = condition || null;
      leadData.year_built = year_built || null;
      leadData.energy_certificate = energy_certificate || null;
      leadData.features = features_text || null;
    } else {
      leadData.is_furnished = is_furnished || null;
      leadData.views = views || null;
      leadData.property_features = property_features || null;
    }

    const { data: lead, error: insertError } = await supabase
      .from(table)
      .insert(leadData)
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to create lead: ${insertError.message}`);
    }

    const leadId = lead.id;
    const sizeM2 = built_size_sqm ? Math.round(Number(built_size_sqm)) : 150;
    const roomsCount = bedrooms ? Number(bedrooms) : 3;

    // 2. Find comparables + zone stats in parallel
    let comparables: any[] = [];
    let zoneStats: any = null;

    if (latitude && longitude) {
      const [compResult, zoneResult] = await Promise.all([
        supabase.rpc("find_comparables_with_fallback", {
          p_lat: Number(latitude),
          p_lng: Number(longitude),
          p_operation: isSell ? "sale" : "rent",
          p_property_type: property_type || "apartment",
          p_size_m2: sizeM2,
          p_rooms: roomsCount,
          p_min_results: 8,
          p_limit: 30,
        }),
        supabase
          .from("properties")
          .select("zone_id")
          .not("zone_id", "is", null)
          .order("location_point", { ascending: true })
          .limit(1)
          .then(async (propRes) => {
            if (propRes.data?.[0]?.zone_id) {
              return supabase.rpc("get_zone_stats", {
                p_zone_id: propRes.data[0].zone_id,
                p_operation: isSell ? "sale" : "rent",
                p_property_type: property_type || "apartment",
              });
            }
            return { data: null, error: null };
          }),
      ]);

      if (!compResult.error && compResult.data?.length > 0) {
        comparables = compResult.data;
      }
      if (zoneResult?.data?.[0]) {
        zoneStats = zoneResult.data[0];
      }
    }

    // 2b. STR comparables for rent
    let strComparables: any[] = [];
    if (!isSell && latitude && longitude) {
      try {
        const { data: strData, error: strError } = await supabase
          .from("short_term_rentals")
          .select("*")
          .gte("scraped_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
          .eq("city", city || "")
          .limit(15);
        if (!strError && strData?.length) strComparables = strData;
      } catch (e) {
        console.error("STR query error:", e);
      }
    }

    // 3. Build dynamic feature adjustments from zone_stats
    const featureAdjustments: Record<string, number> = {};
    if (zoneStats) {
      featureAdjustments.pool = dynamicPremium(zoneStats.median_m2_with_pool, zoneStats.median_m2_without_pool, zoneStats.count_with_pool, "pool");
      featureAdjustments.sea_views = dynamicPremium(zoneStats.median_m2_with_sea_views, zoneStats.median_m2_without_sea_views, zoneStats.count_with_sea_views, "sea_views");
      featureAdjustments.garage = dynamicPremium(zoneStats.median_m2_with_garage, zoneStats.median_m2_without_garage, zoneStats.count_with_garage, "garage");
      featureAdjustments.terrace = dynamicPremium(zoneStats.median_m2_with_terrace, zoneStats.median_m2_without_terrace, zoneStats.count_with_terrace, "terrace");
      featureAdjustments.lift = dynamicPremium(zoneStats.median_m2_with_lift, zoneStats.median_m2_without_lift, zoneStats.count_with_lift, "lift");
      featureAdjustments.garden = FALLBACK_ADJUSTMENTS.garden;
      featureAdjustments.ac = FALLBACK_ADJUSTMENTS.ac;
      featureAdjustments.balcony = FALLBACK_ADJUSTMENTS.balcony;
    } else {
      Object.assign(featureAdjustments, FALLBACK_ADJUSTMENTS);
    }

    console.log("Feature adjustments:", zoneStats ? "dynamic from zone_stats" : "hardcoded fallback", featureAdjustments);

    // 4. Calculate valuation
    let estimatedValue = 0;
    let priceLow = 0;
    let priceHigh = 0;
    let pricePerSqm = 0;
    let monthlyRent = 0;
    let annualRent = 0;

    // Track which features are active and their impact amounts
    const activeFeatures: Record<string, { premium_pct: number; amount: number }> = {};

    if (isSell) {
      if (comparables.length > 0) {
        const pricesPerSqm = comparables
          .filter((c: any) => c.price_per_m2 && c.price_per_m2 > 0)
          .map((c: any) => Number(c.price_per_m2));

        const filtered = filterOutliers(pricesPerSqm);
        const medianPricePerSqm = filtered.length > 0 ? median(filtered) : 3500;
        const baseValue = medianPricePerSqm * sizeM2;

        let multiplier = 1.0;
        const applyFeature = (key: string, active: boolean) => {
          if (active) {
            const adj = featureAdjustments[key] || 0;
            multiplier += adj;
            activeFeatures[key] = { premium_pct: Math.round(adj * 100), amount: Math.round(baseValue * adj) };
          }
        };

        applyFeature("pool", !!has_pool);
        applyFeature("sea_views", !!(has_sea_views || (views && views.toLowerCase().includes("sea"))));
        applyFeature("garage", !!has_garage);
        applyFeature("terrace", !!(has_terrace || (terrace_size_sqm && Number(terrace_size_sqm) > 0)));
        applyFeature("garden", !!has_garden);
        applyFeature("lift", !!has_lift);
        applyFeature("ac", !!has_ac);
        applyFeature("balcony", !!has_balcony);

        if (condition && CONDITION_ADJUSTMENTS[condition] !== undefined) {
          multiplier += CONDITION_ADJUSTMENTS[condition];
        }

        pricePerSqm = Math.round(medianPricePerSqm * multiplier);
        estimatedValue = Math.round(pricePerSqm * sizeM2);
        priceLow = Math.round(estimatedValue * 0.85);
        priceHigh = Math.round(estimatedValue * 1.15);
        monthlyRent = Math.round(estimatedValue * 0.004);
        annualRent = monthlyRent * 12;
      } else {
        pricePerSqm = zoneStats?.median_price_m2 || 3500;
        estimatedValue = pricePerSqm * sizeM2;
        priceLow = Math.round(estimatedValue * 0.85);
        priceHigh = Math.round(estimatedValue * 1.15);
        monthlyRent = Math.round(estimatedValue * 0.004);
        annualRent = monthlyRent * 12;
      }
    } else {
      // Rent valuation
      if (comparables.length > 0) {
        const rentsPerSqm = comparables
          .filter((c: any) => c.price_per_m2 && c.price_per_m2 > 0)
          .map((c: any) => Number(c.price_per_m2));

        const monthlyRents = comparables
          .filter((c: any) => c.price && c.price > 0)
          .map((c: any) => Number(c.price));

        if (rentsPerSqm.length > 0) {
          const filtered = filterOutliers(rentsPerSqm);
          const medianRentPerSqm = median(filtered);

          let multiplier = 1.0;
          if (has_pool) multiplier += 0.08;
          if (has_sea_views || (views && views.toLowerCase().includes("sea"))) multiplier += 0.15;
          if (has_ac) multiplier += 0.03;
          if (is_furnished === "fully") multiplier += 0.10;
          else if (is_furnished === "partially") multiplier += 0.05;

          monthlyRent = Math.round(medianRentPerSqm * multiplier * sizeM2);
        } else if (monthlyRents.length > 0) {
          monthlyRent = Math.round(median(filterOutliers(monthlyRents)));
        } else {
          monthlyRent = Math.round(sizeM2 * 12);
        }
      } else {
        monthlyRent = Math.round(sizeM2 * 12);
      }
      annualRent = monthlyRent * 12;
    }

    // 4b. STR estimates
    let weeklyHighSeason = 0;
    let weeklyLowSeason = 0;
    let occupancyEstimate = 0;
    let seasonalBreakdown: any = null;

    if (!isSell && strComparables.length > 0) {
      const highRates = strComparables.filter((s: any) => s.high_season_daily_rate > 0).map((s: any) => Number(s.high_season_daily_rate));
      const lowRates = strComparables.filter((s: any) => s.low_season_daily_rate > 0).map((s: any) => Number(s.low_season_daily_rate));
      const occupancies = strComparables.filter((s: any) => s.occupancy_rate > 0).map((s: any) => Number(s.occupancy_rate));

      const medianHigh = highRates.length > 0 ? median(highRates) : 0;
      const medianLow = lowRates.length > 0 ? median(lowRates) : 0;
      const medianOcc = occupancies.length > 0 ? median(occupancies) : 0.65;

      weeklyHighSeason = Math.round(medianHigh * 7);
      weeklyLowSeason = Math.round(medianLow * 7);
      occupancyEstimate = Math.round(medianOcc * 100) / 100;

      const midRate = (medianHigh + medianLow) / 2;
      seasonalBreakdown = {
        high_season: { months: ["Jun", "Jul", "Aug", "Sep"], daily_rate: Math.round(medianHigh), weekly_rate: weeklyHighSeason },
        mid_season: { months: ["Apr", "May", "Oct", "Nov"], daily_rate: Math.round(midRate), weekly_rate: Math.round(midRate * 7) },
        low_season: { months: ["Dec", "Jan", "Feb", "Mar"], daily_rate: Math.round(medianLow), weekly_rate: weeklyLowSeason },
        occupancy_rate: occupancyEstimate,
        str_comparables_count: strComparables.length,
      };

      const annualSTR = Math.round((medianHigh * 120 + midRate * 120 + medianLow * 120) * occupancyEstimate);
      if (annualSTR > annualRent) annualRent = annualSTR;
    }

    // 5. AI analysis with structured tool calling
    let analysisText = "";
    let marketTrendsText = "";
    let aiStructured: any = null;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        // Build structured data package for AI
        const compPrices = comparables.filter((c: any) => c.price && c.price > 0).map((c: any) => Number(c.price));
        const compPricesPerSqm = comparables.filter((c: any) => c.price_per_m2 > 0).map((c: any) => Number(c.price_per_m2));
        const minCompPrice = compPrices.length > 0 ? Math.min(...compPrices) : 0;
        const maxCompPrice = compPrices.length > 0 ? Math.max(...compPrices) : 0;
        const medianCompPriceSqm = compPricesPerSqm.length > 0 ? median(compPricesPerSqm) : 0;

        const featuresList = [
          has_pool ? "swimming pool" : "",
          has_sea_views || (views && views.toLowerCase().includes("sea")) ? "sea views" : "",
          has_garage ? "garage" : "",
          has_terrace ? "terrace" : "",
          has_garden ? "garden" : "",
          has_lift ? "lift" : "",
          has_ac ? "air conditioning" : "",
          condition ? `condition: ${condition}` : "",
        ].filter(Boolean).join(", ");

        const dataPackage = {
          type: isSell ? "sell" : "rent",
          property: {
            address: address || city || "Unknown",
            type: property_type || "property",
            size_m2: sizeM2,
            rooms: roomsCount,
            bathrooms: bathrooms || "unknown",
            features: featuresList || "none specified",
            condition: condition || "not specified",
            floor: body.floor || "not specified",
          },
          valuation: isSell
            ? { estimated_value: estimatedValue, estimated_low: priceLow, estimated_high: priceHigh, price_per_m2: pricePerSqm, confidence: comparables.length >= 15 ? "high" : comparables.length >= 8 ? "medium" : "low" }
            : { monthly_rent: monthlyRent, annual_income: annualRent, weekly_high_season: weeklyHighSeason, weekly_low_season: weeklyLowSeason },
          comparables: {
            count: comparables.length,
            price_range: `€${minCompPrice.toLocaleString()}–€${maxCompPrice.toLocaleString()}`,
            median_price_per_m2: Math.round(medianCompPriceSqm),
          },
          zone_stats: zoneStats ? {
            listing_count: zoneStats.listing_count,
            median_price_m2: zoneStats.median_price_m2,
            pct_with_pool: zoneStats.pct_with_pool,
            pct_with_sea_views: zoneStats.pct_with_sea_views,
            avg_size_m2: zoneStats.avg_size_m2,
          } : null,
          feature_impacts: Object.keys(activeFeatures).length > 0 ? activeFeatures : null,
        };

        const systemPrompt = `You are a professional property analyst for ValoraCasa, a Spanish property valuation service. You receive pre-computed data and INTERPRET it — you do not calculate. Be neutral, data-driven, and professional. Never say a property is "too expensive" or a "bad deal". Present facts objectively. Write in English. Do not use markdown formatting. Reference the real data provided.`;

        const userPrompt = `Analyze this property based on the following pre-computed data:\n\n${JSON.stringify(dataPackage, null, 2)}`;

        const tool = isSell ? SELL_ANALYSIS_TOOL : RENT_ANALYSIS_TOOL;
        const toolName = isSell ? "generate_sell_analysis" : "generate_rent_analysis";

        const trendsPrompt = `Write a 2-paragraph market trends summary for ${city || "Costa del Sol"}, Spain as of March 2026. Cover price trends, demand drivers, and outlook. Reference real market dynamics (international buyers, Golden Visa, supply constraints). Keep it concise (120-150 words). Do not use markdown.`;

        const [analysisRes, trendsRes] = await Promise.all([
          fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              temperature: 0.3,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              tools: [tool],
              tool_choice: { type: "function", function: { name: toolName } },
            }),
          }),
          fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                { role: "system", content: "You are a property market analyst for ValoraCasa. Write in English. Be data-driven. Do not use markdown." },
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
              // Backward compatibility: populate analysis text
              analysisText = [aiStructured.summary, aiStructured.detailed_analysis].filter(Boolean).join("\n\n");
            } catch (parseErr) {
              console.error("Failed to parse tool call response:", parseErr);
              // Fallback to content if tool calling failed
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
        console.error("AI generation error:", aiError);
      }
    }

    // 6. Prepare comparable data
    const comparableData = comparables.slice(0, 10).map((c: any) => ({
      id: c.id,
      price: c.price,
      price_per_sqm: c.price_per_m2,
      built_size_sqm: c.size_m2,
      bedrooms: c.rooms,
      bathrooms: c.bathrooms,
      property_type: c.property_type,
      address: c.address,
      city: c.municipality,
      distance_km: c.distance_km,
      image_urls: [],
      listing_url: c.idealista_url,
    }));

    // 7. Update lead with results
    const updateData: Record<string, unknown> = { status: "ready" };

    if (isSell) {
      updateData.estimated_value = estimatedValue;
      updateData.price_range_low = priceLow;
      updateData.price_range_high = priceHigh;
      updateData.price_per_sqm = pricePerSqm;
      updateData.monthly_rental_estimate = monthlyRent;
      updateData.comparable_properties = comparableData;
      updateData.analysis = analysisText || null;
      updateData.market_trends = marketTrendsText || null;
      // Structured AI fields
      if (aiStructured) {
        updateData.ai_strengths = aiStructured.strengths || null;
        updateData.ai_considerations = aiStructured.considerations || null;
        updateData.recommended_listing_price = aiStructured.recommended_listing_price || null;
        updateData.quick_sale_price = aiStructured.quick_sale_price || null;
      }
    } else {
      updateData.monthly_long_term_estimate = monthlyRent;
      updateData.annual_income_estimate = annualRent;
      updateData.comparable_rentals = comparableData;
      updateData.analysis = analysisText || null;
      updateData.weekly_high_season_estimate = weeklyHighSeason || null;
      updateData.weekly_low_season_estimate = weeklyLowSeason || null;
      updateData.occupancy_estimate = occupancyEstimate || null;
      updateData.seasonal_breakdown = seasonalBreakdown || null;
      // Structured AI fields
      if (aiStructured) {
        updateData.ai_strengths = aiStructured.strengths || null;
        updateData.ai_considerations = aiStructured.considerations || null;
      }
    }

    const { error: updateError } = await supabase
      .from(table)
      .update(updateData)
      .eq("id", leadId);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    return new Response(
      JSON.stringify({
        lead_id: leadId,
        status: updateError ? "processing" : "ready",
        comparable_count: comparables.length,
        zone_stats_used: !!zoneStats,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("calculate-valuation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

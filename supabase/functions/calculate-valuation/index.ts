import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Feature adjustment multipliers
const FEATURE_ADJUSTMENTS: Record<string, number> = {
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
  // Keep values within ~2.5 MAD of median
  return values.filter((v) => Math.abs(v - med) / mad <= 3.5);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      valuation_type, // 'sell' | 'rent'
      // Contact
      full_name, email, phone,
      // Address
      address, city, latitude, longitude,
      // Property
      property_type, built_size_sqm, plot_size_sqm, terrace_size_sqm,
      bedrooms, bathrooms, condition, orientation, views,
      year_built, energy_certificate, features_text,
      // Features (booleans)
      has_pool, has_garage, has_sea_views, has_terrace, has_garden,
      has_lift, has_ac, has_balcony,
      // Rent-specific
      is_furnished, property_features, rental_preference,
      // Sell-specific
      wants_to_sell, selling_timeline, interested_in_refinancing,
    } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const isSell = valuation_type === "sell";
    const table = isSell ? "leads_sell" : "leads_rent";

    // 1. Insert lead with status='processing'
    const leadData: Record<string, unknown> = {
      full_name,
      email,
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

    // 2. Find comparables via RPC
    let comparables: any[] = [];
    let estimatedValue = 0;
    let priceLow = 0;
    let priceHigh = 0;
    let pricePerSqm = 0;
    let monthlyRent = 0;
    let annualRent = 0;

    if (latitude && longitude) {
      const { data: comps, error: compError } = await supabase.rpc("find_comparables", {
        p_lat: Number(latitude),
        p_lng: Number(longitude),
        p_operation: isSell ? "sale" : "rent",
        p_property_type: property_type || "apartment",
        p_size_m2: sizeM2,
        p_rooms: roomsCount,
        p_radius_km: 5.0,
        p_limit: 20,
      });

      if (!compError && comps && comps.length > 0) {
        comparables = comps;
      }
    }

    // 2b. Find STR comparables for rent valuations
    let strComparables: any[] = [];
    if (!isSell && latitude && longitude) {
      try {
        const { data: strData, error: strError } = await supabase
          .from("short_term_rentals")
          .select("*")
          .gte("scraped_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
          .eq("city", city || "")
          .limit(15);

        if (!strError && strData && strData.length > 0) {
          strComparables = strData;
        }
      } catch (e) {
        console.error("STR query error:", e);
      }
    }

    // 3. Calculate valuation
    if (isSell) {
      if (comparables.length > 0) {
        const pricesPerSqm = comparables
          .filter((c: any) => c.price_per_m2 && c.price_per_m2 > 0)
          .map((c: any) => Number(c.price_per_m2));

        const filtered = filterOutliers(pricesPerSqm);
        const medianPricePerSqm = filtered.length > 0 ? median(filtered) : 3500;

        // Apply feature adjustments
        let multiplier = 1.0;
        if (has_pool) multiplier += FEATURE_ADJUSTMENTS.pool;
        if (has_sea_views || (views && views.toLowerCase().includes("sea"))) multiplier += FEATURE_ADJUSTMENTS.sea_views;
        if (has_garage) multiplier += FEATURE_ADJUSTMENTS.garage;
        if (has_terrace || (terrace_size_sqm && Number(terrace_size_sqm) > 0)) multiplier += FEATURE_ADJUSTMENTS.terrace;
        if (has_garden) multiplier += FEATURE_ADJUSTMENTS.garden;
        if (has_lift) multiplier += FEATURE_ADJUSTMENTS.lift;
        if (has_ac) multiplier += FEATURE_ADJUSTMENTS.ac;
        if (has_balcony) multiplier += FEATURE_ADJUSTMENTS.balcony;

        // Condition adjustment
        if (condition && CONDITION_ADJUSTMENTS[condition] !== undefined) {
          multiplier += CONDITION_ADJUSTMENTS[condition];
        }

        pricePerSqm = Math.round(medianPricePerSqm * multiplier);
        estimatedValue = Math.round(pricePerSqm * sizeM2);
        priceLow = Math.round(estimatedValue * 0.85);
        priceHigh = Math.round(estimatedValue * 1.15);

        // Rental estimate (roughly 0.4% of value per month)
        monthlyRent = Math.round(estimatedValue * 0.004);
        annualRent = monthlyRent * 12;
      } else {
        // Fallback when no comparables
        pricePerSqm = 3500;
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
          monthlyRent = Math.round(sizeM2 * 12); // Fallback €12/m²
        }
      } else {
        monthlyRent = Math.round(sizeM2 * 12);
      }
      annualRent = monthlyRent * 12;
    }

    // 3b. Calculate STR estimates for rent valuations
    let weeklyHighSeason = 0;
    let weeklyLowSeason = 0;
    let occupancyEstimate = 0;
    let seasonalBreakdown: any = null;

    if (!isSell && strComparables.length > 0) {
      const highRates = strComparables
        .filter((s: any) => s.high_season_daily_rate > 0)
        .map((s: any) => Number(s.high_season_daily_rate));
      const lowRates = strComparables
        .filter((s: any) => s.low_season_daily_rate > 0)
        .map((s: any) => Number(s.low_season_daily_rate));
      const occupancies = strComparables
        .filter((s: any) => s.occupancy_rate > 0)
        .map((s: any) => Number(s.occupancy_rate));

      const medianHigh = highRates.length > 0 ? median(highRates) : 0;
      const medianLow = lowRates.length > 0 ? median(lowRates) : 0;
      const medianOcc = occupancies.length > 0 ? median(occupancies) : 0.65;

      weeklyHighSeason = Math.round(medianHigh * 7);
      weeklyLowSeason = Math.round(medianLow * 7);
      occupancyEstimate = Math.round(medianOcc * 100) / 100;

      // Seasonal breakdown: 4 months high, 4 mid, 4 low
      const midRate = (medianHigh + medianLow) / 2;
      seasonalBreakdown = {
        high_season: { months: ["Jun", "Jul", "Aug", "Sep"], daily_rate: Math.round(medianHigh), weekly_rate: weeklyHighSeason },
        mid_season: { months: ["Apr", "May", "Oct", "Nov"], daily_rate: Math.round(midRate), weekly_rate: Math.round(midRate * 7) },
        low_season: { months: ["Dec", "Jan", "Feb", "Mar"], daily_rate: Math.round(medianLow), weekly_rate: weeklyLowSeason },
        occupancy_rate: occupancyEstimate,
        str_comparables_count: strComparables.length,
      };

      // Estimate annual STR income
      const annualSTR = Math.round(
        (medianHigh * 120 + midRate * 120 + medianLow * 120) * occupancyEstimate
      );
      if (annualSTR > annualRent) {
        annualRent = annualSTR; // Use higher of LTR vs STR
      }
    }

    // 4. Generate AI analysis
    let analysisText = "";
    let marketTrendsText = "";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        const propertyDesc = `${property_type || "property"}, ${sizeM2}m², ${roomsCount} bedrooms, ${bathrooms || "unknown"} bathrooms, in ${city || address || "Spain"}`;
        const featuresList = [
          has_pool ? "swimming pool" : "",
          has_sea_views || (views && views.toLowerCase().includes("sea")) ? "sea views" : "",
          has_garage ? "garage" : "",
          has_terrace ? "terrace" : "",
          has_garden ? "garden" : "",
          has_lift ? "lift" : "",
          has_ac ? "air conditioning" : "",
          condition ? `condition: ${condition}` : "",
          orientation ? `orientation: ${orientation}` : "",
        ].filter(Boolean).join(", ");

        const systemPrompt = `You are a professional property analyst for ValoraCasa, a Spanish property valuation service. Write in English. Be specific, data-driven, and professional. Do not use markdown formatting.`;

        // Build comparable context for data-driven analysis
        const compPrices = comparables.filter((c: any) => c.price && c.price > 0).map((c: any) => Number(c.price));
        const compPricesPerSqm = comparables.filter((c: any) => c.price_per_m2 > 0).map((c: any) => Number(c.price_per_m2));
        const minCompPrice = compPrices.length > 0 ? Math.min(...compPrices) : 0;
        const maxCompPrice = compPrices.length > 0 ? Math.max(...compPrices) : 0;
        const medianCompPriceSqm = compPricesPerSqm.length > 0 ? median(compPricesPerSqm) : 0;
        const userVsMedianPct = medianCompPriceSqm > 0 ? Math.round(((pricePerSqm - medianCompPriceSqm) / medianCompPriceSqm) * 100) : 0;
        const userVsMedianDir = userVsMedianPct >= 0 ? "above" : "below";

        const compContext = comparables.length > 0
          ? `Based on ${comparables.length} comparable properties within 5km. Comparable price range: €${minCompPrice.toLocaleString()}–€${maxCompPrice.toLocaleString()}. Area median price/m²: €${Math.round(medianCompPriceSqm).toLocaleString()}. The property's price/m² of €${pricePerSqm.toLocaleString()} is ${Math.abs(userVsMedianPct)}% ${userVsMedianDir} the area median.`
          : `Limited comparable data available in this area.`;

        const analysisPrompt = isSell
          ? `Write a 3-paragraph property analysis for: ${propertyDesc}. Features: ${featuresList || "none specified"}. Estimated value: €${estimatedValue.toLocaleString()}. ${compContext} Discuss the property's strengths, how features affect value, and market positioning. Reference the real comparable data. Keep it concise (150-200 words).`
          : `Write a 3-paragraph rental income analysis for: ${propertyDesc}. Features: ${featuresList || "none specified"}. Estimated monthly rent: €${monthlyRent.toLocaleString()}. ${compContext} Discuss rental demand, seasonal factors, and income potential. Reference the real comparable data. Keep it concise (150-200 words).`;

        const trendsPrompt = `Write a 2-paragraph market trends summary for ${city || "Costa del Sol"}, Spain as of March 2026. Cover price trends, demand drivers, and outlook. Reference real market dynamics (international buyers, Golden Visa, supply constraints). Keep it concise (120-150 words). Do not use markdown.`;

        // Call AI for analysis and trends in parallel
        const [analysisRes, trendsRes] = await Promise.all([
          fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: analysisPrompt },
              ],
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
                { role: "system", content: systemPrompt },
                { role: "user", content: trendsPrompt },
              ],
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
        console.error("AI generation error:", aiError);
        // Continue without AI text - the frontend has fallbacks
      }
    }

    // 5. Prepare comparable data for storage
    const comparableData = comparables.slice(0, 10).map((c: any) => ({
      id: c.id,
      price: isSell ? c.price : c.monthly_rent,
      price_per_sqm: isSell ? c.price_per_sqm : c.rent_per_sqm,
      built_size_sqm: c.built_size_sqm,
      bedrooms: c.bedrooms,
      bathrooms: c.bathrooms,
      property_type: c.property_type,
      address: c.address,
      city: c.city,
      distance_km: c.distance_km,
      image_urls: c.image_urls,
      listing_url: c.listing_url,
    }));

    // 6. Update lead with results
    const updateData: Record<string, unknown> = {
      status: "ready",
    };

    if (isSell) {
      updateData.estimated_value = estimatedValue;
      updateData.price_range_low = priceLow;
      updateData.price_range_high = priceHigh;
      updateData.price_per_sqm = pricePerSqm;
      updateData.monthly_rental_estimate = monthlyRent;
      updateData.comparable_properties = comparableData;
      updateData.analysis = analysisText || null;
      updateData.market_trends = marketTrendsText || null;
    } else {
      updateData.monthly_long_term_estimate = monthlyRent;
      updateData.annual_income_estimate = annualRent;
      updateData.comparable_rentals = comparableData;
      updateData.analysis = analysisText || null;
      updateData.weekly_high_season_estimate = weeklyHighSeason || null;
      updateData.weekly_low_season_estimate = weeklyLowSeason || null;
      updateData.occupancy_estimate = occupancyEstimate || null;
      updateData.seasonal_breakdown = seasonalBreakdown || null;
    }

    const { error: updateError } = await supabase
      .from(table)
      .update(updateData)
      .eq("id", leadId);

    if (updateError) {
      console.error("Update error:", updateError);
      // Still return the ID - frontend can poll
    }

    return new Response(
      JSON.stringify({
        lead_id: leadId,
        status: updateError ? "processing" : "ready",
        comparable_count: comparables.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("calculate-valuation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

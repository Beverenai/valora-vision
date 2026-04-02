import { fetchWithScrapingBee } from "../_shared/scrapingbee-client.ts";
import { parsePropertyDetail, MUNICIPALITY_SLUGS } from "../_shared/idealista-parser.ts";
import { calculateBuyAnalysis, ValuationInput, ComparableProperty } from "../_shared/valuation-engine.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), ms)),
  ]);
}

function detectMunicipality(address: string | null, title: string): string | null {
  const candidates = [address, title].filter(Boolean).join(" ").toLowerCase();
  for (const [key, slug] of Object.entries(MUNICIPALITY_SLUGS)) {
    if (candidates.includes(key)) return slug;
  }
  return null;
}

const PROPERTY_TYPE_MAP: Record<string, string> = {
  apartment: "viviendas", duplex: "viviendas", studio: "viviendas",
  penthouse: "aticos",
  villa: "chalets", house: "chalets", chalet: "chalets",
  townhouse: "chalets", "semi-detached": "chalets", country_house: "chalets",
};

const FEATURE_LABELS: Record<string, string> = {
  hasPool: "Swimming pool", hasSeaViews: "Sea views", hasGarage: "Garage",
  hasTerrace: "Terrace", hasGarden: "Garden", hasLift: "Lift",
  hasAC: "Air conditioning", isExterior: "Exterior", hasStorage: "Storage room",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return jsonResponse({ error: "Missing 'url' field" }, 400);
    }

    const codeMatch = url.match(/idealista\.com\/inmueble\/(\d+)/);
    if (!codeMatch) {
      return jsonResponse({
        error: "Invalid URL. Please provide an Idealista listing URL (e.g. https://www.idealista.com/inmueble/12345678/)",
        hint: "Only Idealista links are supported at this time.",
      }, 400);
    }
    const propertyCode = codeMatch[1];

    const API_KEY = Deno.env.get("SCRAPINGBEE_API_KEY");
    if (!API_KEY) return jsonResponse({ error: "ScrapingBee API key not configured" }, 500);

    // Step 1: Scrape detail page
    const detailUrl = `https://www.idealista.com/inmueble/${propertyCode}/`;
    console.log("Fetching detail:", detailUrl);
    const t0 = Date.now();

    let detailResult;
    try {
      detailResult = await withTimeout(fetchWithScrapingBee(detailUrl, API_KEY, {
        renderJs: true, premiumProxy: true, stealthProxy: true, countryCode: "es", wait: 1000,
      }), 45_000);
      console.log(`Detail took ${Date.now() - t0}ms, status=${detailResult.statusCode}, credits=${detailResult.creditsUsed}`);
    } catch (e) {
      console.error("Detail fetch error:", String(e));
      return jsonResponse({ error: "Failed to fetch listing (timeout)", detail: String(e) }, 502);
    }

    if (detailResult.error) {
      return jsonResponse({ error: "ScrapingBee error fetching listing", detail: detailResult.error }, 502);
    }

    const property = parsePropertyDetail(detailResult.html);
    if (!property || !property.price || !property.sizeM2) {
      return jsonResponse({
        error: "Could not parse property data. The listing may have been removed or the page structure changed.",
      }, 422);
    }

    // Step 2: Detect municipality
    const municipalitySlug = detectMunicipality(property.address, property.title);

    if (!municipalitySlug) {
      return jsonResponse({
        property,
        analysis: null,
        comparables: [],
        meta: { platform: "idealista", creditsUsed: detailResult.creditsUsed, message: "Could not identify area for comparable search" },
      });
    }

    // Step 3: Query our own database for comparables (no second ScrapingBee call)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const municipalityName = municipalitySlug.split("-")[0];
    const minSize = Math.round(property.sizeM2 * 0.7);
    const maxSize = Math.round(property.sizeM2 * 1.3);
    const targetRooms = property.rooms || 0;

    const { data: dbComps, error: dbError } = await supabase
      .from("properties")
      .select("price, size_m2, price_per_m2, rooms, has_pool, has_sea_views, has_garage, has_terrace, has_garden, has_lift, has_ac, is_exterior, property_code, address, thumbnail_url")
      .eq("is_active", true)
      .eq("operation", "venta")
      .ilike("municipality", `%${municipalityName}%`)
      .gte("size_m2", minSize)
      .lte("size_m2", maxSize)
      .not("price", "is", null)
      .not("size_m2", "is", null)
      .limit(200);

    if (dbError) {
      console.error("DB query error:", dbError);
    }

    const allComps = (dbComps || []);
    const filtered = allComps.filter((c) => {
      if (c.property_code === propertyCode) return false;
      if (!c.size_m2 || !c.rooms) return false;
      if (Math.abs(c.rooms - targetRooms) > 1) return false;
      return true;
    });

    if (filtered.length < 3) {
      return jsonResponse({
        property,
        analysis: null,
        comparables: [],
        meta: {
          platform: "idealista",
          totalSearchResults: allComps.length,
          comparablesFound: filtered.length,
          creditsUsed: detailResult.creditsUsed,
          message: "Too few comparable properties found in database for reliable analysis",
        },
      });
    }

    // Convert DB records to engine format
    const compsForEngine: ComparableProperty[] = filtered.map((c) => ({
      price: c.price,
      sizeM2: c.size_m2,
      pricePerM2: c.price_per_m2 || Math.round(c.price / c.size_m2),
      features: {
        hasPool: c.has_pool || false,
        hasSeaViews: c.has_sea_views || false,
        hasGarage: c.has_garage || false,
        hasTerrace: c.has_terrace || false,
        hasGarden: c.has_garden || false,
        hasLift: c.has_lift || false,
        hasAC: c.has_ac || false,
        isExterior: c.is_exterior || false,
      },
    }));

    const input: ValuationInput = {
      sizeM2: property.sizeM2!,
      rooms: property.rooms || 0,
      bathrooms: property.bathrooms || 0,
      propertyType: property.propertyType || "apartment",
      features: property.features,
    };

    const result = calculateBuyAnalysis(property.price, input, compsForEngine);
    const totalAdjPct = result.featureAdjustments.reduce((s, a) => s + a.adjustment, 0);
    const targetPricePerM2 = property.pricePerM2 || Math.round(property.price / property.sizeM2!);

    const comparablesOut = filtered.slice(0, 10).map((c) => {
      const cPricePerM2 = c.price_per_m2 || Math.round(c.price / c.size_m2);
      let priceComparison = "unknown";
      if (targetPricePerM2 && cPricePerM2) {
        const ratio = cPricePerM2 / targetPricePerM2;
        if (ratio < 0.95) priceComparison = "cheaper";
        else if (ratio > 1.05) priceComparison = "more_expensive";
        else priceComparison = "similar";
      }
      return {
        propertyCode: c.property_code,
        price: c.price,
        sizeM2: c.size_m2,
        pricePerM2: cPricePerM2,
        rooms: c.rooms,
        address: c.address,
        thumbnail: c.thumbnail_url,
        priceComparison,
      };
    });

    return jsonResponse({
      property: {
        propertyCode: property.propertyCode,
        url: property.url,
        title: property.title,
        price: property.price,
        pricePerM2: property.pricePerM2,
        sizeM2: property.sizeM2,
        rooms: property.rooms,
        bathrooms: property.bathrooms,
        floor: property.floor,
        propertyType: property.propertyType,
        address: property.address,
        municipality: municipalityName,
        latitude: property.latitude,
        longitude: property.longitude,
        features: property.features,
        images: property.images,
        description: property.description,
        fullDescription: property.fullDescription,
        energyRating: property.energyRating,
        constructionYear: property.constructionYear,
        condition: property.condition,
        contactInfo: property.contactInfo,
      },
      analysis: {
        estimatedValue: result.estimatedValue,
        estimatedLow: result.priceRangeLow,
        estimatedHigh: result.priceRangeHigh,
        estimatedPricePerM2: result.pricePerM2,
        areaMedianPricePerM2: result.medianPricePerM2,
        confidence: result.confidenceLevel,
        comparablesUsed: result.comparablesUsed,
        comparablesTotal: result.comparablesTotal,
        featureAdjustments: result.featureAdjustments.map((a) => ({
          feature: a.feature,
          label: FEATURE_LABELS[a.feature] || a.feature,
          percent: Math.round(a.adjustment * 10) / 10,
          amount: Math.round(result.estimatedValue * Math.abs(a.adjustment) / 100),
        })),
        totalAdjustmentPercent: Math.round(totalAdjPct * 10) / 10,
        askingPrice: result.askingPrice,
        askingPricePerM2: targetPricePerM2,
        priceDeviationPercent: Math.round(result.priceScore.deviationPercent * 100) / 100,
        priceScore: result.priceScore.score,
        priceScoreLabel: result.priceScore.label,
        priceScoreColor: result.priceScore.color,
        negotiationHint: result.negotiationHint,
      },
      comparables: comparablesOut,
      meta: {
        platform: "idealista",
        source: "database",
        totalSearchResults: allComps.length,
        comparablesFound: filtered.length,
        creditsUsed: detailResult.creditsUsed,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error("buy-analysis error:", e);
    return jsonResponse({ error: "Internal server error", detail: String(e) }, 500);
  }
});

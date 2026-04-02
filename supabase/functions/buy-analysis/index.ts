import { fetchWithScrapingBee, buildIdealistaSearchUrl } from "../_shared/scrapingbee-client.ts";
import { parsePropertyDetail, parseSearchResults, MUNICIPALITY_SLUGS } from "../_shared/idealista-parser.ts";
import { calculateBuyAnalysis, ValuationInput, ComparableProperty } from "../_shared/valuation-engine.ts";

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

function detectMunicipality(address: string | null, title: string): string | null {
  const candidates = [address, title].filter(Boolean).join(" ").toLowerCase();
  for (const [key, slug] of Object.entries(MUNICIPALITY_SLUGS)) {
    if (candidates.includes(key)) return slug;
  }
  return null;
}

const PROPERTY_TYPE_MAP: Record<string, string> = {
  apartment: "pisos", duplex: "pisos", studio: "pisos",
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

    // Step 2: Scrape detail page
    const API_KEY = Deno.env.get("SCRAPINGBEE_API_KEY");
    if (!API_KEY) return jsonResponse({ error: "ScrapingBee API key not configured" }, 500);

    const detailUrl = `https://www.idealista.com/inmueble/${propertyCode}/`;
    let detailHtml: string;
    try {
      detailHtml = await fetchWithScrapingBee(API_KEY, detailUrl, {
        renderJs: false, premiumProxy: true, countryCode: "es",
      });
    } catch (e) {
      return jsonResponse({ error: "Failed to fetch listing", detail: String(e) }, 502);
    }

    const property = parsePropertyDetail(detailHtml);
    if (!property || !property.price || !property.sizeM2) {
      return jsonResponse({
        error: "Could not parse property data. The listing may have been removed or the page structure changed.",
      }, 422);
    }

    // Step 3: Detect municipality
    const municipalitySlug = detectMunicipality(property.address, property.title);

    if (!municipalitySlug) {
      return jsonResponse({
        property,
        analysis: null,
        comparables: [],
        meta: { platform: "idealista", message: "Could not identify area for comparable search" },
      });
    }

    // Step 4: Search comparables
    const idealistaType = PROPERTY_TYPE_MAP[property.propertyType || ""] || "viviendas";
    const minSize = Math.round(property.sizeM2 * 0.7);
    const maxSize = Math.round(property.sizeM2 * 1.3);
    const minPrice = Math.round(property.price * 0.5);
    const maxPrice = Math.round(property.price * 1.8);

    const searchUrl = buildIdealistaSearchUrl({
      municipality: municipalitySlug,
      propertyType: idealistaType,
      minPrice, maxPrice, minSize, maxSize,
    });

    let searchHtml: string;
    try {
      searchHtml = await fetchWithScrapingBee(API_KEY, searchUrl, {
        renderJs: false, premiumProxy: true, countryCode: "es",
      });
    } catch (e) {
      return jsonResponse({
        property,
        analysis: null,
        comparables: [],
        meta: { platform: "idealista", message: "Failed to fetch comparables", detail: String(e) },
      }, 502);
    }

    const allComps = parseSearchResults(searchHtml);
    const targetRooms = property.rooms || 0;
    const filtered = allComps.filter((c) => {
      if (c.propertyCode === propertyCode) return false;
      if (!c.sizeM2 || !c.rooms) return false;
      if (Math.abs(c.rooms - targetRooms) > 1) return false;
      if (Math.abs(c.sizeM2 - property.sizeM2!) / property.sizeM2! > 0.3) return false;
      return true;
    });

    // Step 5: Calculate analysis
    if (filtered.length < 3) {
      return jsonResponse({
        property,
        analysis: null,
        comparables: [],
        meta: {
          platform: "idealista", searchUrl, totalSearchResults: allComps.length,
          comparablesFound: filtered.length,
          message: "Too few comparable properties found for reliable analysis",
        },
      });
    }

    const input: ValuationInput = {
      sizeM2: property.sizeM2!,
      rooms: property.rooms || 0,
      bathrooms: property.bathrooms || 0,
      propertyType: property.propertyType || "apartment",
      features: property.features,
    };

    const compsForEngine: ComparableProperty[] = filtered.map((c) => ({
      price: c.price,
      sizeM2: c.sizeM2,
      pricePerM2: c.pricePerM2,
      features: c.features,
    }));

    const result = calculateBuyAnalysis(property.price, input, compsForEngine);

    const totalAdjPct = result.featureAdjustments.reduce((s, a) => s + a.adjustment, 0);

    // Step 6: Build response
    const targetPricePerM2 = property.pricePerM2 || (property.sizeM2 ? Math.round(property.price / property.sizeM2) : null);

    const comparablesOut = filtered.slice(0, 10).map((c) => {
      let priceComparison = "unknown";
      if (targetPricePerM2 && c.pricePerM2) {
        const ratio = c.pricePerM2 / targetPricePerM2;
        if (ratio < 0.95) priceComparison = "cheaper";
        else if (ratio > 1.05) priceComparison = "more_expensive";
        else priceComparison = "similar";
      }
      return { ...c, priceComparison };
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
        municipality: municipalitySlug.split("-")[0],
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
        searchUrl,
        totalSearchResults: allComps.length,
        comparablesFound: filtered.length,
        creditsUsed: 10,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error("buy-analysis error:", e);
    return jsonResponse({ error: "Internal server error", detail: String(e) }, 500);
  }
});

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

  const DEADLINE = Date.now() + 55_000;

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

    // Step 2: Scrape detail page — single attempt, generous timeout
    const detailUrl = `https://www.idealista.com/inmueble/${propertyCode}/`;
    let detailCredits = 0;

    console.log("Fetching detail:", detailUrl);
    const t0 = Date.now();
    let detailResult;
    try {
      detailResult = await withTimeout(fetchWithScrapingBee(detailUrl, API_KEY, {
        renderJs: true, premiumProxy: true, stealthProxy: true, countryCode: "es", wait: 1000,
      }), 35_000);
      console.log(`Detail took ${Date.now() - t0}ms, status=${detailResult.statusCode}, credits=${detailResult.creditsUsed}`);
      detailCredits = detailResult.creditsUsed;
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

    // Step 3: Detect municipality
    const municipalitySlug = detectMunicipality(property.address, property.title);

    if (!municipalitySlug) {
      return jsonResponse({
        property,
        analysis: null,
        comparables: [],
        meta: { platform: "idealista", creditsUsed: detailCredits, message: "Could not identify area for comparable search" },
      });
    }

    // Step 4: Check if we have time for comparables
    const remainingMs = DEADLINE - Date.now();
    if (remainingMs < 10_000) {
      console.log(`Only ${remainingMs}ms left, returning property without analysis`);
      return jsonResponse({
        property,
        analysis: null,
        comparables: [],
        meta: {
          platform: "idealista",
          creditsUsed: detailCredits,
          message: "Property data retrieved but not enough time for comparables search. Please try again.",
        },
      });
    }

    // Search comparables with remaining time
    const idealistaType = (PROPERTY_TYPE_MAP[property.propertyType || ""] || "viviendas") as "viviendas" | "chalets" | "pisos" | "aticos";
    const minSize = Math.round(property.sizeM2 * 0.7);
    const maxSize = Math.round(property.sizeM2 * 1.3);
    const searchUrl = buildIdealistaSearchUrl({
      operation: "venta",
      municipality: municipalitySlug,
      propertyType: idealistaType,
      minSize, maxSize,
    });

    const searchTimeout = Math.min(remainingMs - 3_000, 30_000); // leave 3s for processing
    let searchResult;
    try {
      console.log(`Fetching comparables (timeout ${searchTimeout}ms):`, searchUrl);
      const t1 = Date.now();
      searchResult = await withTimeout(fetchWithScrapingBee(searchUrl, API_KEY, {
        renderJs: true, premiumProxy: true, stealthProxy: true, countryCode: "es", wait: 1000,
      }), searchTimeout);
      console.log(`Search took ${Date.now() - t1}ms, status=${searchResult.statusCode}, credits=${searchResult.creditsUsed}`);
    } catch (e) {
      console.log("Search timeout/error, returning property only:", String(e));
      return jsonResponse({
        property,
        analysis: null,
        comparables: [],
        meta: {
          platform: "idealista",
          creditsUsed: detailCredits,
          message: "Property found but comparables search timed out. Please try again.",
        },
      });
    }

    const allComps = searchResult.error ? [] : parseSearchResults(searchResult.html);
    const targetRooms = property.rooms || 0;
    const filtered = allComps.filter((c) => {
      if (c.propertyCode === propertyCode) return false;
      if (!c.sizeM2 || !c.rooms) return false;
      if (Math.abs(c.rooms - targetRooms) > 1) return false;
      if (Math.abs(c.sizeM2 - property.sizeM2!) / property.sizeM2! > 0.3) return false;
      return true;
    });

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
        creditsUsed: detailCredits + (searchResult?.creditsUsed || 0),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error("buy-analysis error:", e);
    return jsonResponse({ error: "Internal server error", detail: String(e) }, 500);
  }
});

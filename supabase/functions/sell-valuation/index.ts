const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { fetchWithScrapingBee, buildIdealistaSearchUrl } from "../_shared/scrapingbee-client.ts";
import { parseSearchResults, MUNICIPALITY_SLUGS } from "../_shared/idealista-parser.ts";
import { calculateValuation, type ValuationInput, type ComparableProperty } from "../_shared/valuation-engine.ts";

const PROPERTY_TYPE_MAP: Record<string, string> = {
  apartment: "pisos",
  duplex: "pisos",
  studio: "pisos",
  penthouse: "aticos",
  villa: "chalets",
  house: "chalets",
  chalet: "chalets",
  townhouse: "chalets",
  "semi-detached": "chalets",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { municipality, propertyType = "apartment", sizeM2, rooms, bathrooms, features } = body;

    if (!municipality || !sizeM2 || !rooms) {
      return new Response(
        JSON.stringify({ error: "municipality, sizeM2, and rooms are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const slug = MUNICIPALITY_SLUGS[municipality.toLowerCase()];
    if (!slug) {
      return new Response(
        JSON.stringify({ error: `Unknown municipality: ${municipality}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("SCRAPINGBEE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "SCRAPINGBEE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const idealistaType = PROPERTY_TYPE_MAP[propertyType.toLowerCase()] || "viviendas";
    const minSize = Math.round(sizeM2 * 0.7);
    const maxSize = Math.round(sizeM2 * 1.3);
    const basePrice = sizeM2 * 3000;
    const minPrice = Math.round(basePrice * 0.5);
    const maxPrice = Math.round(basePrice * 1.5);

    const searchUrl = buildIdealistaSearchUrl({
      operation: "venta",
      propertyType: idealistaType as "viviendas" | "chalets" | "pisos" | "aticos",
      municipality: slug,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      minRooms: Math.max(1, rooms - 1),
    });

    console.log(`Fetching: ${searchUrl}`);

    const scrapeResult = await fetchWithScrapingBee(searchUrl, apiKey, {
      renderJs: false,
      premiumProxy: true,
      countryCode: "es",
    });

    if (scrapeResult.error) {
      console.error("ScrapingBee error:", scrapeResult.error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch comparable listings", detail: scrapeResult.error }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allParsed = parseSearchResults(scrapeResult.html);
    console.log(`Parsed ${allParsed.length} listings`);

    // Filter comparables: must have size+rooms, rooms ±1, size ±30%
    const filtered = allParsed.filter((p) => {
      if (!p.sizeM2 || !p.rooms) return false;
      if (Math.abs(p.rooms - rooms) > 1) return false;
      if (p.sizeM2 < minSize || p.sizeM2 > maxSize) return false;
      return true;
    });

    console.log(`Filtered to ${filtered.length} comparables`);

    const inputFeatures = features || {};
    const valuationInput: ValuationInput = {
      sizeM2,
      rooms,
      bathrooms: bathrooms || null,
      propertyType,
      features: {
        hasPool: inputFeatures.hasPool || false,
        hasSeaViews: inputFeatures.hasSeaViews || false,
        hasGarage: inputFeatures.hasGarage || false,
        hasTerrace: inputFeatures.hasTerrace || false,
        hasGarden: inputFeatures.hasGarden || false,
        hasLift: inputFeatures.hasLift || false,
        hasAC: inputFeatures.hasAC || false,
        isExterior: inputFeatures.isExterior || false,
        hasStorage: inputFeatures.hasStorage || false,
      },
    };

    const comparables: ComparableProperty[] = filtered.map((p) => ({
      price: p.price,
      sizeM2: p.sizeM2!,
      rooms: p.rooms!,
      bathrooms: p.bathrooms || null,
      features: p.features,
    }));

    const result = calculateValuation(valuationInput, comparables);

    const responseComparables = filtered.slice(0, 15).map((p) => ({
      propertyCode: p.propertyCode,
      title: p.title,
      price: p.price,
      pricePerM2: p.pricePerM2,
      sizeM2: p.sizeM2,
      rooms: p.rooms,
      bathrooms: p.bathrooms,
      propertyType: p.propertyType,
      address: p.address,
      url: p.url,
      thumbnailUrl: p.thumbnailUrl,
      features: p.features,
    }));

    return new Response(
      JSON.stringify({
        valuation: {
          estimatedValue: result.estimatedValue,
          estimatedLow: result.estimatedLow,
          estimatedHigh: result.estimatedHigh,
          estimatedPricePerM2: result.estimatedPricePerM2,
          areaMedianPricePerM2: result.areaMedianPricePerM2,
          confidence: result.confidence,
          comparablesUsed: result.comparablesUsed,
          comparablesTotal: allParsed.length,
          featureAdjustments: result.featureAdjustments,
          totalAdjustmentPercent: result.totalAdjustmentPercent,
        },
        comparables: responseComparables,
        meta: {
          searchUrl,
          totalResults: allParsed.length,
          comparablesFound: filtered.length,
          creditsUsed: scrapeResult.creditsUsed,
          municipality: slug,
          inputSpecs: { sizeM2, rooms, bathrooms: bathrooms || null, propertyType },
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sell-valuation error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

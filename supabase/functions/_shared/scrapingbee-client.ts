const SCRAPINGBEE_BASE = "https://app.scrapingbee.com/api/v1/";

export interface ScrapingBeeOptions {
  renderJs?: boolean;
  premiumProxy?: boolean;
  stealthProxy?: boolean;
  countryCode?: string;
  blockAds?: boolean;
  waitForSelector?: string;
  wait?: number;
}

export interface ScrapingBeeResult {
  html: string;
  statusCode: number;
  creditsUsed: number;
  resolvedUrl: string;
  error: string | null;
}

export async function fetchWithScrapingBee(
  url: string,
  apiKey: string,
  options: ScrapingBeeOptions = {}
): Promise<ScrapingBeeResult> {
  const {
    renderJs = false,
    premiumProxy = true,
    countryCode = "es",
    blockAds = true,
    waitForSelector,
  } = options;

  const params = new URLSearchParams({
    api_key: apiKey,
    url: url,
    render_js: String(renderJs),
    premium_proxy: String(premiumProxy),
    country_code: countryCode,
    block_ads: String(blockAds),
  });

  if (waitForSelector) {
    params.set("wait_for", waitForSelector);
  }

  const response = await fetch(`${SCRAPINGBEE_BASE}?${params.toString()}`, {
    method: "GET",
    signal: AbortSignal.timeout(90000),
  });

  const html = await response.text();

  return {
    html,
    statusCode: response.status,
    creditsUsed: parseInt(response.headers.get("Spb-Credits") || "0", 10),
    resolvedUrl: response.headers.get("Spb-Resolved-Url") || url,
    error: response.status !== 200
      ? `ScrapingBee error ${response.status}: ${html.slice(0, 300)}`
      : null,
  };
}

export function buildIdealistaSearchUrl(params: {
  operation: "venta" | "alquiler";
  propertyType: "viviendas" | "chalets" | "pisos" | "aticos";
  municipality: string;
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  minRooms?: number;
  page?: number;
}): string {
  const { operation, propertyType, municipality, minPrice, maxPrice, minSize, maxSize, minRooms, page } = params;
  let url = `https://www.idealista.com/${operation}-${propertyType}/${municipality}/`;
  const queryParams: string[] = [];
  if (minPrice) queryParams.push(`precio-desde_${minPrice}`);
  if (maxPrice) queryParams.push(`precio-hasta_${maxPrice}`);
  if (minSize) queryParams.push(`metros-cuadrados-mas-de_${minSize}`);
  if (maxSize) queryParams.push(`metros-cuadrados-menos-de_${maxSize}`);
  if (minRooms) queryParams.push(`de-${minRooms}-habitaciones`);
  if (queryParams.length > 0) url += `con-${queryParams.join(",")}/`;
  if (page && page > 1) url += `pagina-${page}.htm`;
  return url;
}

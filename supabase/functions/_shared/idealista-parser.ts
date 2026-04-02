export interface PropertyFeatures {
  hasPool: boolean;
  hasGarage: boolean;
  hasTerrace: boolean;
  hasGarden: boolean;
  hasLift: boolean;
  hasAC: boolean;
  hasSeaViews: boolean;
  isExterior: boolean;
  hasStorage: boolean;
}

export interface ParsedProperty {
  propertyCode: string;
  url: string;
  title: string;
  price: number;
  pricePerM2: number | null;
  sizeM2: number | null;
  rooms: number | null;
  bathrooms: number | null;
  floor: string | null;
  propertyType: string | null;
  address: string | null;
  municipality: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  features: PropertyFeatures;
  tags: string[];
}

export interface ParsedDetailProperty extends ParsedProperty {
  images: string[];
  fullDescription: string;
  energyRating: string | null;
  constructionYear: number | null;
  condition: string | null;
  contactInfo: {
    name: string | null;
    phone: string | null;
    type: string | null;
  };
}

const defaultFeatures = (): PropertyFeatures => ({
  hasPool: false,
  hasGarage: false,
  hasTerrace: false,
  hasGarden: false,
  hasLift: false,
  hasAC: false,
  hasSeaViews: false,
  isExterior: false,
  hasStorage: false,
});

function parseSpanishPrice(text: string): number {
  const cleaned = text.replace(/[^\d.,]/g, "");
  // Spanish format: 450.000 or 1.200.000
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  return Math.round(parseFloat(normalized));
}

function detectPropertyType(title: string): string | null {
  const t = title.toLowerCase();
  if (/ático|atico|penthouse/.test(t)) return "penthouse";
  if (/dúplex|duplex/.test(t)) return "duplex";
  if (/chalet independiente|villa|independent/.test(t)) return "villa";
  if (/chalet adosado|townhouse|adosado/.test(t)) return "townhouse";
  if (/chalet pareado|semi-detached/.test(t)) return "semi-detached";
  if (/chalet/.test(t)) return "chalet";
  if (/estudio|studio/.test(t)) return "studio";
  if (/piso|apartamento|apartment|flat/.test(t)) return "apartment";
  if (/casa|house/.test(t)) return "house";
  if (/finca|country/.test(t)) return "country_house";
  return null;
}

function detectFeatures(text: string): PropertyFeatures {
  const t = text.toLowerCase();
  return {
    hasPool: /piscina|pool/.test(t),
    hasSeaViews: /vista.*mar|sea.?view|primera.?línea|primera.?linea|front.?line/.test(t),
    hasGarage: /garaje|garage|parking|plaza de garaje/.test(t),
    hasTerrace: /terraza|terrace/.test(t),
    hasGarden: /jardín|jardin|garden/.test(t),
    hasLift: /ascensor|elevator|lift/.test(t),
    hasAC: /aire acondicionado|air condition|a\/c/.test(t),
    isExterior: /exterior/.test(t),
    hasStorage: /trastero|storage/.test(t),
  };
}

function mergeFeatures(a: PropertyFeatures, b: PropertyFeatures): PropertyFeatures {
  return {
    hasPool: a.hasPool || b.hasPool,
    hasGarage: a.hasGarage || b.hasGarage,
    hasTerrace: a.hasTerrace || b.hasTerrace,
    hasGarden: a.hasGarden || b.hasGarden,
    hasLift: a.hasLift || b.hasLift,
    hasAC: a.hasAC || b.hasAC,
    hasSeaViews: a.hasSeaViews || b.hasSeaViews,
    isExterior: a.isExterior || b.isExterior,
    hasStorage: a.hasStorage || b.hasStorage,
  };
}

export function parseSearchResults(html: string): ParsedProperty[] {
  const results: ParsedProperty[] = [];

  // Split by article items
  const articleRegex = /<article[^>]*class="[^"]*item[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
  let articleMatch;

  while ((articleMatch = articleRegex.exec(html)) !== null) {
    const block = articleMatch[1];

    // Property code from href
    const codeMatch = block.match(/\/inmueble\/(\d+)\//);
    if (!codeMatch) continue;
    const propertyCode = codeMatch[1];

    // URL
    const hrefMatch = block.match(/href="(\/inmueble\/\d+[^"]*)"/) ;
    const url = hrefMatch ? `https://www.idealista.com${hrefMatch[1]}` : `https://www.idealista.com/inmueble/${propertyCode}/`;

    // Price
    const priceMatch = block.match(/class="[^"]*item-price[^"]*"[^>]*>([\s\S]*?)<\//);
    const priceText = priceMatch ? priceMatch[1] : "";
    const price = priceText ? parseSpanishPrice(priceText) : 0;
    if (!price || isNaN(price)) continue;

    // Title
    const titleMatch = block.match(/class="[^"]*item-link[^"]*"[^>]*>([\s\S]*?)<\//);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    // Size
    const sizeMatch = block.match(/(\d+)\s*m²/);
    const sizeM2 = sizeMatch ? parseInt(sizeMatch[1], 10) : null;

    // Rooms
    const roomsMatch = block.match(/(\d+)\s*hab/);
    const rooms = roomsMatch ? parseInt(roomsMatch[1], 10) : null;

    // Bathrooms
    const bathMatch = block.match(/(\d+)\s*baño/);
    const bathrooms = bathMatch ? parseInt(bathMatch[1], 10) : null;

    // Floor
    const floorMatch = block.match(/(planta\s*\d+|bajo|entreplanta|sótano)/i);
    const floor = floorMatch ? floorMatch[1] : null;

    // Thumbnail
    const imgMatch = block.match(/<img[^>]*(?:src|data-src)="([^"]*idealista[^"]*|[^"]*imgstatic[^"]*)"[^>]*>/i) ||
      block.match(/<img[^>]*(?:src|data-src)="(https?:\/\/[^"]+)"[^>]*>/i);
    const thumbnailUrl = imgMatch ? imgMatch[1] : null;

    // Description snippet
    const descMatch = block.match(/class="[^"]*item-description[^"]*"[^>]*>([\s\S]*?)<\//);
    const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : null;

    // Address
    const addrMatch = block.match(/class="[^"]*item-detail-location[^"]*"[^>]*>([\s\S]*?)<\//);
    const address = addrMatch ? addrMatch[1].replace(/<[^>]+>/g, "").trim() : null;

    // Property type from title
    const propertyType = detectPropertyType(title);

    // Features from title + description
    const titleFeatures = detectFeatures(title);
    const descFeatures = description ? detectFeatures(description) : defaultFeatures();
    const features = mergeFeatures(titleFeatures, descFeatures);

    // Tags
    const tags: string[] = [];
    const tagRegex = /class="[^"]*item-highlight[^"]*"[^>]*>([\s\S]*?)<\//g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(block)) !== null) {
      tags.push(tagMatch[1].replace(/<[^>]+>/g, "").trim());
    }

    const pricePerM2 = sizeM2 && sizeM2 > 0 ? Math.round(price / sizeM2) : null;

    results.push({
      propertyCode,
      url,
      title,
      price,
      pricePerM2,
      sizeM2,
      rooms,
      bathrooms,
      floor,
      propertyType,
      address,
      municipality: null,
      description,
      thumbnailUrl,
      latitude: null,
      longitude: null,
      features,
      tags,
    });
  }

  return results;
}

export function parsePropertyDetail(html: string): ParsedDetailProperty | null {
  // Price
  const priceMatch = html.match(/class="[^"]*info-data-price[^"]*"[^>]*>([\s\S]*?)<\//) ||
    html.match(/class="[^"]*price[^"]*"[^>]*>([\s\S]*?)<\//) ||
    html.match(/"price"\s*:\s*(\d+)/);
  const price = priceMatch ? parseSpanishPrice(priceMatch[1]) : 0;

  // Title
  const titleMatch = html.match(/<h1[^>]*class="[^"]*main-info__title[^"]*"[^>]*>([\s\S]*?)<\/h1>/);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  // Location / address
  const locMatch = html.match(/class="[^"]*main-info__title-minor[^"]*"[^>]*>([\s\S]*?)<\//);
  const address = locMatch ? locMatch[1].replace(/<[^>]+>/g, "").trim() : null;

  // Property code from URL or page
  const codeMatch = html.match(/\/inmueble\/(\d+)\//) || html.match(/"propertyCode"\s*:\s*"(\d+)"/);
  const propertyCode = codeMatch ? codeMatch[1] : "";
  if (!propertyCode) return null;

  const url = `https://www.idealista.com/inmueble/${propertyCode}/`;

  // GPS coordinates
  const latMatch = html.match(/"latitude"\s*:\s*([\d.-]+)/) || html.match(/data-latitude="([\d.-]+)"/);
  const lngMatch = html.match(/"longitude"\s*:\s*([\d.-]+)/) || html.match(/data-longitude="([\d.-]+)"/);
  const latitude = latMatch ? parseFloat(latMatch[1]) : null;
  const longitude = lngMatch ? parseFloat(lngMatch[1]) : null;

  // Size
  const sizeMatch = html.match(/(\d+)\s*m²/) || html.match(/"size"\s*:\s*(\d+)/);
  const sizeM2 = sizeMatch ? parseInt(sizeMatch[1], 10) : null;

  // Rooms
  const roomsMatch = html.match(/(\d+)\s*hab/) || html.match(/"rooms"\s*:\s*(\d+)/);
  const rooms = roomsMatch ? parseInt(roomsMatch[1], 10) : null;

  // Bathrooms
  const bathMatch = html.match(/(\d+)\s*baño/) || html.match(/"bathrooms"\s*:\s*(\d+)/);
  const bathrooms = bathMatch ? parseInt(bathMatch[1], 10) : null;

  // Floor
  const floorMatch = html.match(/(planta\s*\d+|bajo|entreplanta|sótano)/i);
  const floor = floorMatch ? floorMatch[1] : null;

  // Images
  const images: string[] = [];
  const imgRegex = /<img[^>]*src="(https?:\/\/[^"]*(?:idealista|imgstatic)[^"]*)"[^>]*>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    if (!images.includes(imgMatch[1])) images.push(imgMatch[1]);
  }

  // Full description
  const fullDescMatch = html.match(/class="[^"]*comment[^"]*"[^>]*>([\s\S]*?)<\/div>/) ||
    html.match(/class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  const fullDescription = fullDescMatch ? fullDescMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  // Energy rating
  const energyMatch = html.match(/class="[^"]*energy-certification[^"]*"[^>]*>([\s\S]*?)<\//) ||
    html.match(/"energyCertification"\s*:\s*"([A-G])"/i);
  const energyRating = energyMatch ? energyMatch[1].replace(/<[^>]+>/g, "").trim().charAt(0).toUpperCase() : null;

  // Construction year
  const yearMatch = html.match(/(?:construido|built|año de construcción|construction year)[^0-9]*(\d{4})/i);
  const constructionYear = yearMatch ? parseInt(yearMatch[1], 10) : null;

  // Condition
  const condMatch = html.match(/(?:estado|condition)[^:]*:\s*([\w\s]+)/i);
  const condition = condMatch ? condMatch[1].trim() : null;

  // Contact info
  const contactNameMatch = html.match(/class="[^"]*professional-name[^"]*"[^>]*>([\s\S]*?)<\//);
  const contactPhoneMatch = html.match(/href="tel:([^"]+)"/);
  const contactTypeMatch = html.match(/class="[^"]*professional-type[^"]*"[^>]*>([\s\S]*?)<\//);

  // Property type and features
  const propertyType = detectPropertyType(title);
  const allText = `${title} ${fullDescription} ${address || ""}`;
  const features = detectFeatures(allText);

  const pricePerM2 = sizeM2 && sizeM2 > 0 ? Math.round(price / sizeM2) : null;
  const thumbnailUrl = images.length > 0 ? images[0] : null;

  return {
    propertyCode,
    url,
    title,
    price,
    pricePerM2,
    sizeM2,
    rooms,
    bathrooms,
    floor,
    propertyType,
    address,
    municipality: null,
    description: fullDescription.slice(0, 300),
    thumbnailUrl,
    latitude,
    longitude,
    features,
    tags: [],
    images,
    fullDescription,
    energyRating,
    constructionYear,
    condition,
    contactInfo: {
      name: contactNameMatch ? contactNameMatch[1].replace(/<[^>]+>/g, "").trim() : null,
      phone: contactPhoneMatch ? contactPhoneMatch[1] : null,
      type: contactTypeMatch ? contactTypeMatch[1].replace(/<[^>]+>/g, "").trim() : null,
    },
  };
}

export const MUNICIPALITY_SLUGS: Record<string, string> = {
  "marbella": "marbella-malaga",
  "estepona": "estepona-malaga",
  "fuengirola": "fuengirola-malaga",
  "mijas": "mijas-malaga",
  "benalmádena": "benalmadena-malaga",
  "benalmadena": "benalmadena-malaga",
  "torremolinos": "torremolinos-malaga",
  "málaga": "malaga-malaga",
  "malaga": "malaga-malaga",
  "nerja": "nerja-malaga",
  "manilva": "manilva-malaga",
  "casares": "casares-malaga",
  "benahavís": "benahavis-malaga",
  "benahavis": "benahavis-malaga",
  "ojén": "ojen-malaga",
  "ojen": "ojen-malaga",
  "istán": "istan-malaga",
  "istan": "istan-malaga",
  "madrid": "madrid-madrid",
  "barcelona": "barcelona-barcelona",
};

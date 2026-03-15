// Property categories and types

export const PROPERTY_CATEGORIES = [
  { value: "Apartments", label: "Apartments", description: "Residential apartments and penthouses" },
  { value: "Houses", label: "Houses", description: "Villas, houses and townhouses" },
  { value: "Commercial", label: "Commercial", description: "Offices, shops and commercial properties" },
  { value: "Rural Properties", label: "Rural Properties", description: "Country estates and land" },
  { value: "New Development", label: "New Development", description: "Off-plan and new construction" },
];

export const PROPERTY_TYPE_CATEGORIES = [
  {
    category: "Apartments",
    types: [
      { value: "apartment", label: "Standard Apartment", description: "Standard apartment" },
      { value: "penthouse", label: "Penthouse", description: "Top floor luxury apartment" },
      { value: "duplex-penthouse", label: "Duplex Penthouse", description: "Split-level top floor luxury" },
      { value: "ground-floor-apartment", label: "Ground Floor Apartment", description: "Ground level apartment" },
    ],
  },
  {
    category: "Houses",
    types: [
      { value: "detached-villa", label: "Detached Villa", description: "Free-standing villa" },
      { value: "semi-detached-house", label: "Semi-Detached House", description: "House sharing one common wall" },
      { value: "townhouse", label: "Townhouse", description: "Row house in urban setting" },
      { value: "modern-villa", label: "Modern Villa", description: "Villa with modern design" },
      { value: "andalusian-villa", label: "Andalusian-Style Villa", description: "Traditional Spanish style" },
      { value: "golf-villa", label: "Front-Line Golf Villa", description: "Villa with golf course views" },
      { value: "beachfront-villa", label: "Beachfront Villa", description: "Villa adjacent to the beach" },
      { value: "new-built-villa", label: "New Built Villa", description: "Recently constructed villa" },
    ],
  },
  {
    category: "Commercial",
    types: [
      { value: "office", label: "Office", description: "Office space" },
      { value: "shop", label: "Shop", description: "Retail shop" },
      { value: "commercial", label: "Commercial Property", description: "Restaurant, hotel, or other commercial" },
    ],
  },
  {
    category: "Rural Properties",
    types: [
      { value: "country-estate", label: "Finca/Cortijo", description: "Rural property with land" },
      { value: "land", label: "Building Plot / Land", description: "Undeveloped land for construction" },
    ],
  },
  {
    category: "New Development",
    types: [
      { value: "new-development", label: "New Development", description: "Pre-construction property" },
    ],
  },
];

export const ALL_PROPERTY_TYPES = PROPERTY_TYPE_CATEGORIES.flatMap((cat) => cat.types);

export const APARTMENT_TYPES = ["apartment", "penthouse", "duplex-penthouse", "ground-floor-apartment", "townhouse"];

// Address data shared between Sell and Rent
export interface AddressData {
  streetAddress: string;
  urbanization: string;
  city: string;
  province: string;
  country: string;
  complex?: string;
}

// Sell valuation form data
export interface SellValuationData {
  // Location
  streetAddress: string;
  urbanization: string;
  city: string;
  province: string;
  country: string;
  complex?: string;

  // Property details
  propertyCategory: string;
  propertyType: string;
  builtSize: string;
  plotSize: string;
  terraceSize: string;
  bedrooms: string;
  bathrooms: string;
  floor: string;

  // Features (sell-specific)
  condition: string;
  hasPool: boolean;
  views: string;
  hasGarage: boolean;
  propertyFeatures: string;
  orientation: string;
  yearBuilt: string;
  energyCertificate: string;

  // Contact
  fullName: string;
  email: string;
  phone: string;
  sellingTimeline: string;
  termsAccepted: boolean;
}

// Rent valuation form data
export interface RentValuationData {
  // Location
  streetAddress: string;
  urbanization: string;
  city: string;
  province: string;
  country: string;
  complex?: string;

  // Property details
  propertyCategory: string;
  propertyType: string;
  builtSize: string;
  plotSize: string;
  terraceSize: string;
  bedrooms: string;
  bathrooms: string;
  floor: string;

  // Features (rent-specific)
  condition: string;
  hasPool: boolean;
  views: string;
  hasAC: boolean;
  propertyFeatures: string;
  furnished: string;
  hasWifi: boolean;
  beachProximity: string;
  touristLicense: string;

  // Contact
  fullName: string;
  email: string;
  phone: string;
  rentalSituation: string;
  termsAccepted: boolean;
}

export const INITIAL_SELL_DATA: SellValuationData = {
  streetAddress: "",
  urbanization: "",
  city: "",
  province: "",
  country: "",
  complex: "",
  propertyCategory: "",
  propertyType: "",
  builtSize: "",
  plotSize: "",
  terraceSize: "",
  bedrooms: "",
  bathrooms: "",
  floor: "",
  condition: "",
  hasPool: false,
  seaView: "",
  hasGarage: false,
  orientation: "",
  yearBuilt: "",
  energyCertificate: "",
  fullName: "",
  email: "",
  phone: "",
  sellingTimeline: "",
  termsAccepted: false,
};

export const INITIAL_RENT_DATA: RentValuationData = {
  streetAddress: "",
  urbanization: "",
  city: "",
  province: "",
  country: "",
  complex: "",
  propertyCategory: "",
  propertyType: "",
  builtSize: "",
  plotSize: "",
  terraceSize: "",
  bedrooms: "",
  bathrooms: "",
  floor: "",
  condition: "",
  hasPool: false,
  seaView: "",
  hasAC: false,
  furnished: "",
  hasWifi: false,
  beachProximity: "",
  touristLicense: "",
  fullName: "",
  email: "",
  phone: "",
  rentalSituation: "",
  termsAccepted: false,
};

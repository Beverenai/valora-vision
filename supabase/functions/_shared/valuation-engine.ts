export interface ValuationInput {
  sizeM2: number;
  rooms: number;
  bathrooms: number;
  propertyType: string;
  features: {
    hasPool?: boolean;
    hasGarage?: boolean;
    hasTerrace?: boolean;
    hasGarden?: boolean;
    hasLift?: boolean;
    hasAC?: boolean;
    hasSeaViews?: boolean;
    isExterior?: boolean;
    hasStorage?: boolean;
  };
}

export interface ComparableProperty {
  price: number;
  sizeM2: number | null;
  pricePerM2?: number | null;
  features?: {
    hasPool?: boolean;
    hasGarage?: boolean;
    hasTerrace?: boolean;
    hasGarden?: boolean;
    hasLift?: boolean;
    hasAC?: boolean;
    hasSeaViews?: boolean;
    isExterior?: boolean;
    hasStorage?: boolean;
  };
}

export interface FeatureAdjustment {
  feature: string;
  adjustment: number;
  reason: string;
}

export interface ValuationResult {
  estimatedValue: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  pricePerM2: number;
  confidenceLevel: "high" | "medium" | "low" | "insufficient";
  comparablesUsed: number;
  comparablesTotal: number;
  featureAdjustments: FeatureAdjustment[];
  medianPricePerM2: number;
}

export interface PriceScore {
  score: string;
  label: string;
  color: string;
  deviationPercent: number;
}

export interface BuyAnalysisResult extends ValuationResult {
  askingPrice: number;
  priceScore: PriceScore;
  negotiationHint: string;
}

const FEATURE_ADJUSTMENTS: Record<string, number> = {
  hasSeaViews: 0.20,
  hasPool: 0.10,
  hasGarden: 0.06,
  hasGarage: 0.05,
  hasTerrace: 0.05,
  hasLift: 0.03,
  isExterior: 0.03,
  hasAC: 0.02,
  hasStorage: 0.02,
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function removeOutliersMAD(values: number[]): number[] {
  if (values.length < 4) return values;
  const med = median(values);
  const deviations = values.map((v) => Math.abs(v - med));
  const mad = median(deviations);
  if (mad === 0) return values;
  const scaledMAD = mad * 1.4826; // consistency constant for normal distribution
  return values.filter((v) => Math.abs(v - med) <= 2 * scaledMAD);
}

function getConfidenceLevel(count: number): "high" | "medium" | "low" | "insufficient" {
  if (count >= 15) return "high";
  if (count >= 8) return "medium";
  if (count >= 3) return "low";
  return "insufficient";
}

function formatEuro(amount: number): string {
  return `€${Math.round(amount).toLocaleString("es-ES")}`;
}

export function calculateValuation(
  input: ValuationInput,
  comparables: ComparableProperty[]
): ValuationResult {
  // Filter valid comparables
  const valid = comparables.filter((c) => c.price > 0 && c.sizeM2 && c.sizeM2 > 0);
  const totalComparables = valid.length;

  // Calculate price per m2
  const pricesPerM2 = valid.map((c) => c.pricePerM2 || c.price / c.sizeM2!);

  // Remove outliers
  const filtered = removeOutliersMAD(pricesPerM2);
  const comparablesUsed = filtered.length;

  // Median price per m2
  const medianPriceM2 = median(filtered);

  // Base estimate
  let estimatedValue = medianPriceM2 * input.sizeM2;

  // Feature adjustments
  const featureAdjustments: FeatureAdjustment[] = [];
  const featureKeys = Object.keys(FEATURE_ADJUSTMENTS) as Array<keyof typeof FEATURE_ADJUSTMENTS>;

  for (const key of featureKeys) {
    const targetHas = !!(input.features as Record<string, boolean | undefined>)[key];
    const comparableCount = valid.filter(
      (c) => c.features && !!(c.features as Record<string, boolean | undefined>)[key]
    ).length;
    const comparableRate = totalComparables > 0 ? comparableCount / totalComparables : 0;
    const adjustmentPct = FEATURE_ADJUSTMENTS[key];

    if (targetHas && comparableRate < 0.3) {
      // Target has a rare feature → positive adjustment
      const adj = adjustmentPct;
      estimatedValue *= 1 + adj;
      featureAdjustments.push({
        feature: key,
        adjustment: adj * 100,
        reason: `Property has ${key} (only ${Math.round(comparableRate * 100)}% of comparables)`,
      });
    } else if (!targetHas && comparableRate > 0.7) {
      // Target lacks a common feature → negative adjustment (half rate)
      const adj = adjustmentPct / 2;
      estimatedValue *= 1 - adj;
      featureAdjustments.push({
        feature: key,
        adjustment: -(adj * 100),
        reason: `Property lacks ${key} (${Math.round(comparableRate * 100)}% of comparables have it)`,
      });
    }
  }

  estimatedValue = Math.round(estimatedValue);
  const pricePerM2 = Math.round(estimatedValue / input.sizeM2);

  return {
    estimatedValue,
    priceRangeLow: Math.round(estimatedValue * 0.85),
    priceRangeHigh: Math.round(estimatedValue * 1.15),
    pricePerM2,
    confidenceLevel: getConfidenceLevel(comparablesUsed),
    comparablesUsed,
    comparablesTotal: totalComparables,
    featureAdjustments,
    medianPricePerM2: Math.round(medianPriceM2),
  };
}

function getPriceScore(deviationPercent: number): PriceScore {
  if (deviationPercent < -15) {
    return { score: "below_market", label: "BELOW MARKET", color: "#22c55e", deviationPercent };
  }
  if (deviationPercent < -5) {
    return { score: "good_value", label: "GOOD VALUE", color: "#86efac", deviationPercent };
  }
  if (deviationPercent <= 5) {
    return { score: "fair_price", label: "FAIR PRICE", color: "#9ca3af", deviationPercent };
  }
  if (deviationPercent <= 15) {
    return { score: "slightly_above", label: "SLIGHTLY ABOVE", color: "#fbbf24", deviationPercent };
  }
  return { score: "above_market", label: "ABOVE MARKET", color: "#ef4444", deviationPercent };
}

function getNegotiationHint(score: string, askingPrice: number, estimatedValue: number): string {
  const askingStr = formatEuro(askingPrice);
  const estimatedStr = formatEuro(estimatedValue);

  switch (score) {
    case "below_market":
      return `This property is listed at ${askingStr}, which is competitively priced below the estimated market value of ${estimatedStr}. Acting quickly may be advisable. Verify there are no underlying issues.`;
    case "good_value":
      return `Listed at ${askingStr}, this is priced slightly below the estimated market value of ${estimatedStr}. A modest offer of 2-3% below asking may be accepted.`;
    case "fair_price":
      return `The asking price of ${askingStr} is reasonable and aligns with the estimated market value of ${estimatedStr}. A negotiation margin of 3-5% is typical.`;
    case "slightly_above":
      return `At ${askingStr}, there may be room for negotiation compared to the estimated value of ${estimatedStr}. Consider starting your offer around estimated market value.`;
    case "above_market":
      return `The asking price of ${askingStr} is significantly above the estimated market value of ${estimatedStr}. Significant room for negotiation exists. Consider an initial offer closer to the estimated value.`;
    default:
      return `Asking price: ${askingStr}. Estimated value: ${estimatedStr}.`;
  }
}

export function calculateBuyAnalysis(
  askingPrice: number,
  input: ValuationInput,
  comparables: ComparableProperty[]
): BuyAnalysisResult {
  const valuation = calculateValuation(input, comparables);

  const deviationPercent = valuation.estimatedValue > 0
    ? ((askingPrice - valuation.estimatedValue) / valuation.estimatedValue) * 100
    : 0;

  const priceScore = getPriceScore(Math.round(deviationPercent * 10) / 10);
  const negotiationHint = getNegotiationHint(priceScore.score, askingPrice, valuation.estimatedValue);

  return {
    ...valuation,
    askingPrice,
    priceScore,
    negotiationHint,
  };
}

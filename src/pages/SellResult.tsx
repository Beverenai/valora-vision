import React, { useEffect, useState } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useParams, useNavigate, Link } from "react-router-dom";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

import ValuationTicketCard from "@/components/ValuationTicketCard";
import CardRevealWrapper from "@/components/shared/CardRevealWrapper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Bed, Bath, Grid3X3, Compass, Wrench, Mountain,
  Calendar, Leaf, ShieldCheck, Star, Users, Home,
  ChevronDown, ArrowUp, ArrowDown, Sparkles,
  Waves, Car, Fence, TreePine, Dumbbell, ArrowUpDown, Wind, Flame,
  ParkingCircle, Shield, Warehouse, Sun, Eye, Grape, ChefHat, Tv,
  Snowflake, Droplets, Lock, Wifi, MapPin, Check, Info, ExternalLink,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { formatRefCode } from "@/utils/referenceCode";
import { Copy, Check as CheckIcon } from "lucide-react";

// ── Property Features (inlined) ──
const FEATURE_ICON_MAP: Record<string, React.ElementType> = {
  pool: Waves, swimming: Waves, piscina: Waves,
  garage: Car, parking: ParkingCircle,
  terrace: Fence, terraza: Fence, roof: Fence,
  garden: TreePine, jardin: TreePine,
  gym: Dumbbell, fitness: Dumbbell,
  elevator: ArrowUpDown, lift: ArrowUpDown,
  "air conditioning": Snowflake, "aire acondicionado": Snowflake, ac: Snowflake,
  heating: Flame, calefaccion: Flame,
  security: Shield, alarm: Shield, vigilancia: Shield,
  storage: Warehouse, trastero: Warehouse,
  solarium: Sun, sun: Sun,
  views: Eye, sea: Eye, mountain: Eye,
  wine: Grape, bodega: Grape,
  kitchen: ChefHat,
  tv: Tv, cinema: Tv, entertainment: Tv,
  jacuzzi: Droplets, spa: Droplets, sauna: Droplets,
  gated: Lock,
  wifi: Wifi, internet: Wifi,
  bbq: Flame, barbecue: Flame,
};

function getFeatureIcon(feature: string): React.ElementType {
  const lower = feature.toLowerCase();
  for (const [keyword, Icon] of Object.entries(FEATURE_ICON_MAP)) {
    if (lower.includes(keyword)) return Icon;
  }
  return Wind;
}

const PropertyFeaturesSection: React.FC<{ features: string | null }> = ({ features }) => {
  if (!features) return null;
  const items = features.split(",").map((f) => f.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="w-10 h-px bg-gold mb-8" />
        <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-10">What Makes It Special</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-6">
          {items.map((feature) => {
            const Icon = getFeatureIcon(feature);
            return (
              <div key={feature} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <Icon size={16} className="text-gold" />
                </span>
                <span className="text-sm font-medium text-foreground capitalize">{feature.toLowerCase()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ── Comparable Properties ──
interface Comparable {
  id?: string; price?: number; price_per_sqm?: number; built_size_sqm?: number;
  bedrooms?: number; bathrooms?: number; property_type?: string; address?: string;
  city?: string; distance_km?: number; image_urls?: string[]; listing_url?: string;
}

const compFmt = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function calcSimilarity(comp: Comparable, leadSize: number | null, leadBedrooms: number | null, maxDistance: number): number {
  let score = 0;
  let factors = 0;
  // Size match (40% weight)
  if (comp.built_size_sqm && leadSize) {
    const sizeDiff = Math.abs(comp.built_size_sqm - leadSize) / leadSize;
    score += Math.max(0, 1 - sizeDiff) * 40;
    factors += 40;
  }
  // Room match (30% weight)
  if (comp.bedrooms != null && leadBedrooms != null) {
    const roomDiff = Math.abs(comp.bedrooms - leadBedrooms);
    score += Math.max(0, 1 - roomDiff / 3) * 30;
    factors += 30;
  }
  // Distance (30% weight)
  if (comp.distance_km != null) {
    score += Math.max(0, 1 - comp.distance_km / Math.max(maxDistance, 5)) * 30;
    factors += 30;
  }
  return factors > 0 ? Math.round((score / factors) * 100) : 50;
}

function getPriceColor(compPricePerSqm: number | undefined, leadPricePerSqm: number | null): string {
  if (!compPricePerSqm || !leadPricePerSqm) return "text-foreground";
  const diff = (compPricePerSqm - leadPricePerSqm) / leadPricePerSqm;
  if (diff < -0.1) return "text-emerald-600";
  if (diff > 0.1) return "text-accent";
  return "text-muted-foreground";
}

const ComparableCard: React.FC<{
  comp: Comparable; leadBedrooms?: number | null; leadBathrooms?: number | null;
  leadBuiltSize?: number | null; leadPricePerSqm?: number | null; maxDistance: number;
}> = ({ comp, leadBedrooms, leadBuiltSize, leadPricePerSqm, maxDistance }) => {
  const imageUrl = comp.image_urls?.[0] || "/placeholder.svg";
  const similarity = calcSimilarity(comp, leadBuiltSize || null, leadBedrooms || null, maxDistance);
  const priceColorClass = getPriceColor(comp.price_per_sqm, leadPricePerSqm || null);

  return (
    <div className="rounded-lg overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="h-[180px] bg-muted overflow-hidden">
        <img src={imageUrl} alt={comp.address || "Comparable"} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-5">
        <p className="text-xs text-muted-foreground capitalize">
          {comp.property_type?.replace(/-/g, " ") || "Property"} · {comp.bedrooms ?? "—"} bed · {comp.bathrooms ?? "—"} bath
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {comp.built_size_sqm ? `${comp.built_size_sqm} m² built` : ""}
        </p>

        <div className="flex items-baseline justify-between mt-3">
          {comp.price && <p className="text-xl font-light tracking-tight text-foreground">{compFmt(comp.price)}</p>}
          {comp.price_per_sqm && <p className={`text-xs font-medium ${priceColorClass}`}>{compFmt(comp.price_per_sqm)}/m²</p>}
        </div>

        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <MapPin size={12} />
          <span>{comp.distance_km != null ? `${comp.distance_km.toFixed(1)} km away` : ""}</span>
          {comp.city && <span>· {comp.city}</span>}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">Similarity</span>
            <span className="text-xs font-semibold text-foreground">{similarity}%</span>
          </div>
          <Progress value={similarity} className="h-1.5" />
        </div>
      </div>
    </div>
  );
};

const ComparablePropertiesSection: React.FC<{
  comparables: Comparable[] | null; leadBedrooms?: number | null;
  leadBathrooms?: number | null; leadBuiltSize?: number | null; leadPricePerSqm?: number | null;
}> = ({ comparables, leadBedrooms, leadBathrooms, leadBuiltSize, leadPricePerSqm }) => {
  const [showAll, setShowAll] = useState(false);
  if (!comparables || comparables.length === 0) return null;

  const maxDistance = Math.max(...comparables.map((c) => c.distance_km || 0), 1);
  const displayed = showAll ? comparables : comparables.slice(0, 6);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="w-10 h-px bg-gold mb-8" />
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Comparable Properties</p>
          <p className="text-xs text-muted-foreground">{comparables.length} found</p>
        </div>
        <p className="text-sm text-muted-foreground mb-10">Similar properties currently on the market near you</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayed.map((comp, i) => (
            <ComparableCard
              key={comp.id || i} comp={comp}
              leadBedrooms={leadBedrooms} leadBathrooms={leadBathrooms}
              leadBuiltSize={leadBuiltSize} leadPricePerSqm={leadPricePerSqm}
              maxDistance={maxDistance}
            />
          ))}
        </div>

        {comparables.length > 6 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-8 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
          >
            View all {comparables.length} comparable properties →
          </button>
        )}
      </div>
    </section>
  );
};

// ── Area Comparison Section ──
const AreaComparisonSection: React.FC<{
  userPricePerSqm: number | null; userSize: number | null; userBedrooms: number | null;
  comparables: Comparable[] | null;
}> = ({ userPricePerSqm, userSize, userBedrooms, comparables }) => {
  if (!comparables || comparables.length < 3) return null;

  const validPrices = comparables.filter((c) => c.price_per_sqm && c.price_per_sqm > 0).map((c) => c.price_per_sqm!);
  const validSizes = comparables.filter((c) => c.built_size_sqm && c.built_size_sqm > 0).map((c) => c.built_size_sqm!);
  const validBedrooms = comparables.filter((c) => c.bedrooms != null).map((c) => c.bedrooms!);

  const avgPrice = validPrices.length > 0 ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : null;
  const avgSize = validSizes.length > 0 ? Math.round(validSizes.reduce((a, b) => a + b, 0) / validSizes.length) : null;
  const avgBeds = validBedrooms.length > 0 ? +(validBedrooms.reduce((a, b) => a + b, 0) / validBedrooms.length).toFixed(1) : null;

  const bars = [
    userPricePerSqm && avgPrice ? {
      label: "Price/m²",
      userValue: `${compFmt(userPricePerSqm)}`,
      areaValue: `${compFmt(avgPrice)}`,
      pct: Math.min((userPricePerSqm / Math.max(avgPrice, 1)) * 100, 150),
      diff: Math.round(((userPricePerSqm - avgPrice) / avgPrice) * 100),
    } : null,
    userSize && avgSize ? {
      label: "Size",
      userValue: `${userSize} m²`,
      areaValue: `${avgSize} m²`,
      pct: Math.min((userSize / Math.max(avgSize, 1)) * 100, 150),
      diff: Math.round(((userSize - avgSize) / avgSize) * 100),
    } : null,
    userBedrooms != null && avgBeds != null ? {
      label: "Bedrooms",
      userValue: `${userBedrooms}`,
      areaValue: `${avgBeds}`,
      pct: Math.min((userBedrooms / Math.max(avgBeds, 1)) * 100, 150),
      diff: Math.round(((userBedrooms - avgBeds) / avgBeds) * 100),
    } : null,
  ].filter(Boolean) as { label: string; userValue: string; areaValue: string; pct: number; diff: number }[];

  if (bars.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="w-10 h-px bg-gold mb-8" />
        <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-10">
          Your Property vs the Market
        </p>

        <div className="space-y-8">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{bar.label}</span>
                <span className={`text-xs font-semibold ${bar.diff >= 0 ? "text-emerald-600" : "text-accent"}`}>
                  {bar.diff >= 0 ? "+" : ""}{bar.diff}% {bar.diff >= 0 ? "above" : "below"} average
                </span>
              </div>
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gold transition-all duration-700"
                  style={{ width: `${Math.min(bar.pct / 1.5, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-foreground font-medium">Yours: {bar.userValue}</span>
                <span className="text-xs text-muted-foreground">Area avg: {bar.areaValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Static Data ──
const PRICE_TREND_DATA = [
  { month: "Apr '25", price: 3800 }, { month: "May '25", price: 3850 },
  { month: "Jun '25", price: 3920 }, { month: "Jul '25", price: 4010 },
  { month: "Aug '25", price: 4050 }, { month: "Sep '25", price: 3980 },
  { month: "Oct '25", price: 4020 }, { month: "Nov '25", price: 4060 },
  { month: "Dec '25", price: 4000 }, { month: "Jan '26", price: 4080 },
  { month: "Feb '26", price: 4120 }, { month: "Mar '26", price: 4180 },
];

const MOCK_ANALYSIS = `Your 4-bedroom modern villa in Marbella presents strong value fundamentals. The south-facing orientation maximises natural light and is highly sought-after among international buyers, adding a premium of approximately 8–12% compared to north-facing equivalents. The sea views further enhance desirability, placing your property in the upper tier of comparable listings.

With 250 m² of built area on a 500 m² plot, the property offers a competitive size-to-plot ratio. The good condition minimises immediate renovation costs for buyers, which typically translates into faster sales timelines. Properties in similar condition in your area have averaged 4.2 months on the market.

The inclusion of a private swimming pool and garage adds an estimated €80,000–€120,000 to the overall valuation. Energy certificate rating and year of construction are factored into the long-term maintenance cost projections that sophisticated buyers increasingly consider.`;

const MOCK_TRENDS = `The Costa del Sol property market continues its upward trajectory into 2026, with average prices in Marbella rising 7.3% year-on-year.`;

const fmt = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

// ── Inline Sub-Components ──

const RefCodeBadge: React.FC<{ refCode: string }> = ({ refCode }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-center gap-3 py-6">
      <p className="text-xs text-muted-foreground">Reference</p>
      <button onClick={handleCopy} className="inline-flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-md font-mono text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">
        {refCode}
        {copied ? <CheckIcon size={12} className="text-accent" /> : <Copy size={12} className="text-muted-foreground" />}
      </button>
    </div>
  );
};

const DataCell: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center text-center py-8 px-5">
    <span className="text-gold mb-3">{icon}</span>
    <p className="text-[0.55rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-1.5">{label}</p>
    <p className="text-xl font-light tracking-tight text-foreground">{value}</p>
  </div>
);

const PropertySummaryCard: React.FC<{
  bedrooms?: number | null; bathrooms?: number | null; builtSize?: number | null; plotSize?: number | null;
  orientation?: string | null; condition?: string | null; views?: string | null; yearBuilt?: number | null;
  energyCertificate?: string | null; propertyType?: string | null;
}> = ({ bedrooms, bathrooms, builtSize, plotSize, orientation, condition, views, yearBuilt, energyCertificate, propertyType }) => {
  const cells = [
    { icon: <Bed size={16} />, label: "Bedrooms", value: bedrooms ?? "—" },
    { icon: <Bath size={16} />, label: "Bathrooms", value: bathrooms ?? "—" },
    { icon: <Home size={16} />, label: "Built", value: builtSize ? `${builtSize} m²` : "—" },
    { icon: <Grid3X3 size={16} />, label: "Plot", value: plotSize ? `${plotSize} m²` : "—" },
    { icon: <Compass size={16} />, label: "Facing", value: orientation ?? "—" },
    { icon: <Wrench size={16} />, label: "Condition", value: condition ?? "—" },
    { icon: <Mountain size={16} />, label: "Views", value: views ?? "—" },
    { icon: <Calendar size={16} />, label: "Year", value: yearBuilt ?? "—" },
    { icon: <Leaf size={16} />, label: "Energy", value: energyCertificate ?? "—" },
  ];
  return (
    <section className="py-10 md:py-16">
      {propertyType && (
        <div className="text-center mb-8">
          <p className="text-[0.6rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground">{propertyType.replace(/-/g, " ")}</p>
        </div>
      )}
      <div className="flex flex-wrap justify-center divide-x divide-border">
        {cells.map((cell) => <DataCell key={cell.label} {...cell} />)}
      </div>
    </section>
  );
};

// ── Upgraded Valuation Result Card with Price Range Bar ──
const ValuationResultCard: React.FC<{
  estimatedValue: number; estimatedLow: number; estimatedHigh: number;
  monthlyRental: number; comparableCount: number; city?: string;
}> = ({ estimatedValue, estimatedLow, estimatedHigh, monthlyRental, comparableCount, city }) => {
  const confidenceLevel = comparableCount >= 15 ? "HIGH" : comparableCount >= 8 ? "MEDIUM" : "LOW";
  const confidenceColor = confidenceLevel === "HIGH" ? "text-emerald-600 bg-emerald-50" : confidenceLevel === "MEDIUM" ? "text-amber-600 bg-amber-50" : "text-red-500 bg-red-50";
  const confidenceText = confidenceLevel === "HIGH"
    ? `Based on ${comparableCount} comparable properties within 5km`
    : confidenceLevel === "MEDIUM"
    ? `Based on ${comparableCount} comparable properties within 5km`
    : "Limited comparable data available";

  // Position of estimate on the range bar (0-100%)
  const rangeSpan = estimatedHigh - estimatedLow;
  const estimatePosition = rangeSpan > 0 ? ((estimatedValue - estimatedLow) / rangeSpan) * 100 : 50;

  return (
    <section className="py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto px-6">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-8">Estimated Market Value</p>
        <p className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-foreground">{fmt(estimatedValue)}</p>

        {/* Price Range Bar */}
        <div className="mt-10 max-w-md mx-auto">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">{fmt(estimatedLow)}</span>
            <span className="text-xs text-muted-foreground">{fmt(estimatedHigh)}</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20" />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gold border-2 border-background shadow-md"
              style={{ left: `calc(${estimatePosition}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground/60">Low</span>
            <span className="text-[0.55rem] uppercase tracking-[0.1em] text-gold font-semibold">Est.</span>
            <span className="text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground/60">High</span>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.6rem] uppercase tracking-[0.15em] font-semibold ${confidenceColor}`}>
            Confidence: {confidenceLevel}
          </span>
          <div className="group relative">
            <Info size={14} className="text-muted-foreground/50 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Range represents ±15% based on comparable market data
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{confidenceText}{city ? ` in ${city}` : ""}</p>

        {/* Monthly Rental */}
        <div className="mt-16">
          <p className="text-[0.55rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-2">Estimated Monthly Rental</p>
          <p className="text-2xl md:text-3xl font-light tracking-tight text-foreground">{fmt(monthlyRental)}</p>
        </div>
      </div>
    </section>
  );
};

const AIAnalysisSection: React.FC<{ content: string }> = ({ content }) => {
  const paragraphs = content.split("\n\n").filter(Boolean);
  const firstParagraph = paragraphs[0] || "";
  const firstSentence = firstParagraph.split(/\.\s/)[0] + ".";

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="w-10 h-px bg-gold mb-8" />
        <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-10">
          Property Analysis
        </p>

        <p className="font-heading italic text-lg md:text-xl text-foreground/60 leading-relaxed mb-10 border-l-2 border-gold pl-6">
          {firstSentence}
        </p>

        <p className="text-[15px] leading-[2] text-foreground/70 font-light first-letter:text-5xl first-letter:font-heading first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-foreground">
          {firstParagraph}
        </p>

        {paragraphs.slice(1).map((p, i) => (
          <p key={i} className="text-[15px] leading-[2] text-foreground/70 font-light mt-8">{p}</p>
        ))}
      </div>
    </section>
  );
};

const MarketTrendsSection: React.FC<{ content: string; chartData: { month: string; price: number }[] }> = ({ content, chartData }) => (
  <Collapsible>
    <section className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="w-10 h-px bg-gold mb-8" />
        <div className="flex items-center justify-between">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Market Trends</p>
          <CollapsibleTrigger asChild>
            <button className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 font-medium transition-colors">
              View trends <ChevronDown size={14} className="transition-transform data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-8">
          <p className="text-[15px] leading-[2] text-foreground/70 font-light mb-10 max-w-xl">{content}</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: "12px" }} formatter={(value: number) => [`€${value}/m²`, "Price"]} />
                <Area type="monotone" dataKey="price" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#trendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[0.55rem] uppercase tracking-[0.15em] text-muted-foreground/50 mt-4">€/m² — 12 Month Trend</p>
        </CollapsibleContent>
      </div>
    </section>
  </Collapsible>
);

// ── Matched Agents Section ──
interface MatchedAgent {
  id: string; company_name: string; slug: string; logo_url: string | null;
  tagline: string | null; bio: string | null; avg_rating: number | null;
  total_reviews: number | null; is_verified: boolean | null;
  languages: string[] | null; website: string | null; distance_km: number | null;
}

const AgentCard: React.FC<{ agent: MatchedAgent; onContact: (agent: MatchedAgent) => void }> = ({ agent, onContact }) => {
  const initials = agent.company_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const rating = agent.avg_rating || 0;
  const fullStars = Math.floor(rating);

  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center text-center">
      {agent.logo_url ? (
        <img src={agent.logo_url} alt={agent.company_name} className="w-16 h-16 rounded-full object-cover border border-border" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-lg font-semibold text-muted-foreground">
          {initials}
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="font-heading text-base font-bold text-foreground">{agent.company_name}</h3>
          {agent.is_verified && (
            <ShieldCheck size={14} className="text-accent" />
          )}
        </div>
        {agent.tagline && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{agent.tagline}</p>}
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className={i < fullStars ? "fill-gold text-gold" : "text-muted-foreground/30"} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{agent.total_reviews || 0} reviews</span>
      </div>

      {agent.distance_km != null && (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <MapPin size={11} /> {agent.distance_km} km from property
        </p>
      )}

      {agent.languages && agent.languages.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-3">
          {agent.languages.slice(0, 4).map((lang) => (
            <span key={lang} className="text-[0.55rem] uppercase tracking-[0.1em] bg-muted px-2 py-0.5 rounded text-muted-foreground">{lang}</span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-5 w-full">
        <Button onClick={() => onContact(agent)} className="bg-gold text-primary-foreground hover:bg-gold-dark w-full text-sm">
          Contact {agent.company_name.split(" ")[0]}
        </Button>
        <Link to={`/agentes/${agent.slug}`}>
          <Button variant="outline" className="w-full text-sm">View Profile</Button>
        </Link>
      </div>
    </div>
  );
};

const ContactAgentModal: React.FC<{
  agent: MatchedAgent | null; open: boolean; onClose: () => void; propertyAddress: string;
}> = ({ agent, open, onClose, propertyAddress }) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  useEffect(() => {
    if (open && propertyAddress) {
      setForm((f) => ({
        ...f,
        message: `I valued my property on ValoraCasa at ${propertyAddress} and would like your expert opinion.`,
      }));
    }
  }, [open, propertyAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent || !form.name || !form.email) return;
    setSending(true);
    const { error } = await supabase.from("agent_contact_requests").insert({
      professional_id: agent.id,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      message: form.message || null,
      interest: "valuation",
    });
    setSending(false);
    if (error) {
      toast({ title: "Error", description: "Could not send message. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Message Sent!", description: `${agent.company_name} will be in touch soon.` });
      onClose();
      setForm({ name: "", email: "", phone: "", message: "" });
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {agent.logo_url ? (
              <img src={agent.logo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                {agent.company_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <DialogTitle className="font-heading">Contact {agent.company_name}</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="contact-name">Name *</Label>
            <Input id="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="contact-email">Email *</Label>
            <Input id="contact-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="contact-phone">Phone</Label>
            <Input id="contact-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="contact-message">Message</Label>
            <Textarea id="contact-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} />
          </div>
          <Button type="submit" disabled={sending} className="w-full bg-gold text-primary-foreground hover:bg-gold-dark">
            {sending ? "Sending..." : "Send Message"}
          </Button>
          <p className="text-[0.6rem] text-muted-foreground/60 text-center">
            Your contact details are shared with {agent.company_name} only.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const MatchedAgentsSection: React.FC<{ latitude: number | null; longitude: number | null; city: string | null; propertyAddress: string }> = ({
  latitude, longitude, city, propertyAddress,
}) => {
  const [agents, setAgents] = useState<MatchedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactAgent, setContactAgent] = useState<MatchedAgent | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) { setLoading(false); return; }
    supabase
      .rpc("match_agents_by_location", { p_lat: latitude, p_lng: longitude, p_limit: 3 })
      .then(({ data, error }) => {
        if (!error && data) setAgents(data as MatchedAgent[]);
        setLoading(false);
      });
  }, [latitude, longitude]);

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="animate-pulse text-muted-foreground text-sm">Finding local experts…</div>
        </div>
      </section>
    );
  }

  if (agents.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="w-10 h-px bg-gold mx-auto mb-8" />
          <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-3">
            Recommended Local Experts
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Local agents coming soon. Want to be featured here?
          </p>
          <Link to="/pro">
            <Button variant="outline" className="rounded-full">
              Join as an Agent
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="w-10 h-px bg-gold mb-8" />
        <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-3">Recommended Local Experts</p>
        <p className="text-sm text-muted-foreground mb-10">Matched based on proximity, reviews, and expertise</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onContact={setContactAgent} />
          ))}
        </div>

        {city && (
          <p className="text-sm text-accent mt-8 text-center">
            <Link to={`/agentes?location=${encodeURIComponent(city)}`} className="hover:underline">
              See all agents in {city} →
            </Link>
          </p>
        )}
        <p className="text-[0.55rem] text-muted-foreground/50 text-center mt-3">
          Rankings based on proximity, verified reviews, and platform activity
        </p>

        <ContactAgentModal
          agent={contactAgent}
          open={!!contactAgent}
          onClose={() => setContactAgent(null)}
          propertyAddress={propertyAddress}
        />
      </div>
    </section>
  );
};

const ValuationPredictionGame: React.FC<{ leadId: string; leadType: "sell" | "rent" }> = ({ leadId, leadType }) => {
  const { toast } = useToast();
  const [prediction, setPrediction] = useState<"higher" | "lower" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handlePrediction = async (guess: "higher" | "lower") => {
    setPrediction(guess);
    const { error } = await supabase.from("valuation_feedback").insert({
      lead_id: leadId,
      lead_type: leadType,
      rating: guess === "higher" ? 5 : 1,
      comment: `prediction:${guess}`,
    });
    if (error) {
      toast({ title: "Error", description: "Could not save your prediction.", variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  const responseText = prediction === "higher"
    ? "Many owners are surprised — your property is performing well against the market."
    : "Great instinct — the Costa del Sol market has been rising steadily.";

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-md mx-auto px-6 text-center">
        <div className="w-10 h-px bg-gold mx-auto mb-8" />
        <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-4">
          Your Prediction
        </p>
        <p className="text-lg font-light text-foreground/80 mb-8">
          Did you think it would be…
        </p>

        {!submitted ? (
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handlePrediction("higher")}
              className={`flex flex-col items-center gap-2 px-8 py-6 border rounded-lg transition-all duration-200 ${
                prediction === "higher"
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
              }`}
            >
              <ArrowUp size={28} strokeWidth={1.5} />
              <span className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold">Higher</span>
            </button>
            <button
              onClick={() => handlePrediction("lower")}
              className={`flex flex-col items-center gap-2 px-8 py-6 border rounded-lg transition-all duration-200 ${
                prediction === "lower"
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
              }`}
            >
              <ArrowDown size={28} strokeWidth={1.5} />
              <span className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold">Lower</span>
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 text-gold mb-4">
              <Sparkles size={16} />
              <span className="text-[0.6rem] uppercase tracking-[0.2em] font-semibold">
                {prediction === "higher" ? "↑ Higher" : "↓ Lower"}
              </span>
              <Sparkles size={16} />
            </div>
            <p className="text-[15px] leading-[2] text-foreground/70 font-light max-w-sm mx-auto">
              {responseText}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const ValuationDisclaimer: React.FC = () => {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          This valuation is an automated estimate based on the information provided and market analysis as of {today}. It may not reflect actual market value. For an accurate appraisal, consult a qualified professional.
        </p>
        <p className="text-xs text-muted-foreground/40 mt-3">© {new Date().getFullYear()} ValoraCasa</p>
      </div>
    </section>
  );
};

// ── Main Page ──

interface LeadData {
  id: string; address: string; city: string | null; property_type: string | null;
  built_size_sqm: number | null; plot_size_sqm: number | null; bedrooms: number | null;
  bathrooms: number | null; orientation: string | null; condition: string | null;
  views: string | null; year_built: number | null; energy_certificate: string | null;
  estimated_value: number | null; price_range_low: number | null; price_range_high: number | null;
  price_per_sqm: number | null;
  monthly_rental_estimate: number | null; analysis: string | null; market_trends: string | null; features: string | null;
  comparable_properties: any[] | null; status: string | null;
  latitude: number | null; longitude: number | null;
}

const SellResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Your Property Valuation | ValoraCasa"; }, []);

  useEffect(() => {
    if (!id) { navigate("/sell"); return; }
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const fetchLead = async () => {
      const { data, error } = await supabase
        .from("leads_sell")
        .select("id, address, city, property_type, built_size_sqm, plot_size_sqm, bedrooms, bathrooms, orientation, condition, views, year_built, energy_certificate, estimated_value, price_range_low, price_range_high, price_per_sqm, monthly_rental_estimate, analysis, market_trends, features, comparable_properties, status, latitude, longitude")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast({ title: "Not Found", description: "Valuation not found.", variant: "destructive" });
        navigate("/sell");
        return;
      }
      setLead(data as LeadData);

      if (data.status === "processing" || data.status === "pending") {
        pollTimer = setTimeout(fetchLead, 2000);
      } else {
        setLoading(false);
      }
    };
    fetchLead();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [id, navigate, toast]);

  const builtSize = lead?.built_size_sqm || 200;
  const estimatedValue = lead?.estimated_value || Math.round(builtSize * 3500);
  const estimatedLow = lead?.price_range_low || Math.round(estimatedValue * 0.85);
  const estimatedHigh = lead?.price_range_high || Math.round(estimatedValue * 1.15);
  const monthlyRental = lead?.monthly_rental_estimate || Math.round(estimatedValue * 0.004);
  const comparableCount = (lead?.comparable_properties as any[])?.length || 0;
  const propertyAddress = lead ? `${lead.address}${lead.city ? `, ${lead.city}` : ""}` : "";

  const handleShare = () => {
    const shareText = `My property at ${propertyAddress} is valued at ${fmt(estimatedValue)}.`;
    if (navigator.share) {
      navigator.share({ title: `Property Valuation – ${lead?.address || ""}`, text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      toast({ title: "Link copied!", description: "Valuation details copied to clipboard." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-32">
          <div className="animate-pulse text-muted-foreground">Loading your valuation...</div>
        </div>
      </div>
    );
  }

  const cardElement = (
    <ValuationTicketCard
      address={propertyAddress}
      city={lead?.city || undefined}
      estimatedValue={fmt(estimatedValue)}
      secondaryValue={`${fmt(estimatedLow)} – ${fmt(estimatedHigh)}`}
      propertyType={lead?.property_type || undefined}
      leadId={id!}
      headline="VALUED"
      subtitle="Your Valuation"
      accentType="sell"
      mode="result"
      referenceCode={formatRefCode(id!)}
      onShare={handleShare}
      onDownload={() => toast({ title: "Coming Soon", description: "PDF download will be available shortly." })}
    />
  );

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-background">
      <CardRevealWrapper accentType="sell" cardElement={cardElement} loading={loading}>
        <div className="max-w-[1000px] mx-auto">
          <RefCodeBadge refCode={formatRefCode(id!)} />

          <PropertySummaryCard bedrooms={lead?.bedrooms} bathrooms={lead?.bathrooms} builtSize={lead?.built_size_sqm} plotSize={lead?.plot_size_sqm} orientation={lead?.orientation} condition={lead?.condition} views={lead?.views} yearBuilt={lead?.year_built} energyCertificate={lead?.energy_certificate} propertyType={lead?.property_type} />
          
          <div className="w-full h-px bg-border" />

          <PropertyFeaturesSection features={lead?.features || null} />
          
          <div className="w-full h-px bg-border" />
          
          <ValuationResultCard
            estimatedValue={estimatedValue}
            estimatedLow={estimatedLow}
            estimatedHigh={estimatedHigh}
            monthlyRental={monthlyRental}
            comparableCount={comparableCount > 0 ? comparableCount : 15}
            city={lead?.city || undefined}
          />
          
          <div className="w-full h-px bg-border" />
          
          <AIAnalysisSection content={lead?.analysis || MOCK_ANALYSIS} />
          
          <div className="w-full h-px bg-border" />

          <ComparablePropertiesSection
            comparables={lead?.comparable_properties as any[] || null}
            leadBedrooms={lead?.bedrooms}
            leadBathrooms={lead?.bathrooms}
            leadBuiltSize={lead?.built_size_sqm}
            leadPricePerSqm={lead?.price_per_sqm}
          />

          <div className="w-full h-px bg-border" />

          <AreaComparisonSection
            userPricePerSqm={lead?.price_per_sqm || null}
            userSize={lead?.built_size_sqm || null}
            userBedrooms={lead?.bedrooms || null}
            comparables={lead?.comparable_properties as any[] || null}
          />

          <div className="w-full h-px bg-border" />
          
          <MarketTrendsSection content={lead?.market_trends || MOCK_TRENDS} chartData={PRICE_TREND_DATA} />
          
          <div className="w-full h-px bg-border" />

          <ValuationPredictionGame leadId={id!} leadType="sell" />
          
          <div className="w-full h-px bg-border" />
          
          <MatchedAgentsSection
            latitude={lead?.latitude || null}
            longitude={lead?.longitude || null}
            city={lead?.city || null}
            propertyAddress={propertyAddress}
          />
          
          <ValuationDisclaimer />
        </div>
      </CardRevealWrapper>
    </div>
    </ErrorBoundary>
  );
};

export default SellResult;

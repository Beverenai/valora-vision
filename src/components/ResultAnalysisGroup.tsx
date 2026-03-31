import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  Waves, Car, ParkingCircle, Fence, TreePine, Dumbbell, ArrowUpDown, Wind, Flame,
  Shield, Warehouse, Sun, Eye, Grape, ChefHat, Tv, Snowflake, Droplets, Lock, Wifi, MapPin,
} from "lucide-react";

// ── Feature Icon Map ──
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

export const PropertyFeaturesSection: React.FC<{ features: string | null }> = ({ features }) => {
  if (!features) return null;
  const items = features.split(",").map((f) => f.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <section className="py-8 sm:py-12 border-b border-border/50">
      <div className="max-w-2xl mx-auto px-6">
        <div className="w-10 h-px bg-gold mb-8" />
        <SectionLabel className="mb-2">What Makes It Special</SectionLabel>
        <h2 className="font-serif text-2xl sm:text-3xl mb-6">Property Features</h2>
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
export interface Comparable {
  id?: string; price?: number; price_per_sqm?: number; built_size_sqm?: number;
  bedrooms?: number; bathrooms?: number; property_type?: string; address?: string;
  city?: string; distance_km?: number; image_urls?: string[]; listing_url?: string;
}

const compFmt = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function calcSimilarity(comp: Comparable, leadSize: number | null, leadBedrooms: number | null, maxDistance: number): number {
  let score = 0;
  let factors = 0;
  if (comp.built_size_sqm && leadSize) {
    const sizeDiff = Math.abs(comp.built_size_sqm - leadSize) / leadSize;
    score += Math.max(0, 1 - sizeDiff) * 40;
    factors += 40;
  }
  if (comp.bedrooms != null && leadBedrooms != null) {
    const roomDiff = Math.abs(comp.bedrooms - leadBedrooms);
    score += Math.max(0, 1 - roomDiff / 3) * 30;
    factors += 30;
  }
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

export const ComparablePropertiesSection: React.FC<{
  comparables: Comparable[] | null; leadBedrooms?: number | null;
  leadBathrooms?: number | null; leadBuiltSize?: number | null; leadPricePerSqm?: number | null;
}> = ({ comparables, leadBedrooms, leadBathrooms, leadBuiltSize, leadPricePerSqm }) => {
  const [showAll, setShowAll] = useState(false);
  if (!comparables || comparables.length === 0) return null;

  const maxDistance = Math.max(...comparables.map((c) => c.distance_km || 0), 1);
  const displayed = showAll ? comparables : comparables.slice(0, 6);

  return (
    <section className="py-8 sm:py-12 border-b border-border/50">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="w-10 h-px bg-gold mb-8" />
        <div className="flex items-baseline justify-between mb-2">
          <SectionLabel className="mb-0">Comparable Properties</SectionLabel>
          <p className="text-xs text-muted-foreground">{comparables.length} found</p>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl mb-2">Similar Properties</h2>
        <p className="text-sm text-muted-foreground mb-10">Currently on the market near you</p>
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
          <button onClick={() => setShowAll(true)} className="mt-8 text-sm text-accent hover:text-accent/80 font-medium transition-colors">
            View all {comparables.length} comparable properties →
          </button>
        )}
      </div>
    </section>
  );
};

// ── Area Comparison ──
export const AreaComparisonSection: React.FC<{
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
      label: "Price/m²", userValue: `${compFmt(userPricePerSqm)}`, areaValue: `${compFmt(avgPrice)}`,
      pct: Math.min((userPricePerSqm / Math.max(avgPrice, 1)) * 100, 150),
      diff: Math.round(((userPricePerSqm - avgPrice) / avgPrice) * 100),
    } : null,
    userSize && avgSize ? {
      label: "Size", userValue: `${userSize} m²`, areaValue: `${avgSize} m²`,
      pct: Math.min((userSize / Math.max(avgSize, 1)) * 100, 150),
      diff: Math.round(((userSize - avgSize) / avgSize) * 100),
    } : null,
    userBedrooms != null && avgBeds != null ? {
      label: "Bedrooms", userValue: `${userBedrooms}`, areaValue: `${avgBeds}`,
      pct: Math.min((userBedrooms / Math.max(avgBeds, 1)) * 100, 150),
      diff: Math.round(((userBedrooms - avgBeds) / avgBeds) * 100),
    } : null,
  ].filter(Boolean) as { label: string; userValue: string; areaValue: string; pct: number; diff: number }[];

  if (bars.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="w-10 h-px bg-gold mb-8" />
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-10">Your Property vs the Market</p>
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
                <div className="h-full rounded-full bg-gold transition-all duration-700" style={{ width: `${Math.min(bar.pct / 1.5, 100)}%` }} />
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

// ── Market Trends ──
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronDown } from "lucide-react";

export const MarketTrendsSection: React.FC<{ content: string; chartData: { month: string; price: number }[] }> = ({ content, chartData }) => (
  <Collapsible>
    <section className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="w-10 h-px bg-gold mb-8" />
        <div className="flex items-center justify-between">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Market Trends</p>
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

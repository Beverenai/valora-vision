import React, { lazy, Suspense, useEffect, useState } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useParams, useNavigate } from "react-router-dom";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import ValuationTicketCard from "@/components/ValuationTicketCard";
import CardRevealWrapper from "@/components/shared/CardRevealWrapper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { lazyRetry } from "@/lib/lazyRetry";
import { formatRefCode } from "@/utils/referenceCode";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";
import { StickyAgentButton } from "@/components/shared/StickyAgentButton";
import { Copy, Check as CheckIcon } from "lucide-react";
import {
  Bed, Bath, Grid3X3, Compass, Wrench, Mountain,
  Calendar, Leaf, Home, Info,
} from "lucide-react";
import type { Comparable } from "@/components/ResultAnalysisGroup";

// ── Lazy wrappers: each returns a single default-exported component ──

const LazyAnalysisBundle = lazy(() =>
  lazyRetry(() =>
    import("@/components/ResultAnalysisGroup").then((mod) => ({
      default: (props: {
        features: string | null;
        comparables: Comparable[] | null;
        leadBedrooms?: number | null;
        leadBathrooms?: number | null;
        leadBuiltSize?: number | null;
        leadPricePerSqm?: number | null;
        marketContent: string;
        chartData: { month: string; price: number }[];
      }) => (
        <>
          <mod.PropertyFeaturesSection features={props.features} />
          <div className="w-full h-px bg-border" />
          <mod.ComparablePropertiesSection
            comparables={props.comparables}
            leadBedrooms={props.leadBedrooms}
            leadBathrooms={props.leadBathrooms}
            leadBuiltSize={props.leadBuiltSize}
            leadPricePerSqm={props.leadPricePerSqm}
          />
          <div className="w-full h-px bg-border" />
          <mod.AreaComparisonSection
            userPricePerSqm={props.leadPricePerSqm || null}
            userSize={props.leadBuiltSize || null}
            userBedrooms={props.leadBedrooms || null}
            comparables={props.comparables}
          />
          <div className="w-full h-px bg-border" />
          <mod.MarketTrendsSection content={props.marketContent} chartData={props.chartData} />
        </>
      ),
    }))
  )
);

const LazyAgentBundle = lazy(() =>
  lazyRetry(() =>
    import("@/components/ResultAgentGroup").then((mod) => ({
      default: (props: {
        leadId: string;
        latitude: number | null;
        longitude: number | null;
        city: string | null;
        propertyAddress: string;
      }) => (
        <>
          <mod.ValuationPredictionGame leadId={props.leadId} leadType="sell" />
          <div className="w-full h-px bg-border" />
          <mod.MatchedAgentsSection
            latitude={props.latitude}
            longitude={props.longitude}
            city={props.city}
            propertyAddress={props.propertyAddress}
          />
          <mod.ValuationDisclaimer />
        </>
      ),
    }))
  )
);


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

// ── Inline Sub-Components (above the fold — NOT lazy) ──

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
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground">{propertyType.replace(/-/g, " ")}</p>
        </div>
      )}
      <div className="flex flex-wrap justify-center divide-x divide-border">
        {cells.map((cell) => <DataCell key={cell.label} {...cell} />)}
      </div>
    </section>
  );
};

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

  const rangeSpan = estimatedHigh - estimatedLow;
  const estimatePosition = rangeSpan > 0 ? ((estimatedValue - estimatedLow) / rangeSpan) * 100 : 50;

  return (
    <section className="py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto px-6">
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-8">Estimated Market Value</p>
        <p className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-foreground">{fmt(estimatedValue)}</p>
        <div className="mt-10 max-w-md mx-auto">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">{fmt(estimatedLow)}</span>
            <span className="text-xs text-muted-foreground">{fmt(estimatedHigh)}</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20" />
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border-2 border-background shadow-md" style={{ left: `calc(${estimatePosition}% - 8px)` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground/60">Low</span>
            <span className="text-[0.55rem] uppercase tracking-[0.1em] text-accent font-semibold">Est.</span>
            <span className="text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground/60">High</span>
          </div>
        </div>
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
        <div className="mt-16">
          <p className="text-[0.55rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-2">Estimated Monthly Rental</p>
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
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-10">Property Analysis</p>
        <p className="font-heading italic text-lg md:text-xl text-foreground/60 leading-relaxed mb-10 border-l-2 border-gold pl-6">{firstSentence}</p>
        <p className="text-[15px] leading-[2] text-foreground/70 font-light first-letter:text-5xl first-letter:font-heading first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-foreground">{firstParagraph}</p>
        {paragraphs.slice(1).map((p, i) => (
          <p key={i} className="text-[15px] leading-[2] text-foreground/70 font-light mt-8">{p}</p>
        ))}
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

  useSEO({ title: "Your Property Valuation | ValoraCasa", description: "View your personalized property valuation report for Costa del Sol." });

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

          {/* Group 2: Lazy — features, comparables, area comparison, market trends */}
          <Suspense fallback={<SectionSkeleton rows={4} />}>
            <LazyAnalysisBundle
              features={lead?.features || null}
              comparables={lead?.comparable_properties as any[] || null}
              leadBedrooms={lead?.bedrooms}
              leadBathrooms={lead?.bathrooms}
              leadBuiltSize={lead?.built_size_sqm}
              leadPricePerSqm={lead?.price_per_sqm}
              marketContent={lead?.market_trends || MOCK_TRENDS}
              chartData={PRICE_TREND_DATA}
            />
          </Suspense>
          
          <div className="w-full h-px bg-border" />

          {/* Group 3: Lazy — prediction game, matched agents, disclaimer */}
          <Suspense fallback={<SectionSkeleton rows={3} />}>
            <LazyAgentBundle
              leadId={id!}
              latitude={lead?.latitude || null}
              longitude={lead?.longitude || null}
              city={lead?.city || null}
              propertyAddress={propertyAddress}
            />
          </Suspense>
        </div>
      </CardRevealWrapper>
      <StickyAgentButton />
    </div>
    </ErrorBoundary>
  );
};

export default SellResult;

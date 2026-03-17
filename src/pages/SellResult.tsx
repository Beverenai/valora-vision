import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ValuationTicketCard from "@/components/ValuationTicketCard";
import CardRevealWrapper from "@/components/shared/CardRevealWrapper";
import PropertyFeaturesSection from "@/components/result/PropertyFeaturesSection";
import ComparablePropertiesSection from "@/components/result/ComparablePropertiesSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Bed, Bath, Grid3X3, Compass, Wrench, Mountain,
  Calendar, Leaf, ShieldCheck, Star, Users, Home,
  ChevronDown, ArrowUp, ArrowDown, Sparkles,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { formatRefCode } from "@/utils/referenceCode";
import { Copy, Check as CheckIcon } from "lucide-react";

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

const ValuationResultCard: React.FC<{
  estimatedLow: number; estimatedHigh: number; monthlyRentalLow: number; monthlyRentalHigh: number;
  weeklyHighSeasonLow: number; weeklyHighSeasonHigh: number; comparableCount: number; city?: string;
}> = ({ estimatedLow, estimatedHigh, monthlyRentalLow, monthlyRentalHigh, weeklyHighSeasonLow, weeklyHighSeasonHigh, comparableCount, city }) => (
  <section className="py-16 md:py-24">
    <div className="text-center max-w-2xl mx-auto px-6">
      <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-8">Estimated Market Value</p>
      <p className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-foreground">{fmt(estimatedLow)}</p>
      <p className="text-3xl md:text-4xl font-light tracking-tight text-gold mt-3">— {fmt(estimatedHigh)}</p>
      <p className="text-sm text-muted-foreground mt-8">Based on {comparableCount} comparable properties{city ? ` in ${city}` : ""}</p>
    </div>

    <div className="flex justify-center gap-12 md:gap-20 mt-16 md:mt-20">
      <div className="text-center">
        <p className="text-[0.55rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-2">Monthly Rental</p>
        <p className="text-2xl md:text-3xl font-light tracking-tight text-foreground">{fmt(monthlyRentalLow)}<span className="text-muted-foreground"> – </span>{fmt(monthlyRentalHigh)}</p>
      </div>
      <div className="text-center">
        <p className="text-[0.55rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-2">Weekly High Season</p>
        <p className="text-2xl md:text-3xl font-light tracking-tight text-foreground">{fmt(weeklyHighSeasonLow)}<span className="text-muted-foreground"> – </span>{fmt(weeklyHighSeasonHigh)}</p>
      </div>
    </div>
  </section>
);

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

const ProfessionalSpotlight: React.FC<{
  companyName: string; tagline: string; rating: number; reviewCount: number;
  onContact: () => void; onViewProfile: () => void;
}> = ({ companyName, tagline, rating, reviewCount, onContact, onViewProfile }) => (
  <section className="py-16 md:py-24">
    <div className="max-w-xl mx-auto px-6 text-center">
      <div className="w-10 h-px bg-gold mx-auto mb-8" />
      <p className="text-[0.55rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-6">Recommended Local Expert</p>
      <div className="w-20 h-20 mx-auto bg-muted border border-border rounded-full flex items-center justify-center mb-5">
        <Users className="text-muted-foreground/40" size={28} />
      </div>
      <h3 className="font-heading text-xl font-bold text-foreground">{companyName}</h3>
      <p className="text-sm text-muted-foreground mt-1">{tagline}</p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <div className="flex gap-0.5">
          {Array.from({ length: rating }).map((_, i) => <Star key={i} size={14} className="fill-gold text-gold" />)}
        </div>
        <span className="text-xs text-muted-foreground">{reviewCount} reviews</span>
        <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-[0.55rem] uppercase tracking-[0.1em] font-semibold px-2 py-0.5">
          <ShieldCheck size={10} /> Verified
        </span>
      </div>
      <div className="flex justify-center gap-3 mt-8">
        <Button onClick={onContact} className="bg-gold text-primary hover:bg-gold-dark">Contact {companyName.split(" ")[0]}</Button>
        <Button variant="outline" onClick={onViewProfile}>View Profile</Button>
      </div>
    </div>
  </section>
);

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
        .select("id, address, city, property_type, built_size_sqm, plot_size_sqm, bedrooms, bathrooms, orientation, condition, views, year_built, energy_certificate, estimated_value, price_range_low, price_range_high, price_per_sqm, monthly_rental_estimate, analysis, market_trends, features, comparable_properties, status")
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
  const monthlyRentalLow = lead?.monthly_rental_estimate || Math.round(estimatedValue * 0.004);
  const monthlyRentalHigh = Math.round(monthlyRentalLow * 1.5);
  const weeklyHighLow = Math.round(monthlyRentalLow * 0.85);
  const weeklyHighHigh = Math.round(monthlyRentalHigh * 0.75);
  const comparableCount = (lead?.comparable_properties as any[])?.length || 0;

  const handleShare = () => {
    const shareText = `My property at ${lead?.address || ""}${lead?.city ? `, ${lead.city}` : ""} is valued at ${fmt(estimatedLow)} – ${fmt(estimatedHigh)}.`;
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
      address={lead ? `${lead.address}${lead.city ? `, ${lead.city}` : ""}` : ""}
      city={lead?.city || undefined}
      estimatedValue={fmt(estimatedLow)}
      secondaryValue={fmt(estimatedHigh)}
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
    <div className="min-h-screen bg-background">
      <CardRevealWrapper accentType="sell" cardElement={cardElement} loading={loading}>
        <div className="max-w-[1000px] mx-auto">
          <RefCodeBadge refCode={formatRefCode(id!)} />

          <PropertySummaryCard bedrooms={lead?.bedrooms} bathrooms={lead?.bathrooms} builtSize={lead?.built_size_sqm} plotSize={lead?.plot_size_sqm} orientation={lead?.orientation} condition={lead?.condition} views={lead?.views} yearBuilt={lead?.year_built} energyCertificate={lead?.energy_certificate} propertyType={lead?.property_type} />
          
          <div className="w-full h-px bg-border" />

          <PropertyFeaturesSection features={lead?.features || null} />
          
          <div className="w-full h-px bg-border" />
          
          <ValuationResultCard estimatedLow={estimatedLow} estimatedHigh={estimatedHigh} monthlyRentalLow={monthlyRentalLow} monthlyRentalHigh={monthlyRentalHigh} weeklyHighSeasonLow={weeklyHighLow} weeklyHighSeasonHigh={weeklyHighHigh} comparableCount={comparableCount > 0 ? comparableCount : 47} city={lead?.city || undefined} />
          
          <div className="w-full h-px bg-border" />
          
          <AIAnalysisSection content={lead?.analysis || MOCK_ANALYSIS} />
          
          <div className="w-full h-px bg-border" />
          
          <MarketTrendsSection content={lead?.market_trends || MOCK_TRENDS} chartData={PRICE_TREND_DATA} />
          
          <div className="w-full h-px bg-border" />

          <ComparablePropertiesSection
            comparables={lead?.comparable_properties as any[] || null}
            leadBedrooms={lead?.bedrooms}
            leadBathrooms={lead?.bathrooms}
            leadBuiltSize={lead?.built_size_sqm}
          />
          
          <div className="w-full h-px bg-border" />

          <ValuationPredictionGame leadId={id!} leadType="sell" />
          
          <div className="w-full h-px bg-border" />
          
          <ProfessionalSpotlight companyName="Costa Del Sol Premium Realty" tagline="Full-service luxury property experts since 2005" rating={5} reviewCount={127} onContact={() => toast({ title: "Contact Requested", description: "The agent will reach out to you shortly." })} onViewProfile={() => toast({ title: "Coming Soon", description: "Agent profiles are coming soon." })} />
          
          <ValuationDisclaimer />
        </div>
      </CardRevealWrapper>
    </div>
  );
};

export default SellResult;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConfettiAnimation from "@/components/shared/ConfettiAnimation";
import ValuationTicketCard from "@/components/ValuationTicketCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Share2, Download, Home, Bed, Bath, Grid3X3, Compass, Wrench, Mountain,
  Calendar, Leaf, Euro, CalendarDays, Sun, BarChart, BarChart3, TrendingUp,
  ShieldCheck, Star, Check, Users, ThumbsUp, Meh, ThumbsDown, Send,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import CrossSellBanner from "@/components/CrossSellBanner";
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

const MOCK_TRENDS = `The Costa del Sol property market continues its upward trajectory into 2026, with average prices in Marbella rising 7.3% year-on-year. International demand — particularly from Northern European, Middle Eastern, and North American buyers — remains robust, supported by Spain's Golden Visa programme and favourable lifestyle factors.

Inventory levels in the premium villa segment remain constrained, with only 3.8 months of supply available in Marbella's Golden Mile and surrounding areas. This supply-demand imbalance supports continued price appreciation, though the rate of increase is moderating from the post-pandemic highs of 2022–2023.

New construction activity is focused on boutique developments, while resale villas with modern finishes and sea views continue to command premiums. The rental market also remains strong, with luxury properties achieving gross yields of 4.5–6.2%, making dual-use (personal + rental) an attractive proposition for investors.`;

const MOCK_SERVICES = [
  "Professional photography & drone",
  "3D Matterport virtual tours",
  "International portal marketing",
  "Expert pricing strategy",
  "Full legal & paperwork support",
  "Dedicated personal agent",
];

const fmt = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

// ── Inline Sub-Components ──

const DataCell: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="p-5 border-b border-r border-border last:border-r-0">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-gold">{icon}</span>
      <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground">{label}</p>
    </div>
    <p className="text-2xl font-light tracking-tight text-foreground">{value}</p>
  </div>
);

const ValuationHero: React.FC<{ title: string; address: string; onShare: () => void; onDownload: () => void }> = ({ title, address, onShare, onDownload }) => (
  <section className="border-b border-border">
    <div className="h-0.5 bg-gold" />
    <div className="grid md:grid-cols-2">
      <div className="bg-primary p-8 md:p-12 flex flex-col justify-center">
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-primary-foreground/60 mb-3">Estimated Value Report</p>
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3">{title}</h1>
        <p className="text-gold text-lg md:text-xl font-medium mb-8">{address}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onShare} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Share2 size={16} /> Share Report
          </Button>
          <Button onClick={onDownload} className="bg-gold text-primary hover:bg-gold-dark">
            <Download size={16} /> Download PDF
          </Button>
        </div>
      </div>
      <div className="relative bg-muted min-h-[250px] md:min-h-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-border" />
        <Home className="relative text-muted-foreground/30" size={80} />
        <div className="absolute bottom-6 left-6 bg-primary/90 backdrop-blur-sm px-4 py-2">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-gold">Property Overview</p>
        </div>
      </div>
    </div>
  </section>
);

const PropertySummaryCard: React.FC<{
  bedrooms?: number | null; bathrooms?: number | null; builtSize?: number | null; plotSize?: number | null;
  orientation?: string | null; condition?: string | null; views?: string | null; yearBuilt?: number | null;
  energyCertificate?: string | null; propertyType?: string | null;
}> = ({ bedrooms, bathrooms, builtSize, plotSize, orientation, condition, views, yearBuilt, energyCertificate, propertyType }) => {
  const cells = [
    { icon: <Bed size={14} />, label: "Bedrooms", value: bedrooms ?? "—" },
    { icon: <Bath size={14} />, label: "Bathrooms", value: bathrooms ?? "—" },
    { icon: <Home size={14} />, label: "Built Size", value: builtSize ? `${builtSize} m²` : "—" },
    { icon: <Grid3X3 size={14} />, label: "Plot Size", value: plotSize ? `${plotSize} m²` : "—" },
    { icon: <Compass size={14} />, label: "Orientation", value: orientation ?? "—" },
    { icon: <Wrench size={14} />, label: "Condition", value: condition ?? "—" },
    { icon: <Mountain size={14} />, label: "Views", value: views ?? "—" },
    { icon: <Calendar size={14} />, label: "Year Built", value: yearBuilt ?? "—" },
    { icon: <Leaf size={14} />, label: "Energy Cert", value: energyCertificate ?? "—" },
  ];
  return (
    <section className="border-b border-border">
      {propertyType && (
        <div className="border-b border-border">
          <div className="h-0.5 bg-gold w-16" />
          <div className="px-6 py-3">
            <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Property Type</p>
            <p className="text-foreground font-heading font-semibold mt-1 capitalize">{propertyType.replace(/-/g, " ")}</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {cells.map((cell) => <DataCell key={cell.label} {...cell} />)}
      </div>
    </section>
  );
};

const ValuationResultCard: React.FC<{
  estimatedLow: number; estimatedHigh: number; monthlyRentalLow: number; monthlyRentalHigh: number;
  weeklyHighSeasonLow: number; weeklyHighSeasonHigh: number; comparableCount: number; city?: string;
}> = ({ estimatedLow, estimatedHigh, monthlyRentalLow, monthlyRentalHigh, weeklyHighSeasonLow, weeklyHighSeasonHigh, comparableCount, city }) => (
  <section className="border-b border-border">
    <div className="grid md:grid-cols-5">
      <div className="md:col-span-3 bg-primary p-8 md:p-12 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-4">
          <Euro className="text-gold" size={18} />
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-primary-foreground/60">Estimated Market Value</p>
        </div>
        <p className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-primary-foreground">{fmt(estimatedLow)}</p>
        <p className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gold mt-1">– {fmt(estimatedHigh)}</p>
        <div className="flex items-center gap-2 mt-6">
          <BarChart className="text-primary-foreground/40" size={14} />
          <p className="text-sm text-primary-foreground/60">Based on {comparableCount} comparable properties{city ? ` in ${city}` : ""}</p>
        </div>
      </div>
      <div className="md:col-span-2 grid grid-rows-2">
        <div className="p-6 md:p-8 border-b border-l border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="text-gold" size={14} />
            <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Monthly Rental Estimate</p>
          </div>
          <p className="text-2xl md:text-3xl font-light tracking-tight text-foreground">{fmt(monthlyRentalLow)} – {fmt(monthlyRentalHigh)}</p>
        </div>
        <div className="p-6 md:p-8 border-l border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="text-gold" size={14} />
            <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Weekly Rate (High Season)</p>
          </div>
          <p className="text-2xl md:text-3xl font-light tracking-tight text-foreground">{fmt(weeklyHighSeasonLow)} – {fmt(weeklyHighSeasonHigh)}</p>
        </div>
      </div>
    </div>
  </section>
);

const AIAnalysisSection: React.FC<{ content: string }> = ({ content }) => (
  <section className="border-b border-border">
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="text-accent" size={18} />
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Property Analysis</p>
      </div>
      <div className="max-w-3xl space-y-4">
        {content.split("\n\n").filter(Boolean).map((p, i) => (
          <p key={i} className="text-foreground/80 leading-relaxed text-[0.95rem]">{p}</p>
        ))}
      </div>
    </div>
  </section>
);

const MarketTrendsSection: React.FC<{ content: string; chartData: { month: string; price: number }[] }> = ({ content, chartData }) => (
  <section className="border-b border-border">
    <div className="grid md:grid-cols-2">
      <div className="p-6 md:p-10 border-b md:border-b-0 md:border-r border-border">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-accent" size={18} />
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Market Trends</p>
        </div>
        <div className="space-y-4">
          {content.split("\n\n").filter(Boolean).map((p, i) => (
            <p key={i} className="text-foreground/80 leading-relaxed text-[0.95rem]">{p}</p>
          ))}
        </div>
      </div>
      <div className="p-6 md:p-10 flex flex-col justify-center">
        <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-4">€/m² — 12 Month Trend</p>
        <div className="h-[250px]">
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
      </div>
    </div>
  </section>
);

const ProfessionalSpotlight: React.FC<{
  companyName: string; tagline: string; rating: number; reviewCount: number;
  services: string[]; quote: string; onContact: () => void; onViewProfile: () => void;
}> = ({ companyName, tagline, rating, reviewCount, services, quote, onContact, onViewProfile }) => (
  <section className="border-b border-border">
    <div className="px-6 md:px-10 py-4 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-accent" size={18} />
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Recommended Local Expert</p>
      </div>
      <p className="text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground/60">Sponsored</p>
    </div>
    <div className="grid md:grid-cols-5">
      <div className="md:col-span-3 p-6 md:p-10 border-b md:border-b-0 md:border-r border-border">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-20 h-20 shrink-0 bg-muted border border-border flex items-center justify-center">
            <Users className="text-muted-foreground/40" size={28} />
          </div>
          <div>
            <div className="h-0.5 bg-gold w-10 mb-2" />
            <h3 className="font-heading text-xl font-bold text-foreground">{companyName}</h3>
            <p className="text-sm text-muted-foreground mt-1">{tagline}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {Array.from({ length: rating }).map((_, i) => <Star key={i} size={14} className="fill-gold text-gold" />)}
              </div>
              <span className="text-xs text-muted-foreground">{reviewCount} reviews</span>
              <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-[0.6rem] uppercase tracking-[0.1em] font-semibold px-2 py-0.5 ml-1">
                <ShieldCheck size={10} /> Verified
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
          {services.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <Check size={14} className="text-accent shrink-0" />
              <span className="text-sm text-foreground/80">{s}</span>
            </div>
          ))}
        </div>
        <blockquote className="text-sm italic text-muted-foreground border-l-2 border-gold pl-4 mb-6">"{quote}"</blockquote>
        <div className="flex gap-3">
          <Button onClick={onContact} className="bg-gold text-primary hover:bg-gold-dark">Contact {companyName.split(" ")[0]}</Button>
          <Button variant="outline" onClick={onViewProfile}>View Profile</Button>
        </div>
      </div>
      <div className="md:col-span-2 relative bg-muted min-h-[250px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-border" />
        <Users className="relative text-muted-foreground/20" size={64} />
        <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5">
          <p className="text-[0.55rem] uppercase tracking-[0.15em] font-semibold text-gold">Premium Partner</p>
        </div>
      </div>
    </div>
  </section>
);

const FeedbackSection: React.FC<{ leadId: string; leadType: "sell" | "rent" }> = ({ leadId, leadType }) => {
  const { toast } = useToast();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === null) return;
    const { error } = await supabase.from("valuation_feedback").insert({ lead_id: leadId, lead_type: leadType, rating, comment: comment || null });
    if (error) {
      toast({ title: "Error", description: "Could not submit feedback.", variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Thank you!", description: "Your feedback helps us improve." });
    }
  };

  const options = [
    { value: 5, icon: <ThumbsUp size={20} />, label: "Helpful" },
    { value: 3, icon: <Meh size={20} />, label: "Okay" },
    { value: 1, icon: <ThumbsDown size={20} />, label: "Not helpful" },
  ];

  if (submitted) return (
    <section className="border-b border-border p-6 md:p-10 text-center">
      <p className="text-muted-foreground text-sm">Thank you for your feedback.</p>
    </section>
  );

  return (
    <section className="border-b border-border p-6 md:p-10">
      <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-4">Was this valuation helpful?</p>
      <div className="flex gap-3 mb-4">
        {options.map((opt) => (
          <button key={opt.value} onClick={() => setRating(opt.value)}
            className={`flex flex-col items-center gap-1 px-4 py-3 border transition-colors ${rating === opt.value ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-foreground/30"}`}>
            {opt.icon}
            <span className="text-[0.6rem] uppercase tracking-[0.1em] font-semibold">{opt.label}</span>
          </button>
        ))}
      </div>
      {rating !== null && (
        <div className="space-y-3 max-w-lg animate-fade-in">
          <Textarea placeholder="Any additional comments? (optional)" value={comment} onChange={(e) => setComment(e.target.value)} className="border-border bg-card resize-none" rows={3} />
          <Button onClick={handleSubmit} className="bg-gold text-primary hover:bg-gold-dark"><Send size={14} /> Submit Feedback</Button>
        </div>
      )}
    </section>
  );
};

const ValuationDisclaimer: React.FC = () => {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <section className="p-6 md:p-10">
      <p className="text-xs text-muted-foreground/70 max-w-3xl leading-relaxed">
        This valuation is an automated estimate based on the information provided and market analysis as of {today}. It may not reflect actual market value. For an accurate appraisal, consult a qualified professional.
      </p>
      <p className="text-xs text-muted-foreground/50 mt-2">© {new Date().getFullYear()} ValoraCasa</p>
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
  monthly_rental_estimate: number | null; analysis: string | null; market_trends: string | null; features: string | null;
}

const SellResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => { document.title = "Your Property Valuation | ValoraCasa"; }, []);

  useEffect(() => {
    if (!id) { navigate("/sell"); return; }
    const fetchLead = async () => {
      const { data, error } = await supabase
        .from("leads_sell")
        .select("id, address, city, property_type, built_size_sqm, plot_size_sqm, bedrooms, bathrooms, orientation, condition, views, year_built, energy_certificate, estimated_value, price_range_low, price_range_high, monthly_rental_estimate, analysis, market_trends, features")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Not Found", description: "Valuation not found.", variant: "destructive" });
        navigate("/sell");
        return;
      }
      setLead(data);
      setLoading(false);
    };
    fetchLead();
  }, [id, navigate, toast]);

  const builtSize = lead?.built_size_sqm || 200;
  const basePricePerSqm = 4100;
  const estimatedLow = lead?.price_range_low || Math.round(builtSize * basePricePerSqm * 0.9);
  const estimatedHigh = lead?.price_range_high || Math.round(builtSize * basePricePerSqm * 1.1);
  const monthlyRentalLow = lead?.monthly_rental_estimate || Math.round(estimatedLow * 0.004);
  const monthlyRentalHigh = Math.round(monthlyRentalLow * 1.5);
  const weeklyHighLow = Math.round(monthlyRentalLow * 0.85);
  const weeklyHighHigh = Math.round(monthlyRentalHigh * 0.75);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "My Property Valuation", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!", description: "Share this link with others." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-pulse text-muted-foreground">Loading your valuation...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {showConfetti && <ConfettiAnimation />}
      <div className="max-w-[1400px] mx-auto border-x border-border">
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
          onShare={handleShare}
          onDownload={() => toast({ title: "Coming Soon", description: "PDF download will be available shortly." })}
        />
        <PropertySummaryCard bedrooms={lead?.bedrooms} bathrooms={lead?.bathrooms} builtSize={lead?.built_size_sqm} plotSize={lead?.plot_size_sqm} orientation={lead?.orientation} condition={lead?.condition} views={lead?.views} yearBuilt={lead?.year_built} energyCertificate={lead?.energy_certificate} propertyType={lead?.property_type} />
        <ValuationResultCard estimatedLow={estimatedLow} estimatedHigh={estimatedHigh} monthlyRentalLow={monthlyRentalLow} monthlyRentalHigh={monthlyRentalHigh} weeklyHighSeasonLow={weeklyHighLow} weeklyHighSeasonHigh={weeklyHighHigh} comparableCount={47} city={lead?.city || undefined} />
        <AIAnalysisSection content={lead?.analysis || MOCK_ANALYSIS} />
        <MarketTrendsSection content={lead?.market_trends || MOCK_TRENDS} chartData={PRICE_TREND_DATA} />
        <ProfessionalSpotlight companyName="Costa Del Sol Premium Realty" tagline="Full-service luxury property experts since 2005" rating={5} reviewCount={127} services={MOCK_SERVICES} quote="We look forward to helping you achieve the best possible result for your property." onContact={() => toast({ title: "Contact Requested", description: "The agent will reach out to you shortly." })} onViewProfile={() => toast({ title: "Coming Soon", description: "Agent profiles are coming soon." })} />
        <FeedbackSection leadId={id!} leadType="sell" />
        {/* Cross-sell: Rent */}
        <div className="p-6 md:p-10">
          <CrossSellBanner variant="sell-to-rent" />
        </div>
        <ValuationDisclaimer />
      </div>
      <Footer />
    </div>
  );
};

export default SellResult;

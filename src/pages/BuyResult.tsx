import React, { useEffect, useState } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Bed, Bath, Home, MapPin, TrendingUp, TrendingDown, Minus,
  ExternalLink, Share2, Users, ShieldCheck, Star, Check, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const SCORE_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string; textClass: string }> = {
  below_market: { label: "BELOW MARKET", color: "hsl(var(--success))", bg: "bg-[hsl(var(--success)/0.1)]", emoji: "🟢", textClass: "text-[hsl(var(--success))]" },
  good_value: { label: "GOOD VALUE", color: "hsl(142 71% 45%)", bg: "bg-[hsl(142_71%_45%/0.1)]", emoji: "🟢", textClass: "text-[hsl(142_71%_45%)]" },
  fair_price: { label: "FAIR PRICE", color: "hsl(var(--muted-foreground))", bg: "bg-muted", emoji: "⚪", textClass: "text-muted-foreground" },
  slightly_above: { label: "SLIGHTLY ABOVE", color: "hsl(45 93% 47%)", bg: "bg-[hsl(45_93%_47%/0.1)]", emoji: "🟡", textClass: "text-[hsl(45_93%_47%)]" },
  above_market: { label: "ABOVE MARKET", color: "hsl(var(--destructive))", bg: "bg-destructive/10", emoji: "🔴", textClass: "text-destructive" },
};

const CONFIDENCE_LABELS: Record<string, { label: string; checks: number }> = {
  high: { label: "High confidence", checks: 3 },
  medium: { label: "Medium confidence", checks: 2 },
  low: { label: "Low confidence — limited data", checks: 1 },
  insufficient: { label: "Insufficient data", checks: 0 },
};

function getNegotiationHint(score: string | null, estimatedValue: number): string {
  switch (score) {
    case "below_market":
      return "This is competitively priced. If you're interested, acting quickly may be advisable as below-market listings attract strong buyer interest.";
    case "good_value":
      return "The price is slightly below market value. A small negotiation margin of 2-3% may still be possible, but this represents good value.";
    case "fair_price":
      return `The price is reasonable. A small negotiation margin of 3-5% is typical in this area. Consider starting your offer around ${fmt(Math.round(estimatedValue * 0.97))}.`;
    case "slightly_above":
      return `There may be room for negotiation. Consider starting your offer at ${fmt(estimatedValue)} (the estimated market value). The seller may have priced with negotiation room in mind.`;
    case "above_market":
      return `Significant room for negotiation may exist. Similar properties are valued around ${fmt(estimatedValue)}. Consider an initial offer in that range and evaluate any unique qualities that might justify a premium.`;
    default:
      return "We don't have enough data to provide negotiation guidance for this property.";
  }
}

interface AnalysisData {
  id: string;
  source_url: string;
  source_platform: string | null;
  address: string | null;
  city: string | null;
  property_type: string | null;
  size_m2: number | null;
  rooms: number | null;
  bathrooms: number | null;
  asking_price: number;
  asking_price_per_m2: number | null;
  thumbnail_url: string | null;
  estimated_value: number | null;
  estimated_low: number | null;
  estimated_high: number | null;
  estimated_price_per_m2: number | null;
  area_median_price_per_m2: number | null;
  price_deviation_percent: number | null;
  price_score: string | null;
  confidence_level: string | null;
  comparables_count: number | null;
  comparable_properties: any[] | null;
  feature_adjustments: Record<string, number> | null;
  analysis: string | null;
  market_trends: string | null;
  status: string | null;
}

const BuyResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useSEO({ title: "Price Analysis | ValoraCasa", description: "See a detailed price analysis for this property listing." });

  useEffect(() => {
    if (!id) { navigate("/buy"); return; }
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const fetchData = async () => {
      const { data: row, error } = await supabase
        .from("buy_analyses")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;
      if (error || !row) {
        toast({ title: "Not Found", description: "Analysis not found.", variant: "destructive" });
        navigate("/buy");
        return;
      }
      setData(row as unknown as AnalysisData);
      if (row.status === "processing" || row.status === "pending") {
        pollTimer = setTimeout(fetchData, 2000);
      } else {
        setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; if (pollTimer) clearTimeout(pollTimer); };
  }, [id, navigate, toast]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading your analysis...</div>
      </div>
    );
  }

  const askingPrice = Number(data.asking_price) || 0;
  const estimatedValue = Number(data.estimated_value) || askingPrice;
  const estimatedLow = Number(data.estimated_low) || Math.round(estimatedValue * 0.85);
  const estimatedHigh = Number(data.estimated_high) || Math.round(estimatedValue * 1.15);
  const deviation = Number(data.price_deviation_percent) || 0;
  const scoreKey = data.price_score || "fair_price";
  const scoreConfig = SCORE_CONFIG[scoreKey] || SCORE_CONFIG.fair_price;
  const confidence = CONFIDENCE_LABELS[data.confidence_level || "low"] || CONFIDENCE_LABELS.low;
  const comparables = (data.comparable_properties as any[]) || [];
  const devDirection = deviation > 1 ? "above" : deviation < -1 ? "below" : "in line with";

  const handleShare = () => {
    const text = `Price analysis for ${data.address || "a property"}: asking ${fmt(askingPrice)}, estimated value ${fmt(estimatedValue)}. Score: ${scoreConfig.label}.`;
    if (navigator.share) {
      navigator.share({ title: "ValoraCasa Price Analysis", text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      toast({ title: "Copied!", description: "Analysis link copied to clipboard." });
    }
  };

  // Price spectrum positions (0-100%)
  const spectrumMin = estimatedLow * 0.9;
  const spectrumMax = estimatedHigh * 1.1;
  const range = spectrumMax - spectrumMin;
  const estimatedPos = range > 0 ? ((estimatedValue - spectrumMin) / range) * 100 : 50;
  const askingPos = range > 0 ? Math.min(95, Math.max(5, ((askingPrice - spectrumMin) / range) * 100)) : 60;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-[1000px] mx-auto px-5 md:px-8 py-8 md:py-16">

        {/* ── PRICE SCORE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg mb-12"
        >
          {/* Property image */}
          {data.thumbnail_url && (
            <div className="h-[200px] md:h-[280px] overflow-hidden">
              <img src={data.thumbnail_url} alt={data.address || "Property"} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                {data.address && <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin size={14} />{data.address}</p>}
                {data.city && <p className="text-xs text-muted-foreground/60 mt-1">{data.city}</p>}
                {data.source_platform && (
                  <a href={data.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[hsl(var(--buy-foreground))] mt-2 hover:underline">
                    View on {data.source_platform} <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}><Share2 size={14} className="mr-1.5" />Share</Button>
            </div>

            {/* Asking price */}
            <p className="text-[0.6rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-1">Asking Price</p>
            <p className="text-4xl md:text-5xl font-light tracking-tight text-foreground">{fmt(askingPrice)}</p>

            {/* Score badge */}
            <div className={cn("inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase", scoreConfig.bg, scoreConfig.textClass)}>
              <span>{scoreConfig.emoji}</span>
              {scoreConfig.label}
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-0.5">
                {[1, 2, 3].map((i) => (
                  <Check key={i} size={12} className={i <= confidence.checks ? "text-[hsl(var(--buy-foreground))]" : "text-border"} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{confidence.label} · {data.comparables_count || 0} comparables</span>
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 1: PRICE VERDICT ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="w-10 h-px bg-[hsl(var(--buy))] mb-8" />
          <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-6">Price Verdict</p>

          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12 mb-8">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Asking Price</p>
              <p className="text-3xl md:text-4xl font-light tracking-tight text-foreground">{fmt(askingPrice)}</p>
            </div>
            <div className="text-2xl text-muted-foreground/30">vs</div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Estimated Market Value</p>
              <p className="text-3xl md:text-4xl font-light tracking-tight text-[hsl(var(--buy-foreground))]">{fmt(estimatedValue)}</p>
            </div>
          </div>

          <p className="text-[15px] leading-[2] text-foreground/70 font-light max-w-2xl">
            The asking price is <strong className={scoreConfig.textClass}>{Math.abs(Math.round(deviation))}% {devDirection}</strong> the estimated market value based on {data.comparables_count || 0} comparable properties within 5 km. Properties with similar specs in this area typically sell for {fmt(estimatedLow)} – {fmt(estimatedHigh)}.
          </p>
        </motion.section>

        {/* ── SECTION 2: THE NUMBERS ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="w-10 h-px bg-[hsl(var(--buy))] mb-8" />
          <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-8">The Numbers</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
            {[
              { label: "Asking Price", value: fmt(askingPrice) },
              { label: "Estimated Value", value: fmt(estimatedValue) },
              { label: "Price / m²", value: data.asking_price_per_m2 ? fmt(Number(data.asking_price_per_m2)) : "—" },
              { label: "Area Average", value: data.area_median_price_per_m2 ? fmt(Number(data.area_median_price_per_m2)) : "—" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card p-5 md:p-6 text-center">
                <p className="text-[0.55rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-xl md:text-2xl font-light tracking-tight text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── SECTION 3: PRICE SPECTRUM ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="w-10 h-px bg-[hsl(var(--buy))] mb-8" />
          <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-8">Price Spectrum</p>

          <div className="relative h-16 mb-4">
            {/* Bar */}
            <div className="absolute top-6 left-0 right-0 h-3 rounded-full overflow-hidden bg-gradient-to-r from-[hsl(var(--success))] via-muted to-destructive opacity-30" />
            <div className="absolute top-6 left-0 right-0 h-3 rounded-full border border-border" />

            {/* Estimated value marker */}
            <div className="absolute top-0" style={{ left: `${estimatedPos}%`, transform: "translateX(-50%)" }}>
              <div className="flex flex-col items-center">
                <span className="text-[0.5rem] font-semibold text-muted-foreground whitespace-nowrap">Est. Value</span>
                <div className="w-0.5 h-3 bg-muted-foreground/40 mt-0.5" />
                <div className="w-3 h-3 rounded-full bg-muted-foreground border-2 border-card" />
              </div>
            </div>

            {/* Asking price marker */}
            <div className="absolute top-0" style={{ left: `${askingPos}%`, transform: "translateX(-50%)" }}>
              <div className="flex flex-col items-center">
                <span className="text-[0.5rem] font-bold text-foreground whitespace-nowrap">Asking</span>
                <div className="w-0.5 h-3 bg-foreground/60 mt-0.5" />
                <div className={cn("w-3.5 h-3.5 rounded-full border-2 border-card", deviation > 5 ? "bg-destructive" : deviation < -5 ? "bg-[hsl(var(--success))]" : "bg-muted-foreground")} />
              </div>
            </div>
          </div>

          {/* Range labels */}
          <div className="flex justify-between text-[0.55rem] text-muted-foreground/50 px-1">
            <span>{fmt(Math.round(spectrumMin))}</span>
            <span>{fmt(Math.round(estimatedValue))}</span>
            <span>{fmt(Math.round(spectrumMax))}</span>
          </div>
        </motion.section>

        {/* ── SECTION 4: COMPARABLE PROPERTIES ── */}
        {comparables.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="w-10 h-px bg-[hsl(var(--buy))] mb-8" />
            <div className="flex items-baseline justify-between mb-8">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Comparable Properties</p>
              <p className="text-xs text-muted-foreground">{comparables.length} found</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 snap-x snap-mandatory scrollbar-hide">
              {comparables.map((comp: any, i: number) => {
                const compPrice = comp.price || 0;
                const priceDiff = askingPrice > 0 && compPrice > 0 ? ((compPrice - askingPrice) / askingPrice) * 100 : 0;
                const isHigher = priceDiff > 3;
                const isLower = priceDiff < -3;
                const borderColor = isLower ? "border-[hsl(var(--success))]" : isHigher ? "border-destructive" : "border-border";

                return (
                  <div key={comp.id || i} className={cn("flex-shrink-0 w-[260px] rounded-lg border-2 bg-card overflow-hidden snap-start", borderColor)}>
                    <div className="h-[140px] bg-muted overflow-hidden">
                      <img src={comp.image_urls?.[0] || "/placeholder.svg"} alt={comp.address || "Comparable"} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-lg font-light tracking-tight text-foreground">{comp.price ? fmt(comp.price) : "—"}</p>
                        {isLower && <span className="text-[0.55rem] font-bold text-[hsl(var(--success))]">↓ Cheaper</span>}
                        {isHigher && <span className="text-[0.55rem] font-bold text-destructive">↑ Pricier</span>}
                        {!isLower && !isHigher && <span className="text-[0.55rem] font-bold text-muted-foreground">≈ Similar</span>}
                      </div>
                      {comp.price_per_sqm && <p className="text-xs text-muted-foreground">{fmt(comp.price_per_sqm)}/m²</p>}
                      <p className="text-xs text-foreground/70 mt-2 line-clamp-2">{comp.address || "—"}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {comp.bedrooms != null && <span className="flex items-center gap-1"><Bed size={12} />{comp.bedrooms}</span>}
                        {comp.bathrooms != null && <span className="flex items-center gap-1"><Bath size={12} />{comp.bathrooms}</span>}
                        {comp.built_size_sqm && <span>{comp.built_size_sqm}m²</span>}
                      </div>
                      {comp.distance_km != null && (
                        <p className="text-[0.5rem] text-muted-foreground/50 mt-2">{comp.distance_km.toFixed(1)} km away</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── SECTION 5: WHAT AFFECTS THE PRICE ── */}
        {data.feature_adjustments && Object.keys(data.feature_adjustments).length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="w-10 h-px bg-[hsl(var(--buy))] mb-8" />
            <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-6">What Affects The Price</p>

            <div className="space-y-3">
              {Object.entries(data.feature_adjustments).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <span className="text-sm text-foreground capitalize">{key.replace(/_/g, " ")}</span>
                  <span className={cn("text-sm font-medium", Number(value) > 0 ? "text-[hsl(var(--success))]" : "text-destructive")}>
                    {Number(value) > 0 ? "+" : ""}{fmt(Number(value))}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground/60 mt-4">
              These adjustments reflect how specific features typically affect property values in this area based on market data.
            </p>
          </motion.section>
        )}

        {/* ── SECTION 6: AI ANALYSIS ── */}
        {data.analysis && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="w-10 h-px bg-[hsl(var(--buy))] mb-8" />
            <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-6">Property Analysis</p>

            {data.analysis.split("\n\n").filter(Boolean).map((p, i) => (
              <p key={i} className={cn("text-[15px] leading-[2] text-foreground/70 font-light", i > 0 && "mt-6")}>
                {p}
              </p>
            ))}
          </motion.section>
        )}

        {/* ── SECTION 7: NEGOTIATION HINTS ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="w-10 h-px bg-[hsl(var(--buy))] mb-8" />
          <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-6">Negotiation Insight</p>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-[hsl(var(--buy-foreground))]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--buy-foreground))]">Advisory</span>
            </div>
            <p className="text-[15px] leading-[2] text-foreground/70 font-light">
              {getNegotiationHint(data.price_score, estimatedValue)}
            </p>
          </div>
        </motion.section>

        {/* ── SECTION 8: CTAs ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="w-10 h-px bg-[hsl(var(--buy))] mx-auto mb-8" />
          <p className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-4">Next Steps</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => toast({ title: "Coming Soon", description: "Agent matching will be available shortly." })}
              className="bg-[hsl(var(--buy))] text-[hsl(var(--buy-foreground))] hover:bg-[hsl(var(--buy))/0.9]"
            >
              <Users size={16} className="mr-2" />
              Connect with a Local Agent
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 size={16} className="mr-2" />
              Share Analysis
            </Button>
          </div>

          <p className="text-xs text-muted-foreground/50 mt-6">
            This analysis is an automated estimate based on market data. For professional advice, consult a qualified real estate agent.
          </p>
        </motion.section>

      </div>

      <Footer />
    </div>
  );
};

export default BuyResult;

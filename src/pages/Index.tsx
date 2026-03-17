import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Star, RotateCcw, MapPin, SlidersHorizontal, Sparkles, BedDouble, Bath, Maximize, TrendingUp, Users, Search, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import ValuationTicketCard from "@/components/ValuationTicketCard";
import PropertyShowcaseCarousel from "@/components/PropertyShowcaseCarousel";

/* ─── DATA ─── */

const AGENCIES = [
  { name: "Engel & Völkers", x: "5%", y: 0, opacity: 0.35, size: "text-base", dur: 4.2 },
  { name: "Sotheby's", x: "55%", y: -8, opacity: 0.25, size: "text-lg", dur: 3.6 },
  { name: "Panorama", x: "25%", y: 6, opacity: 0.3, size: "text-sm", dur: 5.0 },
  { name: "DM Properties", x: "70%", y: -4, opacity: 0.2, size: "text-base", dur: 4.8 },
  { name: "Terra Meridiana", x: "10%", y: 10, opacity: 0.28, size: "text-sm", dur: 3.8 },
  { name: "Drumelia", x: "48%", y: -2, opacity: 0.22, size: "text-lg", dur: 4.5 },
  { name: "La Sala Estates", x: "75%", y: 4, opacity: 0.32, size: "text-sm", dur: 3.4 },
];

const HOW_STEPS = [
  { num: "01", title: "Enter your address", desc: "Start typing and select your property from the suggestions." },
  { num: "02", title: "Tell us about your property", desc: "Add bedrooms, bathrooms, size and key features." },
];

const REPORT_FEATURES_SELL = [
  { title: "Estimated Market Value", desc: "Calculated price based on comparable sales data.", accent: true, visual: "hero" as const, gridClass: "col-span-2 md:col-span-2 md:row-span-2" },
  { title: "Price Per Square Metre", desc: "See how your property compares per m² in your area.", accent: false, visual: "metric" as const, gridClass: "col-span-1 md:col-span-2" },
  { title: "Property Analysis", desc: "Detailed analysis of your property's strengths.", accent: false, visual: "icon" as const, gridClass: "col-span-1 md:col-span-2" },
  { title: "Market Trends", desc: "Current price trends and market dynamics in your area.", accent: true, visual: "chart" as const, gridClass: "col-span-2 md:col-span-4" },
  { title: "Comparable Properties", desc: "Similar properties recently sold or listed near you.", accent: false, visual: "cards" as const, gridClass: "col-span-1 md:col-span-2" },
  { title: "Agent Recommendations", desc: "Matched local agents ready to help you sell.", accent: true, visual: "icon" as const, gridClass: "col-span-1 md:col-span-2" },
];

const REPORT_FEATURES_BUY = [
  { title: "Price Score", desc: "See if the asking price is fair, above, or below market value.", accent: true, visual: "hero" as const, gridClass: "col-span-2 md:col-span-2 md:row-span-2" },
  { title: "Price Spectrum", desc: "Visual comparison of asking price vs market range.", accent: false, visual: "metric" as const, gridClass: "col-span-1 md:col-span-2" },
  { title: "Comparable Analysis", desc: "Compare with similar properties currently listed nearby.", accent: false, visual: "cards" as const, gridClass: "col-span-1 md:col-span-2" },
  { title: "Negotiation Hints", desc: "Data-driven advice on how to approach your offer.", accent: true, visual: "chart" as const, gridClass: "col-span-2 md:col-span-4" },
  { title: "Area Insights", desc: "Median price/m² and trends in the area.", accent: false, visual: "icon" as const, gridClass: "col-span-1 md:col-span-2" },
  { title: "Agent Recommendations", desc: "Matched local agents to help you buy.", accent: true, visual: "icon" as const, gridClass: "col-span-1 md:col-span-2" },
];

const TESTIMONIALS_SELL = [
  { quote: "We sold our villa in Marbella for 12% above the initial asking price thanks to the accurate valuation.", name: "James & Sarah T.", location: "Marbella" },
  { quote: "Fast, free, and surprisingly accurate. Best property tool I've found for Spain.", name: "Anna K.", location: "Fuengirola" },
  { quote: "Used it to compare agents' prices. The valuation was within 3% of the final sale price.", name: "Robert D.", location: "Benalmádena" },
];

const TESTIMONIALS_BUY = [
  { quote: "I was about to overpay by €45,000. ValoraCasa showed me the property was 12% above market value.", name: "Stefan R.", location: "Marbella" },
  { quote: "The price analysis confirmed the asking price was fair. Gave me confidence to make an offer immediately.", name: "Emma & David K.", location: "Estepona" },
  { quote: "Used it on every property we viewed. Saved us thousands in negotiations.", name: "Linda M.", location: "Fuengirola" },
];

/* ─── SECTION LABEL ─── */
const SectionLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-xs tracking-[0.2em] uppercase text-muted-foreground", className)}>
    {children}
  </p>
);

/* ─── DIVIDER ─── */
const SectionDivider = () => (
  <hr className="border-border mx-5 md:mx-8" />
);

/* ─── STATS BAR ─── */
const StatsBar = () => (
  <div className="flex justify-between border-y border-border py-6 mx-5 md:mx-8">
    {[
      { label: "Valuations", value: "12,400+" },
      { label: "Average time", value: "2 min" },
      { label: "Cost", value: "Free" },
    ].map((stat, i, arr) => (
      <div
        key={stat.label}
        className={cn(
          "flex-1 text-center",
          i < arr.length - 1 && "border-r border-border"
        )}
      >
        <SectionLabel className="mb-2">{stat.label}</SectionLabel>
        <p className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
      </div>
    ))}
  </div>
);

/* ─── MAIN PAGE ─── */

const Index = () => {
  const navigate = useNavigate();
  const [valuationType, setValuationType] = useState<"sell" | "buy">("sell");
  const [addressData, setAddressData] = useState({
    streetAddress: "",
    urbanization: "",
    city: "",
    province: "",
    country: "Spain",
    complex: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  const handleAddressChange = useCallback((field: string, value: string | number | undefined) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
  }, []);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapExpandedBottom, setMapExpandedBottom] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const isSell = valuationType === "sell";
  const isBuy = valuationType === "buy";
  const testimonials = isSell ? TESTIMONIALS_SELL : TESTIMONIALS_BUY;
  const reportFeatures = isSell ? REPORT_FEATURES_SELL : REPORT_FEATURES_BUY;

  // Reset testimonial index when switching type
  useEffect(() => {
    setTestimonialIdx(0);
  }, [valuationType]);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);


  const handleGetValuation = useCallback(() => {
    if (valuationType === "buy") {
      navigate("/buy");
      return;
    }
    navigate("/sell/valuation", {
      state: {
        addressData: {
          ...addressData,
        },
      },
    });
  }, [addressData, navigate, valuationType]);

  // Showcase card data based on mode
  const showcaseData = isSell
    ? {
        estimatedValue: "€1,250,000",
        secondaryValue: "€4,200/m²",
        headline: "VALUED",
        subtitle: "Your Valuation",
        summaryText: "Your property has been analysed using comparable market data, location scoring, and current demand indicators.",
      }
    : {
        estimatedValue: "€395,000",
        secondaryValue: "FAIR PRICE",
        headline: "ANALYSED",
        subtitle: "Your Analysis",
        summaryText: "This property has been analysed against comparable listings in the area. The asking price aligns well with current market data.",
      };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col">

        {/* ═══════════ HERO ═══════════ */}
        <div
          ref={heroRef}
          className="min-h-[85vh] flex flex-col items-center justify-center px-5 md:px-8 animate-fade-in"
        >
          <div className="flex flex-col items-center text-center gap-4 mb-2 pt-6 md:pt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={valuationType}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <span
                  className={`px-5 py-2 rounded-full text-sm font-medium tracking-wide mb-4 transition-colors duration-300 ${
                    isSell
                      ? "bg-[hsl(var(--terracotta-light))] text-primary"
                      : "bg-[hsl(var(--buy-light))] text-[hsl(var(--buy-foreground))]"
                  }`}
                >
                  {isSell ? "Free Property Valuation" : "Free Price Analysis"}
                </span>
                <h1 className="font-sans text-4xl md:text-7xl font-black uppercase tracking-tight text-foreground leading-[1.05]">
                  {isSell ? (
                    <>What is your property<br />in Spain <span className="font-['DM_Serif_Display'] italic normal-case">really</span> worth?</>
                  ) : (
                    <>Is this property<br /><span className="font-['DM_Serif_Display'] italic normal-case">worth the price</span>?</>
                  )}
                </h1>
                <p className="font-['DM_Serif_Display'] italic text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed mt-4">
                  {isSell
                    ? "Get a detailed market report in under 2 minutes. Completely free."
                    : "Paste a listing link and we'll compare it to the market."
                  }
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <ValuationTicketCard
            address=""
            estimatedValue=""
            leadId=""
            accentType={valuationType}
            size="hero"
            addressData={addressData}
            onAddressFieldChange={handleAddressChange}
            onLocationConfirmed={handleGetValuation}
            mapExpanded={mapExpanded}
            onMapPhaseChange={(phase) => setMapExpanded(phase === "verify")}
            valuationType={valuationType}
            onValuationTypeChange={(t) => setValuationType(t as "sell" | "buy")}
          />
        </div>

        <SectionDivider />

        {/* ═══════════ STATS BAR ═══════════ */}
        <div className="py-2">
          <StatsBar />
        </div>

        <SectionDivider />

        {/* ═══════════ FLOATING AGENCIES ═══════════ */}
        <section className="w-full py-8 md:py-20 overflow-hidden px-5 md:px-8">
          <SectionLabel className="text-center mb-8 md:mb-14">
            Used every day by real estate professionals
          </SectionLabel>
          <div className="relative max-w-4xl mx-auto h-[120px] md:h-[140px]">
            {AGENCIES.map((a, i) => (
              <motion.span
                key={a.name}
                className={cn(
                  "absolute font-['DM_Serif_Display'] italic text-muted-foreground cursor-default select-none",
                  a.size
                )}
                style={{ left: a.x, top: `${30 + (i % 3) * 28}%` }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: a.opacity }}
                viewport={{ once: true }}
                animate={{ y: [a.y, a.y - 6, a.y] }}
                transition={{
                  y: { duration: a.dur, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.8, delay: i * 0.1 },
                }}
                whileHover={{ opacity: 0.6, scale: 1.05 }}
              >
                {a.name}
              </motion.span>
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* ═══════════ HOW IT WORKS — 3 Steps Timeline ═══════════ */}
        <section className="w-full py-8 md:py-20 px-5 md:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 md:mb-16"
            >
              <SectionLabel>How It Works</SectionLabel>
              <h2 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground mt-3">
                Three Simple Steps
              </h2>
              <p className="font-['DM_Serif_Display'] italic text-xl text-muted-foreground mt-4">
                From address to valuation in under two minutes
              </p>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-[27px] md:left-[39px] top-0 bottom-0 w-px bg-border" />

              {/* Step 01 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative flex gap-5 md:gap-8 pb-8 md:pb-14"
              >
                {/* Number + icon */}
                <div className="flex flex-col items-center shrink-0 z-10">
                  <span className="text-4xl md:text-6xl font-extrabold text-border leading-none">01</span>
                  <div className={cn(
                    "w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center mt-3 shadow-sm",
                    isSell ? "bg-[hsl(var(--terracotta-light))]" : "bg-[hsl(var(--buy-light))]"
                  )}>
                    <MapPin className={cn("h-5 w-5 md:h-6 md:w-6", isSell ? "text-primary" : "text-[hsl(var(--buy-foreground))]")} />
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight">
                    Enter your address
                  </h3>
                  <p className="text-muted-foreground mt-1.5 text-base md:text-lg leading-relaxed">
                    Start typing and select your property from the suggestions.
                  </p>
                  {/* Mini preview: fake address input */}
                  <div className="mt-4 rounded-xl border border-border bg-card p-3 md:p-4 max-w-sm">
                    <div className="flex items-center gap-2.5 rounded-lg bg-secondary/70 px-3 py-2.5">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground/60 truncate">Calle Sierra Blanca 12, Marbella…</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 02 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="relative flex gap-5 md:gap-8 pb-8 md:pb-14"
              >
                <div className="flex flex-col items-center shrink-0 z-10">
                  <span className="text-4xl md:text-6xl font-extrabold text-border leading-none">02</span>
                  <div className={cn(
                    "w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center mt-3 shadow-sm",
                    isSell ? "bg-[hsl(var(--terracotta-light))]" : "bg-[hsl(var(--buy-light))]"
                  )}>
                    <SlidersHorizontal className={cn("h-5 w-5 md:h-6 md:w-6", isSell ? "text-primary" : "text-[hsl(var(--buy-foreground))]")} />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight">
                    Tell us about your property
                  </h3>
                  <p className="text-muted-foreground mt-1.5 text-base md:text-lg leading-relaxed">
                    Add bedrooms, bathrooms, size and key features.
                  </p>
                  {/* Mini preview: property pills */}
                  <div className="mt-4 rounded-xl border border-border bg-card p-3 md:p-4 max-w-sm">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { icon: BedDouble, label: "3 Beds" },
                        { icon: Bath, label: "2 Baths" },
                        { icon: Maximize, label: "Size" },
                      ].map((pill) => (
                        <span
                          key={pill.label}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                            isSell
                              ? "bg-[hsl(var(--terracotta-light))] text-primary"
                              : "bg-[hsl(var(--buy-light))] text-[hsl(var(--buy-foreground))]"
                          )}
                        >
                          <pill.icon className="h-3.5 w-3.5" />
                          {pill.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 03 — Valuation Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative flex gap-5 md:gap-8"
              >
                <div className="flex flex-col items-center shrink-0 z-10">
                  <span className="text-4xl md:text-6xl font-extrabold text-border leading-none">03</span>
                  <div className={cn(
                    "w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center mt-3 shadow-sm",
                    isSell ? "bg-[hsl(var(--terracotta-light))]" : "bg-[hsl(var(--buy-light))]"
                  )}>
                    <Sparkles className={cn("h-5 w-5 md:h-6 md:w-6", isSell ? "text-primary" : "text-[hsl(var(--buy-foreground))]")} />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight">
                    See what you'll receive
                  </h3>
                  <p className="text-muted-foreground mt-1.5 text-base md:text-lg leading-relaxed">
                    A beautifully detailed valuation card with all the key data — ready to share.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Flippable showcase card below step 3 */}
            <div className="mt-6 md:mt-10 flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={valuationType}
                  initial={{ opacity: 0, rotateY: 20 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <ValuationTicketCard
                    address="Calle Sierra Blanca 12"
                    city="Marbella"
                    estimatedValue={showcaseData.estimatedValue}
                    secondaryValue={showcaseData.secondaryValue}
                    propertyType="Villa"
                    leadId="a1b2c3d4e5f6"
                    headline={showcaseData.headline}
                    subtitle={showcaseData.subtitle}
                    summaryText={showcaseData.summaryText}
                    accentType={valuationType}
                    size="hero"
                    flippable
                    bedrooms={4}
                    bathrooms={3}
                    builtSize="350 m²"
                    plotSize="1,200 m²"
                    condition="Excellent"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center gap-2 text-muted-foreground/40 text-sm -mt-2">
                <RotateCcw size={14} />
                <span>Tap the card to see property details</span>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ═══════════ REPORT FEATURES ═══════════ */}
        <section className="w-full py-8 md:py-20 px-5 md:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <SectionLabel>Included Free</SectionLabel>
              <h2 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground mt-3 max-w-2xl mx-auto">
                Everything In Your Report
              </h2>
              <p className="font-['DM_Serif_Display'] italic text-xl text-muted-foreground mt-4">
                All the data you need to make informed decisions
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {reportFeatures.map((feat, i) => (
                <motion.div
                  key={`${valuationType}-${feat.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={cn(
                    "rounded-2xl border border-border bg-card p-5 md:p-6 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md",
                    feat.gridClass
                  )}
                >
                  <div>
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  {/* ── Visual previews ── */}
                  {feat.visual === "hero" && (
                    <div className={cn("rounded-xl p-4 mt-auto", isSell ? "bg-[hsl(var(--terracotta-light))]" : "bg-[hsl(var(--buy-light))]")}>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        {isSell ? "Estimated value" : "Price score"}
                      </p>
                      <p className={cn("text-3xl md:text-4xl font-light tracking-tight", isSell ? "text-primary" : "text-[hsl(var(--buy-foreground))]")}>
                        {isSell ? "€845,000" : "FAIR PRICE"}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 h-2 rounded-full bg-background overflow-hidden">
                          <div className={cn("h-full rounded-full", isSell ? "bg-primary" : "bg-[hsl(var(--buy))]")} style={{ width: "78%" }} />
                        </div>
                        <span className="text-[0.65rem] text-muted-foreground whitespace-nowrap">High confidence</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {isSell ? "Range: €790K – €900K" : "Asking: €395K · Est: €380K"}
                      </p>
                    </div>
                  )}

                  {feat.visual === "metric" && (
                    <div className="mt-auto">
                      <p className={cn("text-2xl font-light tracking-tight", isSell ? "text-primary" : "text-[hsl(var(--buy-foreground))]")}>
                        {isSell ? "€3,200" : "€3,150"}
                        <span className="text-sm text-muted-foreground font-normal">/m²</span>
                      </p>
                      <div className="flex gap-1 mt-2">
                        {[65, 78, 85, 72, 90, 88, 95].map((h, j) => (
                          <div key={j} className="flex-1 rounded-sm bg-border" style={{ height: `${h * 0.3}px` }}>
                            <div className={cn("w-full rounded-sm", isSell ? "bg-primary/30" : "bg-[hsl(var(--buy)/0.3)]")} style={{ height: `${h * 0.3}px` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feat.visual === "chart" && (
                    <div className="mt-auto flex items-end gap-3">
                      <div className="flex-1">
                        <svg viewBox="0 0 200 50" className="w-full h-10 md:h-12" fill="none">
                          <path
                            d={isSell
                              ? "M0 40 Q25 38 50 30 T100 22 T150 18 T200 10"
                              : "M0 42 Q25 40 50 35 T100 28 T150 20 T200 12"
                            }
                            stroke={isSell ? "hsl(var(--primary))" : "hsl(var(--buy))"}
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d={isSell
                              ? "M0 40 Q25 38 50 30 T100 22 T150 18 T200 10 V50 H0Z"
                              : "M0 42 Q25 40 50 35 T100 28 T150 20 T200 12 V50 H0Z"
                            }
                            fill={isSell ? "hsl(var(--primary) / 0.08)" : "hsl(var(--buy) / 0.08)"}
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <TrendingUp className={cn("h-4 w-4", isSell ? "text-primary" : "text-[hsl(var(--buy-foreground))]")} />
                        <span className={cn("text-sm font-semibold", isSell ? "text-primary" : "text-[hsl(var(--buy-foreground))]")}>
                          {isSell ? "+4.2%" : "+6.1%"}
                        </span>
                      </div>
                    </div>
                  )}

                  {feat.visual === "cards" && (
                    <div className="mt-auto flex gap-2">
                      {[1, 2, 3].map(n => (
                        <div key={n} className="flex-1 rounded-lg bg-secondary border border-border p-2">
                          <div className="w-full aspect-[4/3] rounded bg-border mb-1.5" />
                          <div className="h-1.5 w-3/4 rounded-full bg-border" />
                          <div className="h-1.5 w-1/2 rounded-full bg-border mt-1" />
                        </div>
                      ))}
                    </div>
                  )}

                  {feat.visual === "icon" && (
                    <div className="mt-auto flex items-center gap-3">
                      {feat.title.includes("Agent") ? (
                        <>
                          <div className="flex -space-x-2">
                            {[0, 1, 2].map(n => (
                              <div key={n} className={cn("w-8 h-8 rounded-full border-2 border-card flex items-center justify-center text-[0.6rem] font-bold text-primary-foreground", isSell ? "bg-primary" : "bg-[hsl(var(--buy))]")} style={{ opacity: 1 - n * 0.2 }}>
                                {["A", "B", "C"][n]}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">3 matched agents</span>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(n => (
                              <div key={n} className={cn("w-2 h-2 rounded-full", n <= 4 ? (isSell ? "bg-primary" : "bg-[hsl(var(--buy))]") : "bg-border")} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">Strong property score</span>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex justify-center mt-10"
            >
              <span className={cn("inline-block rounded-full px-5 py-2.5 text-sm font-medium uppercase tracking-wider", isSell ? "bg-[hsl(var(--terracotta-light))] text-primary" : "bg-[hsl(var(--rent-light))] text-[hsl(var(--rent-foreground))]")}>
                All included — completely free
              </span>
            </motion.div>
          </div>
        </section>

        <SectionDivider />

        {/* ═══════════ RECENT VALUATIONS ═══════════ */}
        <section className="w-full py-8 md:py-20 bg-secondary/50">
          <div className="max-w-5xl mx-auto px-5 md:px-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--success))] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--success))]" />
                </span>
                <span className="text-sm text-[hsl(var(--success))] font-medium">Live</span>
              </div>
              <SectionLabel>Market Data</SectionLabel>
              <h2 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground mt-3">
                {valuationType === "sell" ? "Recent Valuations" : "Recent Rental Estimates"}
              </h2>
              <p className="font-['DM_Serif_Display'] italic text-xl text-muted-foreground mt-4">
                {valuationType === "sell" ? "238 property valuations completed this week" : "185 rental estimates completed this week"}
              </p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden px-5 md:px-8">
            <PropertyShowcaseCarousel accentType={valuationType === "buy" ? "sell" : valuationType} />
          </div>
        </section>

        <SectionDivider />

        {/* ═══════════ TESTIMONIALS ═══════════ */}
        <section className="w-full py-8 md:py-20 px-5 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground mt-3">
              What Owners Say
            </h2>
            <div className="relative min-h-[200px] flex flex-col items-center justify-center mt-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${valuationType}-${testimonialIdx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-5 w-5", isSell ? "fill-primary text-primary" : "fill-[hsl(var(--rent))] text-[hsl(var(--rent))]")} />
                    ))}
                  </div>
                  <p className="text-xl md:text-2xl font-['DM_Serif_Display'] italic text-muted-foreground max-w-2xl leading-relaxed">
                    "{testimonials[testimonialIdx]?.quote}"
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-4">
                    — {testimonials[testimonialIdx]?.name}, {testimonials[testimonialIdx]?.location}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === testimonialIdx ? (isSell ? "bg-primary" : "bg-[hsl(var(--rent))]") + " w-6" : "bg-border w-2 hover:bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ═══════════ FINAL CTA ═══════════ */}
        <section
          className="w-full py-8 md:py-20 px-5 md:px-8 pb-32"
          style={{ background: `linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--${isSell ? 'terracotta-light' : 'rent-light'})) 100%)` }}
        >
          <div className="flex flex-col items-center text-center gap-4 mb-2">
            <SectionLabel>Start Now</SectionLabel>
            <hr className="w-[60px] border-border my-2" />
            <AnimatePresence mode="wait">
              <motion.h2
                key={valuationType}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="font-sans text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground leading-[1.05]"
              >
                {isSell ? (
                  <>Ready to discover your<br />property's <span className="font-['DM_Serif_Display'] italic normal-case">true value</span>?</>
                ) : (
                  <>Ready to discover your<br />property's <span className="font-['DM_Serif_Display'] italic normal-case">rental income</span>?</>
                )}
              </motion.h2>
            </AnimatePresence>
            <p className="font-['DM_Serif_Display'] italic text-xl md:text-2xl text-muted-foreground">
              Free, confidential, and takes less than 2 minutes
            </p>
          </div>
          <ValuationTicketCard
            address=""
            estimatedValue=""
            leadId=""
            accentType={valuationType}
            size="hero"
            addressData={addressData}
            onAddressFieldChange={handleAddressChange}
            onLocationConfirmed={handleGetValuation}
            mapExpanded={mapExpandedBottom}
            onMapPhaseChange={(phase) => setMapExpandedBottom(phase === "verify")}
            valuationType={valuationType}
            onValuationTypeChange={(t) => setValuationType(t as "sell" | "buy")}
          />
        </section>

      </div>

    </div>
  );
};

export default Index;

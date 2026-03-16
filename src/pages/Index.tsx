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
  { title: "Estimated Market Value", desc: "Calculated price based on comparable sales data.", accent: true },
  { title: "Price Per Square Metre", desc: "See how your property compares per m² in your area.", accent: false },
  { title: "Property Analysis", desc: "Detailed analysis of your property's strengths.", accent: false },
  { title: "Market Trends", desc: "Current price trends and market dynamics in your area.", accent: true },
  { title: "Comparable Properties", desc: "Similar properties recently sold or listed near you.", accent: false },
  { title: "Agent Recommendations", desc: "Matched local agents ready to help you sell.", accent: true },
];

const REPORT_FEATURES_RENT = [
  { title: "Monthly Rental Estimate", desc: "Long-term rental income projection for your property.", accent: true },
  { title: "Seasonal Income Forecast", desc: "High and low season weekly rate estimates.", accent: false },
  { title: "Occupancy Projections", desc: "Expected occupancy rates based on local demand.", accent: false },
  { title: "Annual Revenue Estimate", desc: "Total projected annual rental income.", accent: true },
  { title: "Comparable Rentals", desc: "Similar properties currently rented near you.", accent: false },
  { title: "Agent Recommendations", desc: "Matched local agents ready to help you rent.", accent: true },
];

const TESTIMONIALS_SELL = [
  { quote: "We sold our villa in Marbella for 12% above the initial asking price thanks to the accurate valuation.", name: "James & Sarah T.", location: "Marbella" },
  { quote: "Fast, free, and surprisingly accurate. Best property tool I've found for Spain.", name: "Anna K.", location: "Fuengirola" },
  { quote: "Used it to compare agents' prices. The valuation was within 3% of the final sale price.", name: "Robert D.", location: "Benalmádena" },
];

const TESTIMONIALS_RENT = [
  { quote: "The rental estimate was spot-on. We now earn €3,200/month from our apartment in Estepona.", name: "Carlos M.", location: "Estepona" },
  { quote: "Helped us decide between long-term and seasonal rental. The seasonal forecast was incredibly accurate.", name: "Maria L.", location: "Marbella" },
  { quote: "We increased our rental income by 30% after following the recommendations in the report.", name: "Peter & Julia W.", location: "Mijas" },
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
  const [valuationType, setValuationType] = useState<"sell" | "rent">("sell");
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
  const testimonials = isSell ? TESTIMONIALS_SELL : TESTIMONIALS_RENT;
  const reportFeatures = isSell ? REPORT_FEATURES_SELL : REPORT_FEATURES_RENT;

  // Reset testimonial index when switching type
  useEffect(() => {
    setTestimonialIdx(0);
  }, [valuationType]);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);


  const handleGetValuation = useCallback(() => {
    const route = valuationType === "sell" ? "/sell/valuation" : "/rent/valuation";
    navigate(route, {
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
        estimatedValue: "€3,200/mo",
        secondaryValue: "€38,400/yr",
        headline: "VALUED",
        subtitle: "Rental Income",
        summaryText: "Your rental potential has been analysed using comparable rentals, seasonal demand, and occupancy projections.",
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
                      : "bg-[hsl(var(--rent-light))] text-[hsl(var(--rent-foreground))]"
                  }`}
                >
                  {isSell ? "Free Property Valuation" : "Free Rental Estimate"}
                </span>
                <h1 className="font-sans text-4xl md:text-7xl font-black uppercase tracking-tight text-foreground leading-[1.05]">
                  {isSell ? (
                    <>What is your property<br />in Spain <span className="font-['DM_Serif_Display'] italic normal-case">really</span> worth?</>
                  ) : (
                    <>How much could your<br />property <span className="font-['DM_Serif_Display'] italic normal-case">earn</span> in rent?</>
                  )}
                </h1>
                <p className="font-['DM_Serif_Display'] italic text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed mt-4">
                  {isSell
                    ? "Get a detailed market report in under 2 minutes. Completely free."
                    : "Get a rental income estimate in under 2 minutes. Completely free."
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
            onValuationTypeChange={setValuationType}
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
                    isSell ? "bg-[hsl(var(--terracotta-light))]" : "bg-[hsl(var(--rent-light))]"
                  )}>
                    <MapPin className={cn("h-5 w-5 md:h-6 md:w-6", isSell ? "text-primary" : "text-[hsl(var(--rent-foreground))]")} />
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
                    isSell ? "bg-[hsl(var(--terracotta-light))]" : "bg-[hsl(var(--rent-light))]"
                  )}>
                    <SlidersHorizontal className={cn("h-5 w-5 md:h-6 md:w-6", isSell ? "text-primary" : "text-[hsl(var(--rent-foreground))]")} />
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
                              : "bg-[hsl(var(--rent-light))] text-[hsl(var(--rent-foreground))]"
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
                    isSell ? "bg-[hsl(var(--terracotta-light))]" : "bg-[hsl(var(--rent-light))]"
                  )}>
                    <Sparkles className={cn("h-5 w-5 md:h-6 md:w-6", isSell ? "text-primary" : "text-[hsl(var(--rent-foreground))]")} />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
              <AnimatePresence mode="wait">
                {reportFeatures.map((feat, i) => (
                  <motion.div
                    key={`${valuationType}-${feat.title}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className={cn(
                      "py-6 group",
                      i < reportFeatures.length - 2 && "border-b border-border",
                      "max-md:border-b max-md:border-border max-md:last:border-b-0"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        feat.accent
                          ? isSell ? "bg-[hsl(var(--terracotta-light))]" : "bg-[hsl(var(--rent-light))]"
                          : "bg-secondary"
                      )}>
                        <span className={cn("text-lg", isSell ? "text-primary" : "text-[hsl(var(--rent-foreground))]")}>✦</span>
                      </div>
                      <div>
                        <h3 className={cn("font-bold text-foreground text-lg uppercase tracking-tight transition-colors", isSell ? "group-hover:text-primary" : "group-hover:text-[hsl(var(--rent-foreground))]")}>
                          {feat.title}
                        </h3>
                        <p className="text-muted-foreground mt-1 leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
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
            <PropertyShowcaseCarousel accentType={valuationType} />
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
            onValuationTypeChange={setValuationType}
          />
        </section>

      </div>

    </div>
  );
};

export default Index;

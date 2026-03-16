import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Star, ArrowRight, RotateCcw } from "lucide-react";
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
  { num: "03", title: "Get your valuation", desc: "Receive a market estimate based on real data in seconds." },
];

const REPORT_FEATURES = [
  { title: "Estimated Market Value", desc: "Calculated price based on comparable sales data.", accent: true },
  { title: "Rental Income Potential", desc: "Long-term and seasonal rental income projections.", accent: false },
  { title: "Property Analysis", desc: "Detailed analysis of your property's strengths.", accent: false },
  { title: "Market Trends", desc: "Current price trends and market dynamics in your area.", accent: true },
  { title: "Comparable Properties", desc: "Similar properties recently sold or listed near you.", accent: false },
  { title: "Agent Recommendations", desc: "Matched local agents ready to help you sell or rent.", accent: true },
];

const TESTIMONIALS = [
  { quote: "We sold our villa in Marbella for 12% above the initial asking price thanks to the accurate valuation.", name: "James & Sarah T.", location: "Marbella" },
  { quote: "The rental estimate was spot-on. We now earn €3,200/month from our apartment in Estepona.", name: "Carlos M.", location: "Estepona" },
  { quote: "Fast, free, and surprisingly accurate. Best property tool I've found for Spain.", name: "Anna K.", location: "Fuengirola" },
  { quote: "Used it to compare agents' prices. The valuation was within 3% of the final sale price.", name: "Robert D.", location: "Benalmádena" },
];

/* ─── DIVIDER ─── */
const SectionDivider = () => (
  <div className="border-b border-border/40 mx-5 md:mx-8" />
);

/* ─── STATS BAR ─── */
const StatsBar = () => (
  <div className="flex justify-between border-y border-border/40 py-5 mx-5 md:mx-8">
    {[
      { label: "Valuations", value: "12,400+" },
      { label: "Average time", value: "2 min" },
      { label: "Cost", value: "100% Free" },
    ].map((stat, i, arr) => (
      <div
        key={stat.label}
        className={cn(
          "flex-1 text-center",
          i < arr.length - 1 && "border-r border-border/40"
        )}
      >
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          {stat.label}
        </p>
        <p className="font-semibold text-sm text-foreground">{stat.value}</p>
      </div>
    ))}
  </div>
);

/* ─── MAIN PAGE ─── */

const Index = () => {
  const navigate = useNavigate();
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
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapExpandedBottom, setMapExpandedBottom] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleGetValuation = useCallback(() => {
    navigate("/sell/valuation", {
      state: {
        addressData: {
          ...addressData,
        },
      },
    });
  }, [addressData, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col">

        {/* ═══════════ HERO ═══════════ */}
        <div
          ref={heroRef}
          className="min-h-[85vh] flex flex-col items-center justify-center px-5 md:px-8 animate-fade-in"
        >
          <div className="flex flex-col items-center text-center gap-4 mb-2">
            <span className="inline-block bg-[hsl(var(--terracotta-light))] text-primary rounded-full px-4 py-2 text-sm font-medium">
              Free property valuation
            </span>
            <h1 className="font-['DM_Serif_Display'] text-3xl md:text-7xl text-foreground leading-[1.1]">
              What is your property
              <br />
              in Spain <em className="italic">really</em> worth?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Get a detailed market report in under 2 minutes. Completely free.
            </p>
          </div>
          <ValuationTicketCard
            address=""
            estimatedValue=""
            leadId=""
            accentType="sell"
            size="hero"
            addressData={addressData}
            onAddressFieldChange={handleAddressChange}
            onLocationConfirmed={handleGetValuation}
            mapExpanded={mapExpanded}
            onMapPhaseChange={(phase) => setMapExpanded(phase === "verify")}
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
          <p className="text-xs tracking-[0.2em] text-muted-foreground/40 text-center uppercase mb-8 md:mb-14">
            Used every day by real estate professionals
          </p>
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

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section className="w-full py-8 md:py-20 px-5 md:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-baseline justify-between mb-8 md:mb-16"
            >
              <h2 className="font-['DM_Serif_Display'] text-3xl md:text-5xl text-foreground">
                How it works
              </h2>
              <p className="text-sm text-muted-foreground hidden md:block">
                Three simple steps
              </p>
            </motion.div>

            <div className="space-y-0">
              {HOW_STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className={cn(
                    "flex items-start gap-6 md:gap-10 py-8 md:py-12",
                    i < HOW_STEPS.length - 1 && "border-b border-border/30"
                  )}
                >
                  <span className="text-5xl md:text-7xl font-['DM_Serif_Display'] text-primary/20 leading-none shrink-0 -mt-1">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-base md:text-lg leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ═══════════ WHAT YOU GET — Flippable Card ═══════════ */}
        <section className="w-full py-8 md:py-20 px-5 md:px-8 bg-secondary/50">
          <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-['DM_Serif_Display'] text-3xl md:text-5xl text-foreground">
                See what you'll receive
              </h2>
              <p className="text-muted-foreground text-lg mt-3 max-w-xl mx-auto">
                A beautifully detailed valuation card with all the key data about your property — ready to share.
              </p>
            </motion.div>

            <ValuationTicketCard
              address="Calle Sierra Blanca 12"
              city="Marbella"
              estimatedValue="€1,250,000"
              secondaryValue="€4,200/m²"
              propertyType="Villa"
              leadId="a1b2c3d4e5f6"
              headline="VALUED"
              subtitle="Your Valuation"
              summaryText="Your property has been analysed using comparable market data, location scoring, and current demand indicators."
              accentType="sell"
              size="showcase"
              flippable
              bedrooms={4}
              bathrooms={3}
              builtSize="350 m²"
              plotSize="1,200 m²"
              condition="Excellent"
            />

            <div className="flex items-center gap-2 text-muted-foreground/40 text-sm -mt-2">
              <RotateCcw size={14} />
              <span>Tap the card to see property details</span>
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
              className="flex items-baseline justify-between mb-12"
            >
              <h2 className="font-['DM_Serif_Display'] text-3xl md:text-5xl text-foreground max-w-xl">
                Everything you need to know about your property
              </h2>
              <span className="hidden md:inline-block text-sm text-muted-foreground">
                All included free
              </span>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
              {REPORT_FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={cn(
                    "py-6 group",
                    i < REPORT_FEATURES.length - 2 && "border-b border-border/20",
                    "max-md:border-b max-md:border-border/20 max-md:last:border-b-0"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      feat.accent
                        ? "bg-[hsl(var(--terracotta-light))]"
                        : "bg-secondary"
                    )}>
                      <span className="text-primary text-lg">✦</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex justify-center mt-10"
            >
              <span className="inline-block bg-[hsl(var(--terracotta-light))] text-primary rounded-full px-5 py-2.5 text-sm font-medium">
                All included — completely free
              </span>
            </motion.div>
          </div>
        </section>

        <SectionDivider />

        {/* ═══════════ RECENT VALUATIONS ═══════════ */}
        <section className="w-full py-8 md:py-20 bg-secondary/50">
          <div className="max-w-5xl mx-auto px-5 md:px-8">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--success))] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--success))]" />
                  </span>
                  <span className="text-sm text-[hsl(var(--success))] font-medium">Live</span>
                </div>
                <h2 className="font-['DM_Serif_Display'] text-3xl md:text-5xl text-foreground mt-2">
                  Recent valuations
                </h2>
              </div>
              <p className="text-sm text-muted-foreground hidden md:block">
                238 this week
              </p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden px-5 md:px-8">
            <PropertyShowcaseCarousel />
          </div>
        </section>

        <SectionDivider />

        {/* ═══════════ TESTIMONIALS ═══════════ */}
        <section className="w-full py-8 md:py-20 px-5 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-['DM_Serif_Display'] text-3xl md:text-5xl text-foreground">
              What property owners say
            </h2>
            <div className="relative min-h-[200px] flex flex-col items-center justify-center mt-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-xl md:text-2xl text-muted-foreground italic max-w-2xl leading-relaxed">
                    "{TESTIMONIALS[testimonialIdx].quote}"
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-4">
                    — {TESTIMONIALS[testimonialIdx].name}, {TESTIMONIALS[testimonialIdx].location}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === testimonialIdx ? "bg-primary w-6" : "bg-border w-2 hover:bg-muted-foreground/30"
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
          style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--terracotta-light)) 100%)" }}
        >
          <div className="flex flex-col items-center text-center gap-4 mb-2">
            <span className="inline-block bg-[hsl(var(--terracotta-light))] text-primary rounded-full px-4 py-2 text-sm font-medium">
              Free property valuation
            </span>
            <h2 className="font-['DM_Serif_Display'] text-3xl md:text-5xl text-foreground leading-[1.1]">
              Ready to discover your property's
              <br />
              true <em className="italic">value</em>?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Free, confidential, and takes less than 2 minutes
            </p>
          </div>
          <ValuationTicketCard
            address=""
            estimatedValue=""
            leadId=""
            accentType="sell"
            addressData={addressData}
            onAddressFieldChange={handleAddressChange}
            onLocationConfirmed={handleGetValuation}
            mapExpanded={mapExpandedBottom}
            onMapPhaseChange={(phase) => setMapExpandedBottom(phase === "verify")}
          />
        </section>

      </div>

      {/* ═══════════ STICKY MOBILE CTA ═══════════ */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-md border-t border-border"
          >
            <div className="px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Get your free property valuation
              </p>
              <button
                onClick={handleGetValuation}
                className="w-full rounded-full py-4 bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                Get Your Free Valuation
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;

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

/* ─── MAIN PAGE ─── */

const Index = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);
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
    const path = "/sell/valuation";
    if (address.trim()) {
      navigate(path, {
        state: {
          addressData: {
            streetAddress: address,
            urbanization: "",
            city: "",
            province: "",
            country: "Spain",
            complex: "",
          },
        },
      });
    } else {
      navigate(path);
    }
  }, [address, navigate]);

  const AddressBlock = ({ compact }: { compact?: boolean }) => (
    <div className="w-full flex flex-col items-center gap-6">
      <div className={cn("relative w-full", compact ? "max-w-md" : "max-w-lg mx-auto")}>
        <svg className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
          <circle cx="10" cy="8" r="4" />
          <path d="M10 12v6" />
        </svg>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your property address..."
          className={cn(
            "w-full rounded-2xl border border-[hsl(var(--border))] bg-card pl-12 pr-5 text-foreground shadow-sm outline-none transition-shadow focus:shadow-lg placeholder:text-muted-foreground",
            compact ? "py-3.5 text-base" : "py-5 pr-6 text-lg"
          )}
        />
      </div>
      <button
        onClick={handleGetValuation}
        className="rounded-full px-8 py-4 text-lg font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
      >
        Get Your Free Valuation
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">

      {/* ═══════════ HERO ═══════════ */}
      <div
        ref={heroRef}
        className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 animate-fade-in"
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-6">
          <span className="inline-block bg-[hsl(var(--terracotta-light))] text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
            Free property valuation
          </span>
          <h1 className="font-['DM_Serif_Display'] text-3xl md:text-7xl text-foreground leading-[1.1]">
            What is your property
            <br />
            in Spain <em className="italic">really</em> worth?
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-4">
            Get a detailed market report in under 2 minutes. Completely free.
          </p>
          <ValuationTicketCard
            address=""
            estimatedValue=""
            propertyType="Villa"
            leadId="a1b2c3d4e5f6"
            accentType="sell"
            addressValue={address}
            onAddressChange={setAddress}
            onSubmit={handleGetValuation}
          />
          <p className="text-sm text-muted-foreground/60 tracking-wide -mt-2">
            12,400+ valuations · 100% free · 2 minutes
          </p>
        </div>
      </div>

      {/* ═══════════ FLOATING AGENCIES ═══════════ */}
      <section className="w-full py-14 md:py-32 overflow-hidden">
        <p className="text-xs tracking-[0.2em] text-muted-foreground/40 text-center uppercase mb-10 md:mb-16">
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

      {/* ═══════════ HOW IT WORKS — Typographic ═══════════ */}
      <section className="w-full py-14 md:py-32 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 md:mb-20"
          >
            <h2 className="font-['DM_Serif_Display'] text-3xl md:text-5xl text-foreground">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg mt-3">
              Three simple steps to your free valuation
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
                  "flex items-start gap-6 md:gap-10 py-10 md:py-14",
                  i < HOW_STEPS.length - 1 && "border-b border-[hsl(var(--border)/0.3)]"
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

      {/* ═══════════ WHAT YOU GET — Flippable Card ═══════════ */}
      <section className="w-full py-14 md:py-32 px-4 md:px-6 bg-secondary/50">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
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

      {/* ═══════════ REPORT FEATURES — Editorial Scatter ═══════════ */}
      <section className="w-full py-14 md:py-32 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-['DM_Serif_Display'] text-3xl md:text-5xl text-foreground max-w-3xl mx-auto">
              Everything you need to know about your property
            </h2>
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
                  "py-8 group",
                  i < REPORT_FEATURES.length - 2 && "border-b border-[hsl(var(--border)/0.2)]",
                  // On mobile all get bottom border except last
                  "max-md:border-b max-md:border-[hsl(var(--border)/0.2)] max-md:last:border-b-0"
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
            className="flex justify-center mt-12"
          >
            <span className="inline-block bg-[hsl(var(--terracotta-light))] text-primary rounded-full px-5 py-2.5 text-sm font-medium">
              All included — completely free
            </span>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ RECENT VALUATIONS ═══════════ */}
      <section className="w-full py-20 md:py-32 bg-secondary/50">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 justify-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--success))] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--success))]" />
            </span>
            <span className="text-sm text-[hsl(var(--success))] font-medium">Live</span>
          </div>
          <h2 className="font-['DM_Serif_Display'] text-4xl md:text-5xl text-center text-foreground mt-4">
            Recent valuations
          </h2>
          <p className="text-muted-foreground text-lg text-center mt-2">238 valuations this week</p>
        </div>
        <div className="max-w-5xl mx-auto mt-12 rounded-2xl overflow-hidden">
          <PropertyShowcaseCarousel />
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="w-full py-20 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-['DM_Serif_Display'] text-4xl md:text-5xl text-foreground">
            What property owners say
          </h2>
          <div className="relative min-h-[200px] flex flex-col items-center justify-center mt-12">
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
                <p className="text-sm text-muted-foreground/60 mt-6">
                  — {TESTIMONIALS[testimonialIdx].name}, {TESTIMONIALS[testimonialIdx].location}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-2 mt-8">
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

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section
        className="w-full py-20 md:py-32 px-6 pb-32"
        style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--terracotta-light)) 100%)" }}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-6">
          <h2 className="font-['DM_Serif_Display'] text-4xl md:text-5xl text-foreground leading-[1.1]">
            Ready to discover your property's true value?
          </h2>
          <p className="text-lg text-muted-foreground">
            Free, confidential, and takes less than 2 minutes
          </p>
          <div className="w-full mt-6">
            <AddressBlock />
          </div>
          <p className="text-sm text-muted-foreground/60 mt-8">
            Join 12,400+ property owners who already know their home's worth
          </p>
        </div>
      </section>

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
            <div className="px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
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

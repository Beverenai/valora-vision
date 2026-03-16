import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ValuationTicketCard from "@/components/ValuationTicketCard";
import PropertyShowcaseCarousel from "@/components/PropertyShowcaseCarousel";

/* ─── DATA ─── */

const AGENCIES = [
  "Engel & Völkers",
  "Sotheby's",
  "Panorama",
  "DM Properties",
  "Terra Meridiana",
  "Drumelia",
  "La Sala Estates",
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Enter your address",
    desc: "Start typing and select your property from the suggestions.",
    icon: (
      <svg viewBox="0 0 40 40" width="40" height="40" fill="none" strokeWidth="1.5" stroke="#D4713B">
        <circle cx="20" cy="16" r="6" />
        <path d="M20 22 L20 34" />
        <path d="M14 28 L26 28" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Tell us about your property",
    desc: "Add bedrooms, bathrooms, size and key features.",
    icon: (
      <svg viewBox="0 0 40 40" width="40" height="40" fill="none" strokeWidth="1.5" stroke="#D4713B">
        <rect x="8" y="12" width="24" height="20" rx="2" />
        <path d="M8 20 L32 20" />
        <path d="M16 12 L16 8" />
        <path d="M24 12 L24 8" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Get your valuation",
    desc: "Receive a market estimate based on real data in seconds.",
    icon: (
      <svg viewBox="0 0 40 40" width="40" height="40" fill="none" strokeWidth="1.5" stroke="#D4713B">
        <path d="M8 32 L16 20 L24 26 L32 12" />
        <circle cx="32" cy="12" r="3" />
      </svg>
    ),
  },
];

const REPORT_FEATURES = [
  {
    title: "Estimated Market Value",
    desc: "Calculated price based on comparable sales data.",
    icon: (
      <svg viewBox="0 0 36 36" width="36" height="36" fill="none" strokeWidth="1.5" stroke="#D4713B">
        <circle cx="18" cy="18" r="14" />
        <path d="M15 13h6M15 23h6M18 10v16M14 17h8" />
      </svg>
    ),
  },
  {
    title: "Rental Income Potential",
    desc: "Long-term and seasonal rental income projections.",
    icon: (
      <svg viewBox="0 0 36 36" width="36" height="36" fill="none" strokeWidth="1.5" stroke="#D4713B">
        <rect x="6" y="14" width="10" height="16" rx="1" />
        <path d="M6 20h10" />
        <circle cx="26" cy="12" r="5" />
        <path d="M24 12h4M26 10v4" />
      </svg>
    ),
  },
  {
    title: "Property Analysis",
    desc: "Detailed analysis of your property's strengths.",
    icon: (
      <svg viewBox="0 0 36 36" width="36" height="36" fill="none" strokeWidth="1.5" stroke="#D4713B">
        <path d="M18 6l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
      </svg>
    ),
  },
  {
    title: "Market Trends",
    desc: "Current price trends and market dynamics in your area.",
    icon: (
      <svg viewBox="0 0 36 36" width="36" height="36" fill="none" strokeWidth="1.5" stroke="#D4713B">
        <rect x="6" y="22" width="6" height="8" rx="1" />
        <rect x="15" y="16" width="6" height="14" rx="1" />
        <rect x="24" y="10" width="6" height="20" rx="1" />
      </svg>
    ),
  },
  {
    title: "Comparable Properties",
    desc: "Similar properties recently sold or listed near you.",
    icon: (
      <svg viewBox="0 0 36 36" width="36" height="36" fill="none" strokeWidth="1.5" stroke="#D4713B">
        <path d="M6 18l10-10v6h8v-6l10 10" />
        <path d="M10 18v12h6v-8h4v8h6V18" />
      </svg>
    ),
  },
  {
    title: "Agent Recommendations",
    desc: "Matched local agents ready to help you sell or rent.",
    icon: (
      <svg viewBox="0 0 36 36" width="36" height="36" fill="none" strokeWidth="1.5" stroke="#D4713B">
        <circle cx="18" cy="12" r="6" />
        <path d="M8 30c0-5.5 4.5-10 10-10s10 4.5 10 10" />
        <path d="M24 20l3 3 5-5" />
      </svg>
    ),
  },
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

  /* ─── ADDRESS INPUT (for final CTA) ─── */
  const AddressBlock = ({ compact }: { compact?: boolean }) => (
    <div className="w-full flex flex-col items-center gap-6">
      <div className={cn("relative w-full", compact ? "max-w-md" : "max-w-lg mx-auto")}>
        <svg className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#999" strokeWidth="1.5">
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

      {/* ═══════════ SECTION 1 — HERO WITH TICKET CARD ═══════════ */}
      <div
        ref={heroRef}
        className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in"
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-0">
          <span className="inline-block bg-[hsl(var(--terracotta-light))] text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
            Free property valuation
          </span>

          <h1 className="font-['DM_Serif_Display'] text-4xl md:text-7xl text-foreground leading-[1.1]">
            What is your property
            <br />
            in Spain <em className="italic">really</em> worth?
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mt-4">
            Get a detailed market report in under 2 minutes. Completely free.
          </p>

          <ValuationTicketCard
            address="Calle Sierra Blanca 12"
            city="Marbella"
            estimatedValue="€1,250,000"
            secondaryValue="€4,200/m²"
            propertyType="Villa"
            leadId="a1b2c3d4e5f6"
            subtitle="Your Valuation"
            summaryText="Your property has been analysed using comparable market data, location scoring, and current demand indicators. Scroll down to explore the full breakdown."
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

      {/* ═══════════ SECTION 2 — TRUSTED BY ═══════════ */}
      <section className="w-full py-20 bg-card border-t border-border">
        <p className="text-xs tracking-[0.2em] text-muted-foreground/60 text-center uppercase">
          Trusted by leading agencies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 mt-6 px-6 overflow-x-auto">
          {AGENCIES.map((name) => (
            <span key={name} className="text-muted-foreground/40 text-base font-medium whitespace-nowrap">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════ SECTION 3 — HOW IT WORKS ═══════════ */}
      <section className="w-full py-16 md:py-24 px-6 bg-secondary border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-['DM_Serif_Display'] text-3xl md:text-5xl text-center text-foreground">
            How it works
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl text-center mt-3">
            Three simple steps to your free valuation
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 md:mt-16">
            {HOW_STEPS.map((step, i) => (
              <div
                key={step.num}
                className="bg-card rounded-2xl p-6 md:p-10 shadow-sm animate-fade-in"
                style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}
              >
                {step.icon}
                <p className="text-xs text-muted-foreground/30 font-mono tracking-wider mt-4 md:mt-6">{step.num}</p>
                <h3 className="text-lg font-semibold text-foreground mt-2 md:mt-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm md:text-base mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 4 — WHAT YOUR REPORT INCLUDES ═══════════ */}
      <section className="w-full py-16 md:py-24 px-6 bg-card border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-['DM_Serif_Display'] text-3xl md:text-5xl text-center text-foreground max-w-3xl mx-auto">
            Everything you need to know about your property
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-10 md:mt-16">
            {REPORT_FEATURES.map((feat, i) => (
              <div
                key={feat.title}
                className="bg-background rounded-2xl p-6 md:p-8 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                {feat.icon}
                <h3 className="font-semibold text-foreground mt-3 md:mt-4">{feat.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 md:mt-2">{feat.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 md:mt-12">
            <span className="inline-block bg-[hsl(var(--terracotta-light))] text-primary rounded-full px-5 py-2.5 text-sm font-medium">
              All included — completely free
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 5 — RECENT VALUATIONS ═══════════ */}
      <section className="w-full py-16 md:py-24 bg-secondary border-t border-border">
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

      {/* ═══════════ SECTION 6 — TESTIMONIALS ═══════════ */}
      <section className="w-full py-16 md:py-24 px-6 bg-card border-t border-border">
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

      {/* ═══════════ SECTION 7 — FINAL CTA ═══════════ */}
      <section
        className="w-full py-16 md:py-24 px-6 pb-32 border-t border-border"
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

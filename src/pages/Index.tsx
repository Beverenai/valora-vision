import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  MapPin,
  ClipboardList,
  TrendingUp,
  DollarSign,
  Home,
  Brain,
  BarChart3,
  Building2,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── DATA ─── */

const TRUST_STATS = [
  { label: "Valuations", value: "12,400+" },
  { label: "Cities", value: "45+" },
  { label: "Free", value: "100%" },
];

const AGENCIES = [
  "La Sala Estates",
  "Engel & Völkers",
  "Sotheby's",
  "Panorama",
  "DM Properties",
  "Terra Meridiana",
  "Drumelia",
  "Marbella Hills Homes",
];

const RECENT_VALUATIONS = [
  { location: "Nueva Andalucía", time: "2 min ago", price: "€3,850/m²", detail: "Villa • 4 bed • 280m²" },
  { location: "Puerto Banús", time: "5 min ago", price: "€5,200/m²", detail: "Penthouse • 3 bed • 195m²" },
  { location: "Estepona", time: "8 min ago", price: "€2,900/m²", detail: "Apartment • 2 bed • 110m²" },
  { location: "Benahavís", time: "12 min ago", price: "€4,100/m²", detail: "Villa • 5 bed • 420m²" },
  { location: "Mijas Costa", time: "15 min ago", price: "€2,650/m²", detail: "Townhouse • 3 bed • 160m²" },
];

const HOW_STEPS = [
  { num: "01", icon: MapPin, title: "Enter your address", desc: "Start typing and select your property from the suggestions." },
  { num: "02", icon: ClipboardList, title: "Tell us about your property", desc: "Add bedrooms, bathrooms, size and key features." },
  { num: "03", icon: TrendingUp, title: "Get your valuation", desc: "Receive an AI-powered market estimate in seconds." },
];

const REPORT_FEATURES = [
  { icon: DollarSign, title: "Estimated Market Value", desc: "AI-calculated price based on comparable sales data." },
  { icon: Home, title: "Rental Income Potential", desc: "Long-term and seasonal rental income projections." },
  { icon: Brain, title: "AI Property Analysis", desc: "Detailed analysis of your property's strengths." },
  { icon: BarChart3, title: "Market Trends", desc: "Current price trends and market dynamics in your area." },
  { icon: Building2, title: "Comparable Properties", desc: "Similar properties recently sold or listed near you." },
  { icon: Users, title: "Agent Recommendations", desc: "Matched local agents ready to help you sell or rent." },
];

const TESTIMONIALS = [
  { quote: "We sold our villa in Marbella for 12% above the initial asking price thanks to the accurate valuation.", name: "James & Sarah T.", location: "Marbella", stars: 5 },
  { quote: "The rental estimate was spot-on. We now earn €3,200/month from our apartment in Estepona.", name: "Carlos M.", location: "Estepona", stars: 5 },
  { quote: "Fast, free, and surprisingly accurate. Best property tool I've found for Spain.", name: "Anna K.", location: "Fuengirola", stars: 5 },
  { quote: "Used it to compare agents' prices. The AI valuation was within 3% of the final sale price.", name: "Robert D.", location: "Benalmádena", stars: 5 },
];

type ValuationType = "sell" | "rent";

const sectionReveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

/* ─── MARQUEE CSS ─── */
const marqueeStyle = `
@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`;

/* ─── MAIN PAGE ─── */

const Index = () => {
  const navigate = useNavigate();
  const [valuationType, setValuationType] = useState<ValuationType>("sell");
  const [address, setAddress] = useState("");
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Testimonial auto-rotate
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Sticky CTA observer
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

  const handleProceed = useCallback(
    (type: ValuationType) => {
      setValuationType(type);
      if (address.trim()) {
        const path = type === "sell" ? "/sell/valuation" : "/rent/valuation";
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
      }
    },
    [address, navigate]
  );

  const doubled = [...AGENCIES, ...AGENCIES];

  /* ─── ADDRESS INPUT BLOCK (reused in hero + final CTA) ─── */
  const AddressBlock = ({ id }: { id: string }) => (
    <div className="w-full flex flex-col gap-3">
      {/* Input */}
      <div className="relative w-full max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          id={id}
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your property address..."
          className="w-full rounded-2xl bg-white py-4 pl-12 pr-5 text-foreground text-base shadow-2xl outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-1">
        <button
          onClick={() => handleProceed("sell")}
          className={cn(
            "min-h-[48px] rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 w-full sm:w-auto",
            valuationType === "sell"
              ? "bg-amber text-white shadow-lg shadow-amber/25"
              : "border border-white/30 text-white/80 hover:border-amber/60 hover:text-white"
          )}
        >
          I want to sell
        </button>
        <button
          onClick={() => handleProceed("rent")}
          className={cn(
            "min-h-[48px] rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 w-full sm:w-auto",
            valuationType === "rent"
              ? "bg-teal text-white shadow-lg shadow-teal/25"
              : "border border-white/30 text-white/80 hover:border-teal/60 hover:text-white"
          )}
        >
          I want to rent out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col text-foreground" style={{ backgroundColor: "#0F1B2D" }}>
      <style>{marqueeStyle}</style>

      {/* ═══════════ SECTION 1 — HERO ═══════════ */}
      <div
        ref={heroRef}
        className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

        <div className="relative z-10 flex flex-col items-center w-full max-w-lg md:max-w-3xl px-6 gap-6">
          {/* Logo */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-heading text-lg font-bold text-white/90 tracking-wide pt-8"
          >
            Valora<span className="text-amber">Casa</span>
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-heading text-3xl md:text-5xl font-bold text-white text-center leading-tight"
          >
            What is your property
            <br />
            in Spain <em className="text-amber not-italic font-bold italic">really</em> worth?
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-white/50 text-center text-sm sm:text-base max-w-md"
          >
            Free AI-powered valuation in under 2 minutes
          </motion.p>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="w-full mt-2"
          >
            <AddressBlock id="hero-address" />
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="flex items-center gap-5 mt-4 text-white/40 text-sm flex-wrap justify-center"
          >
            {TRUST_STATS.map((stat, i) => (
              <span key={stat.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/15 mr-3">•</span>}
                <CheckCircle2 className="h-3.5 w-3.5 text-amber" />
                <span className="font-semibold text-white/70">{stat.value}</span>{" "}
                {stat.label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ═══════════ SECTION 2 — TRUSTED BY ═══════════ */}
      <motion.section {...sectionReveal} className="w-full py-12 overflow-hidden border-t border-white/5" style={{ background: "#111827" }}>
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-amber/80 text-center px-6 mb-6">
          Trusted by leading property professionals
        </p>

        <div className="relative w-full overflow-hidden">
          <div
            className="flex gap-4 whitespace-nowrap"
            style={{ animation: "marquee-scroll 30s linear infinite", width: "max-content" }}
          >
            {doubled.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="inline-flex items-center px-4 py-2 rounded-full border border-white/10 text-sm text-white/60 bg-white/[0.03] shrink-0"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6 px-6">
          Used daily by 50+ agencies across Costa del Sol
        </p>
      </motion.section>

      {/* ═══════════ SECTION 3 — RECENT VALUATIONS ═══════════ */}
      <motion.section {...sectionReveal} className="w-full py-16 md:py-24 px-6 border-t border-white/5" style={{ background: "#0F1B2D" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 justify-center mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white leading-tight">
              Recent valuations
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-2 px-2 scrollbar-hide">
            {RECENT_VALUATIONS.map((v, i) => (
              <motion.div
                key={v.location}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="min-w-[280px] snap-start bg-white/5 rounded-2xl p-5 border border-white/10 shrink-0"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/80 text-sm font-medium">{v.location}</span>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {v.time}
                  </span>
                </div>
                <p className="text-2xl font-bold text-amber mb-1">{v.price}</p>
                <p className="text-white/40 text-sm">{v.detail}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-muted-foreground text-xs mt-6">
            238 valuations this week
          </p>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 4 — HOW IT WORKS ═══════════ */}
      <motion.section {...sectionReveal} className="w-full py-16 md:py-24 px-6 border-t border-white/5" style={{ background: "#111827" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white text-center leading-tight mb-4">
            How it works
          </h2>
          <p className="text-white/40 text-center text-sm mb-12">
            Get your free property valuation in 3 simple steps
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {HOW_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center"
              >
                <span className="text-6xl font-heading font-bold text-amber/20 mb-2">
                  {step.num}
                </span>
                <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-amber" />
                </div>
                <h3 className="text-white font-heading font-semibold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 5 — WHAT YOU GET ═══════════ */}
      <motion.section {...sectionReveal} className="w-full py-16 md:py-24 px-6 border-t border-white/5" style={{ background: "#0d1520" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white text-center leading-tight mb-12">
            What your free report includes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group bg-white/[0.04] border border-white/10 rounded-xl p-6 transition-all duration-300 hover:border-amber/30 hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center mb-4">
                  <feat.icon className="h-5 w-5 text-amber" />
                </div>
                <h3 className="text-white font-heading font-semibold mb-1">{feat.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <span className="inline-flex items-center px-5 py-2 rounded-full border border-amber/40 text-amber text-sm font-medium">
              All included — completely free
            </span>
          </div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 6 — TESTIMONIALS ═══════════ */}
      <motion.section {...sectionReveal} className="w-full py-16 md:py-24 px-6 border-t border-white/5" style={{ background: "#111827" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white leading-tight mb-12">
            What property owners say
          </h2>

          <div className="min-h-[160px] flex flex-col items-center justify-center">
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
                  {Array.from({ length: TESTIMONIALS[testimonialIdx].stars }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber text-amber" />
                  ))}
                </div>
                <p className="text-white/70 text-lg italic leading-relaxed max-w-2xl">
                  "{TESTIMONIALS[testimonialIdx].quote}"
                </p>
                <p className="text-white/30 text-sm">
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
                  "h-2 rounded-full transition-all duration-300 min-w-[8px]",
                  i === testimonialIdx ? "bg-amber w-6" : "bg-white/20 w-2 hover:bg-white/40"
                )}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 7 — FINAL CTA ═══════════ */}
      <motion.section
        {...sectionReveal}
        className="w-full py-20 md:py-28 px-6 pb-32 border-t border-white/5"
        style={{ background: "linear-gradient(135deg, #1a2332 0%, #0d2847 50%, #1a2332 100%)" }}
      >
        <div className="max-w-lg md:max-w-3xl mx-auto flex flex-col items-center gap-6">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white text-center leading-tight">
            Ready to discover your property's true value?
          </h2>
          <p className="text-white/50 text-center text-sm">
            Free, confidential, and takes less than 2 minutes
          </p>

          <div className="w-full mt-2">
            <AddressBlock id="cta-address" />
          </div>

          <p className="text-white/30 text-xs mt-4">
            Join 12,400+ property owners who already know their home's worth
          </p>
        </div>
      </motion.section>

      {/* ═══════════ STICKY MOBILE CTA ═══════════ */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            style={{ background: "rgba(15,27,45,0.95)", backdropFilter: "blur(12px)" }}
          >
            <div className="px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <button
                onClick={() => handleProceed(valuationType)}
                className="w-full min-h-[48px] bg-amber text-white font-semibold rounded-full py-4 flex items-center justify-center gap-2 shadow-lg shadow-amber/25 active:scale-[0.98] transition-transform"
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

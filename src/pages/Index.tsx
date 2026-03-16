import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
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
} from "lucide-react";
import MapboxAddressInput from "@/components/shared/MapboxAddressInput";
import { cn } from "@/lib/utils";

/* ──────────────────────────── DATA ──────────────────────────── */

const TESTIMONIALS = [
  {
    quote: "We sold our villa in Marbella for 12% above the initial asking price thanks to the accurate valuation.",
    name: "James & Sarah T.",
    location: "Marbella",
    stars: 5,
  },
  {
    quote: "The rental estimate was spot-on. We now earn €3,200/month from our apartment in Estepona.",
    name: "Carlos M.",
    location: "Estepona",
    stars: 5,
  },
  {
    quote: "Fast, free, and surprisingly accurate. Best property tool I've found for Spain.",
    name: "Anna K.",
    location: "Fuengirola",
    stars: 5,
  },
  {
    quote: "Used it to compare agents' prices. The AI valuation was within 3% of the final sale price.",
    name: "Robert D.",
    location: "Benalmádena",
    stars: 5,
  },
];

const TRUST_STATS = [
  { label: "Valuations", value: "12,400+" },
  { label: "Cities", value: "45+" },
  { label: "Free", value: "100%" },
];

const AGENCIES = [
  "La Sala Estates",
  "Engel & Völkers",
  "Kristina Szekely Sotheby's",
  "Panorama Properties",
  "DM Properties",
  "Terra Meridiana",
  "Marbella Hills Homes",
  "Drumelia Real Estate",
];

const HOW_STEPS = [
  { num: "01", icon: MapPin, title: "Enter your address", desc: "Start typing and select your property from the suggestions." },
  { num: "02", icon: ClipboardList, title: "Tell us about your property", desc: "Add bedrooms, bathrooms, size and key features." },
  { num: "03", icon: TrendingUp, title: "Get your valuation", desc: "Receive an AI-powered market estimate in seconds." },
];

const REPORT_FEATURES = [
  { icon: DollarSign, title: "Estimated Market Value", desc: "AI-calculated price based on comparable sales data." },
  { icon: Home, title: "Rental Income Potential", desc: "Long-term and seasonal rental income projections." },
  { icon: Brain, title: "AI Property Analysis", desc: "Detailed analysis of your property's strengths and opportunities." },
  { icon: BarChart3, title: "Market Trends", desc: "Current price trends and market dynamics in your area." },
  { icon: Building2, title: "Comparable Properties", desc: "Similar properties recently sold or listed near you." },
  { icon: Users, title: "Professional Recommendations", desc: "Matched local agents ready to help you sell or rent." },
];

type ValuationType = "sell" | "rent";

const emptyAddress = {
  streetAddress: "",
  urbanization: "",
  city: "",
  province: "",
  country: "",
  complex: "",
};

/* ──────────────── LOCAL COMPONENTS ──────────────── */

const TrustedBySection = () => {
  const doubled = [...AGENCIES, ...AGENCIES];
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full py-12 overflow-hidden"
      style={{ background: "#1a2332" }}
    >
      <div className="max-w-5xl mx-auto px-6 mb-6">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-amber text-center">
          Trusted by leading property professionals
        </p>
      </div>

      {/* Marquee */}
      <div className="relative w-full overflow-hidden">
        <div className="flex gap-6 animate-marquee whitespace-nowrap">
          {doubled.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="inline-flex items-center px-5 py-2.5 rounded-full border border-white/10 text-sm font-medium text-white/70 bg-white/[0.03] flex-shrink-0"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <p className="text-center text-muted-foreground text-sm mt-6">
        Used daily by 50+ agencies across Costa del Sol
      </p>
    </motion.section>
  );
};

const HowItWorksSection = () => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="w-full py-20 px-6"
    style={{ background: "#0f1923" }}
  >
    <div className="max-w-5xl mx-auto">
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-white text-center">
        How it works
      </h2>
      <p className="text-white/50 text-center mt-3 text-sm md:text-base">
        Get your free property valuation in 3 simple steps
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {HOW_STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center"
          >
            <span className="text-gold font-heading text-4xl font-bold mb-4 opacity-60">
              {step.num}
            </span>
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
              <step.icon className="h-6 w-6 text-gold" />
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
);

const ReportIncludesSection = () => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="w-full py-20 px-6"
    style={{ background: "#0d1520" }}
  >
    <div className="max-w-5xl mx-auto">
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-white text-center">
        Your free valuation report includes
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {REPORT_FEATURES.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group bg-white/[0.04] border border-white/10 rounded-xl p-6 transition-all duration-300 hover:scale-[1.03] hover:border-gold/40 hover:shadow-[0_0_20px_-5px_hsl(var(--gold)/0.3)]"
          >
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
              <feat.icon className="h-5 w-5 text-gold" />
            </div>
            <h3 className="text-white font-heading font-semibold mb-1">
              {feat.title}
            </h3>
            <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <span className="inline-flex items-center px-5 py-2 rounded-full border border-gold/40 text-gold text-sm font-medium">
          All included — completely free
        </span>
      </div>
    </div>
  </motion.section>
);

const TestimonialsSection = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full py-20 px-6"
      style={{ background: "#131d2a" }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-12">
          What property owners say
        </h2>

        <div className="min-h-[140px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex gap-1">
                {Array.from({ length: TESTIMONIALS[idx].stars }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-white/60 text-lg sm:text-xl italic leading-relaxed max-w-2xl">
                "{TESTIMONIALS[idx].quote}"
              </p>
              <p className="text-white/30 text-sm">
                — {TESTIMONIALS[idx].name}, {TESTIMONIALS[idx].location}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i === idx ? "bg-gold w-6" : "bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

interface FinalCTAProps {
  addressData: typeof emptyAddress;
  onAddressChange: (field: string, value: string) => void;
  onProceed: (type: ValuationType) => void;
  valuationType: ValuationType;
}

const FinalCTASection = ({ addressData, onAddressChange, onProceed, valuationType }: FinalCTAProps) => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="w-full py-20 px-6"
    style={{
      background: "linear-gradient(135deg, #1a2332 0%, #0d2847 50%, #1a2332 100%)",
    }}
  >
    <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-white text-center leading-tight">
        Ready to discover your property's true value?
      </h2>
      <p className="text-white/50 text-center text-sm md:text-base">
        Free, confidential, and takes less than 2 minutes
      </p>

      <div className="w-full max-w-[600px] mt-2 rounded-xl p-[2px]">
        <div className="bg-card rounded-xl p-4">
          <MapboxAddressInput addressData={addressData} onChange={onAddressChange} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onProceed("sell")}
          className={cn(
            "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
            valuationType === "sell"
              ? "bg-gold text-black shadow-lg shadow-gold/25"
              : "border border-white/20 text-white/70 hover:border-gold/50 hover:text-white"
          )}
        >
          I want to sell
        </button>
        <button
          onClick={() => onProceed("rent")}
          className={cn(
            "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
            valuationType === "rent"
              ? "bg-teal text-white shadow-lg shadow-teal/25"
              : "border border-white/20 text-white/70 hover:border-teal/50 hover:text-white"
          )}
        >
          I want to rent out
        </button>
      </div>

      <p className="text-white/30 text-xs mt-4">
        Join 12,400+ property owners who already know their home's worth
      </p>
    </div>
  </motion.section>
);

/* ──────────────────────── MAIN PAGE ──────────────────────── */

const Index = () => {
  const navigate = useNavigate();
  const [valuationType, setValuationType] = useState<ValuationType>("sell");
  const [addressData, setAddressData] = useState(emptyAddress);

  const handleAddressChange = useCallback(
    (field: string, value: string) => {
      setAddressData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const hasAddress = addressData.streetAddress || addressData.city;

  const handleProceed = (type: ValuationType) => {
    setValuationType(type);
    if (hasAddress) {
      const path = type === "sell" ? "/sell/valuation" : "/rent/valuation";
      navigate(path, { state: { addressData } });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* ═══ HERO ═══ */}
      <div
        className="relative w-full flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />

        <div className="relative z-10 flex flex-col items-center w-full max-w-3xl px-6 py-12 gap-6">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-heading text-lg font-bold text-white/90 tracking-wide"
          >
            Valora<span className="text-gold">Casa</span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center leading-tight tracking-tight"
          >
            What is your property
            <br />
            in Spain{" "}
            <span className="text-gold">really</span> worth?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-white/60 text-center text-sm sm:text-base max-w-lg"
          >
            Free AI-powered valuations based on real market data from thousands of listings
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-full max-w-[600px] mt-2 rounded-xl p-[2px] animate-[glow-pulse_3s_ease-in-out_infinite]"
          >
            <div className="bg-card rounded-xl p-4">
              <MapboxAddressInput addressData={addressData} onChange={handleAddressChange} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="flex gap-3 mt-1"
          >
            <button
              onClick={() => handleProceed("sell")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                valuationType === "sell"
                  ? "bg-gold text-black shadow-lg shadow-gold/25"
                  : "border border-white/20 text-white/70 hover:border-gold/50 hover:text-white"
              )}
            >
              I want to sell
            </button>
            <button
              onClick={() => handleProceed("rent")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                valuationType === "rent"
                  ? "bg-teal text-white shadow-lg shadow-teal/25"
                  : "border border-white/20 text-white/70 hover:border-teal/50 hover:text-white"
              )}
            >
              I want to rent out
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex items-center gap-6 mt-6 text-white/40 text-xs sm:text-sm"
          >
            {TRUST_STATS.map((stat, i) => (
              <span key={stat.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/20 mr-4">•</span>}
                <span className="font-semibold text-white/70">{stat.value}</span>{" "}
                {stat.label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ═══ SECTION 2 — TRUSTED BY ═══ */}
      <TrustedBySection />

      {/* ═══ SECTION 3 — HOW IT WORKS ═══ */}
      <HowItWorksSection />

      {/* ═══ SECTION 4 — REPORT INCLUDES ═══ */}
      <ReportIncludesSection />

      {/* ═══ SECTION 5 — TESTIMONIALS ═══ */}
      <TestimonialsSection />

      {/* ═══ SECTION 6 — FINAL CTA ═══ */}
      <FinalCTASection
        addressData={addressData}
        onAddressChange={handleAddressChange}
        onProceed={handleProceed}
        valuationType={valuationType}
      />
    </div>
  );
};

export default Index;

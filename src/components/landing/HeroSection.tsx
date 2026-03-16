import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HERO_FEATURES = [
  "Accurate market data from 12,400+ valuations",
  "Comparable sales and rental analysis",
  "Personalized agent recommendations",
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);

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

  return (
    <section ref={heroRef} className="px-4 pt-12 pb-6 md:px-8 md:pt-20 md:pb-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Desktop: 2-col layout */}
        <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-center">
          {/* Image Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full lg:w-[58%] rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-[16/10]"
          >
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"
              alt="Luxury Mediterranean villa with pool"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="font-['DM_Serif_Display'] text-white text-sm tracking-wide">
                ValoraCasa
              </span>
              <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[0.65rem] font-medium text-white uppercase tracking-wider">
                Featured
              </span>
            </div>

            {/* Bottom overlay content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
              <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">
                Costa del Sol
              </p>
              <h1 className="font-['DM_Serif_Display'] text-white text-2xl md:text-4xl lg:text-5xl leading-[1.1]">
                What is your property
                <br />
                <em className="italic">really</em> worth?
              </h1>
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-5 right-5 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
            </div>
          </motion.div>

          {/* Content / CTA side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 lg:mt-0 lg:w-[42%] flex flex-col"
          >
            {/* Features list */}
            <div className="space-y-3 mb-6">
              {HERO_FEATURES.map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-border mb-6" />

            {/* Address input */}
            <div className="space-y-4">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35">
                  <circle cx="10" cy="8" r="4" />
                  <path d="M10 12v6" />
                </svg>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your property address..."
                  className="w-full rounded-2xl border border-border bg-card pl-11 pr-4 py-4 text-foreground text-sm shadow-sm outline-none transition-shadow focus:shadow-md placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={handleGetValuation}
                className="w-full rounded-2xl px-6 py-4 text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
              >
                Get Your Free Valuation
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-xs text-muted-foreground/50 text-center">
                12,400+ valuations · 100% free · 2 minutes
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

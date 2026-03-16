import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import GoogleMapsAddressInput from "@/components/shared/GoogleMapsAddressInput";
import { cn } from "@/lib/utils";

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

type ValuationType = "sell" | "rent";

const Index = () => {
  const navigate = useNavigate();
  const [valuationType, setValuationType] = useState<ValuationType>("sell");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [addressData, setAddressData] = useState({
    streetAddress: "",
    urbanization: "",
    city: "",
    province: "",
    country: "",
    complex: "",
  });

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

  // Auto-cycle testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-3xl px-6 py-12 gap-6">
        {/* Logo */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-lg font-bold text-white/90 tracking-wide"
        >
          Valora<span className="text-gold">Casa</span>
        </motion.p>

        {/* Headline */}
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

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-white/60 text-center text-sm sm:text-base max-w-lg"
        >
          Free AI-powered valuations based on real market data from thousands of
          listings
        </motion.p>

        {/* Address input with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full max-w-[600px] mt-2 rounded-xl p-[2px] animate-[glow-pulse_3s_ease-in-out_infinite]"
        >
          <div className="bg-card rounded-xl p-4">
            <GoogleMapsAddressInput
              addressData={addressData}
              onChange={handleAddressChange}
            />
          </div>
        </motion.div>

        {/* Type pills */}
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

        {/* Trust stats */}
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

        {/* Rotating testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.95 }}
          className="mt-4 text-center max-w-md min-h-[80px] flex flex-col items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: TESTIMONIALS[testimonialIndex].stars }).map(
                  (_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-gold text-gold"
                    />
                  )
                )}
              </div>
              <p className="text-white/50 text-xs sm:text-sm italic leading-relaxed">
                "{TESTIMONIALS[testimonialIndex].quote}"
              </p>
              <p className="text-white/30 text-xs">
                — {TESTIMONIALS[testimonialIndex].name},{" "}
                {TESTIMONIALS[testimonialIndex].location}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;

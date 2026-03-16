import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PROPERTIES = [
  { id: "marbella-villa", city: "Marbella, Costa del Sol", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200", price: "€1,250,000", propertyType: "4 Bed Villa" },
  { id: "ibiza-finca", city: "Ibiza, Balearics", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200", price: "€890,000", propertyType: "3 Bed Finca" },
  { id: "barcelona-penthouse", city: "Barcelona, Catalonia", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200", price: "€675,000", propertyType: "2 Bed Penthouse" },
  { id: "malaga-apartment", city: "Málaga, Costa del Sol", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200", price: "€320,000", propertyType: "2 Bed Apartment" },
  { id: "valencia-townhouse", city: "Valencia, Community", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200", price: "€425,000", propertyType: "3 Bed Townhouse" },
  { id: "alicante-villa", city: "Alicante, Costa Blanca", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200", price: "€545,000", propertyType: "4 Bed Villa" },
  { id: "tenerife-apartment", city: "Tenerife, Canary Islands", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200", price: "€275,000", propertyType: "1 Bed Apartment" },
  { id: "madrid-flat", city: "Madrid, Central Spain", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200", price: "€510,000", propertyType: "3 Bed Flat" },
];

const AUTO_PLAY_INTERVAL = 3500;
const ITEM_HEIGHT = 52;
const MOBILE_ITEM_HEIGHT = 46;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const PropertyShowcaseCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const itemHeight = isMobile ? MOBILE_ITEM_HEIGHT : ITEM_HEIGHT;
  const currentIndex = ((step % PROPERTIES.length) + PROPERTIES.length) % PROPERTIES.length;

  const nextStep = useCallback(() => setStep((prev) => prev + 1), []);

  const handleChipClick = (index: number) => {
    const diff = (index - currentIndex + PROPERTIES.length) % PROPERTIES.length;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused]);

  const visibleCount = isMobile ? 4 : PROPERTIES.length;
  const activeProperty = PROPERTIES[currentIndex];

  const handleCardClick = useCallback(() => {
    const [cityName, province] = activeProperty.city.split(", ");
    navigate("/sell/valuation", {
      state: {
        addressData: {
          city: cityName,
          province: province || "",
          country: "Spain",
          streetAddress: "",
          urbanization: "",
        },
      },
    });
  }, [activeProperty, navigate]);

  return (
    <div className="flex flex-col md:grid md:grid-cols-2 gap-[1px] bg-border border border-border rounded-2xl overflow-hidden mx-2 md:mx-0">
      {/* City/Area Labels */}
      <div className="bg-primary p-5 md:p-10 flex flex-col justify-between relative overflow-hidden">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2 md:mb-4">
            Recent Valuations
          </p>
          <h3 className="font-heading text-lg md:text-3xl font-medium text-primary-foreground mb-3 md:mb-8">
            Trusted by property owners across Spain
          </h3>
        </div>

        <div className="relative" style={{ height: visibleCount * itemHeight }}>
          <div className="absolute inset-0 pointer-events-none z-10" style={{
            background: "linear-gradient(to bottom, hsl(var(--primary)) 0%, transparent 15%, transparent 85%, hsl(var(--primary)) 100%)",
          }} />
          <div className="relative h-full overflow-hidden">
            {PROPERTIES.map((property, index) => {
              const isActive = index === currentIndex;
              const distance = index - currentIndex;
              const wrappedDistance = wrap(-(PROPERTIES.length / 2), PROPERTIES.length / 2, distance);

              return (
                <div
                  key={property.id}
                  className="absolute w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{
                    top: "50%",
                    marginTop: -itemHeight / 2,
                    transform: `translateY(${wrappedDistance * itemHeight}px) scale(${isActive ? 1 : 0.95})`,
                    opacity: Math.abs(wrappedDistance) > 2 ? 0 : 1,
                  }}
                >
                  <button
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "relative flex items-center gap-2 md:gap-3 w-full px-3 md:px-5 py-2 md:py-3 transition-colors duration-300 text-left border",
                      isActive
                        ? "bg-card text-foreground border-border"
                        : "bg-transparent text-primary-foreground/50 border-primary-foreground/15 hover:border-primary-foreground/30 hover:text-primary-foreground/80"
                    )}
                  >
                    <MapPin size={12} className={cn(isActive ? "text-gold" : "text-primary-foreground/30")} />
                    <span className={cn("text-xs font-medium", isActive ? "text-foreground" : "text-primary-foreground/50")}>
                      {property.city}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right — Property Image + Price */}
      <div
        className="relative bg-muted min-h-[250px] md:min-h-[450px] overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProperty.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${activeProperty.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[0.55rem] md:text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-gold mb-1">
                    Estimated Value
                  </p>
                  <p className="font-heading text-2xl md:text-4xl font-bold text-card">
                    {activeProperty.price}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-card/10 backdrop-blur-sm border border-card/20 px-2.5 py-1 md:px-3 md:py-1.5">
                    <p className="text-[0.65rem] md:text-xs font-medium text-card">{activeProperty.propertyType}</p>
                  </div>
                  <div className="bg-gold/90 backdrop-blur-sm px-2.5 py-1 md:px-3 md:py-1.5 flex items-center gap-1 hover:bg-gold transition-colors">
                    <p className="text-[0.65rem] md:text-xs font-semibold text-primary">Get Valuation</p>
                    <ArrowRight size={10} className="text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PropertyShowcaseCarousel;

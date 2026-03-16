import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const PROPERTIES = [
  {
    id: "marbella-villa",
    city: "Marbella, Costa del Sol",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200",
    price: "€1,250,000",
    propertyType: "4 Bed Villa",
  },
  {
    id: "ibiza-finca",
    city: "Ibiza, Balearics",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200",
    price: "€890,000",
    propertyType: "3 Bed Finca",
  },
  {
    id: "barcelona-penthouse",
    city: "Barcelona, Catalonia",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200",
    price: "€675,000",
    propertyType: "2 Bed Penthouse",
  },
  {
    id: "malaga-apartment",
    city: "Málaga, Costa del Sol",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
    price: "€320,000",
    propertyType: "2 Bed Apartment",
  },
  {
    id: "valencia-townhouse",
    city: "Valencia, Community",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200",
    price: "€425,000",
    propertyType: "3 Bed Townhouse",
  },
  {
    id: "alicante-villa",
    city: "Alicante, Costa Blanca",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200",
    price: "€545,000",
    propertyType: "4 Bed Villa",
  },
  {
    id: "tenerife-apartment",
    city: "Tenerife, Canary Islands",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200",
    price: "€275,000",
    propertyType: "1 Bed Apartment",
  },
  {
    id: "madrid-flat",
    city: "Madrid, Central Spain",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200",
    price: "€510,000",
    propertyType: "3 Bed Flat",
  },
];

const AUTO_PLAY_INTERVAL = 3500;
const ITEM_HEIGHT = 52;
const MOBILE_ITEM_HEIGHT = 46;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const PropertyShowcaseCarousel: React.FC = () => {
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

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = PROPERTIES.length;
    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;
    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  // Only render active + neighbors for performance
  const visibleCards = useMemo(() => {
    return PROPERTIES.map((p, i) => ({ ...p, index: i, status: getCardStatus(i) }))
      .filter((p) => p.status !== "hidden");
  }, [currentIndex]);

  const visibleCount = isMobile ? 4 : PROPERTIES.length;

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
                <motion.div
                  key={property.id}
                  animate={{ y: wrappedDistance * itemHeight, opacity: Math.abs(wrappedDistance) > 2 ? 0 : 1, scale: isActive ? 1 : 0.95 }}
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute w-full"
                  style={{ top: "50%", marginTop: -itemHeight / 2, willChange: "transform" }}
                >
                  <button
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "relative flex items-center gap-2 md:gap-3 w-full px-3 md:px-5 py-2 md:py-3 transition-all duration-500 text-left border",
                      isActive
                        ? "bg-card text-foreground border-border"
                        : "bg-transparent text-primary-foreground/50 border-primary-foreground/15 hover:border-primary-foreground/30 hover:text-primary-foreground/80"
                    )}
                  >
                    <MapPin size={12} className={cn(isActive ? "text-gold" : "text-primary-foreground/30")} />
                    <span className={cn("text-xs font-medium transition-colors", isActive ? "text-foreground" : "text-primary-foreground/50")}>
                      {property.city}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right — Property Image + Price */}
      <div className="relative bg-muted min-h-[250px] md:min-h-[450px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {visibleCards.map((property) => {
            const isActive = property.status === "active";
            const isPrev = property.status === "prev";
            const isNext = property.status === "next";

            return (
              <motion.div
                key={property.id}
                className="absolute inset-0"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{
                  opacity: isActive ? 1 : isPrev || isNext ? 0.3 : 0,
                  y: isActive ? 0 : isPrev ? -30 : isNext ? 30 : 60,
                  scale: isActive ? 1 : 0.95,
                  zIndex: isActive ? 10 : 0,
                }}
                exit={{ opacity: 0, y: -40, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${property.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="absolute bottom-0 left-0 right-0 p-5 md:p-8"
                  >
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[0.55rem] md:text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-gold mb-1">
                          Estimated Value
                        </p>
                        <p className="font-heading text-2xl md:text-4xl font-bold text-card">
                          {property.price}
                        </p>
                      </div>
                      <div className="bg-card/10 backdrop-blur-sm border border-card/20 px-2.5 py-1 md:px-3 md:py-1.5">
                        <p className="text-[0.65rem] md:text-xs font-medium text-card">{property.propertyType}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PropertyShowcaseCarousel;

import React, { useRef, useEffect, useState } from "react";
import ValuationTicketCard from "@/components/ValuationTicketCard";
import { cn } from "@/lib/utils";

const PROPERTIES = [
  { id: "marbella-villa", city: "Marbella", address: "Golden Mile, Marbella", propertyType: "Villa", price: "€1,250,000", rentPrice: "€4,200/mo", leadId: "DEMO-001", bedrooms: 4, bathrooms: 3, builtSize: "320 m²" },
  { id: "ibiza-finca", city: "Ibiza", address: "San José, Ibiza", propertyType: "Finca", price: "€890,000", rentPrice: "€3,800/mo", leadId: "DEMO-002", bedrooms: 3, bathrooms: 2, builtSize: "240 m²" },
  { id: "barcelona-penthouse", city: "Barcelona", address: "Eixample, Barcelona", propertyType: "Penthouse", price: "€675,000", rentPrice: "€2,900/mo", leadId: "DEMO-003", bedrooms: 2, bathrooms: 2, builtSize: "145 m²" },
  { id: "malaga-apartment", city: "Málaga", address: "Centro Histórico, Málaga", propertyType: "Apartment", price: "€320,000", rentPrice: "€1,450/mo", leadId: "DEMO-004", bedrooms: 2, bathrooms: 1, builtSize: "95 m²" },
  { id: "valencia-townhouse", city: "Valencia", address: "El Carmen, Valencia", propertyType: "Townhouse", price: "€425,000", rentPrice: "€1,800/mo", leadId: "DEMO-005", bedrooms: 3, bathrooms: 2, builtSize: "180 m²" },
  { id: "alicante-villa", city: "Alicante", address: "San Juan, Alicante", propertyType: "Villa", price: "€545,000", rentPrice: "€2,200/mo", leadId: "DEMO-006", bedrooms: 4, bathrooms: 3, builtSize: "280 m²" },
];

interface PropertyShowcaseCarouselProps {
  accentType?: "sell" | "rent";
}

const PropertyShowcaseCarousel: React.FC<PropertyShowcaseCarouselProps> = ({ accentType = "sell" }) => {
  const isSell = accentType === "sell";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;
    const container = scrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 2) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: 300, behavior: "smooth" });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {PROPERTIES.map((property) => (
        <div
          key={property.id}
          className="snap-start shrink-0 w-[280px] md:w-[320px]"
        >
          <ValuationTicketCard
            address={property.address}
            city={property.city}
            estimatedValue={isSell ? property.price : property.rentPrice}
            propertyType={property.propertyType}
            leadId={property.leadId}
            headline={isSell ? "VALUED" : "ESTIMATED"}
            subtitle={isSell ? "Sale Valuation" : "Rental Estimate"}
            summaryText=""
            accentType={accentType}
            size="default"
            flippable={false}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            builtSize={property.builtSize}
          />
        </div>
      ))}
    </div>
  );
};

export default PropertyShowcaseCarousel;

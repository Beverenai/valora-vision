import React, { useRef, useCallback, useState } from "react";
import { Share2, Download, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ValuationTicketCardProps {
  address: string;
  city?: string;
  estimatedValue: string;
  secondaryValue?: string;
  propertyType?: string;
  leadId: string;
  headline?: string;
  subtitle?: string;
  summaryText?: string;
  accentType?: "sell" | "rent";
  onShare?: () => void;
  onDownload?: () => void;
}

const PROPERTY_IMAGES: Record<string, string> = {
  Villa: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800",
  Apartment: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
  Townhouse: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=800",
  Penthouse: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
  Finca: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800";

const ValuationTicketCard: React.FC<ValuationTicketCardProps> = ({
  address,
  city,
  estimatedValue,
  secondaryValue,
  propertyType,
  leadId,
  headline = "VALUED",
  subtitle = "Your Valuation",
  summaryText = "Your property has been analysed using comparable market data, location scoring, and current demand indicators. Scroll down to explore the full breakdown.",
  accentType = "sell",
  onShare,
  onDownload,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const accentHsl = accentType === "sell" ? "hsl(var(--primary))" : "hsl(var(--success))";
  const accentClass = accentType === "sell" ? "bg-primary" : "bg-[hsl(var(--success))]";
  const heroImage = (propertyType && PROPERTY_IMAGES[propertyType]) || DEFAULT_IMAGE;

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    setTilt({ rotateX: -y * 12, rotateY: x * 12 });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handlePointerMove(e.clientX, e.clientY);
  }, [handlePointerMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) handlePointerMove(touch.clientX, touch.clientY);
  }, [handlePointerMove]);

  const resetTilt = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <div className="flex items-center justify-center px-4 py-6 md:py-8" style={{ perspective: "800px" }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        onTouchMove={handleTouchMove}
        onTouchEnd={resetTilt}
        className="relative flex w-full max-w-[280px] md:max-w-[340px] bg-[hsl(36_9%_88%)] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group cursor-grab active:cursor-grabbing"
        style={{
          aspectRatio: "9/16",
          maxHeight: "520px",
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          transition: tilt.rotateX === 0 && tilt.rotateY === 0 ? "transform 0.5s ease-out" : "transform 0.08s linear",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* ── Main Section ── */}
        <div className="flex-1 flex flex-col p-4 md:p-5 relative border-r-2 border-dashed border-foreground/15">
          {/* Hero Image Area */}
          <div className="relative w-full h-[42%] rounded-[16px] md:rounded-[20px] overflow-hidden mb-4 shrink-0">
            <img
              src={heroImage}
              alt={propertyType || "Property"}
              className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />

            {/* Accent Circles */}
            <div
              className={`absolute w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full ${accentClass} opacity-80`}
              style={{ top: "14px", right: "24px", zIndex: 10 }}
            />
            <div
              className={`absolute w-[55px] h-[55px] md:w-[65px] md:h-[65px] rounded-full ${accentClass} opacity-80`}
              style={{ bottom: "-16px", left: "-16px", zIndex: 20 }}
            />
            <div
              className={`absolute w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-full ${accentClass} opacity-80`}
              style={{ bottom: "40%", right: "-8px", zIndex: 10 }}
            />

            {/* Share/Download overlay */}
            <div className="absolute top-3 left-3 flex gap-1.5 z-30">
              {onShare && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onShare}
                  className="h-7 w-7 bg-primary/60 backdrop-blur-sm text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                  <Share2 size={12} />
                </Button>
              )}
              {onDownload && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onDownload}
                  className="h-7 w-7 bg-primary/60 backdrop-blur-sm text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                  <Download size={12} />
                </Button>
              )}
            </div>
          </div>

          {/* Data Grid */}
          <div className="flex justify-between items-center mb-1.5 relative z-[2]">
            <span className="font-sans text-[2rem] md:text-[2.5rem] font-light tracking-[-1.5px] leading-none text-foreground">
              {estimatedValue}
            </span>
            <span className="text-[0.6rem] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {city || "—"}
            </span>
          </div>

          {/* Big Headline */}
          <h2
            className="font-heading text-[3rem] md:text-[3.5rem] font-extrabold text-center leading-[0.8] my-2 tracking-[-2px] text-foreground"
            style={{ transform: "scaleY(0.9)" }}
          >
            {headline}
          </h2>

          {/* Dots Divider */}
          <div className="flex justify-between w-full overflow-hidden my-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-foreground shrink-0" />
            ))}
          </div>

          {/* Text Block */}
          <div className="relative flex-1 flex flex-col">
            <span className="font-ticket-cursive text-[2.5rem] md:text-[3rem] leading-[0.6] mb-3 -ml-1 text-foreground block">
              {subtitle}
            </span>

            <p className="text-[0.55rem] md:text-[0.6rem] uppercase text-justify leading-[1.4] font-medium text-foreground/90 mb-4">
              {summaryText}
            </p>

            {/* Meta Info */}
            <div className="absolute bottom-[55px] md:bottom-[65px] right-0 text-right text-[0.45rem] md:text-[0.5rem] leading-[1.2] text-foreground/60 w-[80px] md:w-[100px]">
              <p>VALUATION REPORT</p>
              <p>REF #{leadId.slice(0, 8).toUpperCase()}</p>
              <p>VALID FOR ONE</p>
            </div>

            {/* Barcode */}
            <div className="mt-auto relative h-[45px] md:h-[55px] w-full">
              <div
                className="h-full w-full"
                style={{
                  background: `repeating-linear-gradient(90deg, ${accentHsl} 0px, ${accentHsl} 2px, transparent 2px, transparent 4px, ${accentHsl} 4px, ${accentHsl} 8px, transparent 8px, transparent 9px)`,
                }}
              />
              <p className="absolute -bottom-3 left-0 w-full text-center text-[0.5rem] tracking-[3px] text-foreground/60">
                {leadId.slice(0, 4).toUpperCase()} {leadId.slice(4, 8).toUpperCase()} {leadId.slice(8, 12).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stub Section ── */}
        <div className="hidden sm:flex w-[50px] flex-col items-center justify-between py-4 bg-[hsl(36_9%_88%)]">
          <div className="flex flex-col items-center gap-3">
            <ArrowDown size={16} className="text-foreground/60" />
          </div>

          <span
            className="font-heading text-xs font-bold uppercase tracking-[2px] text-foreground/80"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            ValoraCasa
          </span>

          <div className="flex flex-col items-center gap-3">
            <ArrowDown size={16} className="text-foreground/60" />
            <span className="text-base text-foreground/60">⊕</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuationTicketCard;

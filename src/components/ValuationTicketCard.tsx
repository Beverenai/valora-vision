import React from "react";
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
  const accentHsl = accentType === "sell" ? "hsl(var(--primary))" : "hsl(var(--success))";
  const accentClass = accentType === "sell" ? "bg-primary" : "bg-[hsl(var(--success))]";

  return (
    <div className="flex items-center justify-center px-4 py-8 md:py-12">
      <div
        className="relative flex w-full max-w-[480px] bg-muted rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
        style={{ aspectRatio: "9/16", maxHeight: "850px" }}
      >
        {/* ── Main Section ── */}
        <div className="flex-1 flex flex-col p-6 relative border-r-2 border-dashed border-foreground/20">
          {/* SVG Backdrop */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
            viewBox="0 0 500 900"
            preserveAspectRatio="none"
          >
            <path
              d="M50,100 Q200,50 350,150 T500,300 Q400,500 200,600 T50,800"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              className="text-foreground animate-ticket-dash"
            />
            <path
              d="M450,50 Q300,200 150,150 T0,400 Q100,600 300,700 T450,850"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              className="text-foreground animate-ticket-dash"
              style={{ animationDelay: "5s" }}
            />
          </svg>

          {/* Hero Image Area */}
          <div className="relative w-full h-[45%] bg-primary rounded-[20px] overflow-hidden mb-6 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-navy-deep grayscale group-hover:grayscale-0 transition-all duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-primary-foreground/20 text-6xl font-heading font-bold">
                {propertyType?.charAt(0).toUpperCase() || "P"}
              </span>
            </div>

            {/* Accent Circles */}
            <div
              className={`absolute w-[60px] h-[60px] rounded-full ${accentClass} animate-ticket-float`}
              style={{ top: "20px", right: "40px", zIndex: 10 }}
            />
            <div
              className={`absolute w-[80px] h-[80px] rounded-full ${accentClass}`}
              style={{ bottom: "-20px", left: "-20px", zIndex: 20 }}
            />
            <div
              className={`absolute w-[40px] h-[40px] rounded-full ${accentClass}`}
              style={{ bottom: "40%", right: "-10px", zIndex: 10 }}
            />

            {/* Share/Download overlay */}
            <div className="absolute top-4 left-4 flex gap-2 z-30">
              {onShare && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onShare}
                  className="h-8 w-8 bg-primary/60 backdrop-blur-sm text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                  <Share2 size={14} />
                </Button>
              )}
              {onDownload && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onDownload}
                  className="h-8 w-8 bg-primary/60 backdrop-blur-sm text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                  <Download size={14} />
                </Button>
              )}
            </div>
          </div>

          {/* Data Grid */}
          <div className="flex justify-between items-center mb-2 relative z-[2]">
            <span className="font-sans text-[3rem] font-light tracking-[-2px] leading-none text-foreground">
              {estimatedValue}
            </span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {city || "—"}
            </span>
          </div>

          {/* Big Headline */}
          <h2
            className="font-heading text-[4.5rem] font-extrabold text-center leading-[0.8] my-3 tracking-[-3px] text-foreground"
            style={{ transform: "scaleY(0.9)" }}
          >
            {headline}
          </h2>

          {/* Dots Divider */}
          <div className="flex justify-between w-full overflow-hidden my-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0"
              />
            ))}
          </div>

          {/* Text Block */}
          <div className="relative flex-1 flex flex-col">
            <span className="font-ticket-cursive text-[3.5rem] leading-[0.6] mb-4 -ml-1 text-foreground block">
              {subtitle}
            </span>

            <p className="text-[0.65rem] uppercase text-justify leading-[1.4] font-medium text-foreground/90 mb-5">
              {summaryText}
            </p>

            {/* Meta Info */}
            <div className="absolute bottom-[75px] right-0 text-right text-[0.5rem] leading-[1.2] text-foreground/60 w-[100px]">
              <p>VALUATION BY AI</p>
              <p>REF #{leadId.slice(0, 8).toUpperCase()}</p>
              <p>VALID FOR ONE</p>
            </div>

            {/* Barcode */}
            <div className="mt-auto relative h-[60px] w-full">
              <div
                className="h-full w-full"
                style={{
                  background: `repeating-linear-gradient(90deg, ${accentHsl} 0px, ${accentHsl} 2px, transparent 2px, transparent 4px, ${accentHsl} 4px, ${accentHsl} 8px, transparent 8px, transparent 9px)`,
                }}
              />
              <p className="absolute -bottom-4 left-0 w-full text-center text-[0.6rem] tracking-[4px] text-foreground/60">
                {leadId.slice(0, 4).toUpperCase()} {leadId.slice(4, 8).toUpperCase()} {leadId.slice(8, 12).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Scribble decoration */}
          <svg
            className="absolute bottom-0 left-0 w-full h-[300px] pointer-events-none"
            viewBox="0 0 400 300"
            preserveAspectRatio="none"
          >
            <path
              d="M0,250 Q100,200 200,230 T400,210"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground/[0.15]"
            />
            <path
              d="M0,270 Q150,240 300,260 T400,250"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground/[0.15]"
            />
          </svg>
        </div>

        {/* ── Stub Section ── */}
        <div className="hidden sm:flex w-[60px] flex-col items-center justify-between py-6 bg-muted">
          <div className="flex flex-col items-center gap-4">
            <ArrowDown size={18} className="text-foreground/60" />
          </div>

          <span
            className="font-heading text-sm font-bold uppercase tracking-[2px] text-foreground/80"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            ValoraCasa
          </span>

          <div className="flex flex-col items-center gap-4">
            <ArrowDown size={18} className="text-foreground/60" />
            <span className="text-lg text-foreground/60">⊕</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuationTicketCard;

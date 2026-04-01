import React, { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { Share2, Download, ArrowDown, MapPin, ArrowRight, Bed, Bath, Ruler, LandPlot, Home, Sparkles, Link2, X } from "lucide-react";
import GoogleAddressInput from "@/components/shared/GoogleAddressInput";
import { Button } from "@/components/ui/button";
import SkyToggle from "@/components/ui/sky-toggle";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { formatRefCode } from "@/utils/referenceCode";

type CardSize = "default" | "hero";

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
  accentType?: "sell" | "rent" | "buy";
  onShare?: () => void;
  onDownload?: () => void;
  /* Embedded input mode */
  addressValue?: string;
  onAddressChange?: (value: string) => void;
  onContinue?: () => void;
  /** @deprecated Use onContinue instead */
  onSubmit?: () => void;
  /* Google address input mode (replaces plain input) */
  addressData?: {
    streetAddress: string;
    urbanization: string;
    city: string;
    province: string;
    country: string;
    complex?: string;
    latitude?: number;
    longitude?: number;
  };
  onAddressFieldChange?: (field: string, value: string | number | undefined) => void;
  onLocationConfirmed?: () => void;
  /* Flippable result mode */
  flippable?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  builtSize?: string;
  plotSize?: string;
  condition?: string;
  /* Compact mode for when card is an anchor above form */
  compact?: boolean;
  /* Processing mode */
  mode?: "input" | "compact" | "result" | "processing";
  processingProgress?: number;
  referenceCode?: string;
  /* Map expanded state - card grows taller when map is visible */
  mapExpanded?: boolean;
  onMapPhaseChange?: (phase: "search" | "verify") => void;
  /* Size variant for different contexts */
  size?: CardSize;
  /* Valuation type toggle */
  valuationType?: "sell" | "rent" | "buy";
  onValuationTypeChange?: (type: "sell" | "rent" | "buy") => void;
  /* BUY mode: listing URL input */
  listingUrl?: string;
  onListingUrlChange?: (url: string) => void;
}

const PROPERTY_IMAGES: Record<string, string> = {
  Villa: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800",
  Apartment: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
  Townhouse: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=800",
  Penthouse: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
  Finca: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800";

const PROCESSING_MESSAGES = [
  "Researching property data...",
  "Analyzing market conditions...",
  "Comparing similar properties...",
  "Calculating valuation estimates...",
  "Preparing your report...",
];

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
  addressValue,
  onAddressChange,
  onContinue,
  onSubmit,
  addressData,
  onAddressFieldChange,
  onLocationConfirmed,
  flippable = false,
  bedrooms,
  bathrooms,
  builtSize,
  plotSize,
  condition,
  compact = false,
  mode,
  processingProgress = 0,
  referenceCode,
  mapExpanded = false,
  onMapPhaseChange,
  size = "default",
  valuationType,
  onValuationTypeChange,
  listingUrl,
  onListingUrlChange,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  // Determine effective mode
  const isProcessing = mode === "processing";
  const isCompact = mode === "compact" || (!mode && compact);
  const isLarge = size === "hero";

  const isBuyMode = valuationType === "buy";
  const hasInput = (onAddressChange !== undefined || onAddressFieldChange !== undefined || (isBuyMode && onListingUrlChange !== undefined)) && !isProcessing;
  const hasGoogleInput = onAddressFieldChange !== undefined && addressData !== undefined && !isBuyMode;
  const hasBuyInput = isBuyMode && onListingUrlChange !== undefined;
  const handleContinue = onContinue || onSubmit;

  // Platform detection for BUY mode
  const detectedPlatform = useMemo(() => {
    if (!listingUrl) return null;
    const url = listingUrl.toLowerCase();
    if (url.includes("idealista.com")) return "Idealista";
    if (url.includes("fotocasa.es")) return "Fotocasa";
    if (url.includes("kyero.com")) return "Kyero";
    if (url.includes("spainhouses.net")) return "SpainHouses";
    if (url.includes("pisos.com")) return "Pisos.com";
    return null;
  }, [listingUrl]);

  const accentHsl = accentType === "sell" ? "hsl(var(--primary))" : accentType === "buy" ? "hsl(var(--buy))" : "hsl(var(--success))";
  const accentClass = accentType === "sell" ? "bg-primary" : accentType === "buy" ? "bg-[hsl(var(--buy))]" : "bg-[hsl(var(--success))]";
  const heroImage = (propertyType && PROPERTY_IMAGES[propertyType]) || DEFAULT_IMAGE;

  const refCode = referenceCode || (leadId ? formatRefCode(leadId) : "VC-0000-0000");

  // Size-dependent classes — per-variant configs
  const sizeConfig = {
    default: {
      outerMaxWidth: "max-w-[360px] md:max-w-[500px]",
      stubWidth: "w-[50px]",
      mainPadding: "p-3 md:p-5",
      heroImageMaxH: "max-h-[42%]",
      titleSize: "text-[2.2rem] md:text-[3.5rem]",
      cursiveSize: "text-[2rem] md:text-[2.5rem]",
      resultCursiveSize: "text-[1.8rem] md:text-[3rem]",
      priceSize: "text-[1.6rem] md:text-[2.5rem]",
      
    },
    hero: {
      outerMaxWidth: "max-w-[360px] md:max-w-[720px] lg:max-w-[960px]",
      stubWidth: "w-[50px] md:w-[65px] lg:w-[80px]",
      mainPadding: "p-3 md:p-7 lg:p-10",
      heroImageMaxH: "max-h-[42%] md:max-h-[50%]",
      titleSize: "text-[2.2rem] md:text-[3.5rem] lg:text-[4.5rem]",
      cursiveSize: "text-[2rem] md:text-[2.8rem] lg:text-[3.5rem]",
      resultCursiveSize: "text-[1.8rem] md:text-[3rem] lg:text-[4rem]",
      priceSize: "text-[1.6rem] md:text-[2.5rem] lg:text-[3.5rem]",
      
    },
  }[size];

  const { outerMaxWidth, stubWidth, mainPadding, heroImageMaxH, titleSize, cursiveSize, resultCursiveSize, priceSize } = sizeConfig;

  // Rotate processing messages
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (isCompact || isProcessing) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    setTilt({ rotateX: -y * 10, rotateY: x * 10 });
    setIsInteracting(true);
  }, [flipped, isCompact, isProcessing]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handlePointerMove(e.clientX, e.clientY);
  }, [handlePointerMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) handlePointerMove(touch.clientX, touch.clientY);
  }, [handlePointerMove]);

  const resetTilt = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsInteracting(false);
  }, []);

  const handleCardClick = useCallback(() => {
    if (flippable && !hasInput && !isProcessing) {
      setFlipped((f) => !f);
      setTilt({ rotateX: 0, rotateY: 0 });
    }
  }, [flippable, hasInput, isProcessing]);

  const detailItems = [
    { icon: Home, label: "Type", value: propertyType || null },
    { icon: Sparkles, label: "Condition", value: condition || null },
    { icon: Bed, label: "Bedrooms", value: bedrooms != null ? `${bedrooms}` : null },
    { icon: Bath, label: "Bathrooms", value: bathrooms != null ? `${bathrooms}` : null },
    { icon: Ruler, label: "Built Size", value: builtSize || null },
    { icon: LandPlot, label: "Plot Size", value: plotSize || null },
  ].filter((d) => d.value != null);

  /* ── Compact mode: small address summary card ── */
  if (isCompact) {
    return (
      <div className="w-full max-w-[320px] md:max-w-[680px] mx-auto">
        <div className="flex items-center gap-3 bg-[hsl(36_9%_88%)] rounded-2xl px-4 py-3 shadow-sm">
          <div className={`w-8 h-8 rounded-full ${accentClass} flex items-center justify-center shrink-0`}>
            <MapPin size={14} className="text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{addressValue || address || "Your property"}</p>
            {city && <p className="text-xs text-muted-foreground">{city}</p>}
          </div>
          <span className="text-[0.55rem] text-muted-foreground/60 font-mono tracking-wider shrink-0">{refCode}</span>
        </div>
      </div>
    );
  }

  /* ── Card dimensions shared by both faces ── */
  const shadowClasses = "shadow-[0_8px_30px_rgba(0,0,0,0.12),0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3),0_30px_60px_rgba(0,0,0,0.5)]";
  const cardClasses = cn(
    "flex w-full bg-[hsl(36_9%_88%)] rounded-[24px] md:rounded-[32px]",
    flippable ? "" : shadowClasses,
    hasInput
      ? cn("relative", mapExpanded ? "overflow-hidden min-h-[85vh] md:min-h-[70vh]" : "overflow-visible min-h-[440px] md:min-h-[480px]")
      : "overflow-hidden h-full"
  );

  /* ── FRONT FACE ── */
  const frontFace = (
    <div className={cardClasses}>
      {/* Main Section */}
      <div className={cn("flex-1 flex flex-col relative border-r-2 border-dashed border-foreground/15", mainPadding, (mapExpanded || hasBuyInput) ? "overflow-visible" : "overflow-hidden")}>
        {/* Hero Image */}
        <div className={cn(
          "relative w-full min-h-[120px] rounded-[16px] md:rounded-[20px] overflow-hidden mb-3 md:mb-4 shrink transition-all duration-500",
          mapExpanded ? "max-h-[60px] md:max-h-[25%]" : heroImageMaxH
        )}>
          <img
            src={heroImage}
            alt={propertyType || "Property"}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-[filter] duration-500",
              isProcessing
                ? processingProgress >= 90 ? "grayscale-0" : "grayscale"
                : "grayscale group-hover:grayscale-0"
            )}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />

          {/* Accent Circles */}
          <div className={`absolute w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full ${accentClass} opacity-80`} style={{ top: "14px", right: "24px", zIndex: 10 }} />
          <div className={`absolute w-[55px] h-[55px] md:w-[65px] md:h-[65px] rounded-full ${accentClass} opacity-80`} style={{ bottom: "-16px", left: "-16px", zIndex: 20 }} />
          <div className={`absolute w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-full ${accentClass} opacity-80`} style={{ bottom: "40%", right: "-8px", zIndex: 10 }} />

          {/* Share/Download */}
          {!hasInput && !isProcessing && (
            <div className="absolute top-3 left-3 flex gap-1.5 z-30">
              {onShare && (
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onShare(); }} className="h-7 w-7 bg-primary/60 backdrop-blur-sm text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
                  <Share2 size={12} />
                </Button>
              )}
              {onDownload && (
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onDownload(); }} className="h-7 w-7 bg-primary/60 backdrop-blur-sm text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
                  <Download size={12} />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── PROCESSING MODE ── */}
        {isProcessing ? (
          <div className="flex-1 flex flex-col justify-center gap-3 relative z-[2]">
            <h2
              className={cn("font-heading font-extrabold text-center leading-[0.8] tracking-[-2px] text-foreground animate-pulse", titleSize)}
              style={{ transform: "scaleY(0.9)" }}
            >
              ANALYSING
            </h2>

            {/* Dots Divider */}
            <div className="flex justify-between w-full overflow-hidden my-2">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-foreground shrink-0" />
              ))}
            </div>

            <div className="space-y-2 px-1">
              <Progress value={processingProgress} className="h-2 w-full bg-foreground/10" />
              <p className="text-[0.6rem] md:text-xs text-muted-foreground text-center font-medium animate-fade-in" key={messageIndex}>
                {PROCESSING_MESSAGES[messageIndex]}
              </p>
              <p className="text-[0.5rem] text-center text-primary font-medium mt-1">
                Please don't refresh the page
              </p>
            </div>

            {/* Ref code */}
            <div className="text-right text-[0.45rem] md:text-[0.5rem] leading-[1.2] text-foreground/60 mt-2">
              <p>VALUATION REPORT · REF {refCode}</p>
            </div>

          </div>
        ) : hasInput ? (
          /* ── Hero INPUT mode ── */
          <div className="flex-1 flex flex-col justify-start gap-3 pb-8 md:pb-12 relative z-[2]" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <span className={cn("font-ticket-cursive leading-[0.7] text-foreground block -ml-1", cursiveSize)}>
              {isBuyMode ? "Your Analysis" : "Your Valuation"}
            </span>

            {hasBuyInput ? (
              /* ── BUY MODE: URL paste input ── */
              <div className="mt-2">
                <div className="relative">
                  <Link2 size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    value={listingUrl || ""}
                    onChange={(e) => onListingUrlChange?.(e.target.value)}
                    placeholder="https://www.idealista.com/inmueble/12345678/"
                    className="w-full rounded-xl border border-border bg-card pl-8 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[hsl(var(--buy))]/40 transition-shadow"
                    style={{ fontSize: "16px" }}
                    autoComplete="off"
                  />
                  {listingUrl && (
                    <button
                      type="button"
                      onClick={() => onListingUrlChange?.("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {/* Platform badge */}
                {detectedPlatform && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--buy-light))] text-[hsl(var(--buy-foreground))] text-xs font-medium">
                      {detectedPlatform} detected
                    </span>
                  </div>
                )}
                {/* Toggle */}
                {onValuationTypeChange && (
                  <div className="mt-3 flex justify-center" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                    <SkyToggle
                      checked={valuationType === "buy"}
                      onChange={(checked) => onValuationTypeChange(checked ? "buy" : "sell")}
                      leftLabel="Sell Property"
                      rightLabel="Buy Analysis"
                    />
                  </div>
                )}
                {/* Analyze button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleContinue?.(); }}
                  disabled={!listingUrl?.trim()}
                  className="flex items-center justify-end gap-1.5 text-sm font-medium text-[hsl(var(--buy-foreground))] mt-2 self-end transition-all disabled:opacity-0 disabled:pointer-events-none hover:gap-2.5 w-full justify-end"
                >
                  Analyze Property
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : hasGoogleInput ? (
              <div className="mt-2">
                <GoogleAddressInput
                  addressData={addressData!}
                  onChange={onAddressFieldChange! as any}
                  onLocationConfirmed={onLocationConfirmed || handleContinue}
                  onPhaseChange={onMapPhaseChange}
                />
              {!mapExpanded && onValuationTypeChange && (
                <div className="mt-4 flex justify-center" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                  <SkyToggle
                    checked={String(valuationType) === "buy"}
                    onChange={(checked) => onValuationTypeChange(checked ? "buy" : "sell")}
                    leftLabel="Sell Property"
                    rightLabel="Buy Analysis"
                  />
                </div>
              )}
              </div>
            ) : (
              <>
                <div className="relative mt-2">
                  <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={addressValue || ""}
                    onChange={(e) => onAddressChange?.(e.target.value)}
                    placeholder="Your address..."
                    className="w-full rounded-xl border border-border bg-card pl-8 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                  />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleContinue?.(); }}
                  disabled={!addressValue?.trim()}
                  className="flex items-center justify-end gap-1.5 text-sm font-medium text-primary mt-1 self-end transition-all disabled:opacity-0 disabled:pointer-events-none hover:gap-2.5"
                >
                  Continue
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* ── Result/display mode: price + data ── */}
            <div className="flex justify-between items-center mb-1.5 relative z-[2]">
              <span className={cn("font-sans font-light tracking-[-1.5px] leading-none text-foreground", priceSize)}>
                {estimatedValue}
              </span>
              <span className="text-[0.6rem] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {city || "—"}
              </span>
            </div>

            <h2 className={cn("font-heading font-extrabold text-center leading-[0.8] my-2 tracking-[-2px] text-foreground", titleSize)} style={{ transform: "scaleY(0.9)" }}>
              {headline}
            </h2>

            {/* Dots Divider */}
            <div className="flex justify-between w-full overflow-hidden my-3">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-foreground shrink-0" />
              ))}
            </div>

            {/* Text Block */}
            <div className="flex-1 flex flex-col min-h-0">
              <span className={cn("font-ticket-cursive leading-[0.6] mb-2 md:mb-3 -ml-1 text-foreground block", resultCursiveSize)}>
                {subtitle}
              </span>
              <p className="text-[0.55rem] md:text-[0.6rem] uppercase text-justify leading-[1.4] font-medium text-foreground/90 mb-2 line-clamp-4">
                {summaryText}
              </p>

              <div className="text-right text-[0.45rem] md:text-[0.5rem] leading-[1.2] text-foreground/60 mb-4">
                <p>VALUATION REPORT · REF {refCode} · VALID FOR ONE</p>
              </div>

            </div>
          </>
        )}

      </div>

      {/* Stub */}
      <div className={cn("hidden sm:flex flex-col items-center justify-between py-4 bg-[hsl(36_9%_88%)]", stubWidth)}>
        <ArrowDown size={16} className="text-foreground/60" />
        <span className="font-heading text-xs font-bold uppercase tracking-[2px] text-foreground/80" style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
          ValoraCasa
        </span>
        <div className="flex flex-col items-center gap-3">
          <ArrowDown size={16} className="text-foreground/60" />
          <span className="text-base text-foreground/60">⊕</span>
        </div>
      </div>
    </div>
  );

  /* ── BACK FACE ── */
  const backFace = flippable ? (
    <div className={cardClasses}>
      <div className={cn("flex-1 flex flex-col overflow-y-auto", mainPadding)}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={14} className="text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{address}</span>
        </div>
        <span className="text-[0.6rem] text-muted-foreground/60 uppercase tracking-wider">{city}</span>

        <div className="my-4 h-px bg-foreground/10" />

        <h3 className="font-heading text-lg font-bold text-foreground mb-1">Property Details</h3>
        <p className="text-[0.6rem] text-muted-foreground mb-5 uppercase tracking-wider">Tap to flip back</p>

        {/* Detail Grid */}
        <div className="grid grid-cols-2 gap-3 flex-1 content-start">
          {detailItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 bg-foreground/[0.04] rounded-xl px-3 py-2.5">
              <item.icon size={16} className="text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[0.55rem] text-muted-foreground/60 uppercase tracking-wider leading-none">{item.label}</p>
                <p className="text-sm font-semibold text-foreground truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Stub */}
      <div className={cn("hidden sm:flex flex-col items-center justify-between py-4 bg-[hsl(36_9%_88%)]", stubWidth)}>
        <ArrowDown size={16} className="text-foreground/60" />
        <span className="font-heading text-xs font-bold uppercase tracking-[2px] text-foreground/80" style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
          ValoraCasa
        </span>
        <span className="text-base text-foreground/60">⊕</span>
      </div>
    </div>
  ) : null;

  /* For both input and result/showcase modes, use 3D tilt */
  if (!hasInput) {
    return (
      <div className="flex items-center justify-center px-4 py-2 md:py-4" style={{ perspective: "800px" }}>
        <div
          ref={cardRef}
          onClick={handleCardClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          onTouchMove={handleTouchMove}
          onTouchEnd={resetTilt}
          className={cn(
            "relative w-full group transition-all duration-700",
            flippable ? cn("cursor-pointer", shadowClasses) : "",
            outerMaxWidth,
            flippable
              ? "h-[480px] md:h-[560px] lg:h-[620px]"
              : size === "default"
                ? "min-h-[480px] max-h-[680px] md:min-h-[540px] md:max-h-[780px]"
                : "min-h-[480px] max-h-[680px] md:min-h-[560px] md:max-h-[820px] lg:min-h-[620px] lg:max-h-[900px]",
            "rounded-[24px] md:rounded-[32px]"
          )}
          style={{
            display: "grid",
            transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY + (flipped ? 180 : 0)}deg)`,
            transition: isInteracting ? "transform 0.08s linear" : "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
            transformStyle: "preserve-3d",
            willChange: isInteracting ? "transform" : "auto",
          }}
        >
          <div style={{ gridArea: "1/1", backfaceVisibility: "hidden" }}>{frontFace}</div>
          {backFace && <div style={{ gridArea: "1/1", backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>{backFace}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4 py-2 md:py-4" style={{ perspective: "800px" }}>
      <div
        ref={cardRef}
        onClick={handleCardClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        onTouchMove={handleTouchMove}
        onTouchEnd={resetTilt}
        className={cn(
          "relative w-full group cursor-grab active:cursor-grabbing transition-all duration-500",
          outerMaxWidth,
          mapExpanded ? "min-h-[85vh] md:min-h-[70vh]" : "min-h-[440px] md:min-h-[480px]"
        )}
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          transition: isInteracting ? "transform 0.08s linear" : "transform 0.6s ease-out",
          transformStyle: "preserve-3d",
          willChange: isInteracting ? "transform" : "auto",
        }}
      >
        {frontFace}
      </div>
    </div>
  );
};

export default ValuationTicketCard;

import { useState, useEffect, useRef, useCallback } from "react";
import { TypewriterText } from "@/components/shared/TypewriterText";
import { useSEO } from "@/hooks/use-seo";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Star, RotateCcw, MapPin, SlidersHorizontal, Sparkles, BedDouble, Bath, Maximize, TrendingUp, Users, Search, BarChart3, Link2, ShieldCheck, Target, ArrowRight, Home, Zap, PieChart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import ValuationTicketCard from "@/components/ValuationTicketCard";
import PropertyShowcaseCarousel from "@/components/PropertyShowcaseCarousel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─── DATA ─── */

const SERVICES = [
  { icon: Home, title: "Free Valuation", desc: "Get an instant property valuation based on real comparable data." },
  { icon: BarChart3, title: "Comparable Sales", desc: "See recently sold and listed properties in your area." },
  { icon: Sparkles, title: "AI Analysis", desc: "Our AI analyzes your property's strengths and considerations." },
  { icon: Users, title: "Agent Matching", desc: "Connect with verified local agents matched to your area." },
  { icon: PieChart, title: "Rental Estimate", desc: "Find out how much rent your property could earn." },
  { icon: TrendingUp, title: "Market Trends", desc: "Stay ahead with price trends and market dynamics." },
];

const TESTIMONIALS_SELL = [
  { quote: "We sold our villa in Marbella for 12% above the initial asking price thanks to the accurate valuation.", name: "James & Sarah T.", location: "Marbella" },
  { quote: "Fast, free, and surprisingly accurate. Best property tool I've found for Spain.", name: "Anna K.", location: "Fuengirola" },
  { quote: "Used it to compare agents' prices. The valuation was within 3% of the final sale price.", name: "Robert D.", location: "Benalmádena" },
];

const TESTIMONIALS_BUY = [
  { quote: "I was about to overpay by €45,000. ValoraCasa showed me the property was 12% above market value.", name: "Stefan R.", location: "Marbella" },
  { quote: "The price analysis confirmed the asking price was fair. Gave me confidence to make an offer immediately.", name: "Emma & David K.", location: "Estepona" },
  { quote: "Used it on every property we viewed. Saved us thousands in negotiations.", name: "Linda M.", location: "Fuengirola" },
];

const TESTIMONIALS_RENT = [
  { quote: "Found out our apartment could earn 40% more as a holiday rental. The seasonal breakdown was eye-opening.", name: "Maria & Carlos S.", location: "Marbella" },
  { quote: "The rental estimate was spot-on. We listed at the recommended price and had tenants within a week.", name: "Henrik L.", location: "Estepona" },
  { quote: "Great tool for comparing long-term vs short-term rental income. Helped us decide our strategy.", name: "Sophie W.", location: "Fuengirola" },
];

/* ─── STATS BAR ─── */
const StatsBar = () => (
  <div className="bg-brand py-8">
    <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
      {[
        { label: "Valuations", value: "2,400+" },
        { label: "Verified Agents", value: "150+" },
        { label: "Assessed Value", value: "€2.1B" },
        { label: "Coverage", value: "Costa del Sol" },
      ].map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-white/50 mb-1">{stat.label}</p>
          <p className="text-2xl md:text-[2rem] font-bold text-white tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ─── MAIN PAGE ─── */

const Index = () => {
  useSEO({ title: "ValoraCasa — Free Property Valuations in Costa del Sol", description: "Get a free, instant property valuation for your home in Spain. Based on real market data from Costa del Sol.", path: "/" });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");
  const [valuationType, setValuationType] = useState<"sell" | "rent" | "buy">(
    modeParam === "buy" ? "buy" : modeParam === "rent" ? "rent" : "sell"
  );

  useEffect(() => {
    if (modeParam === "buy") setValuationType("buy");
    else if (modeParam === "rent") setValuationType("rent");
    else if (modeParam === "sell") setValuationType("sell");
  }, [modeParam]);
  const [listingUrl, setListingUrl] = useState("");
  const [addressData, setAddressData] = useState({
    streetAddress: "",
    urbanization: "",
    city: "",
    province: "",
    country: "Spain",
    complex: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  const handleAddressChange = useCallback((field: string, value: string | number | undefined) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
  }, []);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapExpandedBottom, setMapExpandedBottom] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const isSell = valuationType === "sell";
  const isBuy = valuationType === "buy";
  const isRent = valuationType === "rent";
  const testimonials = isRent ? TESTIMONIALS_RENT : isBuy ? TESTIMONIALS_BUY : TESTIMONIALS_SELL;

  useEffect(() => {
    setTestimonialIdx(0);
  }, [valuationType]);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);


  const handleGetValuation = useCallback(() => {
    if (valuationType === "buy") {
      navigate("/buy", { state: { listingUrl } });
      return;
    }
    if (valuationType === "rent") {
      navigate("/rent/valuation", {
        state: {
          address: {
            streetAddress: addressData.streetAddress,
            city: addressData.city,
            province: addressData.province,
            country: addressData.country,
            urbanization: addressData.urbanization,
          },
        },
      });
      return;
    }
    navigate("/sell/valuation", {
      state: {
        addressData: {
          ...addressData,
        },
      },
    });
  }, [addressData, navigate, valuationType, listingUrl]);

  // Showcase card data based on mode
  const showcaseData = isRent
    ? {
        estimatedValue: "€1,800/mo",
        secondaryValue: "€14/m²",
        headline: "ESTIMATED",
        subtitle: "Your Rental Estimate",
        summaryText: "Your property's rental potential has been analysed using comparable rental data, seasonal demand, and location scoring.",
      }
    : isSell
    ? {
        estimatedValue: "€1,250,000",
        secondaryValue: "€4,200/m²",
        headline: "VALUED",
        subtitle: "Your Valuation",
        summaryText: "Your property has been analysed using comparable market data, location scoring, and current demand indicators.",
      }
    : {
        estimatedValue: "€395,000",
        secondaryValue: "FAIR PRICE",
        headline: "ANALYSED",
        subtitle: "Your Analysis",
        summaryText: "This property has been analysed against comparable listings in the area. The asking price aligns well with current market data.",
      };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <div
        ref={heroRef}
        className="min-h-[75vh] flex flex-col items-center justify-center px-5 md:px-8 animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, hsl(243 96% 28%) 0%, hsl(310 52% 50%) 100%)'
        }}
      >
        <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center text-center gap-4 mb-2 pt-6 md:pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={valuationType}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <span className="text-[0.65rem] tracking-[0.15em] uppercase text-white/50 font-semibold mb-3">
                {isRent ? "Free Rental Estimate" : isSell ? "Free Property Valuation" : "Free Price Analysis"}
              </span>
              <h1 className="text-4xl md:text-[3.5rem] lg:text-[3.75rem] font-normal text-white leading-[1.1] tracking-tight max-w-3xl min-h-[2.5em]">
                {isRent ? (
                  <TypewriterText
                    phrases={[
                      "How much rent can you earn?",
                      "What's your property's rental value?",
                      "Free rental estimate in 2 minutes",
                    ]}
                  />
                ) : isSell ? (
                  <TypewriterText
                    phrases={[
                      "What is your property worth?",
                      "Find the value of your home",
                      "Free valuation in 2 minutes",
                    ]}
                  />
                ) : (
                  <>Is this property worth the price?</>
                )}
              </h1>
              <p className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mt-3">
                {isRent
                  ? "Get a rental income estimate based on comparable data. Completely free."
                  : isSell
                  ? "Get a detailed market report in under 2 minutes. Completely free."
                  : "Paste a listing link and we'll compare it to the market."
                }
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        <ValuationTicketCard
          address=""
          estimatedValue=""
          leadId=""
          accentType={valuationType}
          size="hero"
          addressData={addressData}
          onAddressFieldChange={handleAddressChange}
          onLocationConfirmed={handleGetValuation}
          mapExpanded={mapExpanded}
          onMapPhaseChange={(phase) => setMapExpanded(phase === "verify")}
          valuationType={valuationType}
          onValuationTypeChange={isRent ? undefined : (t) => setValuationType(t as "sell" | "rent" | "buy")}
          listingUrl={listingUrl}
          onListingUrlChange={setListingUrl}
        />
      </div>

      {/* ═══════════ STATS BAR ═══════════ */}
      <StatsBar />

      <div className="max-w-[1400px] mx-auto w-full flex flex-col">

        {/* ═══════════ FLOATING AGENCIES ═══════════ */}
        <section className="w-full py-8 md:py-20 overflow-hidden px-5 md:px-8">
          <SectionLabel className="text-center mb-8 md:mb-14">
            Used every day by real estate professionals
          </SectionLabel>
          <div className="relative max-w-4xl mx-auto h-[120px] md:h-[140px]">
            {AGENCIES.map((a, i) => (
              <motion.span
                key={a.name}
                className={cn(
                  "absolute font-sans text-muted-foreground cursor-default select-none",
                  a.size
                )}
                style={{ left: a.x, top: `${30 + (i % 3) * 28}%` }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: a.opacity }}
                viewport={{ once: true }}
                animate={{ y: [a.y, a.y - 6, a.y] }}
                transition={{
                  y: { duration: a.dur, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.8, delay: i * 0.1 },
                }}
                whileHover={{ opacity: 0.6, scale: 1.05 }}
              >
                {a.name}
              </motion.span>
            ))}
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS — Vertical Timeline ═══════════ */}
        <section className="w-full py-8 md:py-20 px-5 md:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 md:mb-16 text-center"
            >
              <SectionLabel>How It Works</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
                {isRent ? "Four Steps to Your Rental Estimate" : isSell ? "Four Steps to Your Valuation" : "Four Steps to Your Price Analysis"}
              </h2>
              <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
                {isRent
                  ? "From address to rental estimate — and the best agents in your area"
                  : isSell
                  ? "From address to valuation — and the best agents in your area"
                  : "From listing link to price analysis — and the best agents nearby"}
              </p>
            </motion.div>

            {/* Vertical Timeline */}
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-primary/15" />

              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative flex gap-5 md:gap-8 mb-10 md:mb-14"
              >
                <div className="relative z-10 flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                    <span className="text-lg md:text-xl font-bold text-primary">01</span>
                  </div>
                </div>
                <div className="pt-1 md:pt-2 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      {isBuy ? <Link2 className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />}
                    </div>
                    <h3 className="text-base md:text-lg uppercase tracking-[0.08em] font-bold text-foreground">
                      {isBuy ? "Paste a listing link" : "Enter your address"}
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                    {isBuy
                      ? "Copy any property URL from Idealista, Fotocasa, Habitaclia or similar portals. We extract all the details automatically — price, size, features, photos and location."
                      : "Start typing and select from Google-powered suggestions. We'll pinpoint your property on the map for accurate comparisons against nearby listings."}
                  </p>
                  <div className="border border-[rgba(0,0,0,0.06)] rounded-2xl p-4 bg-card max-w-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        {isBuy ? <Link2 className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 h-3 bg-muted rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="h-2.5 bg-muted rounded-full w-2/3" />
                        <div className="h-2.5 bg-muted rounded-full w-1/3" />
                      </div>
                      <div className="h-2.5 bg-primary/20 rounded-full w-1/2" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative flex gap-5 md:gap-8 mb-10 md:mb-14"
              >
                <div className="relative z-10 flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                    <span className="text-lg md:text-xl font-bold text-primary">02</span>
                  </div>
                </div>
                <div className="pt-1 md:pt-2 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      {isBuy ? <Search className="h-4 w-4 text-primary" /> : <SlidersHorizontal className="h-4 w-4 text-primary" />}
                    </div>
                    <h3 className="text-base md:text-lg uppercase tracking-[0.08em] font-bold text-foreground">
                      {isBuy ? "We analyze the market" : "Tell us about your property"}
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                    {isBuy
                      ? "Our AI compares against hundreds of active and recently sold listings in the area. We factor in size, condition, features and location to determine fair market value."
                      : "Bedrooms, bathrooms, pool, terrace, parking, condition, year built — every detail that affects value. It takes less than a minute to complete."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(isBuy ? [
                      { icon: Search, label: "Comparables" },
                      { icon: TrendingUp, label: "Market Data" },
                      { icon: Sparkles, label: "AI Analysis" },
                    ] : [
                      { icon: BedDouble, label: "4 Beds" },
                      { icon: Bath, label: "3 Baths" },
                      { icon: Maximize, label: "350 m²" },
                      { icon: Sparkles, label: "Pool" },
                      { icon: SlidersHorizontal, label: "Terrace" },
                      { icon: Home, label: "Garage" },
                    ]).map((pill) => (
                      <div
                        key={pill.label}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-[rgba(0,0,0,0.06)] text-sm text-foreground"
                      >
                        <pill.icon className="h-3.5 w-3.5 text-primary" />
                        {pill.label}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative flex gap-5 md:gap-8 mb-10 md:mb-14"
              >
                <div className="relative z-10 flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                    <span className="text-lg md:text-xl font-bold text-primary">03</span>
                  </div>
                </div>
                <div className="pt-1 md:pt-2 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-base md:text-lg uppercase tracking-[0.08em] font-bold text-foreground">
                      {isRent ? "Get your rental estimate" : isSell ? "See your valuation" : "Get your price score"}
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                    {isRent
                      ? "A detailed rental report with seasonal breakdown, comparable properties, and income projections. Download as PDF or share it with anyone instantly."
                      : isSell
                      ? "Instant PDF report with price range, confidence score, comparable properties, and AI market summary. Share it or download — it's yours to keep."
                      : "See if the asking price is fair or overpriced. Get negotiation insights, comparable data, and a detailed AI verdict to make an informed offer."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: FileText, label: "PDF Report" },
                      { icon: TrendingUp, label: "Price Range" },
                      { icon: Sparkles, label: "AI Summary" },
                    ].map((pill) => (
                      <div
                        key={pill.label}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-[rgba(0,0,0,0.06)] text-sm text-foreground"
                      >
                        <pill.icon className="h-3.5 w-3.5 text-primary" />
                        {pill.label}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Step 4 — Agent Matching */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative flex gap-5 md:gap-8"
              >
                <div className="relative z-10 flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                    <span className="text-lg md:text-xl font-bold text-primary">04</span>
                  </div>
                </div>
                <div className="pt-1 md:pt-2 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-base md:text-lg uppercase tracking-[0.08em] font-bold text-foreground">
                      Get the best agents in your area
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                    We match you with top-rated, verified local agents so you get a complete picture — from valuation to sale. Compare agents, read reviews, and choose with confidence.
                  </p>
                  {/* Visual: Agent avatars */}
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[
                        "bg-primary/20",
                        "bg-accent/60",
                        "bg-primary/30",
                      ].map((bg, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-primary",
                            bg
                          )}
                        >
                          {["EV", "SP", "DM"][i]}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <Star className="h-3.5 w-3.5 fill-primary/40 text-primary/40" />
                      </div>
                      <span className="text-xs text-muted-foreground">Matched in your area</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Flippable showcase card */}
            <div className="mt-12 md:mt-20 flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={valuationType}
                  initial={{ opacity: 0, rotateY: 20 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <ValuationTicketCard
                    address="Calle Sierra Blanca 12"
                    city="Marbella"
                    estimatedValue={showcaseData.estimatedValue}
                    secondaryValue={showcaseData.secondaryValue}
                    propertyType="Villa"
                    leadId="a1b2c3d4e5f6"
                    headline={showcaseData.headline}
                    subtitle={showcaseData.subtitle}
                    summaryText={showcaseData.summaryText}
                    accentType={valuationType}
                    size="hero"
                    flippable
                    bedrooms={4}
                    bathrooms={3}
                    builtSize="350 m²"
                    plotSize="1,200 m²"
                    condition="Excellent"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center gap-2 text-muted-foreground/40 text-sm -mt-2">
                <RotateCcw size={14} />
                <span>Tap the card to see property details</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ EVERYTHING IN YOUR REPORT — Bento Grid ═══════════ */}
        <section className="w-full py-8 md:py-20 bg-background-alt">
          <div className="max-w-5xl mx-auto px-5 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 md:mb-16"
            >
              <SectionLabel>Included Free</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
                Everything In Your Report
              </h2>
            </motion.div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Card 1 - Price Estimate (wide) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="md:col-span-7 border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 bg-card hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all"
              >
                <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-foreground mb-2">Price Estimate</h3>
                <p className="text-sm text-muted-foreground mb-4">A data-driven price range based on comparable properties in your area.</p>
                {/* Visual: price bar */}
                <div className="flex items-end gap-1 h-12">
                  {[40, 55, 70, 85, 100, 90, 75, 60, 45].map((h, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-full rounded-t-sm transition-all",
                        i === 4 ? "bg-primary" : "bg-primary/20"
                      )}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Card 2 - Price per m² (narrow) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="md:col-span-5 border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 bg-card hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all"
              >
                <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-foreground mb-2">Price Per M²</h3>
                <p className="text-sm text-muted-foreground mb-4">Compare your property's €/m² against the local average.</p>
                {/* Visual: sqm color blocks */}
                <div className="grid grid-cols-4 gap-1.5">
                  {["bg-primary/10", "bg-primary/20", "bg-primary/40", "bg-primary", "bg-primary/30", "bg-primary/15", "bg-primary/50", "bg-primary/25"].map((c, i) => (
                    <div key={i} className={cn("h-6 rounded-md", c)} />
                  ))}
                </div>
              </motion.div>

              {/* Card 3 - Comparable Properties (full width) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="md:col-span-12 border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 bg-card hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all"
              >
                <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-foreground mb-2">Comparable Properties</h3>
                <p className="text-sm text-muted-foreground mb-4">See recently listed and sold properties similar to yours, with distance and price data.</p>
                {/* Visual: mini property thumbnails */}
                <div className="flex gap-3 overflow-hidden">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="w-20 h-14 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                      <Home className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  ))}
                  <div className="w-20 h-14 rounded-lg bg-primary/10 shrink-0 flex items-center justify-center text-xs font-medium text-primary">
                    +12
                  </div>
                </div>
              </motion.div>

              {/* Card 4 - Confidence Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="md:col-span-4 border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 bg-card hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all"
              >
                <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-foreground mb-2">Confidence Score</h3>
                <p className="text-sm text-muted-foreground mb-4">How reliable is the estimate.</p>
                {/* Visual: dot rating */}
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div key={d} className={cn("w-4 h-4 rounded-full", d <= 4 ? "bg-primary" : "bg-primary/20")} />
                  ))}
                </div>
              </motion.div>

              {/* Card 5 - Market Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="md:col-span-4 border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 bg-card hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all"
              >
                <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-foreground mb-2">Market Trends</h3>
                <p className="text-sm text-muted-foreground mb-4">Price direction in your zone.</p>
                {/* Visual: trend line */}
                <svg viewBox="0 0 120 40" className="w-full h-10">
                  <polyline
                    points="0,35 20,30 40,28 60,22 80,18 100,12 120,8"
                    fill="none"
                    stroke="hsl(328 100% 39%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="0,35 20,30 40,28 60,22 80,18 100,12 120,8"
                    fill="url(#trendGrad)"
                    stroke="none"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(328 100% 39%)" />
                      <stop offset="100%" stopColor="hsl(328 100% 39%)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* Card 6 - Agent Matching */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="md:col-span-4 border border-[rgba(0,0,0,0.06)] rounded-2xl p-6 bg-card hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all"
              >
                <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-foreground mb-2">Agent Matching</h3>
                <p className="text-sm text-muted-foreground mb-4">Local experts matched to your area.</p>
                {/* Visual: agent avatars */}
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((a) => (
                    <div key={a} className="w-9 h-9 rounded-full bg-primary/15 border-2 border-card flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-primary/60" />
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full bg-primary border-2 border-card flex items-center justify-center text-[10px] font-bold text-white">
                    +8
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════ RECENT VALUATIONS ═══════════ */}
        <section className="w-full py-8 md:py-20">
          <div className="max-w-5xl mx-auto px-5 md:px-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--success))] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--success))]" />
                </span>
                <span className="text-sm text-[hsl(var(--success))] font-medium">Live</span>
              </div>
              <SectionLabel className="flex flex-col items-center">Market Data</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
                {isRent ? "Recent Rental Estimates" : isSell ? "Recent Valuations" : "Recent Price Analyses"}
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                {isRent ? "124 rental estimates completed this week" : isSell ? "238 property valuations completed this week" : "185 price analyses completed this week"}
              </p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden px-5 md:px-8">
            <PropertyShowcaseCarousel accentType={valuationType === "buy" ? "sell" : valuationType} />
          </div>
        </section>

        {/* ═══════════ TESTIMONIALS ═══════════ */}
        <section className="w-full py-8 md:py-20 bg-background-alt px-5 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <SectionLabel className="flex flex-col items-center">Testimonials</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
              What Owners Say
            </h2>
            <div className="relative min-h-[200px] flex flex-col items-center justify-center mt-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${valuationType}-${testimonialIdx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed italic">
                    "{testimonials[testimonialIdx]?.quote}"
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-4">
                    — {testimonials[testimonialIdx]?.name}, {testimonials[testimonialIdx]?.location}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === testimonialIdx ? "bg-primary w-6" : "bg-border w-2 hover:bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ FINAL CTA ═══════════ */}
        <section
          className="w-full py-12 md:py-20 px-5 md:px-8 pb-32"
          style={{ background: 'linear-gradient(135deg, hsl(243 96% 28%) 0%, hsl(310 52% 50%) 100%)' }}
        >
          <div className="flex flex-col items-center text-center gap-4 mb-2">
            <h2 className="text-3xl md:text-4xl font-normal text-white leading-[1.1]">
              {isRent ? (
                <>Ready to find out your property's rental potential?</>
              ) : isSell ? (
                <>Ready to discover your property's true value?</>
              ) : (
                <>Ready to find out if the price is really fair?</>
              )}
            </h2>
            <p className="text-lg md:text-xl text-white/70">
              Free, confidential, and takes less than 2 minutes
            </p>
          </div>
          <ValuationTicketCard
            address=""
            estimatedValue=""
            leadId=""
            accentType={valuationType}
            size="hero"
            addressData={addressData}
            onAddressFieldChange={handleAddressChange}
            onLocationConfirmed={handleGetValuation}
            mapExpanded={mapExpandedBottom}
            onMapPhaseChange={(phase) => setMapExpandedBottom(phase === "verify")}
            valuationType={valuationType}
            onValuationTypeChange={isRent ? undefined : (t) => setValuationType(t as "sell" | "rent" | "buy")}
            listingUrl={listingUrl}
            onListingUrlChange={setListingUrl}
          />
        </section>

        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative border border-[rgba(0,0,0,0.06)] rounded-2xl px-6 py-10 md:px-12 md:py-14 bg-card overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <p className="text-xs uppercase tracking-[0.15em] font-semibold text-primary/70 mb-4">
                For Professionals
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Are you a real estate agent?
              </h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                Join ValoraCasa and get qualified leads, a professional profile page, and AI-powered tools to grow your business.
              </p>
              <Link to="/pro">
                <Button className="px-10 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all">
                  List Your Agency
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
};

export default Index;

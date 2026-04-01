import { useState, useEffect, useRef, useCallback } from "react";
import { TypewriterText } from "@/components/shared/TypewriterText";
import { useSEO } from "@/hooks/use-seo";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Star, RotateCcw, MapPin, SlidersHorizontal, Sparkles, BedDouble, Bath, Maximize, TrendingUp, Users, Search, BarChart3, Link2, ShieldCheck, Target, ArrowRight, Home, Zap, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/ui/SectionLabel";
import ValuationTicketCard from "@/components/ValuationTicketCard";
import PropertyShowcaseCarousel from "@/components/PropertyShowcaseCarousel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─── DATA ─── */

const AGENCIES = [
  { name: "Engel & Völkers", x: "5%", y: 0, opacity: 0.35, size: "text-base", dur: 4.2 },
  { name: "Sotheby's", x: "55%", y: -8, opacity: 0.25, size: "text-lg", dur: 3.6 },
  { name: "Panorama", x: "25%", y: 6, opacity: 0.3, size: "text-sm", dur: 5.0 },
  { name: "DM Properties", x: "70%", y: -4, opacity: 0.2, size: "text-base", dur: 4.8 },
  { name: "Terra Meridiana", x: "10%", y: 10, opacity: 0.28, size: "text-sm", dur: 3.8 },
  { name: "Drumelia", x: "48%", y: -2, opacity: 0.22, size: "text-lg", dur: 4.5 },
  { name: "La Sala Estates", x: "75%", y: 4, opacity: 0.32, size: "text-sm", dur: 3.4 },
];

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
              <h1 className="text-4xl md:text-[3.5rem] lg:text-[3.75rem] font-normal text-white leading-[1.1] tracking-tight max-w-3xl">
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

        {/* ═══════════ HOW IT WORKS — 4 Steps Grid ═══════════ */}
        <section className="w-full py-8 md:py-20 px-5 md:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16"
            >
              <SectionLabel className="flex flex-col items-center">How It Works</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
                Four Simple Steps
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                {isRent
                  ? "From address to rental estimate in under two minutes"
                  : isSell
                  ? "From address to valuation in under two minutes"
                  : "From listing link to price analysis in seconds"}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  num: "01",
                  icon: isBuy ? Link2 : MapPin,
                  title: isBuy ? "Paste a listing link" : "Enter your address",
                  desc: isBuy ? "Copy any property URL from Idealista, Fotocasa or similar." : "Start typing and select your property from the suggestions.",
                },
                {
                  num: "02",
                  icon: isBuy ? Search : SlidersHorizontal,
                  title: isBuy ? "We analyze the market" : "Tell us about your property",
                  desc: isBuy ? "We compare against similar listings in the area." : "Add bedrooms, bathrooms, size and key features.",
                },
                {
                  num: "03",
                  icon: isBuy ? ShieldCheck : Sparkles,
                  title: isRent ? "Get your rental estimate" : isSell ? "Get your valuation" : "Get your price score",
                  desc: isRent ? "A detailed rental estimate with seasonal breakdown." : isSell ? "A detailed valuation card with all the data." : "See if the asking price is fair or overpriced.",
                },
                {
                  num: "04",
                  icon: Users,
                  title: "Connect with top agents",
                  desc: "Get matched with verified local agents ready to help.",
                },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <span className="text-[3rem] font-bold text-primary/30 leading-none block mb-3">{step.num}</span>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <step.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Flippable showcase card */}
            <div className="mt-10 md:mt-16 flex flex-col items-center">
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

        {/* ═══════════ SERVICE GRID ═══════════ */}
        <section className="w-full py-8 md:py-20 bg-background-alt">
          <div className="max-w-5xl mx-auto px-5 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <SectionLabel className="flex flex-col items-center">What You Get</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 max-w-2xl mx-auto">
                Everything In Your Report
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                All the data you need to make informed decisions
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SERVICES.map((svc, i) => (
                <motion.div
                  key={svc.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-card rounded-xl border border-[rgba(0,0,0,0.06)] p-6 transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <svc.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{svc.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{svc.desc}</p>
                </motion.div>
              ))}
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

        {/* ═══════════ EXPLORE AREAS ═══════════ */}
        <section className="py-8 sm:py-12">
          <div className="max-w-[1400px] mx-auto px-5 md:px-8">
            <SectionLabel>Popular Areas</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Explore Costa del Sol</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {[
                { name: "Marbella", slug: "marbella", img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop" },
                { name: "Nueva Andalucía", slug: "nueva-andalucia", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop" },
                { name: "Puerto Banús", slug: "puerto-banus", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop" },
                { name: "Golden Mile", slug: "golden-mile", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&h=200&fit=crop" },
                { name: "Benahavís", slug: "benahavis", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=200&fit=crop" },
                { name: "Estepona", slug: "estepona", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&h=200&fit=crop" },
                { name: "Mijas", slug: "mijas", img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=200&h=200&fit=crop" },
                { name: "Fuengirola", slug: "fuengirola", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop" },
              ].map((area) => (
                <Link key={area.slug} to={`/sone/${area.slug}`} className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors">
                    <img src={area.img} alt={area.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <span className="text-sm font-medium text-center">{area.name}</span>
                </Link>
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

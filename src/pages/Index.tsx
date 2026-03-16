import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Star, ArrowRight, MapPin, Play, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── DATA ─── */

const FEATURED = {
  image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200",
  label: "FEATURED",
  type: "Penthouse",
  title: "The Glass House",
  features: ["Panoramic shoreline views", "Private rooftop infinity pool", "Integrated smart-home system"],
};

const BROWSE_PROPERTIES = [
  { id: "1", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800", title: "Midtown Loft", desc: "Modern industrial design in the heart of the arts district.", badges: ["2 Bed", "Urban"] },
  { id: "2", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800", title: "Azure Waters Villa", desc: "Stunning coastal retreat with private dock access.", badges: ["4 Bed", "Coastal"] },
  { id: "3", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800", title: "Sierra Blanca Estate", desc: "Exclusive gated community with panoramic mountain views.", badges: ["5 Bed", "Luxury"] },
];

const STATS = [
  { label: "Price", value: "$2.4M" },
  { label: "Beds", value: "4 BR" },
  { label: "Sqft", value: "3,200" },
];

const TESTIMONIALS = [
  { quote: "We sold our villa in Marbella for 12% above the initial asking price thanks to the accurate valuation.", name: "James & Sarah T.", location: "Marbella" },
  { quote: "The rental estimate was spot-on. We now earn €3,200/month from our apartment in Estepona.", name: "Carlos M.", location: "Estepona" },
  { quote: "Fast, free, and surprisingly accurate. Best property tool I've found for Spain.", name: "Anna K.", location: "Fuengirola" },
  { quote: "Used it to compare agents' prices. The valuation was within 3% of the final sale price.", name: "Robert D.", location: "Benalmádena" },
];

/* ─── MAIN PAGE ─── */

const Index = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
    <div className="min-h-screen w-full flex flex-col bg-background">

      {/* ═══════════ HERO — Featured Property Card ═══════════ */}
      <section ref={heroRef} className="px-4 pt-6 pb-6 md:px-8 md:pt-10 md:pb-10">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          {/* Brand + Badge row */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-['DM_Serif_Display'] text-lg md:text-xl text-foreground tracking-tight">
              ValoraCasa
            </span>
            <span className="rounded-full bg-foreground text-background px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider">
              {FEATURED.label}
            </span>
          </div>

          {/* Hero Card — mobile: stacked, desktop: side-by-side */}
          <div className="md:grid md:grid-cols-5 md:gap-6">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl overflow-hidden aspect-[16/10] md:col-span-3 md:aspect-[4/3]"
            >
              <img
                src={FEATURED.image}
                alt={FEATURED.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />

              {/* Overlay bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-primary-foreground/70 mb-1">
                  Featured listing
                </p>
                <h1 className="font-['DM_Serif_Display'] text-2xl md:text-4xl text-primary-foreground leading-tight">
                  {FEATURED.title}
                </h1>
                <span className="inline-block mt-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 px-3 py-1 text-xs text-primary-foreground">
                  {FEATURED.type}
                </span>
              </div>

              {/* Dot indicators */}
              <div className="absolute bottom-5 right-5 md:bottom-8 md:right-8 flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-foreground" />
                <span className="w-2 h-2 rounded-full bg-primary-foreground/40" />
                <span className="w-2 h-2 rounded-full bg-primary-foreground/40" />
              </div>
            </motion.div>

            {/* Right column — features + input */}
            <div className="mt-5 md:mt-0 md:col-span-2 flex flex-col gap-5">
              {/* Feature bullets */}
              <div className="flex flex-col gap-3">
                {FEATURED.features.map((feat, i) => (
                  <motion.div
                    key={feat}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p className="text-sm md:text-base text-muted-foreground leading-snug">{feat}</p>
                  </motion.div>
                ))}
              </div>

              {/* Address input */}
              <div className="flex flex-col gap-3 mt-auto">
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your property address..."
                    className="w-full rounded-2xl border border-border bg-card pl-11 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:shadow-lg focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  onClick={handleGetValuation}
                  className="w-full rounded-2xl px-6 py-4 text-sm font-semibold bg-foreground text-background flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors active:scale-[0.98]"
                >
                  Get Your Free Valuation
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ DIVIDER ═══════════ */}
      <div className="border-b border-border/60" />

      {/* ═══════════ BROWSE PROPERTIES ═══════════ */}
      <section className="py-6 md:py-16 px-4 md:px-8">
        <div className="max-w-lg md:max-w-5xl mx-auto">
          {/* Section header */}
          <div className="flex items-center justify-between mb-5 md:mb-8">
            <h2 className="font-['DM_Serif_Display'] text-xl md:text-3xl text-foreground">
              Browse Properties
            </h2>
            <button
              onClick={() => navigate("/sell/valuation")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              See all
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Cards — horizontal scroll mobile, grid desktop */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {BROWSE_PROPERTIES.map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="min-w-[280px] md:min-w-0 snap-start flex flex-col rounded-2xl overflow-hidden bg-card shadow-sm border border-border/40 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate("/sell/valuation")}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={prop.image}
                    alt={prop.title}
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                {/* Content */}
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-semibold text-foreground text-base">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{prop.desc}</p>
                  {prop.badges.length > 0 && (
                    <div className="flex gap-2 mt-1">
                      {prop.badges.map((badge) => (
                        <span key={badge} className="rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ DIVIDER ═══════════ */}
      <div className="border-b border-border/60" />

      {/* ═══════════ DISCOVERY / EDITORIAL ═══════════ */}
      <section className="py-6 md:py-16 px-4 md:px-8">
        <div className="max-w-lg md:max-w-5xl mx-auto md:grid md:grid-cols-2 md:gap-8 md:items-center">
          {/* Left — Image with overlay chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden aspect-[4/5] md:aspect-[3/4]"
          >
            <img
              src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200"
              alt="Curated property interior"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-foreground/10" />

            {/* Overlay chips */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
                <Play size={10} className="fill-current" />
                Video Tour
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
                <FileText size={10} />
                Free Report
              </span>
            </div>

            {/* Bottom overlay text */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-primary-foreground/90 text-sm leading-relaxed">
                Where craftsmanship meets comfort—discover the artisan's flat.
              </p>
            </div>
          </motion.div>

          {/* Right — Editorial text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 md:mt-0 flex flex-col gap-4"
          >
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Explore curated spaces designed for living, not just staying. Connect with agents who prioritize your vision of home.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our AI-powered valuation analyses comparable sales, location data, and market trends to give you the most accurate estimate—completely free.
            </p>
            <button
              onClick={handleGetValuation}
              className="self-start mt-2 rounded-full px-6 py-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Start your valuation
              <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ DIVIDER ═══════════ */}
      <div className="border-b border-border/60" />

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="py-6 md:py-10 px-4 md:px-8">
        <div className="max-w-lg md:max-w-3xl mx-auto">
          <div className="flex items-center border-y border-border/60 divide-x divide-border/60">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex-1 py-5 md:py-8 text-center">
                <p className="text-[0.65rem] md:text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="font-['DM_Serif_Display'] text-xl md:text-3xl text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ DIVIDER ═══════════ */}
      <div className="border-b border-border/60" />

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-6 md:py-16 px-4 md:px-8">
        <div className="max-w-lg md:max-w-3xl mx-auto text-center">
          <h2 className="font-['DM_Serif_Display'] text-2xl md:text-4xl text-foreground mb-8 md:mb-12">
            What property owners say
          </h2>
          <div className="relative min-h-[180px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-lg md:text-xl text-muted-foreground italic max-w-xl leading-relaxed">
                  "{TESTIMONIALS[testimonialIdx].quote}"
                </p>
                <p className="text-xs text-muted-foreground/60 mt-4">
                  — {TESTIMONIALS[testimonialIdx].name}, {TESTIMONIALS[testimonialIdx].location}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
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

      {/* ═══════════ DIVIDER ═══════════ */}
      <div className="border-b border-border/60" />

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-10 md:py-20 px-4 md:px-8 pb-28">
        <div className="max-w-lg md:max-w-2xl mx-auto flex flex-col items-center text-center gap-5">
          <h2 className="font-['DM_Serif_Display'] text-2xl md:text-4xl text-foreground leading-tight">
            Ready to discover your property's true value?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Free, confidential, and takes less than 2 minutes
          </p>
          <div className="w-full flex flex-col gap-3 mt-4">
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your property address..."
                className="w-full rounded-2xl border border-border bg-card pl-11 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:shadow-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={handleGetValuation}
              className="w-full rounded-2xl px-6 py-4 text-sm font-semibold bg-foreground text-background flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors"
            >
              Get Your Free Valuation
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-4">
            Join 12,400+ property owners who already know their home's worth
          </p>
        </div>
      </section>

      {/* ═══════════ STICKY MOBILE CTA ═══════════ */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-md border-t border-border"
          >
            <div className="px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <p className="text-xs text-muted-foreground mb-2 text-center">Free Property Valuation</p>
              <button
                onClick={handleGetValuation}
                className="w-full rounded-2xl py-3.5 bg-foreground text-background font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                Get Your Free Valuation
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;

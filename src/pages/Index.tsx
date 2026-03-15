import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TestimonialCard from "@/components/TestimonialCard";
import CTABanner from "@/components/CTABanner";
import PropertyShowcaseCarousel from "@/components/PropertyShowcaseCarousel";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <Navbar />

      {/* ── Hero Grid ── */}
      <div className="max-w-[1400px] mx-auto grid gap-[1px] bg-border border border-border md:grid-cols-2 mb-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}
          className="bg-gradient-to-br from-primary to-navy-deep p-12 md:p-16 flex flex-col justify-between text-primary-foreground">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-6">Residential Data</p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-normal leading-[1.1] tracking-[-0.02em] mb-6">
              Unlock the true value of your Spanish property.
            </h1>
            <p className="text-primary-foreground/60 leading-relaxed max-w-md">
              Advanced valuation models and local market insights connecting owners with top-tier professionals.
            </p>
          </div>
          <div className="flex gap-8 mt-12 text-sm text-primary-foreground/40">
            <span>Est. 2024</span>
            <span>Coverage: 45+ Cities</span>
          </div>
        </motion.div>

        <div className="grid grid-rows-2 gap-[1px] bg-border">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="relative bg-muted min-h-[300px] overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-primary-foreground/80 p-6 md:p-8 bg-primary/85 backdrop-blur-sm text-primary-foreground text-center">
              <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2">Market Intelligence</p>
              <p className="font-heading text-xl md:text-2xl font-medium">Accuracy, Resolution, Trust</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-[1px] bg-border">
            <Link to="/sell" className="group bg-card p-6 md:p-8 relative transition-colors hover:bg-muted">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-soft-blue" />
              <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-2">I want to</p>
              <h3 className="font-heading text-2xl md:text-3xl font-medium text-foreground mb-4">Sell</h3>
              <div className="flex items-center gap-1 text-sm font-medium text-soft-blue">
                Get Free Valuation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
            <Link to="/rent" className="group bg-card p-6 md:p-8 relative transition-colors hover:bg-muted">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />
              <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-2">I want to</p>
              <h3 className="font-heading text-2xl md:text-3xl font-medium text-foreground mb-4">Rent</h3>
              <div className="flex items-center gap-1 text-sm font-medium text-accent">
                Est. Rental Income <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="max-w-[1400px] mx-auto grid gap-[1px] bg-border border border-border grid-cols-2 md:grid-cols-4 mb-12">
        <div className="bg-card p-8 text-center">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-2">Valuations Delivered</p>
          <p className="text-[2.5rem] md:text-[3rem] font-light tracking-[-0.03em] leading-none text-foreground">12.4K</p>
        </div>
        <div className="bg-card p-8 text-center">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-2">Cities Covered</p>
          <p className="text-[2.5rem] md:text-[3rem] font-light tracking-[-0.03em] leading-none text-foreground">45+</p>
        </div>
        <div className="bg-card p-8 text-center">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-2">Owner Satisfaction</p>
          <p className="text-[2.5rem] md:text-[3rem] font-light tracking-[-0.03em] leading-none text-foreground">98%</p>
        </div>
        <div className="bg-primary p-8 flex items-center justify-center">
          <p className="text-sm text-primary-foreground/60 leading-relaxed text-center">
            Connected to the national registry for real-time comparative market analysis.
          </p>
        </div>
      </div>

      {/* ── Property Showcase Carousel ── */}
      <section className="max-w-[1400px] mx-auto mb-12">
        <motion.div {...fadeUp} className="mb-8">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2">Showcase</p>
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground">Properties we've valued</h2>
        </motion.div>
        <PropertyShowcaseCarousel />
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-[1400px] mx-auto mb-12">
        <motion.div {...fadeUp} className="mb-8">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2">Trusted by Owners</p>
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground">What property owners say</h2>
        </motion.div>
        <div className="grid gap-[1px] bg-border border border-border md:grid-cols-3">
          <TestimonialCard quote="The valuation was spot-on. We sold our apartment in Marbella within 3 weeks of listing at the suggested price." name="James H." location="Marbella, Costa del Sol" rating={5} />
          <TestimonialCard quote="Very professional service. The rental estimate helped us set the right price for our holiday villa in Ibiza." name="Anna S." location="Ibiza" rating={5} />
          <TestimonialCard quote="Quick, accurate, and completely free. The agent they recommended was excellent — spoke perfect English too." name="Peter W." location="Alicante, Costa Blanca" rating={4} />
        </div>
      </section>

      {/* ── Coverage Grid ── */}
      <section className="max-w-[1400px] mx-auto mb-12">
        <motion.div {...fadeUp} className="mb-8">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2">Coverage</p>
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground">Active across Spain</h2>
        </motion.div>
        <div className="grid gap-[1px] bg-border border border-border grid-cols-2 md:grid-cols-4">
          {["Costa del Sol", "Balearic Islands", "Costa Blanca", "Barcelona", "Madrid", "Canary Islands", "Valencia", "Málaga"].map((zone) => (
            <div key={zone} className="bg-card p-5 text-center">
              <MapPin className="mx-auto mb-1 h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">{zone}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="max-w-[1400px] mx-auto mb-12">
        <CTABanner title="Ready to find out what your property is worth?" subtitle="Get a free, AI-powered valuation in just 2 minutes." buttonText="Start Now" href="/sell/valuation" />
      </div>

      <Footer />
    </div>
  );
};

export default Index;

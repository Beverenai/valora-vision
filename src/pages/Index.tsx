import { useState, useEffect, useRef } from "react";
import HeroSection from "@/components/landing/HeroSection";
import BrowseSection from "@/components/landing/BrowseSection";
import DiscoverySection from "@/components/landing/DiscoverySection";
import StatsBar from "@/components/landing/StatsBar";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FinalCTA from "@/components/landing/FinalCTA";
import StickyBottomCTA from "@/components/landing/StickyBottomCTA";

const Index = () => {
  const [showStickyCta, setShowStickyCta] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Hero sentinel for sticky CTA */}
      <div ref={heroRef}>
        <HeroSection />
      </div>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8">
        <div className="h-px bg-border" />
      </div>

      <BrowseSection />

      <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8">
        <div className="h-px bg-border" />
      </div>

      <DiscoverySection />

      <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8">
        <div className="h-px bg-border" />
      </div>

      <StatsBar />

      <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8">
        <div className="h-px bg-border" />
      </div>

      <TestimonialsSection />

      <FinalCTA />

      <StickyBottomCTA visible={showStickyCta} />
    </div>
  );
};

export default Index;

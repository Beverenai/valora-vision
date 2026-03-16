import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  BarChart3,
  UserCheck,
  CalendarRange,
  Home,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TestimonialCard from "@/components/TestimonialCard";
import CTABanner from "@/components/CTABanner";
import CompanyLogos from "@/components/CompanyLogos";
import AboutValuator from "@/components/AboutValuator";
import InlineCTA from "@/components/InlineCTA";
import PropertyShowcaseCarousel from "@/components/PropertyShowcaseCarousel";
import GoogleAddressInput from "@/components/shared/GoogleAddressInput";
import { AddressData } from "@/types/valuation";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const features = [
  { icon: CalendarRange, title: "Short-term vs long-term", desc: "Compare Airbnb-style holiday rental income against stable long-term tenancy — side by side." },
  { icon: Home, title: "Seasonal income breakdown", desc: "See estimated monthly income across high, mid, and low seasons with occupancy rates." },
  { icon: Wallet, title: "Net income estimate", desc: "Understand your potential earnings after management fees, cleaning costs, and platform commissions." },
  { icon: ShieldCheck, title: "Top property managers", desc: "Connect with verified property management companies who specialise in your area." },
];

const faqs = [
  { q: "How do you estimate rental income?", a: "We analyse thousands of active rental listings, Airbnb data, and booking rates in your area to calculate realistic income ranges for both short-term and long-term rentals." },
  { q: "Do I need a tourist license (VFT)?", a: "For short-term holiday rentals in Spain, yes — most regions require a Vivienda con Fines Turísticos (VFT) license. We'll explain what you need and connect you with managers who can help." },
  { q: "Short-term or long-term — which is better?", a: "It depends on your situation. Short-term typically generates 30–60% more annual income but requires more management and a tourist license. Long-term offers stable, predictable income with less hassle." },
  { q: "Is it really free?", a: "Yes, 100% free for property owners. We're funded by property management companies who pay to be visible on our platform." },
  { q: "What if I already have a property manager?", a: "You can still get a free estimate to benchmark your current income. Many owners discover they could be earning significantly more with a different strategy or manager." },
];

const steps = [
  { icon: ClipboardList, title: "Describe your property", desc: "Tell us about your property: type, location, size, furnishing, and amenities — about 2 minutes.", step: "01" },
  { icon: BarChart3, title: "We crunch the numbers", desc: "Our AI analyses rental listings, Airbnb data, occupancy rates, and seasonal trends in your area.", step: "02" },
  { icon: UserCheck, title: "Get your estimate + top managers", desc: "See your short-term and long-term income potential and connect with the best local property managers.", step: "03" },
];

const Rent = () => {
  const navigate = useNavigate();
  const [addressData, setAddressData] = useState<AddressData>({
    streetAddress: "",
    urbanization: "",
    city: "",
    province: "",
    country: "",
  });

  useEffect(() => {
    document.title = "Free Rental Income Estimate in Spain — ValoraCasa";
  }, []);

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    setAddressData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGetEstimate = () => {
    navigate("/rent/valuation", { state: { address: addressData } });
  };

  const hasAddress = !!(addressData.streetAddress || addressData.city);

  return (
    <div className="min-h-screen bg-background p-6">
      <Navbar />

      {/* ── Hero with Address Input ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="max-w-[1400px] mx-auto border border-border mb-12"
      >
        <div className="bg-gradient-to-br from-primary to-navy-deep p-10 md:p-16">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-4">
            Free Rental Estimate
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-normal leading-[1.1] tracking-[-0.02em] text-primary-foreground mb-4">
            How much can you<br />
            <span className="text-accent">earn from your property?</span>
          </h1>
          <p className="text-primary-foreground/60 max-w-xl mb-8">
            Get a free rental income estimate — both short-term (Airbnb) and long-term — based on real market data. Find the best property managers in your area.
          </p>

          {/* Address Input */}
          <div className="max-w-xl">
            <div className="bg-card/10 backdrop-blur-sm border border-primary-foreground/20 p-4">
              <MapboxAddressInput
                addressData={addressData}
                onChange={handleAddressChange}
              />
              <button
                onClick={handleGetEstimate}
                disabled={!hasAddress}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-gold text-primary px-6 py-3 text-sm font-medium hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Your Free Estimate
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Social Proof Strip ── */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-3 gap-[1px] bg-border border border-border mb-12">
        <div className="bg-card p-6 text-center">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-1">Property Owners</p>
          <p className="text-[2rem] font-light tracking-[-0.02em] leading-none text-foreground">1,000+</p>
          <p className="text-xs text-muted-foreground mt-1">have used this tool</p>
        </div>
        <div className="bg-card p-6 text-center">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-1">Cities Covered</p>
          <p className="text-[2rem] font-light tracking-[-0.02em] leading-none text-foreground">45+</p>
        </div>
        <div className="bg-card p-6 text-center">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-1">Verified Managers</p>
          <p className="text-[2rem] font-light tracking-[-0.02em] leading-none text-foreground">120+</p>
        </div>
      </div>

      {/* ── Company Logos ── */}
      <CompanyLogos />

      {/* ── Inline CTA ── */}
      <InlineCTA text="Get your free rental estimate now →" href="/rent/valuation" />

      {/* ── Property Showcase ── */}
      <section className="max-w-[1400px] mx-auto mb-12">
        <motion.div {...fadeUp} className="mb-8">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2">Showcase</p>
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground">Properties we've estimated</h2>
        </motion.div>
        <PropertyShowcaseCarousel />
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-[1400px] mx-auto mb-12">
        <motion.div {...fadeUp} className="mb-8">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2">Trusted by Owners</p>
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground">What rental owners say</h2>
        </motion.div>
        <div className="grid gap-[1px] bg-border border border-border md:grid-cols-3">
          <TestimonialCard quote="The rental estimate helped us set the right price for our holiday villa in Ibiza. We're now earning 40% more than before." name="Anna S." location="Ibiza" rating={5} />
          <TestimonialCard quote="I had no idea short-term rental could generate this much income. The property manager they recommended handles everything." name="Henrik J." location="Marbella, Costa del Sol" rating={5} />
          <TestimonialCard quote="Very useful comparison between Airbnb and long-term rental. Helped us make a much more informed decision." name="Sophie & Mark D." location="Fuengirola" rating={4} />
        </div>
      </section>

      {/* ── Inline CTA ── */}
      <InlineCTA text="Find out how much you can earn — it's free →" href="/rent/valuation" />

      {/* ── About the Valuator ── */}
      <AboutValuator />

      {/* ── How it Works ── */}
      <section className="max-w-[1400px] mx-auto mb-12">
        <motion.div {...fadeUp} className="mb-8">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2">Simple Process</p>
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground">How your rental estimate works</h2>
        </motion.div>
        <div className="grid gap-[1px] bg-border border border-border md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="bg-card p-8 relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />
              <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-accent mb-4">Step {item.step}</p>
              <item.icon className="h-6 w-6 text-primary mb-4" />
              <h3 className="font-heading text-base font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What You'll Get ── */}
      <section className="max-w-[1400px] mx-auto mb-12">
        <motion.div {...fadeUp} className="mb-8">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2">Your Report</p>
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground">What you'll get</h2>
        </motion.div>
        <div className="grid gap-[1px] bg-border border border-border sm:grid-cols-2">
          {features.map((feat) => (
            <div key={feat.title} className="bg-card p-6 flex gap-4">
              <feat.icon className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading text-sm font-semibold text-foreground mb-1">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-[1400px] mx-auto mb-12">
        <motion.div {...fadeUp} className="mb-8">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2">FAQ</p>
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground">Frequently asked questions</h2>
        </motion.div>
        <div className="border border-border">
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border last:border-b-0 bg-card px-6">
                <AccordionTrigger className="text-left font-heading text-sm font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <div className="max-w-[1400px] mx-auto mb-12">
        <CTABanner
          title="Ready to find out how much you can earn?"
          subtitle="Get a free rental income estimate in just 2 minutes. Short-term and long-term."
          buttonText="Get Your Free Estimate"
          href="/rent/valuation"
          variant="teal"
        />
      </div>

      <Footer />
    </div>
  );
};

export default Rent;

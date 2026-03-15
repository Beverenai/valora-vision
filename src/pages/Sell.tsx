import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  BarChart3,
  UserCheck,
  TrendingUp,
  Users,
  Target,
  MapPin,
  Shield,
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
import { useEffect } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const features = [
  { icon: TrendingUp, title: "Price range estimate", desc: "Get a realistic min–max valuation based on comparable sales and active listings in your area." },
  { icon: Users, title: "Compare similar properties", desc: "See how your property stacks up against recent sales and current listings nearby." },
  { icon: BarChart3, title: "Local price trends", desc: "Understand whether prices in your area are rising, stable, or declining over the past 12 months." },
  { icon: Target, title: "Top-rated agents", desc: "Connect with verified, top-performing agents who specialise in your area and property type." },
];

const faqs = [
  { q: "How accurate is the valuation?", a: "Our AI analyses thousands of comparable listings and recent sales to provide a realistic price range. While no automated valuation replaces an official appraisal (tasación), our estimates are typically within 5–10% of market value." },
  { q: "Is it really free?", a: "Yes, 100% free for property owners. We are funded by real estate professionals who pay to be visible on our platform, not by you." },
  { q: "How do you calculate the price?", a: "We use a comparable-based algorithm that considers property type, location, size, features (pool, sea view, condition), and current market conditions. We weight recent sales more heavily than older data." },
  { q: "What data do you use?", a: "We aggregate listing data from major Spanish property portals, public registry information, and our own network of professional partners to ensure comprehensive coverage." },
  { q: "Do I have to contact an agent?", a: "No. The valuation is completely standalone. We show recommended agents as a convenience, but there's no obligation to contact anyone." },
];

const steps = [
  { icon: ClipboardList, title: "Tell us about your property", desc: "Property type, location, size, bedrooms, and key features — it takes about 2 minutes.", step: "01" },
  { icon: BarChart3, title: "Our AI analyses the market", desc: "We compare your property against thousands of active listings and recent sales in your area.", step: "02" },
  { icon: UserCheck, title: "Get your valuation + top agents", desc: "Receive your estimated price range and connect with the best-rated agents near you.", step: "03" },
];

const Sell = () => {
  useEffect(() => { document.title = "Free Property Valuation in Spain — ValoraCasa"; }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <Navbar />

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="max-w-[1400px] mx-auto border border-border mb-12"
      >
        <div className="bg-gradient-to-br from-primary to-navy-deep p-12 md:p-16">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-4">
            Free Property Valuation
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-normal leading-[1.1] tracking-[-0.02em] text-primary-foreground mb-4">
            What is your property<br />
            in Spain <span className="text-soft-blue">really worth?</span>
          </h1>
          <p className="text-primary-foreground/60 max-w-xl mb-8">
            Get a free AI-powered valuation based on real market data from thousands of listings. No obligations, no hidden fees.
          </p>
          <Link
            to="/sell/valuation"
            className="inline-flex items-center gap-2 bg-gold text-primary px-6 py-3 text-sm font-medium hover:bg-gold-dark transition-colors"
          >
            Get Your Free Valuation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-[1px] bg-border">
          <div className="bg-card p-6 text-center">
            <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-1">Valuations</p>
            <p className="text-[2rem] font-light tracking-[-0.02em] leading-none text-foreground">12,400+</p>
          </div>
          <div className="bg-card p-6 text-center">
            <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-1">Cities</p>
            <p className="text-[2rem] font-light tracking-[-0.02em] leading-none text-foreground">45+</p>
          </div>
          <div className="bg-card p-6 text-center">
            <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-1">Satisfaction</p>
            <p className="text-[2rem] font-light tracking-[-0.02em] leading-none text-foreground">98%</p>
          </div>
        </div>
      </motion.div>

      {/* ── How it Works ── */}
      <section className="max-w-[1400px] mx-auto mb-12">
        <motion.div {...fadeUp} className="mb-8">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2">Simple Process</p>
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground">How your valuation works</h2>
        </motion.div>

        <div className="grid gap-[1px] bg-border border border-border md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="bg-card p-8 relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold" />
              <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-gold mb-4">Step {item.step}</p>
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
              <feat.icon className="h-5 w-5 text-soft-blue shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading text-sm font-semibold text-foreground mb-1">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-[1400px] mx-auto mb-12">
        <motion.div {...fadeUp} className="mb-8">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-2">Trusted by Owners</p>
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground">What sellers say</h2>
        </motion.div>

        <div className="grid gap-[1px] bg-border border border-border md:grid-cols-3">
          <TestimonialCard
            quote="The valuation was spot-on. We sold our apartment in Marbella within 3 weeks of listing at the suggested price."
            name="James H."
            location="Marbella, Costa del Sol"
            rating={5}
          />
          <TestimonialCard
            quote="I was sceptical at first, but the comparable properties they showed gave me real confidence in the price range."
            name="Ingrid M."
            location="Nueva Andalucía"
            rating={5}
          />
          <TestimonialCard
            quote="Quick, accurate, and completely free. The agent they recommended was excellent — spoke perfect English too."
            name="Peter W."
            location="Alicante, Costa Blanca"
            rating={4}
          />
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
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b border-border last:border-b-0 bg-card px-6"
              >
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

      {/* ── CTA ── */}
      <div className="max-w-[1400px] mx-auto mb-12">
        <CTABanner
          title="Ready to find out what your property is worth?"
          subtitle="Get a free, AI-powered valuation in just 2 minutes. No obligations."
          buttonText="Get Your Free Valuation"
          href="/sell/valuation"
        />
      </div>

      <Footer />
    </div>
  );
};

export default Sell;
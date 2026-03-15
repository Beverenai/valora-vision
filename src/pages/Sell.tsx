import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  BarChart3,
  UserCheck,
  TrendingUp,
  Users,
  FileText,
  Target,
  CheckCircle2,
  MapPin,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
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
  {
    icon: TrendingUp,
    title: "Price range estimate",
    desc: "Get a realistic min–max valuation based on comparable sales and active listings in your area.",
  },
  {
    icon: Users,
    title: "Compare similar properties",
    desc: "See how your property stacks up against recent sales and current listings nearby.",
  },
  {
    icon: BarChart3,
    title: "Local price trends",
    desc: "Understand whether prices in your area are rising, stable, or declining over the past 12 months.",
  },
  {
    icon: Target,
    title: "Top-rated agents",
    desc: "Connect with verified, top-performing agents who specialise in your area and property type.",
  },
];

const faqs = [
  {
    q: "How accurate is the valuation?",
    a: "Our AI analyses thousands of comparable listings and recent sales to provide a realistic price range. While no automated valuation replaces an official appraisal (tasación), our estimates are typically within 5–10% of market value.",
  },
  {
    q: "Is it really free?",
    a: "Yes, 100% free for property owners. We are funded by real estate professionals who pay to be visible on our platform, not by you.",
  },
  {
    q: "How do you calculate the price?",
    a: "We use a comparable-based algorithm that considers property type, location, size, features (pool, sea view, condition), and current market conditions. We weight recent sales more heavily than older data.",
  },
  {
    q: "What data do you use?",
    a: "We aggregate listing data from major Spanish property portals, public registry information, and our own network of professional partners to ensure comprehensive coverage.",
  },
  {
    q: "Do I have to contact an agent?",
    a: "No. The valuation is completely standalone. We show recommended agents as a convenience, but there's no obligation to contact anyone.",
  },
];

const Sell = () => {
  useEffect(() => {
    document.title = "Free Property Valuation in Spain — ValoraCasa";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-deep px-4 py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-soft-blue blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-gold blur-[80px]" />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">
              Free Property Valuation
            </p>
            <h1 className="font-heading text-4xl font-extrabold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
              What is your property
              <br />
              in Spain <span className="text-soft-blue">really worth?</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/60">
              Get a free AI-powered valuation based on real market data from
              thousands of listings. No obligations, no hidden fees.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-gold text-navy hover:bg-gold-dark"
            >
              <Link to="/sell/valuation">
                Get Your Free Valuation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-3">
            <StatCard icon={BarChart3} value="12,400+" label="Valuations completed" delay={0.1} />
            <StatCard icon={MapPin} value="45+" label="Cities covered" delay={0.2} />
            <StatCard icon={Shield} value="98%" label="Customer satisfaction" delay={0.3} />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container py-20">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">
            Simple Process
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl">
            How your valuation works
          </h2>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
          {[
            {
              icon: ClipboardList,
              title: "Tell us about your property",
              desc: "Property type, location, size, bedrooms, and key features — it takes about 2 minutes.",
              step: "01",
            },
            {
              icon: BarChart3,
              title: "Our AI analyses the market",
              desc: "We compare your property against thousands of active listings and recent sales in your area.",
              step: "02",
            },
            {
              icon: UserCheck,
              title: "Get your valuation + top agents",
              desc: "Receive your estimated price range and connect with the best-rated agents near you.",
              step: "03",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
            >
              <span className="absolute -top-4 left-6 rounded-lg bg-gold px-3 py-1 font-heading text-xs font-bold text-navy">
                {item.step}
              </span>
              <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <item.icon className="h-7 w-7 text-navy" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-bold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What You'll Get */}
      <section className="border-y border-border bg-muted/50 py-20">
        <div className="container">
          <motion.div {...fadeUp} className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gold">
              Your Report
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl">
              What you'll get
            </h2>
          </motion.div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-soft-blue/10">
                  <feat.icon className="h-6 w-6 text-soft-blue" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">
                    {feat.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-20">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">
            Trusted by Owners
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl">
            What sellers say
          </h2>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
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

      {/* FAQ */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container">
          <motion.div {...fadeUp} className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gold">
              FAQ
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl">
              Frequently asked questions
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="mx-auto mt-12 max-w-2xl"
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border bg-card px-6 shadow-sm"
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
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <CTABanner
          title="Ready to find out what your property is worth?"
          subtitle="Get a free, AI-powered valuation in just 2 minutes. No obligations."
          buttonText="Get Your Free Valuation"
          href="/sell/valuation"
        />
      </section>

      <Footer />
    </div>
  );
};

export default Sell;

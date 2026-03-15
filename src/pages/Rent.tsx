import { Link } from "react-router-dom";
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
  CheckCircle2,
  MapPin,
  Key,
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
    icon: CalendarRange,
    title: "Short-term vs long-term",
    desc: "Compare Airbnb-style holiday rental income against stable long-term tenancy — side by side.",
  },
  {
    icon: Home,
    title: "Seasonal income breakdown",
    desc: "See estimated monthly income across high, mid, and low seasons with occupancy rates.",
  },
  {
    icon: Wallet,
    title: "Net income estimate",
    desc: "Understand your potential earnings after management fees, cleaning costs, and platform commissions.",
  },
  {
    icon: ShieldCheck,
    title: "Top property managers",
    desc: "Connect with verified property management companies who specialise in your area.",
  },
];

const faqs = [
  {
    q: "How do you estimate rental income?",
    a: "We analyse thousands of active rental listings, Airbnb data, and booking rates in your area to calculate realistic income ranges for both short-term and long-term rentals.",
  },
  {
    q: "Do I need a tourist license (VFT)?",
    a: "For short-term holiday rentals in Spain, yes — most regions require a Vivienda con Fines Turísticos (VFT) license. We'll explain what you need and connect you with managers who can help.",
  },
  {
    q: "Short-term or long-term — which is better?",
    a: "It depends on your situation. Short-term typically generates 30–60% more annual income but requires more management and a tourist license. Long-term offers stable, predictable income with less hassle.",
  },
  {
    q: "Is it really free?",
    a: "Yes, 100% free for property owners. We're funded by property management companies who pay to be visible on our platform.",
  },
  {
    q: "What if I already have a property manager?",
    a: "You can still get a free estimate to benchmark your current income. Many owners discover they could be earning significantly more with a different strategy or manager.",
  },
];

const Rent = () => {
  useEffect(() => {
    document.title = "Free Rental Income Estimate in Spain — ValoraCasa";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-deep px-4 py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-teal blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/3 h-48 w-48 rounded-full bg-gold blur-[80px]" />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">
              Free Rental Estimate
            </p>
            <h1 className="font-heading text-4xl font-extrabold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
              How much can you
              <br />
              <span className="text-teal">earn from your property?</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/60">
              Get a free rental income estimate — both short-term (Airbnb) and
              long-term — based on real market data. Find the best property
              managers in your area.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-gold text-navy hover:bg-gold-dark"
            >
              <Link to="/rent/valuation">
                Get Your Free Estimate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-3">
            <StatCard icon={Key} value="4,200+" label="Rental estimates" delay={0.1} />
            <StatCard icon={MapPin} value="45+" label="Cities covered" delay={0.2} />
            <StatCard icon={CheckCircle2} value="120+" label="Verified managers" delay={0.3} />
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
            How your rental estimate works
          </h2>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
          {[
            {
              icon: ClipboardList,
              title: "Describe your property",
              desc: "Tell us about your property: type, location, size, furnishing, and amenities — about 2 minutes.",
              step: "01",
            },
            {
              icon: BarChart3,
              title: "We crunch the numbers",
              desc: "Our AI analyses rental listings, Airbnb data, occupancy rates, and seasonal trends in your area.",
              step: "02",
            },
            {
              icon: UserCheck,
              title: "Get your estimate + top managers",
              desc: "See your short-term and long-term income potential and connect with the best local property managers.",
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
              <span className="absolute -top-4 left-6 rounded-lg bg-teal px-3 py-1 font-heading text-xs font-bold text-primary-foreground">
                {item.step}
              </span>
              <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <item.icon className="h-7 w-7 text-teal" />
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
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/10">
                  <feat.icon className="h-6 w-6 text-teal" />
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
            What rental owners say
          </h2>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          <TestimonialCard
            quote="The rental estimate helped us set the right price for our holiday villa in Ibiza. We're now earning 40% more than before."
            name="Anna S."
            location="Ibiza"
            rating={5}
          />
          <TestimonialCard
            quote="I had no idea short-term rental could generate this much income. The property manager they recommended handles everything."
            name="Henrik J."
            location="Marbella, Costa del Sol"
            rating={5}
          />
          <TestimonialCard
            quote="Very useful comparison between Airbnb and long-term rental. Helped us make a much more informed decision."
            name="Sophie & Mark D."
            location="Fuengirola"
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

          <motion.div {...fadeUp} className="mx-auto mt-12 max-w-2xl">
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
          title="Ready to find out how much you can earn?"
          subtitle="Get a free rental income estimate in just 2 minutes. Short-term and long-term."
          buttonText="Get Your Free Estimate"
          href="/rent/valuation"
          variant="teal"
        />
      </section>

      <Footer />
    </div>
  );
};

export default Rent;

import { useState, useEffect } from "react";
import { useSEO } from "@/hooks/use-seo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, Building2, Users, Mail, BarChart3, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const tiers = [
  {
    name: "Basic",
    price: 149,
    features: [
      { label: "Appear on result pages", included: true },
      { label: "1 zone coverage", included: true },
      { label: "Standard ranking", included: true },
      { label: "Verified badge", included: false },
      { label: "Basic analytics", included: true },
      { label: "Email notifications", included: true },
      { label: "Monthly report", included: false },
    ],
  },
  {
    name: "Premium",
    price: 299,
    popular: true,
    features: [
      { label: "Appear on result pages", included: true },
      { label: "3 zone coverage", included: true },
      { label: "Higher ranking", included: true },
      { label: "Verified badge", included: true },
      { label: "Full analytics", included: true },
      { label: "Email + SMS notifications", included: true },
      { label: "Monthly report", included: true },
    ],
  },
  {
    name: "Elite",
    price: 499,
    features: [
      { label: "Appear on result pages", included: true },
      { label: "Unlimited zones", included: true },
      { label: "Highest ranking", included: true },
      { label: "Verified badge", included: true },
      { label: "Full analytics", included: true },
      { label: "Email + SMS + WhatsApp", included: true },
      { label: "Monthly report", included: true },
    ],
  },
];

const steps = [
  { icon: Zap, title: "Sign up in 2 minutes", desc: "AI builds your profile automatically from your website and Google reviews." },
  { icon: Users, title: "Get matched to sellers", desc: "We show you on valuation results near your office location." },
  { icon: Mail, title: "Receive qualified leads", desc: "Homeowners contact you directly through your profile page." },
];

const faqs = [
  { q: "How does matching work?", a: "We match you to sellers based on your office location and selected service zones. When a homeowner requests a valuation in your area, your profile appears on their result page." },
  { q: "What data do sellers see about me?", a: "Sellers see your agency name, logo, team members, Google rating, service areas, and a contact form. They never see your personal email or phone until they reach out." },
  { q: "Can I control which zones I appear in?", a: "Yes! You choose your service zones during onboarding and can update them anytime. Your plan determines how many zones you can cover." },
  { q: "How do I get reviews?", a: "We import your existing Google reviews automatically. Homeowners who contact you through ValoraCasa can also leave reviews on your profile." },
  { q: "Can I cancel anytime?", a: "Absolutely. No lock-in contracts. You can cancel, upgrade, or downgrade your plan at any time. Your profile stays active until the end of your billing period." },
];

const ProLanding = () => {
  useSEO({ title: "For Agents — List Your Agency on ValoraCasa", description: "Join ValoraCasa to receive qualified leads from property sellers and buyers across Costa del Sol." });
  const [valuationCount, setValuationCount] = useState<number | null>(null);

  useEffect(() => {
    // title handled by useSEO
    const fetchCount = async () => {
      const { count } = await supabase.from("leads_sell").select("*", { count: "exact", head: true });
      if (count !== null) setValuationCount(count);
    };
    fetchCount();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(21 62% 53% / 0.12) 0%, hsl(30 80% 80% / 0.06) 50%, transparent 85%)" }} />
        <div className="relative max-w-[1100px] mx-auto px-6 py-20 md:py-32 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-6xl font-bold text-foreground leading-tight"
          >
            Reach homeowners when
            <br />
            they're <span className="italic font-serif text-primary">ready to sell</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto"
          >
            ValoraCasa connects you with qualified sellers in your area.
            No activation fees. No transaction limits.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild size="lg" className="rounded-full text-lg px-12 py-7 shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide">
              <Link to="/pro/onboard">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full text-base px-8 border-foreground/20 text-foreground hover:bg-foreground/5">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-[1100px] mx-auto px-6 py-16 md:py-24">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-12">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-xs font-semibold text-primary tracking-wider uppercase mb-2">Step {i + 1}</div>
              <h3 className="font-heading text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-center text-foreground/60 mb-12">Start free — upgrade when you're ready. No credit card required.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-card rounded-2xl p-6 border ${tier.popular ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border"}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <h3 className="font-heading text-xl font-bold">{tier.name}</h3>
                <div className="mt-3 mb-5">
                  <span className="text-3xl font-bold">€{tier.price}</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 shrink-0 ${f.included ? "text-primary" : "text-muted-foreground/30"}`} />
                      <span className={f.included ? "" : "text-muted-foreground/50"}>{f.label}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full rounded-full" variant={tier.popular ? "default" : "outline"}>
                  <Link to="/pro/onboard">Start free trial</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-24 text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
          Trusted by agents across Costa del Sol
        </h2>
        {valuationCount !== null && (
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-5 py-2 text-sm font-semibold">
            <BarChart3 className="w-4 h-4" />
            {valuationCount.toLocaleString()} valuations delivered
          </div>
        )}
        <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40">
          {["Premium Realty", "Costa Properties", "Sol Living", "Mediterranean Homes"].map((name) => (
            <div key={name} className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span className="font-heading font-semibold text-sm">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="max-w-[700px] mx-auto px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border px-5">
                <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-24 text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
          Ready to grow your business?
        </h2>
        <p className="text-foreground/70 mb-8 max-w-lg mx-auto">
          Join ValoraCasa today and start receiving qualified leads from homeowners in your area.
        </p>
        <Button asChild size="lg" className="rounded-full text-base px-10 shadow-md">
          <Link to="/pro/onboard">
            Get started for free <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </section>

      <Footer />
    </div>
  );
};

export default ProLanding;

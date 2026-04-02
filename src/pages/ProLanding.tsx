import { useState, useEffect } from "react";
import { useSEO } from "@/hooks/use-seo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check, ArrowRight, Building2, Users, Mail, BarChart3, Shield, Zap, Home, Star,
  MapPin, Briefcase, Award, Search, Sparkles, MessageSquare, TrendingUp, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

/* ─── DATA ─── */

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

const howItWorksSteps = [
  {
    icon: Zap,
    title: "Sign up in 2 minutes",
    desc: "AI builds your profile automatically from your website and Google reviews. No manual data entry needed.",
    pills: [
      { icon: Sparkles, label: "AI Profile" },
      { icon: Star, label: "Google Reviews" },
    ],
  },
  {
    icon: Users,
    title: "Get matched to sellers",
    desc: "We show your profile on valuation results near your office. Sellers see your reviews, recent sales, and contact you directly.",
    pills: [
      { icon: MapPin, label: "Zone Matching" },
      { icon: TrendingUp, label: "Merit Ranking" },
    ],
  },
  {
    icon: Mail,
    title: "Receive qualified leads",
    desc: "Homeowners who have already valued their property contact you through your profile page. No cold calling — they come to you.",
    pills: [
      { icon: MessageSquare, label: "Direct Contact" },
      { icon: UserCheck, label: "Pre-Qualified" },
    ],
  },
];

const sellerFactors = [
  { icon: MapPin, label: "Proximity", pct: 29, hint: "Sellers prefer agents with a nearby office" },
  { icon: Star, label: "Reviews", pct: 21, hint: "Online reputation is the #2 decision factor" },
  { icon: Home, label: "Recent Sales", pct: 19, hint: "Proven track record in the local area" },
  { icon: Briefcase, label: "Experience", pct: 18, hint: "Years of market knowledge and expertise" },
  { icon: Award, label: "Brand", pct: 14, hint: "Agency recognition and perceived trust" },
];

const faqs = [
  { q: "How does matching work?", a: "We match you to sellers based on your office location and selected service zones. When a homeowner requests a valuation in your area, your profile appears on their result page." },
  { q: "What data do sellers see about me?", a: "Sellers see your agency name, logo, team members, Google rating, service areas, and a contact form. They never see your personal email or phone until they reach out." },
  { q: "Can I control which zones I appear in?", a: "Yes! You choose your service zones during onboarding and can update them anytime. Your plan determines how many zones you can cover." },
  { q: "How do I get reviews?", a: "We import your existing Google reviews automatically. Homeowners who contact you through ValoraCasa can also leave reviews on your profile." },
  { q: "Can I cancel anytime?", a: "Absolutely. No lock-in contracts. You can cancel, upgrade, or downgrade your plan at any time. Your profile stays active until the end of your billing period." },
];

/* ─── STATS BAR ─── */
const ProStatsBar = ({ valuationCount }: { valuationCount: number | null }) => (
  <div className="bg-brand py-8">
    <div className="max-w-[1100px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
      {[
        { label: "Valuations Delivered", value: valuationCount ? `${valuationCount.toLocaleString()}+` : "—" },
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

const ProLanding = () => {
  useSEO({ title: "For Agents — List Your Agency on ValoraCasa", description: "Join ValoraCasa to receive qualified leads from property sellers and buyers across Costa del Sol." });
  const [valuationCount, setValuationCount] = useState<number | null>(null);

  useEffect(() => {
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
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.04) 50%, transparent 85%)" }} />
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-4 text-sm text-foreground/50"
          >
            Already have an account?{" "}
            <Link to="/pro/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </motion.p>
        </div>
      </section>

      {/* Stats bar */}
      <ProStatsBar valuationCount={valuationCount} />

      {/* How it works — vertical timeline */}
      <section id="how-it-works" className="max-w-[1100px] mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <SectionLabel className="flex flex-col items-center">How It Works</SectionLabel>
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mt-4">
            Live in under 2 minutes
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            AI does the heavy lifting — you just sign up and start receiving leads.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border" />

          {howItWorksSteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex gap-5 md:gap-8 ${i < howItWorksSteps.length - 1 ? "mb-10 md:mb-14" : ""}`}
            >
              <div className="relative z-10 flex flex-col items-center shrink-0">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                  <span className="text-lg md:text-xl font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                </div>
              </div>
              <div className="pt-1 md:pt-2 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-base md:text-lg uppercase tracking-[0.08em] font-bold text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                  {step.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {step.pills.map((pill) => (
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
          ))}
        </div>
      </section>

      {/* KPMG Market Insight — Part A: Seller journey */}
      <section className="bg-accent/30 py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            <SectionLabel className="flex flex-col items-center">Market Insight</SectionLabel>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mt-4">
              How sellers start their journey
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              A nationwide study by KPMG Spain reveals how homeowners choose their agent — and where they look first.
            </p>
          </div>

          {/* Bento grid — seller behaviour */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* Wide card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-card p-6 md:p-8"
            >
              <p className="text-4xl md:text-5xl font-bold text-foreground mb-2">1 in 2</p>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                One in two sellers uses an <span className="font-semibold text-foreground">online valuation tool</span> before contacting an agent. If you're not visible where they look, you're invisible.
              </p>
            </motion.div>

            {/* Narrow card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-card p-6 md:p-8 flex flex-col justify-center"
            >
              <p className="text-4xl md:text-5xl font-bold text-foreground mb-2">87%</p>
              <p className="text-muted-foreground text-sm">
                of agents on online platforms <span className="font-semibold text-foreground">renew their subscription</span> — because the leads keep coming.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-card p-6 md:p-8"
            >
              <p className="text-4xl md:text-5xl font-bold text-foreground mb-2">14%</p>
              <p className="text-muted-foreground text-sm">
                of clients come through <span className="font-semibold text-foreground">referrals from other satisfied clients</span> — your reputation compounds over time.
              </p>
            </motion.div>

            {/* Banner card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 flex items-center"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-foreground text-sm">The new reality</p>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sellers today research online first. They compare agents, read reviews, and check valuations — all before making a single phone call.
                </p>
              </div>
            </motion.div>
          </div>

          <p className="text-xs text-muted-foreground/60 text-center">Source: KPMG Spain, 2025 — National Real Estate Market Study</p>
        </div>
      </section>

      {/* Part B — What sellers look for in an agent */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            <SectionLabel className="flex flex-col items-center">Agent Selection</SectionLabel>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mt-4">
              What sellers look for in an agent
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              The five factors that drive a seller's decision, ranked by importance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {sellerFactors.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-card p-5 text-center"
              >
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">{item.pct}%</p>
                <p className="text-xs font-semibold text-foreground mb-2">{item.label}</p>
                <Progress value={item.pct} className="h-1.5 mb-2" />
                <p className="text-[0.65rem] text-muted-foreground leading-snug">{item.hint}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild className="rounded-full px-8">
              <Link to="/pro/onboard">
                Claim Your Zone <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground/60 text-center mt-6">Source: KPMG Spain, 2025</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            <SectionLabel className="flex flex-col items-center">Plans</SectionLabel>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mt-4">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-muted-foreground">Start free — upgrade when you're ready. No credit card required.</p>
          </div>

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
        <SectionLabel className="flex flex-col items-center">Proof</SectionLabel>
        <h2 className="font-serif text-2xl md:text-4xl font-bold mt-4 mb-4">
          Trusted by agents across Costa del Sol
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-8 opacity-40">
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
          <div className="text-center mb-10">
            <SectionLabel className="flex flex-col items-center">Support</SectionLabel>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mt-4">
              Frequently asked questions
            </h2>
          </div>
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
        <h2 className="font-serif text-2xl md:text-4xl font-bold mb-4">
          Ready to grow your business?
        </h2>
        <p className="text-foreground/70 mb-8 max-w-lg mx-auto">
          Join ValoraCasa today and start receiving qualified leads from homeowners in your area.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="rounded-full text-base px-10 shadow-md">
            <Link to="/pro/onboard">
              Get started for free <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="rounded-full text-base text-primary">
            <Link to="/pro/login">
              Sign in to dashboard
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProLanding;

import { motion } from "framer-motion";
import { Database, BarChart3, Shield, Zap } from "lucide-react";

const points = [
  {
    icon: Database,
    title: "Real market data",
    desc: "We aggregate listing data from major Spanish property portals, public registries, and our own network of professional partners.",
  },
  {
    icon: BarChart3,
    title: "AI-powered analysis",
    desc: "Our algorithm compares your property against thousands of active listings and recent sales, weighted by recency and relevance.",
  },
  {
    icon: Shield,
    title: "Accuracy you can trust",
    desc: "Our estimates are typically within 5–10% of market value. Over 12,400 valuations delivered with 98% owner satisfaction.",
  },
  {
    icon: Zap,
    title: "Results in 2 minutes",
    desc: "Answer a few questions about your property and get an instant price range estimate — no waiting, no obligations.",
  },
];

const AboutValuator = () => (
  <section className="max-w-[1400px] mx-auto mb-12">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <p className="text-xs uppercase tracking-[0.15em] font-semibold text-primary mb-2">
        About Our Valuator
      </p>
      <h2 className="font-sans text-2xl md:text-3xl font-medium text-foreground">
        How we calculate your estimate
      </h2>
    </motion.div>

    <div className="grid gap-4 sm:grid-cols-2">
      {points.map((p) => (
        <div key={p.title} className="bg-card rounded-xl border border-[rgba(0,0,0,0.06)] p-6 flex gap-4 transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          <p.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-sans text-sm font-semibold text-foreground mb-1">
              {p.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {p.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default AboutValuator;

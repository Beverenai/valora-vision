import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Key,
  ArrowRight,
  ClipboardList,
  BarChart3,
  UserCheck,
  CheckCircle2,
  MapPin,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import TestimonialCard from "@/components/TestimonialCard";
import CTABanner from "@/components/CTABanner";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-deep px-4 py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-gold blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-soft-blue blur-[80px]" />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="font-heading text-4xl font-extrabold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
              Your property in Spain.
              <br />
              <span className="text-gold">Know its true value.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/60">
              Free AI-powered valuations and rental estimates based on real
              market data from thousands of listings.
            </p>
          </motion.div>

          {/* Path Cards */}
          <div className="mx-auto mt-12 grid max-w-2xl gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/sell" className="group block">
                <div className="rounded-2xl border border-soft-blue/20 bg-primary-foreground/5 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-soft-blue/40 hover:shadow-lg hover:shadow-soft-blue/10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-soft-blue/20">
                    <Home className="h-6 w-6 text-soft-blue" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-primary-foreground">
                    Sell
                  </h3>
                  <p className="mt-1 text-sm text-primary-foreground/50">
                    What is your property worth?
                  </p>
                  <p className="mt-3 text-xs text-primary-foreground/40">
                    Free valuation in 2 minutes
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-soft-blue">
                    Get Valuation
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <Link to="/rent" className="group block">
                <div className="rounded-2xl border border-teal/20 bg-primary-foreground/5 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal/40 hover:shadow-lg hover:shadow-teal/10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/20">
                    <Key className="h-6 w-6 text-teal" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-primary-foreground">
                    Rent Out
                  </h3>
                  <p className="mt-1 text-sm text-primary-foreground/50">
                    How much can you earn?
                  </p>
                  <p className="mt-3 text-xs text-primary-foreground/40">
                    Free estimate in 2 minutes
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-teal">
                    Get Estimate
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/50"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-teal" /> 12,400+ valuations
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gold" /> 45+ cities
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-soft-blue" /> 100% Free
            </span>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container py-20">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">
            Simple Process
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl">
            How it works
          </h2>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
          {[
            {
              icon: ClipboardList,
              title: "Enter property details",
              desc: "Tell us about your property: type, location, size, and features.",
              step: "01",
            },
            {
              icon: BarChart3,
              title: "Get instant estimate",
              desc: "Our AI analyzes thousands of listings and recent sales in your area.",
              step: "02",
            },
            {
              icon: UserCheck,
              title: "Find the best professional",
              desc: "Connect with top-rated local agents or property managers.",
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

      {/* Stats */}
      <section className="border-y border-border bg-muted/50 py-16">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          <StatCard icon={BarChart3} value="12,400+" label="Valuations completed" delay={0} />
          <StatCard icon={MapPin} value="45+" label="Cities covered" delay={0.1} />
          <StatCard icon={UserCheck} value="320+" label="Verified professionals" delay={0.2} />
          <StatCard icon={Shield} value="98%" label="Customer satisfaction" delay={0.3} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-20">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">
            Trusted by Owners
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl">
            What property owners say
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
            quote="Very professional service. The rental estimate helped us set the right price for our holiday villa in Ibiza."
            name="Anna S."
            location="Ibiza"
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

      {/* Coverage */}
      <section className="container pb-20">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">
            Coverage
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl">
            Active across Spain
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            From the Costa del Sol to the Balearic Islands, we cover the most
            popular areas for international property owners.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4"
        >
          {[
            "Costa del Sol",
            "Balearic Islands",
            "Costa Blanca",
            "Barcelona",
            "Madrid",
            "Canary Islands",
            "Valencia",
            "Málaga",
          ].map((zone) => (
            <div
              key={zone}
              className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-medium text-foreground shadow-sm"
            >
              <MapPin className="mx-auto mb-1 h-4 w-4 text-teal" />
              {zone}
            </div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <CTABanner
          title="Ready to find out what your property is worth?"
          subtitle="Get a free, AI-powered valuation in just 2 minutes."
          buttonText="Start Now"
          href="/sell/valuation"
        />
      </section>

      <Footer />
    </div>
  );
};

export default Index;

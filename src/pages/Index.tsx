import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <Navbar />

      <div className="max-w-[1400px] mx-auto grid gap-[1px] bg-border border border-border md:grid-cols-2 mb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-br from-primary to-navy-deep p-12 md:p-16 flex flex-col justify-between"
        >
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-6">
              ValoraCasa
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-normal leading-[1.1] tracking-[-0.02em] text-primary-foreground mb-6">
              What is your property<br />in Spain <span className="text-soft-blue">really worth?</span>
            </h1>
            <p className="text-primary-foreground/60 leading-relaxed max-w-md">
              Free AI-powered valuations and rental income estimates — based on real market data from thousands of listings.
            </p>
          </div>
          <div className="flex gap-8 mt-12 text-sm text-primary-foreground/40">
            <span>Est. 2024</span>
            <span>Coverage: 45+ Cities</span>
          </div>
        </motion.div>

        <div className="grid grid-rows-2 gap-[1px] bg-border">
          <Link to="/sell" className="group bg-card p-8 md:p-12 relative transition-colors hover:bg-muted flex flex-col justify-center">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-soft-blue" />
            <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-2">I want to</p>
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground mb-3">Sell my property</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">Get a free AI-powered property valuation in 2 minutes</p>
            <div className="flex items-center gap-1 text-sm font-medium text-soft-blue">
              Get Free Valuation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
          <Link to="/rent" className="group bg-card p-8 md:p-12 relative transition-colors hover:bg-muted flex flex-col justify-center">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />
            <p className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-2">I want to</p>
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground mb-3">Rent my property</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">Find out your rental income — short-term and long-term</p>
            <div className="flex items-center gap-1 text-sm font-medium text-accent">
              Get Rental Estimate <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;

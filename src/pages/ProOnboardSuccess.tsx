import { useEffect } from "react";
import { useSEO } from "@/hooks/use-seo";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PartyPopper, ArrowRight, Eye, CreditCard, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ConfettiAnimation from "@/components/shared/ConfettiAnimation";

const ProOnboardSuccess = () => {
  const [params] = useSearchParams();
  const slug = params.get("slug") || "your-agency";

  useSEO({ title: "Welcome to ValoraCasa!", description: "Your agency profile is live. Start receiving qualified leads." });

  return (
    <div className="min-h-screen bg-background">
      <ConfettiAnimation />
      <Navbar />
      <div className="max-w-[540px] mx-auto px-6 py-16 md:py-24 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.6 }}>
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <PartyPopper className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Welcome to ValoraCasa!</h1>
          <p className="text-muted-foreground mb-10">
            Your profile is now live. Check your email to verify your account.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 text-left bg-card rounded-2xl border p-6 mb-8"
        >
          <h2 className="font-heading font-bold text-lg mb-4">Next steps</h2>
          <Link to={`/agentes/${slug}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">View your profile</div>
              <div className="text-xs text-muted-foreground">See how sellers will find you</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <Link to="/pro" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Choose your plan</div>
              <div className="text-xs text-muted-foreground">Free for 30 days — upgrade anytime</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        </motion.div>

        <p className="text-xs text-muted-foreground">
          Your profile: <span className="font-mono text-foreground">valoracasa.com/agentes/{slug}</span>
        </p>
      </div>
    </div>
  );
};

export default ProOnboardSuccess;

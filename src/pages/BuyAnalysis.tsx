import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Search, ArrowRight, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { name: "Idealista", pattern: "idealista" },
  { name: "Fotocasa", pattern: "fotocasa" },
  { name: "Kyero", pattern: "kyero" },
  { name: "SpainHouses", pattern: "spainhouses" },
];

const LOADING_MESSAGES = [
  "Fetching property details...",
  "Scanning the local market...",
  "Comparing with similar properties...",
  "Calculating fair market value...",
  "Preparing your analysis...",
];

function detectPlatform(url: string): string | null {
  const lower = url.toLowerCase();
  for (const p of PLATFORMS) {
    if (lower.includes(p.pattern)) return p.name;
  }
  return null;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const BuyAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const detectedPlatform = url.length > 10 ? detectPlatform(url) : null;
  const urlValid = url.length > 10 && isValidUrl(url);

  useEffect(() => {
    document.title = "Buy Analysis | ValoraCasa";
  }, []);

  // Simulated progress
  useEffect(() => {
    if (!loading) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 8 + 2;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = useCallback(async () => {
    if (!urlValid) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-listing", {
        body: { url },
      });

      if (fnError) throw fnError;

      if (data?.status === "error") {
        setError(data.message || "Could not analyze this listing. Try a different URL.");
        setLoading(false);
        return;
      }

      if (data?.analysis_id) {
        setProgress(100);
        setTimeout(() => navigate(`/buy/result/${data.analysis_id}`), 500);
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [url, urlValid, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <Navbar />

      {loading && (
        <LoadingOverlay
          simulatedProgress={Math.min(progress, 95)}
          title="Analyzing this property..."
        />
      )}

      <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col">
        {/* Hero */}
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center gap-4 max-w-2xl"
          >
            <span className="px-5 py-2 rounded-full text-sm font-medium tracking-wide bg-[hsl(var(--buy-light))] text-[hsl(var(--buy-foreground))]">
              Free Price Analysis
            </span>

            <h1 className="font-sans text-4xl md:text-7xl font-black uppercase tracking-tight text-foreground leading-[1.05]">
              Is this property<br />
              <span className="font-['DM_Serif_Display'] italic normal-case">worth the price</span>?
            </h1>

            <p className="font-['DM_Serif_Display'] italic text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed">
              Paste a listing link and we'll compare it to the market
            </p>

            {/* URL Input */}
            <div className="w-full max-w-xl mt-6">
              <div className="relative">
                <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(null); }}
                  placeholder="https://www.idealista.com/inmueble/12345678/"
                  className="pl-11 pr-4 py-6 text-base rounded-2xl border-2 border-border focus:border-[hsl(var(--buy))] bg-card"
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                />
                {detectedPlatform && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[hsl(var(--buy-foreground))] bg-[hsl(var(--buy-light))] px-2 py-1 rounded-full">
                    {detectedPlatform}
                  </span>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-3 text-destructive text-sm"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={!urlValid || loading}
                className="w-full mt-4 py-6 text-base font-semibold rounded-2xl bg-[hsl(var(--buy))] text-[hsl(var(--buy-foreground))] hover:bg-[hsl(var(--buy))/0.9]"
              >
                Analyze Property
                <ArrowRight size={18} className="ml-2" />
              </Button>

              {/* Supported platforms */}
              <div className="flex items-center justify-center gap-4 mt-6">
                {PLATFORMS.map((p) => (
                  <span
                    key={p.name}
                    className={cn(
                      "text-xs font-medium transition-colors",
                      detectedPlatform === p.name
                        ? "text-[hsl(var(--buy-foreground))]"
                        : "text-muted-foreground/50"
                    )}
                  >
                    {p.name}
                  </span>
                ))}
              </div>

              <p className="text-xs text-muted-foreground/50 text-center mt-4">
                Free analysis in under 10 seconds · No account required
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BuyAnalysis;

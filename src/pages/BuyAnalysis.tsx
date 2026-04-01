import React, { useState, useCallback, useEffect } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { name: "Idealista", pattern: "idealista" },
  { name: "Fotocasa", pattern: "fotocasa" },
  { name: "Kyero", pattern: "kyero" },
  { name: "SpainHouses", pattern: "spainhouses" },
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

interface UrlInputProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  onClearError?: () => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ label, value, onChange, onClearError }) => {
  const detected = value.length > 10 ? detectPlatform(value) : null;
  return (
    <div className="w-full">
      {label && <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>}
      <div className="relative">
        <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="url"
          value={value}
          onChange={(e) => { onChange(e.target.value); onClearError?.(); }}
          placeholder="https://www.idealista.com/inmueble/12345678/"
          className="pl-11 pr-4 py-6 text-base rounded-2xl border-2 border-border focus:border-[hsl(var(--buy))] bg-card"
        />
        {detected && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[hsl(var(--buy-foreground))] bg-[hsl(var(--buy-light))] px-2 py-1 rounded-full">
            {detected}
          </span>
        )}
      </div>
    </div>
  );
};

const BuyAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"single" | "compare">("single");
  const [url, setUrl] = useState("");
  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const urlValid = url.length > 10 && isValidUrl(url);
  const compareValid = urlA.length > 10 && isValidUrl(urlA) && urlB.length > 10 && isValidUrl(urlB);

  useSEO({ title: "Buy Analysis | ValoraCasa", description: "Analyze any property listing to see if the price is fair." });

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
      const { data, error: fnError } = await supabase.functions.invoke("analyze-listing", { body: { url } });
      if (fnError) throw fnError;
      if (data?.status === "error") {
        setError(data.message || "Could not analyze this listing.");
        setLoading(false);
        return;
      }
      if (data?.analysis_id) {
        setProgress(100);
        setTimeout(() => navigate(`/buy/result/${data.analysis_id}`), 500);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [url, urlValid, navigate]);

  const handleCompare = useCallback(async () => {
    if (!compareValid) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("compare-listings", {
        body: { url_a: urlA, url_b: urlB },
      });
      if (fnError) throw fnError;
      if (data?.comparison_id) {
        setProgress(100);
        setTimeout(() => navigate(`/buy/compare/${data.comparison_id}`), 500);
      } else {
        setError(data?.error || "Could not compare these listings.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [urlA, urlB, compareValid, navigate]);

  const loadingTitle = mode === "compare" ? "Comparing properties..." : "Analyzing this property...";

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <Navbar />

      {loading && <LoadingOverlay simulatedProgress={Math.min(progress, 95)} title={loadingTitle} />}

      <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col">
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
              {mode === "compare"
                ? "Paste two listing links and we'll compare them"
                : "Paste a listing link and we'll compare it to the market"}
            </p>

            {/* Mode toggle */}
            <Tabs value={mode} onValueChange={(v) => { setMode(v as "single" | "compare"); setError(null); }} className="mt-2">
              <TabsList className="bg-muted/60">
                <TabsTrigger value="single" className="text-sm">Analyze One</TabsTrigger>
                <TabsTrigger value="compare" className="text-sm">Compare Two</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Inputs */}
            <div className="w-full max-w-xl mt-4">
              <AnimatePresence mode="wait">
                {mode === "single" ? (
                  <motion.div key="single" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                    <UrlInput
                      value={url}
                      onChange={setUrl}
                      onClearError={() => setError(null)}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="compare" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-3">
                    <UrlInput label="Property A" value={urlA} onChange={setUrlA} onClearError={() => setError(null)} />
                    <UrlInput label="Property B" value={urlB} onChange={setUrlB} onClearError={() => setError(null)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-3 text-destructive text-sm">
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}

              {mode === "single" ? (
                <Button
                  onClick={handleAnalyze}
                  disabled={!urlValid || loading}
                  className="w-full mt-4 py-6 text-base font-semibold rounded-2xl bg-[hsl(var(--buy))] text-[hsl(var(--buy-foreground))] hover:bg-[hsl(var(--buy))]/90"
                >
                  Analyze Property <ArrowRight size={18} className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompare}
                  disabled={!compareValid || loading}
                  className="w-full mt-4 py-6 text-base font-semibold rounded-2xl bg-[hsl(var(--buy))] text-[hsl(var(--buy-foreground))] hover:bg-[hsl(var(--buy))]/90"
                >
                  Compare Properties <ArrowRight size={18} className="ml-2" />
                </Button>
              )}

              {/* Supported platforms */}
              <div className="flex items-center justify-center gap-4 mt-6">
                {PLATFORMS.map((p) => {
                  const active = mode === "single"
                    ? detectPlatform(url) === p.name
                    : detectPlatform(urlA) === p.name || detectPlatform(urlB) === p.name;
                  return (
                    <span key={p.name} className={cn("text-xs font-medium transition-colors", active ? "text-[hsl(var(--buy-foreground))]" : "text-muted-foreground/50")}>
                      {p.name}
                    </span>
                  );
                })}
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

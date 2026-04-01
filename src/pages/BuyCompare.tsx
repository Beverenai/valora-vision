import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/use-seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Trophy, Equal, ExternalLink, Home } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import PageLoadingFallback from "@/components/shared/PageLoadingFallback";

function formatPrice(n: number | null | undefined): string {
  if (!n) return "—";
  return "€" + n.toLocaleString("en-US");
}

function scoreLabel(score: string | null): string {
  if (!score) return "N/A";
  return score.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const BuyCompare: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  useSEO({ title: "Property Comparison | ValoraCasa", description: "Side-by-side property comparison" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["buy-comparison", id],
    queryFn: async () => {
      const { data: comp, error: compErr } = await supabase
        .from("buy_comparisons")
        .select("*")
        .eq("id", id!)
        .single();
      if (compErr) throw compErr;

      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from("buy_analyses").select("*").eq("id", comp.analysis_a_id!).single(),
        supabase.from("buy_analyses").select("*").eq("id", comp.analysis_b_id!).single(),
      ]);

      return { comparison: comp, analysisA: a, analysisB: b };
    },
    enabled: !!id,
  });

  if (isLoading) return <PageLoadingFallback />;
  if (error || !data?.comparison) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Comparison not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { comparison, analysisA, analysisB } = data;
  const winner = comparison.ai_winner;
  const points = (comparison.ai_comparison_points as any)?.comparison_points || [];
  const recommendation = (comparison.ai_comparison_points as any)?.recommendation || "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="max-w-[1400px] mx-auto w-full flex-1 px-5 md:px-8 py-10 md:py-16">
        {/* Back */}
        <Link to="/buy" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} /> Back to analysis
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge className="mb-4 bg-[hsl(var(--buy-light))] text-[hsl(var(--buy-foreground))]">
            Property Comparison
          </Badge>
          <h1 className="font-sans text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground leading-tight">
            Property A <span className="text-muted-foreground font-normal lowercase italic font-['DM_Serif_Display']">vs</span> Property B
          </h1>
          {comparison.ai_comparison && (
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto font-['DM_Serif_Display'] italic text-lg">
              {comparison.ai_comparison}
            </p>
          )}
        </motion.div>

        {/* Winner badge */}
        {winner && winner !== "tie" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--buy))] text-white font-semibold text-sm">
              <Trophy size={16} />
              Property {winner.toUpperCase()} offers better value
            </div>
          </motion.div>
        )}
        {winner === "tie" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
              <Equal size={16} />
              Both properties offer similar value
            </div>
          </motion.div>
        )}

        {/* Side-by-side cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            { label: "A", analysis: analysisA, isWinner: winner === "a" },
            { label: "B", analysis: analysisB, isWinner: winner === "b" },
          ].map(({ label, analysis, isWinner }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: label === "A" ? 0.1 : 0.2 }}>
              <Card className={cn("relative overflow-hidden", isWinner && "ring-2 ring-[hsl(var(--buy))]")}>
                {isWinner && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-[hsl(var(--buy))] text-white"><Trophy size={12} className="mr-1" /> Best Value</Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Property {label}</div>
                  <CardTitle className="text-lg leading-tight">{analysis?.address || "Unknown address"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{analysis?.city || ""}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis?.thumbnail_url && (
                    <img src={analysis.thumbnail_url} alt="" className="w-full h-40 object-cover rounded-lg" />
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Asking Price</p>
                      <p className="text-xl font-bold">{formatPrice(analysis?.asking_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated Value</p>
                      <p className="text-xl font-bold text-[hsl(var(--buy))]">{formatPrice(analysis?.estimated_value)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="font-semibold">{analysis?.size_m2 ? `${analysis.size_m2} m²` : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rooms</p>
                      <p className="font-semibold">{analysis?.rooms || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Price/m²</p>
                      <p className="font-semibold">{formatPrice(analysis?.asking_price_per_m2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Price Score</p>
                      <Badge variant="outline" className="text-xs">{scoreLabel(analysis?.price_score)}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {analysis?.price_deviation_percent != null
                        ? `${Number(analysis.price_deviation_percent) > 0 ? "+" : ""}${Number(analysis.price_deviation_percent).toFixed(1)}% vs market`
                        : ""}
                    </span>
                    <Link to={`/buy/result/${analysis?.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs gap-1">
                        Full Report <ArrowRight size={12} />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Comparison points */}
        {points.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-xl">Detailed Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {points.map((point: any, i: number) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start py-3 border-b last:border-0">
                      <div className={cn("text-sm", point.advantage === "a" && "font-semibold text-[hsl(var(--buy))]")}>
                        {point.property_a}
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{point.category}</span>
                        {point.advantage !== "tie" && (
                          <span className="text-xs mt-1 text-[hsl(var(--buy))]">
                            {point.advantage === "a" ? "← A" : "B →"}
                          </span>
                        )}
                      </div>
                      <div className={cn("text-sm text-right", point.advantage === "b" && "font-semibold text-[hsl(var(--buy))]")}>
                        {point.property_b}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recommendation */}
        {recommendation && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-[hsl(var(--buy-light))] border-[hsl(var(--buy))]/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-[hsl(var(--buy-foreground))] mb-2">Our Assessment</h3>
                <p className="text-sm text-[hsl(var(--buy-foreground))]">{recommendation}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BuyCompare;

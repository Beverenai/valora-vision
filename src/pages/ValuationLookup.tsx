import { useState } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ValuationLookup = () => {
  useSEO({ title: "Look Up Your Valuation | ValoraCasa", description: "Retrieve a previous valuation using your reference code." });
  const [refCode, setRefCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const parseRefCode = (code: string): string | null => {
    const cleaned = code.trim().toUpperCase().replace(/^VC-/, "");
    const parts = cleaned.replace(/-/g, "");
    if (parts.length < 4) return null;
    return parts.toLowerCase();
  };

  const handleLookup = async () => {
    const prefix = parseRefCode(refCode);
    if (!prefix) {
      toast({ title: "Invalid code", description: "Enter a valid reference code like VC-A1B2-C3D4", variant: "destructive" });
      return;
    }

    setIsSearching(true);

    try {
      // Search sell leads
      const { data: sellLeads } = await supabase
        .from("leads_sell")
        .select("id")
        .ilike("id", `${prefix}%`)
        .limit(1);

      if (sellLeads && sellLeads.length > 0) {
        navigate(`/sell/result/${sellLeads[0].id}`);
        return;
      }

      // Search rent leads
      const { data: rentLeads } = await supabase
        .from("leads_rent")
        .select("id")
        .ilike("id", `${prefix}%`)
        .limit(1);

      if (rentLeads && rentLeads.length > 0) {
        navigate(`/rent/result/${rentLeads[0].id}`);
        return;
      }

      toast({ title: "Not found", description: "No valuation found with that reference code.", variant: "destructive" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="max-w-md w-full flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Search size={28} className="text-primary" />
          </div>
          <h1 className="font-['DM_Serif_Display'] text-3xl text-foreground">
            Find your valuation
          </h1>
          <p className="text-muted-foreground">
            Enter the reference code from your valuation report to view your results again.
          </p>
          <div className="w-full flex gap-2">
            <Input
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              placeholder="e.g. VC-A1B2-C3D4"
              className="text-center text-lg tracking-wider uppercase"
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
            <Button onClick={handleLookup} disabled={isSearching || !refCode.trim()} className="gap-1.5 shrink-0">
              {isSearching ? "..." : <><span>Go</span><ArrowRight size={16} /></>}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/60">
            Your reference code was shown on your valuation result page
          </p>
        </div>
      </main>
    </div>
  );
};

export default ValuationLookup;

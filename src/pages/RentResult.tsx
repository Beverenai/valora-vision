import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConfettiAnimation from "@/components/shared/ConfettiAnimation";
import ValuationTicketCard from "@/components/result/ValuationTicketCard";
import CrossSellBanner from "@/components/CrossSellBanner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fmt = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const RentResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Your Rental Estimate | ValoraCasa";
  }, []);

  useEffect(() => {
    if (!id) { navigate("/rent"); return; }
    const fetchLead = async () => {
      const { data, error } = await supabase
        .from("leads_rent")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Not Found", description: "Estimate not found.", variant: "destructive" });
        navigate("/rent");
        return;
      }
      setLead(data);
      setLoading(false);
    };
    fetchLead();
  }, [id, navigate, toast]);

  const monthlyEstimate = lead?.monthly_long_term_estimate || 2500;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "My Rental Estimate", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!", description: "Share this link with others." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-pulse text-muted-foreground">Loading your estimate...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ConfettiAnimation />
      <div className="max-w-[1400px] mx-auto border-x border-border">
        <ValuationTicketCard
          address={lead ? `${lead.address}${lead.city ? `, ${lead.city}` : ""}` : ""}
          city={lead?.city || undefined}
          estimatedValue={`${fmt(monthlyEstimate)}/mo`}
          secondaryValue={lead?.annual_income_estimate ? fmt(lead.annual_income_estimate) + "/yr" : undefined}
          propertyType={lead?.property_type || undefined}
          leadId={id!}
          headline="ESTIMATED"
          subtitle="Your Rental Income"
          summaryText="Your property's rental potential has been analysed using comparable listings, seasonal demand patterns, and local market data. Scroll down for the full breakdown."
          accentType="rent"
          onShare={handleShare}
          onDownload={() => toast({ title: "Coming Soon", description: "PDF download will be available shortly." })}
        />

        {/* Cross-sell: Sell */}
        <div className="p-6 md:p-10">
          <CrossSellBanner variant="rent-to-sell" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RentResult;

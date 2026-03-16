import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Footer from "@/components/Footer";
import ValuationTicketCard from "@/components/ValuationTicketCard";
import CardRevealWrapper from "@/components/shared/CardRevealWrapper";
import CrossSellBanner from "@/components/CrossSellBanner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatRefCode } from "@/utils/referenceCode";
import { Copy, Check as CheckIcon } from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const RefCodeBadge: React.FC<{ refCode: string }> = ({ refCode }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-md font-mono text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">
      {refCode}
      {copied ? <CheckIcon size={12} className="text-accent" /> : <Copy size={12} className="text-muted-foreground" />}
    </button>
  );
};

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
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const fetchLead = async () => {
      const { data, error } = await supabase
        .from("leads_rent")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast({ title: "Not Found", description: "Estimate not found.", variant: "destructive" });
        navigate("/rent");
        return;
      }
      setLead(data);

      if (data.status === "processing" || data.status === "pending") {
        pollTimer = setTimeout(fetchLead, 2000);
      } else {
        setLoading(false);
      }
    };
    fetchLead();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [id, navigate, toast]);

  const monthlyEstimate = lead?.monthly_long_term_estimate || 2500;

  const handleShare = () => {
    const shareText = `My property at ${lead?.address || ""}${lead?.city ? `, ${lead.city}` : ""} could earn ${fmt(monthlyEstimate)}/mo in rental income.`;
    if (navigator.share) {
      navigator.share({ title: `Rental Estimate – ${lead?.address || ""}`, text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      toast({ title: "Link copied!", description: "Estimate details copied to clipboard." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-32">
          <div className="animate-pulse text-muted-foreground">Loading your estimate...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const cardElement = (
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
      mode="result"
      referenceCode={formatRefCode(id!)}
      onShare={handleShare}
      onDownload={() => toast({ title: "Coming Soon", description: "PDF download will be available shortly." })}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <CardRevealWrapper accentType="rent" cardElement={cardElement} loading={loading}>
        <div className="max-w-[1400px] mx-auto border-x border-border">
          {/* Reference code badge */}
          <div className="flex items-center justify-center gap-3 py-4 border-b border-border">
            <p className="text-xs text-muted-foreground">Return to this valuation anytime with reference code</p>
            <RefCodeBadge refCode={formatRefCode(id!)} />
          </div>

          {/* Cross-sell: Sell */}
          <div className="p-6 md:p-10">
            <CrossSellBanner variant="rent-to-sell" />
          </div>
        </div>
      </CardRevealWrapper>
      <Footer />
    </div>
  );
};

export default RentResult;

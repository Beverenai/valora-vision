// SellResult page
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConfettiAnimation from "@/components/shared/ConfettiAnimation";
import ValuationHero from "@/components/result/ValuationHero";
import PropertySummaryCard from "@/components/result/PropertySummaryCard";
import ValuationResultCard from "@/components/result/ValuationResultCard";
import AIAnalysisSection from "@/components/result/AIAnalysisSection";
import MarketTrendsSection from "@/components/result/MarketTrendsSection";
import ProfessionalSpotlight from "@/components/result/ProfessionalSpotlight";
import FeedbackSection from "@/components/result/FeedbackSection";
import ValuationDisclaimer from "@/components/result/ValuationDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PRICE_TREND_DATA = [
  { month: "Apr '25", price: 3800 }, { month: "May '25", price: 3850 },
  { month: "Jun '25", price: 3920 }, { month: "Jul '25", price: 4010 },
  { month: "Aug '25", price: 4050 }, { month: "Sep '25", price: 3980 },
  { month: "Oct '25", price: 4020 }, { month: "Nov '25", price: 4060 },
  { month: "Dec '25", price: 4000 }, { month: "Jan '26", price: 4080 },
  { month: "Feb '26", price: 4120 }, { month: "Mar '26", price: 4180 },
];

const MOCK_ANALYSIS = `Your 4-bedroom modern villa in Marbella presents strong value fundamentals. The south-facing orientation maximises natural light and is highly sought-after among international buyers, adding a premium of approximately 8–12% compared to north-facing equivalents. The sea views further enhance desirability, placing your property in the upper tier of comparable listings.

With 250 m² of built area on a 500 m² plot, the property offers a competitive size-to-plot ratio. The good condition minimises immediate renovation costs for buyers, which typically translates into faster sales timelines. Properties in similar condition in your area have averaged 4.2 months on the market.

The inclusion of a private swimming pool and garage adds an estimated €80,000–€120,000 to the overall valuation. Energy certificate rating and year of construction are factored into the long-term maintenance cost projections that sophisticated buyers increasingly consider.`;

const MOCK_TRENDS = `The Costa del Sol property market continues its upward trajectory into 2026, with average prices in Marbella rising 7.3% year-on-year. International demand — particularly from Northern European, Middle Eastern, and North American buyers — remains robust, supported by Spain's Golden Visa programme and favourable lifestyle factors.

Inventory levels in the premium villa segment remain constrained, with only 3.8 months of supply available in Marbella's Golden Mile and surrounding areas. This supply-demand imbalance supports continued price appreciation, though the rate of increase is moderating from the post-pandemic highs of 2022–2023.

New construction activity is focused on boutique developments, while resale villas with modern finishes and sea views continue to command premiums. The rental market also remains strong, with luxury properties achieving gross yields of 4.5–6.2%, making dual-use (personal + rental) an attractive proposition for investors.`;

const MOCK_SERVICES = [
  "Professional photography & drone",
  "3D Matterport virtual tours",
  "International portal marketing",
  "Expert pricing strategy",
  "Full legal & paperwork support",
  "Dedicated personal agent",
];

interface LeadData {
  id: string;
  address: string;
  city: string | null;
  property_type: string | null;
  built_size_sqm: number | null;
  plot_size_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  orientation: string | null;
  condition: string | null;
  views: string | null;
  year_built: number | null;
  energy_certificate: string | null;
  estimated_value: number | null;
  price_range_low: number | null;
  price_range_high: number | null;
  monthly_rental_estimate: number | null;
  analysis: string | null;
  market_trends: string | null;
  features: string | null;
}

const SellResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => { document.title = "Your Property Valuation | ValoraCasa"; }, []);

  useEffect(() => {
    if (!id) { navigate("/sell"); return; }
    const fetchLead = async () => {
      const { data, error } = await supabase
        .from("leads_sell")
        .select("id, address, city, property_type, built_size_sqm, plot_size_sqm, bedrooms, bathrooms, orientation, condition, views, year_built, energy_certificate, estimated_value, price_range_low, price_range_high, monthly_rental_estimate, analysis, market_trends, features")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Not Found", description: "Valuation not found.", variant: "destructive" });
        navigate("/sell");
        return;
      }
      setLead(data);
      setLoading(false);
    };
    fetchLead();
  }, [id, navigate, toast]);

  const builtSize = lead?.built_size_sqm || 200;
  const basePricePerSqm = 4100;
  const estimatedLow = lead?.price_range_low || Math.round(builtSize * basePricePerSqm * 0.9);
  const estimatedHigh = lead?.price_range_high || Math.round(builtSize * basePricePerSqm * 1.1);
  const monthlyRentalLow = lead?.monthly_rental_estimate || Math.round(estimatedLow * 0.004);
  const monthlyRentalHigh = Math.round(monthlyRentalLow * 1.5);
  const weeklyHighLow = Math.round(monthlyRentalLow * 0.85);
  const weeklyHighHigh = Math.round(monthlyRentalHigh * 0.75);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "My Property Valuation", url: window.location.href });
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
          <div className="animate-pulse text-muted-foreground">Loading your valuation...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {showConfetti && <ConfettiAnimation />}

      <div className="max-w-[1400px] mx-auto border-x border-border">
        <ValuationHero
          title="Your Property Valuation"
          address={lead ? `${lead.address}${lead.city ? `, ${lead.city}` : ""}` : ""}
          onShare={handleShare}
          onDownload={() => toast({ title: "Coming Soon", description: "PDF download will be available shortly." })}
        />

        <PropertySummaryCard
          bedrooms={lead?.bedrooms}
          bathrooms={lead?.bathrooms}
          builtSize={lead?.built_size_sqm}
          plotSize={lead?.plot_size_sqm}
          orientation={lead?.orientation}
          condition={lead?.condition}
          views={lead?.views}
          yearBuilt={lead?.year_built}
          energyCertificate={lead?.energy_certificate}
          propertyType={lead?.property_type}
        />

        <ValuationResultCard
          estimatedLow={estimatedLow}
          estimatedHigh={estimatedHigh}
          monthlyRentalLow={monthlyRentalLow}
          monthlyRentalHigh={monthlyRentalHigh}
          weeklyHighSeasonLow={weeklyHighLow}
          weeklyHighSeasonHigh={weeklyHighHigh}
          comparableCount={47}
          city={lead?.city || undefined}
        />

        <AIAnalysisSection content={lead?.analysis || MOCK_ANALYSIS} />

        <MarketTrendsSection
          content={lead?.market_trends || MOCK_TRENDS}
          chartData={PRICE_TREND_DATA}
        />

        <ProfessionalSpotlight
          companyName="Costa Del Sol Premium Realty"
          tagline="Full-service luxury property experts since 2005"
          rating={5}
          reviewCount={127}
          services={MOCK_SERVICES}
          quote="We look forward to helping you achieve the best possible result for your property."
          onContact={() => toast({ title: "Contact Requested", description: "The agent will reach out to you shortly." })}
          onViewProfile={() => toast({ title: "Coming Soon", description: "Agent profiles are coming soon." })}
        />

        <FeedbackSection leadId={id!} leadType="sell" />

        <ValuationDisclaimer />
      </div>

      <Footer />
    </div>
  );
};

export default SellResult;

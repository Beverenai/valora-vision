import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CrossSellBanner from "@/components/CrossSellBanner";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const RentResult: React.FC = () => {
  const { id } = useParams();

  useEffect(() => {
    document.title = "Your Rental Estimate | ValoraCasa";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Your Rental Estimate
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            This is a placeholder for the rent result page. The full rental income display with seasonal analysis,
            comparable rentals, and property managers will be built in Phase 5.
          </p>
          <p className="text-sm text-muted-foreground font-mono">Estimate ID: {id}</p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild variant="outline">
              <Link to="/rent/valuation">New Estimate</Link>
            </Button>
            <Button asChild>
              <Link to="/sell">
                Get Sale Valuation <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Cross-sell: Sell */}
        <div className="mt-12">
          <CrossSellBanner variant="rent-to-sell" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RentResult;

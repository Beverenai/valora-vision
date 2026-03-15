import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const SellResult: React.FC = () => {
  const { id } = useParams();

  useEffect(() => {
    document.title = "Your Property Valuation | ValoraCasa";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Your Property Valuation
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            This is a placeholder for the sell result page. The full valuation display with comparable properties,
            price trends, and recommended agents will be built in Phase 5.
          </p>
          <p className="text-sm text-muted-foreground font-mono">Valuation ID: {id}</p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild variant="outline">
              <Link to="/sell/valuation">New Valuation</Link>
            </Button>
            <Button asChild>
              <Link to="/rent">
                Get Rental Estimate <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellResult;

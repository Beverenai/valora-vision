import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";

export default function ComingSoon() {
  useSEO({ title: "Rental Valuations Coming Soon | ValoraCasa", description: "Rental property valuations are coming soon to ValoraCasa. Try our free sell valuation in the meantime." });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Rental Valuations Coming Soon
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            We're working on bringing rental valuations to ValoraCasa. In the meantime, try our free property sale valuation.
          </p>
          <Button asChild className="rounded-full px-8">
            <Link to="/sell/valuation">
              Try Sell Valuation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, TrendingUp, Users } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  useSEO({ title: "Page Not Found | ValoraCasa", description: "The page you're looking for doesn't exist." });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl font-extrabold text-primary mb-4">404</p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="rounded-full">
              <Link to="/"><Home className="mr-2 h-4 w-4" /> Home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/sell/valuation"><TrendingUp className="mr-2 h-4 w-4" /> Sell Valuation</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/agentes"><Users className="mr-2 h-4 w-4" /> Find an Agent</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;

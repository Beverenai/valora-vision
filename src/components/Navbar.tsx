import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Sell", href: "/sell" },
  { label: "Rent", href: "/rent" },
  { label: "For Professionals", href: "/for-professionals" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy font-heading text-sm font-bold text-primary-foreground">
            V
          </div>
          <span className="font-heading text-xl font-bold text-foreground">
            Valora<span className="text-gold">Casa</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Globe className="h-4 w-4" />
            EN
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button size="sm" className="bg-navy hover:bg-navy/90">
            Get Valuation
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 border-t border-border pt-3">
            <Button size="sm" className="w-full bg-navy hover:bg-navy/90">
              Get Valuation
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

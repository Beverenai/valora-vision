import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const serviceLinks = [
  { id: "sell", label: "Sell", href: "/?mode=sell" },
  { id: "rent", label: "Rent", href: "/?mode=rent" },
  { id: "buy", label: "Buy Analysis", href: "/?mode=buy" },
];

const permanentLinks = [
  { label: "Find an Agent", href: "/agentes" },
  { label: "For Agents", href: "/pro" },
];

const ctaConfig: Record<string, { label: string; href: string }> = {
  sell: { label: "Get Valuation", href: "/?mode=sell" },
  rent: { label: "Estimate Rent", href: "/?mode=rent" },
  buy: { label: "Analyze Price", href: "/?mode=buy" },
};

function detectContext(pathname: string): string | null {
  if (pathname === "/" || pathname.startsWith("/sell")) return "sell";
  if (pathname.startsWith("/rent")) return "rent";
  if (pathname.startsWith("/buy")) return "buy";
  return null;
}

function isProRoute(pathname: string): boolean {
  return pathname.startsWith("/pro");
}

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const context = detectContext(location.pathname);

  const onPro = isProRoute(location.pathname);

  const visibleServiceLinks = context
    ? serviceLinks.filter((l) => l.id !== context)
    : serviceLinks;

  const navLinks = [...visibleServiceLinks, ...permanentLinks];
  const cta = context ? ctaConfig[context] : ctaConfig.sell;

  return (
    <header className="w-full border-b-2 border-primary">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between py-4 px-6 relative">
        <Link to="/" className="flex items-center gap-1">
          <span className="font-heading text-xl font-bold text-foreground">
            Valora<span className="text-gold">Casa</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                location.pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {onPro && (
            <Link
              to="/pro/login"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
          {!onPro && (
            <Link
              to={cta.href}
              className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              {cta.label}
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 z-50 border-b border-border bg-card px-6 pb-4 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={cta.href}
              onClick={() => setMobileOpen(false)}
              className="block mt-2 text-center bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              {cta.label}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

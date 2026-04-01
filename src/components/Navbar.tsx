import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const context = detectContext(location.pathname);
  const onPro = isProRoute(location.pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visibleServiceLinks = context
    ? serviceLinks.filter((l) => l.id !== context)
    : serviceLinks;

  const navLinks = [...visibleServiceLinks, ...permanentLinks];
  const cta = context ? ctaConfig[context] : ctaConfig.sell;

  return (
    <header className={cn(
      "w-full sticky top-0 z-50 transition-all duration-300",
      scrolled ? "bg-brand shadow-lg" : "bg-brand"
    )}>
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-6 relative">
        <Link to="/" className="flex items-center gap-1">
          <span className="font-sans text-xl font-bold text-white">
            Valora<span className="text-[hsl(var(--gold))]">Casa</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm transition-colors hover:text-white",
                location.pathname === link.href
                  ? "text-white font-medium"
                  : "text-white/70"
              )}
            >
              {link.label}
            </Link>
          ))}
          {onPro && (
            <Link
              to="/pro/login"
              className="flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
          {!onPro && (
            <Link
              to={cta.href}
              className="bg-primary text-primary-foreground rounded-[10px] px-5 py-2 text-sm font-semibold hover:bg-primary-hover transition-all hover:-translate-y-[1px] hover:shadow-lg"
            >
              {cta.label}
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 z-50 bg-brand px-6 pb-4 md:hidden shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm text-white/70 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {onPro ? (
              <Link
                to="/pro/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1.5 mt-2 text-center bg-primary text-primary-foreground rounded-[10px] px-5 py-2.5 text-sm font-semibold"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            ) : (
              <Link
                to={cta.href}
                onClick={() => setMobileOpen(false)}
                className="block mt-2 text-center bg-primary text-primary-foreground rounded-[10px] px-5 py-2.5 text-sm font-semibold"
              >
                {cta.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

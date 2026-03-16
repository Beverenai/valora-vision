import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Valuation", href: "/sell/valuation" },
  { label: "Rentals", href: "/rent/valuation" },
  { label: "Lookup", href: "/lookup" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="max-w-[1400px] mx-auto flex items-center justify-between py-4 px-6 border-b-2 border-primary">
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
        <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
          Sign In
        </span>
      </nav>

      {/* Mobile toggle */}
      <button
        className="md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-14 left-0 right-0 z-50 border-b border-border bg-card px-6 pb-4 md:hidden">
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
        </div>
      )}
    </header>
  );
};

export default Navbar;
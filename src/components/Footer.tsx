import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="max-w-[1400px] mx-auto border-t border-border">
    <div className="grid gap-[1px] bg-border md:grid-cols-4">
      <div className="bg-card p-8">
        <span className="font-heading text-lg font-bold text-foreground">
          Valora<span className="text-gold">Casa</span>
        </span>
        <p className="mt-3 text-sm text-muted-foreground">
          Free property valuations and rental estimates for owners in Spain.
        </p>
      </div>
      <div className="bg-card p-8">
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-3">
          Services
        </p>
        <div className="flex flex-col gap-2">
          <Link to="/sell" className="text-sm text-foreground/70 hover:text-foreground">Sell Valuation</Link>
          <Link to="/rent" className="text-sm text-foreground/70 hover:text-foreground">Rental Estimate</Link>
          <Link to="/for-professionals" className="text-sm text-foreground/70 hover:text-foreground">For Professionals</Link>
        </div>
      </div>
      <div className="bg-card p-8">
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-3">
          Company
        </p>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-foreground/70">About Us</span>
          <span className="text-sm text-foreground/70">Blog</span>
          <span className="text-sm text-foreground/70">Contact</span>
        </div>
      </div>
      <div className="bg-card p-8">
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-3">
          Legal
        </p>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-foreground/70">Privacy Policy</span>
          <span className="text-sm text-foreground/70">Terms of Service</span>
          <span className="text-sm text-foreground/70">Cookie Policy</span>
        </div>
      </div>
    </div>
    <div className="bg-card border-t border-border px-8 py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} ValoraCasa. All rights reserved.
    </div>
  </footer>
);

export default Footer;
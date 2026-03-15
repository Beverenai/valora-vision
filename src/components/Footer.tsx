import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-navy text-primary-foreground">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <span className="font-heading text-xl font-bold">
            Valora<span className="text-gold">Casa</span>
          </span>
          <p className="mt-3 text-sm text-primary-foreground/60">
            Free property valuations and rental estimates for owners in Spain.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-primary-foreground/40">
            Services
          </h4>
          <div className="flex flex-col gap-2">
            <Link to="/sell" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">Sell Valuation</Link>
            <Link to="/rent" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">Rental Estimate</Link>
            <Link to="/for-professionals" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">For Professionals</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-primary-foreground/40">
            Company
          </h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-primary-foreground/70">About Us</span>
            <span className="text-sm text-primary-foreground/70">Blog</span>
            <span className="text-sm text-primary-foreground/70">Contact</span>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-primary-foreground/40">
            Legal
          </h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-primary-foreground/70">Privacy Policy</span>
            <span className="text-sm text-primary-foreground/70">Terms of Service</span>
            <span className="text-sm text-primary-foreground/70">Cookie Policy</span>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
        © {new Date().getFullYear()} ValoraCasa. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-brand">
    <div className="max-w-[1400px] mx-auto">
      <div className="grid gap-8 md:grid-cols-4 px-8 py-12">
        <div>
          <span className="font-sans text-lg font-bold text-white">
            Valora<span className="text-[hsl(var(--gold))]">Casa</span>
          </span>
          <p className="mt-3 text-sm text-white/60">
            Free property valuations and rental estimates for owners in Spain.
          </p>
          <p className="mt-4 text-xs text-white/40">Made in Marbella 🇪🇸</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] font-semibold text-white/40 mb-3">
            For Homeowners
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/sell/valuation" className="text-sm text-white/60 hover:text-white transition-colors">Sell Valuation</Link>
            <Link to="/rent/valuation" className="text-sm text-white/60 hover:text-white transition-colors">Rental Valuation</Link>
            <Link to="/buy" className="text-sm text-white/60 hover:text-white transition-colors">Buy Analysis</Link>
            <Link to="/lookup" className="text-sm text-white/60 hover:text-white transition-colors">Lookup Valuation</Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] font-semibold text-white/40 mb-3">
            For Agents
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/agentes" className="text-sm text-white/60 hover:text-white transition-colors">Find an Agent</Link>
            <Link to="/pro" className="text-sm text-white/60 hover:text-white transition-colors">List Your Agency</Link>
            <Link to="/pro/login" className="text-sm text-white/60 hover:text-white transition-colors">Agent Login</Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] font-semibold text-white/40 mb-3">
            Company
          </p>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-white/60">Privacy Policy</span>
            <span className="text-sm text-white/60">Terms of Service</span>
            <span className="text-sm text-white/60">Cookie Policy</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-8 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} ValoraCasa · Made in Marbella
      </div>
    </div>
  </footer>
);

export default Footer;

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CrossSellBannerProps {
  variant: "sell-to-rent" | "rent-to-sell";
}

const content = {
  "sell-to-rent": {
    label: "Rental Income",
    title: "Also curious how much you could earn renting?",
    subtitle: "Get a free rental income estimate — short-term and long-term — for the same property.",
    buttonText: "Get Rental Estimate",
    href: "/rent/valuation",
  },
  "rent-to-sell": {
    label: "Property Value",
    title: "Want to know your property's sale value?",
    subtitle: "Get a free AI-powered property valuation based on real market data.",
    buttonText: "Get Sale Valuation",
    href: "/sell/valuation",
  },
};

const CrossSellBanner = ({ variant }: CrossSellBannerProps) => {
  const c = content[variant];
  return (
    <section className="border border-border">
      <div className="bg-gradient-to-br from-primary to-navy-deep p-10 md:p-14">
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-gold mb-3">
          {c.label}
        </p>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
          {c.title}
        </h2>
        <p className="text-primary-foreground/60 max-w-lg text-sm mb-6">
          {c.subtitle}
        </p>
        <Link
          to={c.href}
          className="inline-flex items-center gap-2 bg-gold text-primary px-6 py-3 text-sm font-medium hover:bg-gold-dark transition-colors"
        >
          {c.buttonText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default CrossSellBanner;

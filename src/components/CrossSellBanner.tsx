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
    subtitle: "Get a free property valuation based on real market data.",
    buttonText: "Get Sale Valuation",
    href: "/sell/valuation",
  },
};

const CrossSellBanner = ({ variant }: CrossSellBannerProps) => {
  const c = content[variant];
  return (
    <section>
      <div className="bg-gradient-to-br from-brand to-brand-light p-10 md:p-14 rounded-2xl">
        <p className="text-xs uppercase tracking-[0.15em] font-semibold text-primary-light mb-3">
          {c.label}
        </p>
        <h2 className="font-sans text-2xl md:text-3xl font-bold text-white mb-2">
          {c.title}
        </h2>
        <p className="text-white/60 max-w-lg text-sm mb-6">
          {c.subtitle}
        </p>
        <Link
          to={c.href}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-base font-semibold rounded-[10px] hover:bg-primary-hover transition-all hover:-translate-y-[1px] hover:shadow-lg"
        >
          {c.buttonText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default CrossSellBanner;

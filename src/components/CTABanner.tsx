import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CTABannerProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  href: string;
  variant?: "navy" | "teal";
}

const CTABanner = ({ title, subtitle, buttonText, href }: CTABannerProps) => (
  <section className="border border-border">
    <div className="bg-primary p-12 md:p-16 text-center">
      <h2 className="font-heading text-2xl font-bold text-primary-foreground md:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-lg text-primary-foreground/60 text-sm">{subtitle}</p>
      )}
      <Link
        to={href}
        className="mt-6 inline-flex items-center gap-2 bg-gold text-primary px-8 py-3.5 text-base font-semibold rounded-full hover:bg-gold-dark transition-colors shadow-md"
      >
        {buttonText}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </section>
);

export default CTABanner;
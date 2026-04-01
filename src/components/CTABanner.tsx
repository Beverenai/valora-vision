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
  <section>
    <div className="bg-gradient-to-br from-brand to-brand-light p-12 md:p-16 text-center rounded-2xl">
      <h2 className="font-sans text-2xl font-bold text-white md:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-lg text-white/60 text-sm">{subtitle}</p>
      )}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to={href}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-base font-semibold rounded-[10px] hover:bg-primary-hover transition-all hover:-translate-y-[1px] hover:shadow-lg"
        >
          {buttonText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>
);

export default CTABanner;

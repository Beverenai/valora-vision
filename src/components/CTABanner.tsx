import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTABannerProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  href: string;
  variant?: "navy" | "teal";
}

const CTABanner = ({ title, subtitle, buttonText, href, variant = "navy" }: CTABannerProps) => (
  <section
    className={`rounded-2xl px-8 py-12 text-center ${
      variant === "teal"
        ? "bg-gradient-to-r from-teal to-teal-light"
        : "bg-gradient-to-r from-navy to-navy-deep"
    }`}
  >
    <h2 className="font-heading text-2xl font-bold text-primary-foreground md:text-3xl">
      {title}
    </h2>
    {subtitle && (
      <p className="mx-auto mt-2 max-w-lg text-primary-foreground/70">{subtitle}</p>
    )}
    <Button
      asChild
      size="lg"
      className="mt-6 bg-gold text-navy hover:bg-gold-dark"
    >
      <Link to={href}>
        {buttonText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  </section>
);

export default CTABanner;

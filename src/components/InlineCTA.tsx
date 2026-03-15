import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface InlineCTAProps {
  text: string;
  href: string;
}

const InlineCTA = ({ text, href }: InlineCTAProps) => (
  <div className="max-w-[1400px] mx-auto mb-12">
    <Link
      to={href}
      className="flex items-center justify-center gap-2 bg-primary p-4 text-sm font-medium text-gold hover:bg-navy-deep transition-colors border border-border"
    >
      {text}
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export default InlineCTA;

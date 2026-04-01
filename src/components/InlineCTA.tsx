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
      className="flex items-center justify-center gap-2 bg-brand p-4 text-base font-semibold text-white hover:bg-brand/90 transition-colors rounded-[10px] shadow-md"
    >
      {text}
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export default InlineCTA;

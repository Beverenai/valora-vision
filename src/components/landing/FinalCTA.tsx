import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");

  const handleGetValuation = useCallback(() => {
    const path = "/sell/valuation";
    if (address.trim()) {
      navigate(path, {
        state: {
          addressData: {
            streetAddress: address,
            urbanization: "",
            city: "",
            province: "",
            country: "Spain",
            complex: "",
          },
        },
      });
    } else {
      navigate(path);
    }
  }, [address, navigate]);

  return (
    <section className="py-10 md:py-16 pb-28">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div
          className="rounded-3xl p-6 md:p-12 text-center"
          style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--terracotta-light)) 100%)" }}
        >
          <h2 className="font-['DM_Serif_Display'] text-2xl md:text-4xl text-foreground leading-[1.1] mb-3">
            Ready to discover your
            <br />
            property's true value?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Free, confidential, and takes less than 2 minutes
          </p>

          <div className="max-w-md mx-auto space-y-3">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35">
                <circle cx="10" cy="8" r="4" />
                <path d="M10 12v6" />
              </svg>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your property address..."
                className="w-full rounded-2xl border border-border bg-card pl-11 pr-4 py-4 text-foreground text-sm shadow-sm outline-none transition-shadow focus:shadow-md placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={handleGetValuation}
              className="w-full rounded-2xl px-6 py-4 text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              Get Your Free Valuation
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground/50 mt-6">
            Join 12,400+ property owners who already know their home's worth
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;

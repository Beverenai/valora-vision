import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useFormWizard } from "@/hooks/use-form-wizard";
import { INITIAL_SELL_DATA, SellValuationData } from "@/types/valuation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ValuationTicketCard from "@/components/ValuationTicketCard";
import SellLocationStep from "@/components/sell/SellLocationStep";
import SellDetailsStep from "@/components/sell/SellDetailsStep";
import SellFeaturesStep from "@/components/sell/SellFeaturesStep";
import SellContactStep from "@/components/sell/SellContactStep";
import { Button } from "@/components/ui/button";
import { formatRefCode } from "@/utils/referenceCode";

const SELL_STEPS = [
  { name: "Location", label: "Property Location" },
  { name: "Details", label: "Property Details" },
  { name: "Features", label: "Property Features" },
  { name: "Contact", label: "Contact Information" },
];

const validateSellStep = (step: number, data: SellValuationData): boolean => {
  switch (step) {
    case 0:
      return !!(data.streetAddress || data.city);
    case 1:
      return !!(data.propertyType && data.builtSize && data.bedrooms && data.bathrooms);
    case 2:
      return !!data.condition;
    case 3:
      return !!(data.fullName && data.email && data.phone && data.termsAccepted);
    default:
      return true;
  }
};

const SellValuation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  const addressState = (location.state as { address?: { streetAddress?: string; city?: string; province?: string; country?: string; urbanization?: string }; addressData?: { streetAddress?: string; city?: string; province?: string; country?: string; urbanization?: string } })?.address
    || (location.state as any)?.addressData;

  const initialData = addressState
    ? {
        ...INITIAL_SELL_DATA,
        streetAddress: addressState.streetAddress || "",
        city: addressState.city || "",
        province: addressState.province || "",
        country: addressState.country || "",
        urbanization: addressState.urbanization || "",
      }
    : INITIAL_SELL_DATA;

  useEffect(() => {
    if (addressState?.streetAddress) {
      setIsExpanded(true);
    }
  }, []);

  useEffect(() => {
    document.title = "Free Property Valuation | ValoraCasa";
  }, []);

  const {
    currentStep,
    formData,
    direction,
    handleChange,
    handleNextStep,
    handlePrevStep,
  } = useFormWizard<SellValuationData>({
    steps: SELL_STEPS,
    initialData: initialData,
    validateStep: validateSellStep,
  });

  const startProgressSimulation = useCallback(() => {
    setSimulatedProgress(0);
    let current = 0;
    progressRef.current = setInterval(() => {
      const increment = Math.max(0.5, (90 - current) * 0.08);
      current = Math.min(90, current + increment);
      setSimulatedProgress(current);
      if (current >= 90) {
        if (progressRef.current) clearInterval(progressRef.current);
      }
    }, 300);
  }, []);

  const stopProgressSimulation = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  useEffect(() => {
    return () => stopProgressSimulation();
  }, [stopProgressSimulation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    startProgressSimulation();

    try {
      const bedroomsNum = formData.bedrooms === "8+" ? 8 : parseInt(formData.bedrooms) || null;
      const bathroomsNum = formData.bathrooms === "7+" ? 7 : parseInt(formData.bathrooms) || null;

      const { data, error } = await supabase
        .from("leads_sell")
        .insert({
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone || null,
          address: formData.streetAddress || formData.city || "Unknown",
          city: formData.city || null,
          property_type: formData.propertyType || null,
          built_size_sqm: formData.builtSize ? parseFloat(formData.builtSize) : null,
          plot_size_sqm: formData.plotSize ? parseFloat(formData.plotSize) : null,
          terrace_size_sqm: formData.terraceSize ? parseFloat(formData.terraceSize) : null,
          bedrooms: bedroomsNum,
          bathrooms: bathroomsNum,
          orientation: formData.orientation || null,
          views: formData.views || null,
          condition: formData.condition || null,
          features: [
            formData.hasPool ? "pool" : "",
            formData.hasGarage ? "garage" : "",
            formData.propertyFeatures || "",
          ].filter(Boolean).join(", ") || null,
          year_built: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
          energy_certificate: formData.energyCertificate || null,
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
        })
        .select("id")
        .single();

      if (error) throw error;

      setSubmittedLeadId(data.id);
      setSimulatedProgress(100);
      stopProgressSimulation();

      setTimeout(() => {
        navigate(`/sell/result/${data.id}`);
      }, 600);
    } catch (error) {
      console.error("Failed to submit lead:", error);
      stopProgressSimulation();
      setIsSubmitting(false);
      setSimulatedProgress(0);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContinueFromCard = () => {
    if (formData.streetAddress || formData.city) {
      setIsExpanded(true);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      setIsExpanded(false);
    } else {
      handlePrevStep();
    }
  };

  const isLastStep = currentStep === SELL_STEPS.length - 1;
  const isCurrentStepValid = validateSellStep(currentStep, formData);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <SellLocationStep formData={formData} onChange={handleChange} />;
      case 1:
        return <SellDetailsStep formData={formData} onChange={handleChange} />;
      case 2:
        return <SellFeaturesStep formData={formData} onChange={handleChange} />;
      case 3:
        return <SellContactStep formData={formData} onChange={handleChange} />;
      default:
        return null;
    }
  };

  // Determine card mode
  const cardMode = isSubmitting ? "processing" : isExpanded ? "compact" : "input";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        {/* ── Card: adapts to current stage ── */}
        <div
          className="w-full transition-all duration-500 ease-out"
          style={{
            transform: isExpanded && !isSubmitting ? "scale(0.92)" : "scale(1)",
            opacity: 1,
          }}
        >
          {isSubmitting ? (
            <ValuationTicketCard
              address={formData.streetAddress || ""}
              city={formData.city}
              estimatedValue=""
              propertyType={formData.propertyType || "Villa"}
              leadId={submittedLeadId || "00000000"}
              accentType="sell"
              mode="processing"
              processingProgress={simulatedProgress}
              referenceCode={submittedLeadId ? formatRefCode(submittedLeadId) : undefined}
            />
          ) : isExpanded ? (
            <ValuationTicketCard
              address={formData.streetAddress || ""}
              city={formData.city}
              estimatedValue=""
              propertyType="Villa"
              leadId="a1b2c3d4e5f6"
              accentType="sell"
              addressValue={formData.streetAddress || formData.city}
              mode="compact"
            />
          ) : (
            <ValuationTicketCard
              address=""
              estimatedValue=""
              propertyType="Villa"
              leadId="a1b2c3d4e5f6"
              accentType="sell"
              addressValue={formData.streetAddress}
              onAddressChange={(val) => handleChange("streetAddress", val)}
              onContinue={handleContinueFromCard}
              mode="input"
            />
          )}
        </div>

        {/* ── Form panel: expands below the card ── */}
        {!isSubmitting && (
          <div
            className="w-full max-w-lg mx-auto overflow-hidden transition-all duration-500 ease-out"
            style={{
              maxHeight: isExpanded ? "2000px" : "0px",
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded ? "translateY(0)" : "translateY(-20px)",
            }}
          >
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6 mt-2">
              {SELL_STEPS.map((step, i) => (
                <div key={step.name} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "bg-primary w-6"
                        : i < currentStep
                        ? "bg-primary/60"
                        : "bg-border"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Step label */}
            <h2 className="text-lg font-semibold text-foreground text-center mb-1">
              {SELL_STEPS[currentStep].label}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Step {currentStep + 1} of {SELL_STEPS.length}
            </p>

            {/* Form content */}
            <div className="bg-card rounded-2xl border border-border p-5 md:p-8 shadow-sm animate-fade-in">
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft size={16} />
                Back
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentStepValid || isSubmitting}
                  className="gap-1.5"
                >
                  Get My Free Valuation
                  <Check size={16} />
                </Button>
              ) : (
                <Button
                  onClick={handleNextStep}
                  disabled={!isCurrentStepValid}
                  className="gap-1.5"
                >
                  Next
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Sub-card text when not expanded */}
        {!isExpanded && !isSubmitting && (
          <p className="text-sm text-muted-foreground/60 tracking-wide mt-2 animate-fade-in">
            12,400+ valuations · 100% free · 2 minutes
          </p>
        )}
      </main>

      {/* ── Agent prompt at bottom ── */}
      {!isSubmitting && (
        <footer className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Are you a real estate agent?{" "}
            <Link to="/for-professionals" className="text-primary font-medium hover:underline">
              Sign up here →
            </Link>
          </p>
        </footer>
      )}
    </div>
  );
};

export default SellValuation;

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, MapPin, ArrowDown } from "lucide-react";
import { useFormWizard } from "@/hooks/use-form-wizard";
import { INITIAL_RENT_DATA, RentValuationData } from "@/types/valuation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ValuationTicketCard from "@/components/ValuationTicketCard";
import RentLocationStep from "@/components/rent/RentLocationStep";
import RentDetailsStep from "@/components/rent/RentDetailsStep";
import RentPreferencesStep from "@/components/rent/RentPreferencesStep";
import RentContactStep from "@/components/rent/RentContactStep";
import { Button } from "@/components/ui/button";
import { formatRefCode } from "@/utils/referenceCode";

const RENT_STEPS = [
  { name: "Location", label: "Property Location" },
  { name: "Details", label: "Property Details" },
  { name: "Rental", label: "Rental Preferences" },
  { name: "Contact", label: "Contact Information" },
];

const validateRentStep = (step: number, data: RentValuationData): boolean => {
  switch (step) {
    case 0:
      return !!(data.streetAddress || data.city);
    case 1:
      return !!(data.propertyType && data.builtSize && data.bedrooms && data.bathrooms && data.furnished);
    case 2:
      return !!data.condition;
    case 3:
      return !!(data.fullName && data.email && data.phone && data.termsAccepted);
    default:
      return true;
  }
};

const RentValuation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  const addressState = (location.state as { address?: { streetAddress?: string; city?: string; province?: string; country?: string; urbanization?: string } })?.address;
  const initialData = addressState
    ? {
        ...INITIAL_RENT_DATA,
        streetAddress: addressState.streetAddress || "",
        city: addressState.city || "",
        province: addressState.province || "",
        country: addressState.country || "",
        urbanization: addressState.urbanization || "",
      }
    : INITIAL_RENT_DATA;

  useEffect(() => {
    if (addressState?.streetAddress) {
      setIsExpanded(true);
    }
  }, []);

  useEffect(() => {
    document.title = "Free Rental Estimate | ValoraCasa";
  }, []);

  const {
    currentStep,
    formData,
    direction,
    handleChange,
    handleNextStep,
    handlePrevStep,
  } = useFormWizard<RentValuationData>({
    steps: RENT_STEPS,
    initialData: initialData,
    validateStep: validateRentStep,
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
        .from("leads_rent")
        .insert({
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone || null,
          address: formData.streetAddress || formData.city || "Unknown",
          city: formData.city || null,
          property_type: formData.propertyType || null,
          built_size_sqm: formData.builtSize ? parseFloat(formData.builtSize) : null,
          bedrooms: bedroomsNum,
          bathrooms: bathroomsNum,
          is_furnished: formData.furnished || null,
          views: formData.views || null,
          property_features: formData.propertyFeatures || null,
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
        navigate(`/rent/result/${data.id}`);
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

  const isLastStep = currentStep === RENT_STEPS.length - 1;
  const isCurrentStepValid = validateRentStep(currentStep, formData);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <RentLocationStep formData={formData} onChange={handleChange} onLocationConfirmed={handleNextStep} />;
      case 1:
        return <RentDetailsStep formData={formData} onChange={handleChange} />;
      case 2:
        return <RentPreferencesStep formData={formData} onChange={handleChange} />;
      case 3:
        return <RentContactStep formData={formData} onChange={handleChange} />;
      default:
        return null;
    }
  };

  const accentHsl = "hsl(var(--success))";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        {isSubmitting ? (
          <ValuationTicketCard
            address={formData.streetAddress || ""}
            city={formData.city}
            estimatedValue=""
            propertyType={formData.propertyType || "Villa"}
            leadId={submittedLeadId || "00000000"}
            accentType="rent"
            mode="processing"
            processingProgress={simulatedProgress}
            referenceCode={submittedLeadId ? formatRefCode(submittedLeadId) : undefined}
          />
        ) : isExpanded ? (
          <div className="flex items-center justify-center w-full" style={{ perspective: "800px" }}>
            <div className="relative w-full max-w-[380px] md:max-w-[520px] flex">
              <div className="flex-1 flex flex-col bg-[hsl(36_9%_88%)] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-r-2 border-dashed border-foreground/15">
                {/* Header band */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/10">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--success))] flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {formData.streetAddress || formData.city || "Your property"}
                    </p>
                    {formData.city && formData.streetAddress && (
                      <p className="text-xs text-muted-foreground">{formData.city}</p>
                    )}
                  </div>
                </div>

                <div className="px-4 pt-4 pb-2">
                  <h2 className="text-base font-semibold text-foreground">
                    {RENT_STEPS[currentStep].label}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Step {currentStep + 1} of {RENT_STEPS.length}
                  </p>
                </div>

                <div className="flex-1 px-4 pb-2 overflow-y-auto animate-fade-in">
                  {renderStep()}
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-foreground/10">
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
                      size="sm"
                      className="gap-1.5"
                    >
                      Get My Free Rental Estimate
                      <Check size={16} />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextStep}
                      disabled={!isCurrentStepValid}
                      size="sm"
                      className="gap-1.5"
                    >
                      Next
                      <ArrowRight size={16} />
                    </Button>
                  )}
                </div>

                <div className="px-3 pb-3">
                  <div className="relative h-[30px] md:h-[40px] w-full">
                    <div
                      className="h-full w-full"
                      style={{
                        background: `repeating-linear-gradient(90deg, ${accentHsl} 0px, ${accentHsl} 2px, transparent 2px, transparent 4px, ${accentHsl} 4px, ${accentHsl} 8px, transparent 8px, transparent 9px)`,
                      }}
                    />
                    <p className="absolute -bottom-3 left-0 w-full text-center text-[0.5rem] tracking-[3px] text-foreground/60">
                      VALORACASA
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex w-[50px] flex-col items-center justify-between py-4 bg-[hsl(36_9%_88%)] rounded-r-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <ArrowDown size={16} className="text-foreground/60" />
                <span
                  className="font-heading text-xs font-bold uppercase tracking-[2px] text-foreground/80"
                  style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                >
                  ValoraCasa
                </span>
                <span className="text-base text-foreground/60">⊕</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ValuationTicketCard
              address=""
              estimatedValue=""
              propertyType="Villa"
              leadId="a1b2c3d4e5f6"
              accentType="rent"
              addressValue={formData.streetAddress}
              onAddressChange={(val) => handleChange("streetAddress", val)}
              onContinue={handleContinueFromCard}
              mode="input"
            />
            <p className="text-sm text-muted-foreground/60 tracking-wide mt-2 animate-fade-in">
              12,400+ valuations · 100% free · 2 minutes
            </p>
          </>
        )}
      </main>

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

export default RentValuation;

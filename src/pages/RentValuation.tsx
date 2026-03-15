import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressIndicator from "@/components/shared/ProgressIndicator";
import FormStepWrapper from "@/components/shared/FormStepWrapper";
import StepNavigation from "@/components/shared/StepNavigation";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { useFormWizard } from "@/hooks/use-form-wizard";
import { INITIAL_RENT_DATA, RentValuationData } from "@/types/valuation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RentLocationStep from "@/components/rent/RentLocationStep";
import RentDetailsStep from "@/components/rent/RentDetailsStep";
import RentPreferencesStep from "@/components/rent/RentPreferencesStep";
import RentContactStep from "@/components/rent/RentContactStep";

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

const getRentProgressMessage = (progress: number) => {
  if (progress < 20) return "Analyzing your property details...";
  if (progress < 40) return "Researching rental rates in your area...";
  if (progress < 60) return "Calculating seasonal demand patterns...";
  if (progress < 80) return "Estimating your income potential...";
  return "Preparing your rental report...";
};

const RentValuation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pre-fill address from navigation state
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
    document.title = "Free Rental Estimate | ValoraCasa";
  }, []);

  const {
    currentStep,
    formData,
    progressPercentage,
    direction,
    handleChange,
    handleNextStep,
    handlePrevStep,
  } = useFormWizard<RentValuationData>({
    steps: RENT_STEPS,
    initialData: INITIAL_RENT_DATA,
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
        })
        .select("id")
        .single();

      if (error) throw error;

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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <RentLocationStep formData={formData} onChange={handleChange} />;
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {isSubmitting && (
        <LoadingOverlay
          simulatedProgress={simulatedProgress}
          title={getRentProgressMessage(simulatedProgress)}
        />
      )}
      <main className="container mx-auto px-4 py-8 max-w-2xl" id="valuation-form">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Free Rental Estimate
          </h1>
          <p className="text-muted-foreground">Find out how much you can earn from your property</p>
        </div>

        <ProgressIndicator
          steps={RENT_STEPS}
          currentStep={currentStep}
          progressPercentage={progressPercentage}
        />

        <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-sm">
          <FormStepWrapper direction={direction} currentStep={currentStep}>
            {renderStep()}
          </FormStepWrapper>

          <StepNavigation
            currentStep={currentStep}
            totalSteps={RENT_STEPS.length}
            isSubmitting={isSubmitting}
            isCurrentStepValid={validateRentStep(currentStep, formData)}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onSubmit={handleSubmit}
            submitLabel="Get My Free Rental Estimate"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RentValuation;

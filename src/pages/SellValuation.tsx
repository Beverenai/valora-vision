import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressIndicator from "@/components/shared/ProgressIndicator";
import FormStepWrapper from "@/components/shared/FormStepWrapper";
import StepNavigation from "@/components/shared/StepNavigation";
import { useFormWizard } from "@/hooks/use-form-wizard";
import { INITIAL_SELL_DATA, SellValuationData } from "@/types/valuation";

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

  useEffect(() => {
    document.title = "Free Property Valuation | ValoraCasa";
  }, []);

  const {
    currentStep,
    formData,
    progressPercentage,
    direction,
    handleChange,
    handleNextStep,
    handlePrevStep,
  } = useFormWizard<SellValuationData>({
    steps: SELL_STEPS,
    initialData: INITIAL_SELL_DATA,
    validateStep: validateSellStep,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockId = crypto.randomUUID();
    navigate(`/sell/result/${mockId}`);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-bold text-foreground">Property Location</h3>
            <p className="text-muted-foreground">Where is your property located?</p>
            <p className="text-sm text-muted-foreground italic">Google Maps address input will be integrated here. For now, this is a placeholder.</p>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-bold text-foreground">Property Details</h3>
            <p className="text-muted-foreground">Tell us about your property specifications.</p>
            <p className="text-sm text-muted-foreground italic">Property type selector and size inputs will be integrated here.</p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-bold text-foreground">Property Features</h3>
            <p className="text-muted-foreground">What features does your property have?</p>
            <p className="text-sm text-muted-foreground italic">Condition, pool, sea view, garage toggles will be integrated here.</p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-bold text-foreground">Contact Information</h3>
            <p className="text-muted-foreground">How can we reach you with your valuation?</p>
            <p className="text-sm text-muted-foreground italic">Name, email, phone input, timeline selector will be integrated here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl" id="valuation-form">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Free Property Valuation
          </h1>
          <p className="text-muted-foreground">Get an accurate estimate in just 2 minutes</p>
        </div>

        <ProgressIndicator
          steps={SELL_STEPS}
          currentStep={currentStep}
          progressPercentage={progressPercentage}
        />

        <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-sm">
          <FormStepWrapper direction={direction} currentStep={currentStep}>
            {renderStep()}
          </FormStepWrapper>

          <StepNavigation
            currentStep={currentStep}
            totalSteps={SELL_STEPS.length}
            isSubmitting={false}
            isCurrentStepValid={validateSellStep(currentStep, formData)}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onSubmit={handleSubmit}
            submitLabel="Get My Free Valuation"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellValuation;

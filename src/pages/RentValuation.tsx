import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressIndicator from "@/components/shared/ProgressIndicator";
import FormStepWrapper from "@/components/shared/FormStepWrapper";
import StepNavigation from "@/components/shared/StepNavigation";
import { useFormWizard } from "@/hooks/use-form-wizard";
import { INITIAL_RENT_DATA, RentValuationData } from "@/types/valuation";

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
      return !!(data.propertyType && data.builtSize && data.bedrooms && data.bathrooms);
    case 2:
      return !!data.furnished;
    case 3:
      return !!(data.fullName && data.email && data.phone && data.termsAccepted);
    default:
      return true;
  }
};

const RentValuation: React.FC = () => {
  const navigate = useNavigate();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockId = crypto.randomUUID();
    navigate(`/rent/result/${mockId}`);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-bold text-foreground">Property Location</h3>
            <p className="text-muted-foreground">Where is your property located?</p>
            <p className="text-sm text-muted-foreground italic">Address input will be integrated here.</p>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-bold text-foreground">Property Details</h3>
            <p className="text-muted-foreground">Tell us about your property.</p>
            <p className="text-sm text-muted-foreground italic">Property type, size, beds/baths, furnished status will be here.</p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-bold text-foreground">Rental Preferences</h3>
            <p className="text-muted-foreground">Tell us about your rental plans.</p>
            <p className="text-sm text-muted-foreground italic">AC, WiFi, beach proximity, tourist license options will be here.</p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-bold text-foreground">Contact Information</h3>
            <p className="text-muted-foreground">How can we reach you?</p>
            <p className="text-sm text-muted-foreground italic">Name, email, phone, rental situation will be here.</p>
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
            isSubmitting={false}
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

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isCurrentStepValid: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  isCurrentStepValid,
  onPrevStep,
  onNextStep,
  onSubmit,
  submitLabel = "Get Valuation",
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? "pt-3" : "pt-6"} flex justify-between`}>
      {currentStep > 0 ? (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevStep}
          disabled={isSubmitting}
          size={isMobile ? "sm" : "default"}
          className="flex items-center"
        >
          <ChevronLeft className="mr-1" size={isMobile ? 14 : 16} />
          Back
        </Button>
      ) : (
        <div />
      )}

      {currentStep < totalSteps - 1 ? (
        <Button
          type="button"
          onClick={onNextStep}
          disabled={isSubmitting || !isCurrentStepValid}
          size={isMobile ? "sm" : "default"}
          className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        >
          Next
          <ChevronRight className="ml-1" size={isMobile ? 14 : 16} />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !isCurrentStepValid}
          size={isMobile ? "sm" : "default"}
          className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        >
          {submitLabel}
          <Check className="ml-1" size={isMobile ? 14 : 16} />
        </Button>
      )}
    </div>
  );
};

export default StepNavigation;

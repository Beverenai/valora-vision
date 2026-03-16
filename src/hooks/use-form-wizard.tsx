import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseFormWizardProps<T> {
  steps: { name: string; label: string }[];
  initialData: T;
  initialStep?: number;
  validateStep: (step: number, data: T) => boolean;
}

export function useFormWizard<T>({
  steps,
  initialData,
  initialStep = 0,
  validateStep,
}: UseFormWizardProps<T>) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<T>(initialData);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if (isMobile && currentStep > 0) {
      setTimeout(() => {
        const formElement = document.getElementById("valuation-form");
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    }
  }, [currentStep, isMobile]);

  const handleChange = (fieldName: keyof T, value: T[keyof T]) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleNextStep = () => {
    if (validateStep(currentStep, formData) && currentStep < steps.length - 1) {
      setDirection("forward");
      setCurrentStep(currentStep + 1);
    } else if (!validateStep(currentStep, formData)) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setDirection("back");
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    currentStep,
    formData,
    progressPercentage,
    direction,
    handleChange,
    handleNextStep,
    handlePrevStep,
    setFormData,
    steps,
  };
}

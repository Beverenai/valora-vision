import React from "react";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProgressIndicatorProps {
  steps: { name: string; label: string }[];
  currentStep: number;
  progressPercentage: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  progressPercentage,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="mb-5">
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step.name}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      flex items-center justify-center rounded-full transition-all duration-300
                      ${
                        isActive
                          ? "w-9 h-9 bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)] scale-110"
                          : isCompleted
                          ? "w-8 h-8 bg-primary/80"
                          : "w-8 h-8 bg-muted border border-border"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check size={14} className="text-primary-foreground" />
                    ) : (
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? "text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 font-medium transition-colors duration-300 ${
                      isActive
                        ? "text-foreground"
                        : isCompleted
                        ? "text-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={`h-0.5 w-8 mx-1 -mt-4 rounded-full transition-colors duration-300 ${
                      isCompleted ? "bg-primary/60" : "bg-border"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-3">
      <Progress
        value={progressPercentage}
        className="h-3 rounded-full bg-muted"
      />
      <div className="flex justify-between text-sm pt-2 font-medium">
        {steps.map((step, index) => (
          <div
            key={step.name}
            className={`${
              index <= currentStep ? "text-foreground font-semibold" : "text-muted-foreground"
            } flex flex-col items-center`}
          >
            {index <= currentStep ? (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mb-1 text-primary-foreground text-xs">
                {index < currentStep ? <Check size={14} /> : index + 1}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mb-1 text-muted-foreground text-xs">
                {index + 1}
              </div>
            )}
            {step.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;

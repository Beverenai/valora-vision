import React from "react";
import { createPortal } from "react-dom";
import { Loader } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";

interface LoadingOverlayProps {
  simulatedProgress: number;
  title?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  simulatedProgress,
  title = "Generating your property valuation...",
}) => {
  const isMobile = useIsMobile();

  return createPortal(
    <div
      className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center animate-fade-in"
      style={{ zIndex: 9999 }}
    >
      <div
        className={`bg-card ${
          isMobile ? "p-5 mx-4" : "p-8"
        } rounded-xl shadow-2xl flex flex-col items-center space-y-3 max-w-sm mx-auto text-center border border-border`}
      >
        <Loader
          className={`${
            isMobile ? "h-8 w-8" : "h-12 w-12"
          } text-primary animate-spin`}
        />
        <h3
          className={`${
            isMobile ? "text-base" : "text-xl"
          } font-semibold font-heading text-foreground`}
        >
          {title}
        </h3>
        <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
          This takes approximately 60 seconds as we analyze your property details.
        </p>

        <div className="w-full space-y-2">
          <Progress value={simulatedProgress} className="h-2 w-full bg-muted" />
          <p className="text-xs text-muted-foreground">
            {simulatedProgress < 30
              ? "Researching property data..."
              : simulatedProgress < 60
              ? "Analyzing market conditions..."
              : simulatedProgress < 90
              ? "Calculating valuation estimates..."
              : "Finalizing your report..."}
          </p>
          <p
            className={`${
              isMobile ? "text-xs" : "text-sm"
            } font-medium mt-2 text-primary`}
          >
            Please don't refresh the page.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LoadingOverlay;

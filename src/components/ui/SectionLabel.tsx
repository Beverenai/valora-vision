import React from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div className={cn("mb-3", className)}>
      <div className="w-10 h-[2px] bg-primary mb-3" />
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
        {children}
      </p>
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p className={cn(
      "text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium mb-3",
      className
    )}>
      {children}
    </p>
  );
}

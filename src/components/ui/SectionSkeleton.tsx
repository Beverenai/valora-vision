import React from "react";
import { cn } from "@/lib/utils";

interface SectionSkeletonProps {
  rows?: number;
  className?: string;
}

export function SectionSkeleton({ rows = 3, className }: SectionSkeletonProps) {
  return (
    <div className={cn("animate-pulse space-y-4 py-8 px-6", className)}>
      <div className="h-3 w-24 bg-muted rounded" />
      <div className="h-8 w-64 bg-muted rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded" style={{ width: `${80 - i * 10}%` }} />
      ))}
    </div>
  );
}

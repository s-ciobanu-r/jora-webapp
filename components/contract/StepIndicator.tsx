"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/config";

interface StepIndicatorProps {
  currentStage: string;
  progress: number;
  className?: string;
}

export function StepIndicator({ 
  currentStage, 
  progress,
  className 
}: StepIndicatorProps) {
  const { t } = useTranslation();
  
  // Clamp progress between 0-100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
        <span>{t("contract.progressSteps") || "Progress"}</span>
        <span>{clampedProgress}%</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <div className="text-xs text-center text-muted-foreground font-mono uppercase tracking-wider">
        {currentStage?.replace(/_/g, " ") || "Initializing..."}
      </div>
    </div>
  );
}

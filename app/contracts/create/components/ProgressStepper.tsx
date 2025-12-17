// app/contracts/create/components/ProgressStepper.tsx
"use client";

/**
 * ProgressStepper
 * ----------------
 * Pure presentational component.
 * - Shows wizard progress
 * - No store access
 * - No side effects
 * - Fully i18n-driven labels (passed in)
 */

type Step = {
  key: string;
  label: string;
};

type ProgressStepperProps = {
  steps: Step[];
  currentStep: number;
};

export default function ProgressStepper({
  steps,
  currentStep,
}: ProgressStepperProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center text-center flex-1">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium",
                    isCompleted
                      ? "border-green-600 bg-green-600 text-white"
                      : isCurrent
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300 bg-white text-gray-500",
                  ].join(" ")}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {index + 1}
                </div>

                <span
                  className={[
                    "mt-2 text-xs font-medium",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-green-700"
                      : "text-gray-500",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={[
                    "mx-2 h-px flex-1",
                    isCompleted ? "bg-green-600" : "bg-gray-300",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

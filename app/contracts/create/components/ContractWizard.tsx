// app/contracts/create/components/ContractWizard.tsx
"use client";

/**
 * ContractWizard
 * ----------------
 * - Orchestrates the stepper flow
 * - Connects steps to the draft store
 * - Enforces step-level validation
 * - Triggers final submission (single n8n call via API)
 *
 * IMPORTANT:
 * - No business logic here beyond flow control
 * - No backend assumptions
 * - No i18n in domain/store — ONLY here in UI
 */

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useContractDraftStore } from "../store/contractDraftStore";
import {
  contractInfoSchema,
  vehicleSchema,
  buyerSchema,
  priceSchema,
  validateStep,
  validateFullDraft,
} from "../validation/contractDraftSchema";

import ProgressStepper from "./ProgressStepper";
import ContractInfoStep from "./steps/ContractInfoStep";
import VehicleStep from "./steps/VehicleStep";
import BuyerStep from "./steps/BuyerStep";
import PriceStep from "./steps/PriceStep";
import ReviewStep from "./steps/ReviewStep";
import SuccessScreen from "./SuccessScreen";

type StepConfig = {
  key: string;
  labelKey: string;
  validate: (draft: unknown) => { valid: true } | { valid: false; errors: Record<string, string> };
  Component: React.ComponentType<StepComponentProps>;
};

export type StepComponentProps = {
  onNext(): void;
  onBack(): void;
  errors: Record<string, string>;
};

const STEPS: StepConfig[] = [
  {
    key: "contract",
    labelKey: "steps.contractInfo",
    validate: (draft) => validateStep(contractInfoSchema, draft),
    Component: ContractInfoStep,
  },
  {
    key: "vehicle",
    labelKey: "steps.vehicle",
    validate: (draft) => validateStep(vehicleSchema, draft),
    Component: VehicleStep,
  },
  {
    key: "buyer",
    labelKey: "steps.buyer",
    validate: (draft) => validateStep(buyerSchema, draft),
    Component: BuyerStep,
  },
  {
    key: "price",
    labelKey: "steps.price",
    validate: (draft) => validateStep(priceSchema, draft),
    Component: PriceStep,
  },
  {
    key: "review",
    labelKey: "steps.review",
    validate: (draft) => validateFullDraft(draft),
    Component: ReviewStep,
  },
];

export default function ContractWizard() {
  const t = useTranslations("contracts.create");

  const {
    draft,
    meta,
    currentStep,
    setStep,
    markSubmitting,
    markSubmitted,
  } = useContractDraftStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fatalError, setFatalError] = useState<string | null>(null);

  // If completed, show success screen (terminal)
  if (meta.status === "completed" && meta.pdf_url) {
    return <SuccessScreen pdfUrl={meta.pdf_url} />;
  }

  const stepConfig = STEPS[currentStep];
  const StepComponent = stepConfig.Component;

  const handleNext = () => {
    const validation = stepConfig.validate(draft);

    if (validation.valid) {
      setErrors({});
      setStep(currentStep + 1);
    } else {
      setErrors(validation.errors);
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep(Math.max(0, currentStep - 1));
  };

  const handleSubmit = async () => {
    const validation = validateFullDraft(draft);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      markSubmitting();

      const response = await fetch("/api/contracts/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          idempotency_key: meta.idempotency_key,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        setFatalError(result.error || "errors.unknown");
        return;
      }

      markSubmitted(result.contract_id, result.pdf_url);
    } catch (err) {
      setFatalError("errors.network");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <ProgressStepper
        steps={STEPS.map((s) => ({
          key: s.key,
          label: t(s.labelKey),
        }))}
        currentStep={currentStep}
      />

      {fatalError && (
        <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {t(fatalError)}
        </div>
      )}

      <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
        <StepComponent
          onNext={currentStep === STEPS.length - 1 ? handleSubmit : handleNext}
          onBack={handleBack}
          errors={errors}
        />
      </div>
    </div>
  );
}

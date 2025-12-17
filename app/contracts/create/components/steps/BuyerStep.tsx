// app/contracts/create/components/steps/BuyerStep.tsx
"use client";

/**
 * BuyerStep
 * ---------
 * Step 3 of the wizard.
 * - Allows selecting an existing buyer OR creating/editing a buyer
 * - All data flows into the draft store
 * - No backend calls directly (delegated to hooks/components)
 * - Validation errors are passed from wizard
 */

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { StepComponentProps } from "../ContractWizard";
import { useContractDraftStore } from "../../store/contractDraftStore";
import BuyerSearch from "../BuyerSearch";
import BuyerForm from "../BuyerForm";

type Mode = "search" | "form";

export default function BuyerStep({
  onNext,
  onBack,
  errors,
}: StepComponentProps) {
  const t = useTranslations("contracts.create");
  const { draft, updateBuyer } = useContractDraftStore();

  const [mode, setMode] = useState<Mode>(
    draft.buyer.id ? "form" : "search"
  );

  const handleSelectBuyer = (buyer: any) => {
    updateBuyer(buyer);
    setMode("form");
  };

  const handleCreateNew = () => {
    updateBuyer({
      id: undefined,
      full_name: "",
      street: "",
      street_no: "",
      zip: "",
      city: "",
      phone: "",
      email: "",
      document_number: "",
      document_authority: "",
    });
    setMode("form");
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-gray-900">
        {t("steps.buyer")}
      </h2>

      {mode === "search" && (
        <BuyerSearch
          onSelect={handleSelectBuyer}
          onCreateNew={handleCreateNew}
        />
      )}

      {mode === "form" && (
        <BuyerForm
          buyer={draft.buyer}
          errors={errors}
          onChange={updateBuyer}
        />
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          {t("actions.back")}
        </button>

        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          {t("actions.next")}
        </button>
      </div>
    </div>
  );
}

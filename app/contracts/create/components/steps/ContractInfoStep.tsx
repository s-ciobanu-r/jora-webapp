// app/contracts/create/components/steps/ContractInfoStep.tsx
"use client";

/**
 * ContractInfoStep
 * ----------------
 * Step 1 of the wizard.
 * - Edits contract number + contract date
 * - No navigation logic beyond callbacks
 * - No backend calls
 * - Fully controlled by Zustand store
 */

import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import { useContractDraftStore } from "../../store/contractDraftStore";
import type { StepComponentProps } from "../ContractWizard";

export default function ContractInfoStep({
  onNext,
  onBack,
  errors,
}: StepComponentProps) {
  const t = useTranslations("contracts.create");
  const { draft, updateContract } = useContractDraftStore();

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateContract({ number: e.target.value });
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateContract({ date: e.target.value });
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-gray-900">
        {t("steps.contractInfo")}
      </h2>

      <div className="space-y-4">
        {/* Contract Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("fields.contractNumber")}
          </label>
          <input
            type="text"
            value={draft.contract.number}
            onChange={handleNumberChange}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors["contract.number"] && (
            <p className="mt-1 text-sm text-red-600">
              {t(errors["contract.number"])}
            </p>
          )}
        </div>

        {/* Contract Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("fields.contractDate")}
          </label>
          <input
            type="date"
            value={draft.contract.date}
            onChange={handleDateChange}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors["contract.date"] && (
            <p className="mt-1 text-sm text-red-600">
              {t(errors["contract.date"])}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled
          className="cursor-not-allowed rounded-md border border-gray-300 px-6 py-2 text-sm text-gray-400"
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

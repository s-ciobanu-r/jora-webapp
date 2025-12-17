// app/contracts/create/components/steps/PriceStep.tsx
"use client";

/**
 * PriceStep
 * ---------
 * Step 4 of the wizard.
 * - Edits sale price
 * - Controlled via draft store
 * - Displays formatted value
 * - Shows validation errors from schema
 */

import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import { useContractDraftStore } from "../../store/contractDraftStore";
import type { StepComponentProps } from "../ContractWizard";
import { formatMoneyRON } from "../../domain/contractDraft";

export default function PriceStep({
  onNext,
  onBack,
  errors,
}: StepComponentProps) {
  const t = useTranslations("contracts.create");
  const { draft, updatePrice } = useContractDraftStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(",", ".");
    const value = Number(raw);
    if (!Number.isNaN(value)) {
      updatePrice(value);
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-gray-900">
        {t("steps.price")}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("fields.price")}
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={draft.price || ""}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          {errors["price"] && (
            <p className="mt-1 text-sm text-red-600">
              {t(errors["price"])}
            </p>
          )}

          {draft.price > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {t("price.formatted")}:{" "}
              <span className="font-medium">
                {formatMoneyRON(draft.price)}
              </span>
            </p>
          )}
        </div>
      </div>

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

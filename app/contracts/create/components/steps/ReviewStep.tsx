// app/contracts/create/components/steps/ReviewStep.tsx
"use client";

/**
 * ReviewStep
 * ----------
 * Step 5 of the wizard (final review).
 * - Read-only summary of all draft data
 * - Provides edit shortcuts to previous steps
 * - Does NOT mutate state
 * - Final submit is delegated to ContractWizard via onNext()
 */

import { useTranslations } from "next-intl";

import type { StepComponentProps } from "../ContractWizard";
import { useContractDraftStore } from "../../store/contractDraftStore";
import { formatMoneyRON } from "../../domain/contractDraft";

type Section = {
  titleKey: string;
  stepIndex: number;
  rows: { labelKey: string; value: string }[];
};

export default function ReviewStep({
  onNext,
  onBack,
}: StepComponentProps) {
  const t = useTranslations("contracts.create");
  const { draft, setStep } = useContractDraftStore();

  const sections: Section[] = [
    {
      titleKey: "steps.contractInfo",
      stepIndex: 0,
      rows: [
        {
          labelKey: "fields.contractNumber",
          value: draft.contract.number || "-",
        },
        {
          labelKey: "fields.contractDate",
          value: draft.contract.date || "-",
        },
      ],
    },
    {
      titleKey: "steps.vehicle",
      stepIndex: 1,
      rows: [
        {
          labelKey: "fields.brandModel",
          value: draft.vehicle.brand_model || "-",
        },
        {
          labelKey: "fields.vin",
          value: draft.vehicle.vin || "-",
        },
        {
          labelKey: "fields.km",
          value: draft.vehicle.km
            ? `${draft.vehicle.km} km`
            : "-",
        },
        {
          labelKey: "fields.firstRegistration",
          value: draft.vehicle.first_reg || "-",
        },
      ],
    },
    {
      titleKey: "steps.buyer",
      stepIndex: 2,
      rows: [
        {
          labelKey: "fields.fullName",
          value: draft.buyer.full_name || "-",
        },
        {
          labelKey: "fields.address",
          value: `${draft.buyer.street} ${
            draft.buyer.street_no ?? ""
          }, ${draft.buyer.zip} ${draft.buyer.city}`.trim() || "-",
        },
        {
          labelKey: "fields.phone",
          value: draft.buyer.phone || "-",
        },
        {
          labelKey: "fields.email",
          value: draft.buyer.email || "-",
        },
        {
          labelKey: "fields.documentNumber",
          value: draft.buyer.document_number || "-",
        },
        {
          labelKey: "fields.documentAuthority",
          value: draft.buyer.document_authority || "-",
        },
      ],
    },
    {
      titleKey: "steps.price",
      stepIndex: 3,
      rows: [
        {
          labelKey: "fields.price",
          value:
            draft.price > 0 ? formatMoneyRON(draft.price) : "-",
        },
      ],
    },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-gray-900">
        {t("steps.review")}
      </h2>

      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.titleKey}
            className="rounded-lg bg-gray-50 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">
                {t(section.titleKey)}
              </h3>
              <button
                type="button"
                onClick={() => setStep(section.stepIndex)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("actions.edit")}
              </button>
            </div>

            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {section.rows.map((row) => (
                <div key={row.labelKey}>
                  <dt className="text-sm text-gray-600">
                    {t(row.labelKey)}
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
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
          {t("actions.generatePdf")}
        </button>
      </div>
    </div>
  );
}

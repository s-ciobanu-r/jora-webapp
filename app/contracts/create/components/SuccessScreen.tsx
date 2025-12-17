// app/contracts/create/components/SuccessScreen.tsx
"use client";

/**
 * SuccessScreen
 * --------------
 * Terminal screen shown after successful contract finalization.
 * - No navigation back into the wizard
 * - No store mutation (except optional reset via button)
 * - Fully i18n-driven
 */

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useContractDraftStore } from "../store/contractDraftStore";

type SuccessScreenProps = {
  pdfUrl: string;
};

export default function SuccessScreen({ pdfUrl }: SuccessScreenProps) {
  const t = useTranslations("contracts.create");
  const router = useRouter();
  const reset = useContractDraftStore((s) => s.reset);

  const handleCreateAnother = () => {
    reset();
    router.push("/contracts/create");
  };

  const handleGoToList = () => {
    reset();
    router.push("/contracts");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center">
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-700"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-gray-900">
          {t("success.title")}
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          {t("success.subtitle")}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90"
          >
            {t("actions.downloadPdf")}
          </a>

          <button
            type="button"
            onClick={handleCreateAnother}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t("actions.createAnother")}
          </button>

          <button
            type="button"
            onClick={handleGoToList}
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            {t("actions.goToContracts")}
          </button>
        </div>
      </div>
    </div>
  );
}

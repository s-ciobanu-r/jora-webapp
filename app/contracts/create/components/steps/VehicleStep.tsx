// app/contracts/create/components/steps/VehicleStep.tsx
"use client";

/**
 * VehicleStep
 * -----------
 * Step 2 of the wizard.
 * - Allows manual vehicle entry OR OCR-assisted entry
 * - All data flows into the draft store
 * - No backend calls here (OCR handled by child component)
 * - Validation errors are passed in from the wizard
 */

import { useState, ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import { useContractDraftStore } from "../../store/contractDraftStore";
import type { StepComponentProps } from "../ContractWizard";
import VehicleOCRUpload from "../VehicleOCRUpload";

type Mode = "manual" | "ocr";

export default function VehicleStep({
  onNext,
  onBack,
  errors,
}: StepComponentProps) {
  const t = useTranslations("contracts.create");
  const { draft, updateVehicle } = useContractDraftStore();
  const [mode, setMode] = useState<Mode>("manual");

  const vehicle = draft.vehicle;

  const handleChange =
    (field: keyof typeof vehicle) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "km" ? Number(e.target.value) : e.target.value;
      updateVehicle({ [field]: value } as Partial<typeof vehicle>);
    };

  const handleOcrAccept = (data: Partial<typeof vehicle>) => {
    updateVehicle(data);
    setMode("manual");
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-gray-900">
        {t("steps.vehicle")}
      </h2>

      {/* Mode selector */}
      <div className="mb-6 flex gap-3">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            mode === "manual"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("vehicle.manualEntry")}
        </button>

        <button
          type="button"
          onClick={() => setMode("ocr")}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            mode === "ocr"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("vehicle.ocrUpload")}
        </button>
      </div>

      {/* OCR mode */}
      {mode === "ocr" ? (
        <VehicleOCRUpload onAccept={handleOcrAccept} />
      ) : (
        <div className="space-y-4">
          {/* Brand / Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("fields.brandModel")}
            </label>
            <input
              type="text"
              value={vehicle.brand_model}
              onChange={handleChange("brand_model")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors["vehicle.brand_model"] && (
              <p className="mt-1 text-sm text-red-600">
                {t(errors["vehicle.brand_model"])}
              </p>
            )}
          </div>

          {/* VIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("fields.vin")}
            </label>
            <input
              type="text"
              value={vehicle.vin}
              maxLength={17}
              onChange={(e) =>
                updateVehicle({ vin: e.target.value.toUpperCase() })
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors["vehicle.vin"] && (
              <p className="mt-1 text-sm text-red-600">
                {t(errors["vehicle.vin"])}
              </p>
            )}
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("fields.km")}
            </label>
            <input
              type="number"
              value={vehicle.km || ""}
              onChange={handleChange("km")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors["vehicle.km"] && (
              <p className="mt-1 text-sm text-red-600">
                {t(errors["vehicle.km"])}
              </p>
            )}
          </div>

          {/* First registration */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("fields.firstRegistration")}
            </label>
            <input
              type="date"
              value={vehicle.first_reg}
              onChange={handleChange("first_reg")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors["vehicle.first_reg"] && (
              <p className="mt-1 text-sm text-red-600">
                {t(errors["vehicle.first_reg"])}
              </p>
            )}
          </div>
        </div>
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

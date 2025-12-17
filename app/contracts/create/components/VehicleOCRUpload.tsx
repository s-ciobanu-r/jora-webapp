// app/contracts/create/components/VehicleOCRUpload.tsx
"use client";

/**
 * VehicleOCRUpload
 * ----------------
 * Handles vehicle document OCR flow.
 * Responsibilities:
 * - Upload file (PDF/image) to backend
 * - Trigger OCR extraction
 * - Show extracted fields + confidence
 * - Require explicit user acceptance
 *
 * IMPORTANT:
 * - Does NOT mutate global store directly
 * - Emits accepted data upward
 * - Never auto-advances wizard
 */

import { useState } from "react";
import { useTranslations } from "next-intl";

type OCRResult = {
  brand_model?: string | null;
  vin?: string | null;
  km?: number | null;
  first_reg?: string | null;
};

type OCRConfidence = {
  brand_model?: "low" | "medium" | "high";
  vin?: "low" | "medium" | "high";
  km?: "low" | "medium" | "high";
  first_reg?: "low" | "medium" | "high";
};

type VehicleOCRUploadProps = {
  onAccept(data: Partial<{
    brand_model: string;
    vin: string;
    km: number;
    first_reg: string;
    ocr_file_url?: string;
  }>): void;
};

export default function VehicleOCRUpload({
  onAccept,
}: VehicleOCRUploadProps) {
  const t = useTranslations("contracts.create");

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<OCRResult | null>(null);
  const [confidence, setConfidence] = useState<OCRConfidence | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/ocr/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      throw new Error("errors.ocrUploadFailed");
    }

    const json = await res.json();
    return json.file_url as string;
  };

  const extractOCR = async (url: string) => {
    const res = await fetch("/api/ocr/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_url: url }),
    });

    if (!res.ok) {
      throw new Error("errors.ocrExtractFailed");
    }

    return res.json();
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setLoading(true);

    try {
      const url = await uploadFile(selected);
      setFileUrl(url);

      const extracted = await extractOCR(url);

      setResult(extracted.extracted || {});
      setConfidence(extracted.confidence || {});
    } catch (err: any) {
      setError(err.message || "errors.ocrFailed");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!result) return;

    onAccept({
      brand_model: result.brand_model ?? undefined,
      vin: result.vin ?? undefined,
      km: result.km ?? undefined,
      first_reg: result.first_reg ?? undefined,
      ocr_file_url: fileUrl ?? undefined,
    });
  };

  return (
    <div className="rounded-md border border-dashed border-gray-300 p-6">
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        {t("vehicle.ocrTitle")}
      </h3>

      {!result && (
        <>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileSelect}
            disabled={loading}
          />

          {loading && (
            <p className="mt-3 text-sm text-gray-600">
              {t("vehicle.ocrProcessing")}
            </p>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {t(error)}
            </p>
          )}
        </>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {(
              [
                ["brand_model", t("fields.brandModel")],
                ["vin", t("fields.vin")],
                ["km", t("fields.km")],
                ["first_reg", t("fields.firstRegistration")],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <dt className="text-gray-600">{label}</dt>
                <dd className="font-medium text-gray-900">
                  {String(result[key] ?? "-")}
                  {confidence?.[key] && (
                    <span
                      className={`ml-2 text-xs ${
                        confidence[key] === "high"
                          ? "text-green-600"
                          : confidence[key] === "medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      ({t(`ocr.confidence.${confidence[key]}`)})
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              {t("actions.accept")}
            </button>

            <button
              type="button"
              onClick={() => {
                setResult(null);
                setConfidence(null);
                setFile(null);
                setFileUrl(null);
              }}
              className="rounded-md border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {t("actions.retry")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

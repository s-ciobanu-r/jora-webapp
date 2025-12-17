// app/contracts/create/components/BuyerForm.tsx
"use client";

/**
 * BuyerForm
 * ---------
 * Dumb, controlled form for buyer data.
 * - No API calls
 * - No global store access
 * - Emits partial buyer updates upward
 * - Displays validation errors (i18n keys)
 */

import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";

type Buyer = {
  id?: number;
  full_name: string;
  street: string;
  street_no?: string;
  zip: string;
  city: string;
  phone: string;
  email?: string;
  document_number?: string;
  document_authority?: string;
};

type BuyerFormProps = {
  buyer: Buyer;
  errors: Record<string, string>;
  onChange(update: Partial<Buyer>): void;
};

export default function BuyerForm({
  buyer,
  errors,
  onChange,
}: BuyerFormProps) {
  const t = useTranslations("contracts.create");

  const handleChange =
    (field: keyof Buyer) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange({ [field]: e.target.value } as Partial<Buyer>);
    };

  return (
    <div className="space-y-4">
      {/* Full name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("fields.fullName")}
        </label>
        <input
          type="text"
          value={buyer.full_name}
          onChange={handleChange("full_name")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors["buyer.full_name"] && (
          <p className="mt-1 text-sm text-red-600">
            {t(errors["buyer.full_name"])}
          </p>
        )}
      </div>

      {/* Street */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("fields.street")}
        </label>
        <input
          type="text"
          value={buyer.street}
          onChange={handleChange("street")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors["buyer.street"] && (
          <p className="mt-1 text-sm text-red-600">
            {t(errors["buyer.street"])}
          </p>
        )}
      </div>

      {/* Street number */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("fields.streetNo")}
        </label>
        <input
          type="text"
          value={buyer.street_no ?? ""}
          onChange={handleChange("street_no")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* ZIP */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("fields.zip")}
        </label>
        <input
          type="text"
          value={buyer.zip}
          onChange={handleChange("zip")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors["buyer.zip"] && (
          <p className="mt-1 text-sm text-red-600">
            {t(errors["buyer.zip"])}
          </p>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("fields.city")}
        </label>
        <input
          type="text"
          value={buyer.city}
          onChange={handleChange("city")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors["buyer.city"] && (
          <p className="mt-1 text-sm text-red-600">
            {t(errors["buyer.city"])}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("fields.phone")}
        </label>
        <input
          type="tel"
          value={buyer.phone}
          onChange={handleChange("phone")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors["buyer.phone"] && (
          <p className="mt-1 text-sm text-red-600">
            {t(errors["buyer.phone"])}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("fields.email")}
        </label>
        <input
          type="email"
          value={buyer.email ?? ""}
          onChange={handleChange("email")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors["buyer.email"] && (
          <p className="mt-1 text-sm text-red-600">
            {t(errors["buyer.email"])}
          </p>
        )}
      </div>

      {/* Document number */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("fields.documentNumber")}
        </label>
        <input
          type="text"
          value={buyer.document_number ?? ""}
          onChange={handleChange("document_number")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors["buyer.document_number"] && (
          <p className="mt-1 text-sm text-red-600">
            {t(errors["buyer.document_number"])}
          </p>
        )}
      </div>

      {/* Document authority */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t("fields.documentAuthority")}
        </label>
        <input
          type="text"
          value={buyer.document_authority ?? ""}
          onChange={handleChange("document_authority")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors["buyer.document_authority"] && (
          <p className="mt-1 text-sm text-red-600">
            {t(errors["buyer.document_authority"])}
          </p>
        )}
      </div>
    </div>
  );
}

// app/contracts/create/validation/contractDraftSchema.ts

/**
 * Draft-only validation schema.
 * - Used by the frontend wizard to gate navigation between steps
 * - Returns ERROR KEYS (for i18n), not human-readable strings
 * - Does NOT enforce DB-level or cross-user constraints
 *
 * Backend (n8n / finalize) MUST re-validate independently.
 */

import { z } from "zod";

/**
 * Common validators
 */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "errors.invalidDate");

const nonEmptyString = z
  .string()
  .trim()
  .min(1, "errors.required");

const vinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(17, "errors.invalidVinLength")
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "errors.invalidVinFormat");

const positiveNumber = z
  .number({
    required_error: "errors.required",
    invalid_type_error: "errors.invalidNumber",
  })
  .positive("errors.mustBePositive");

/**
 * Contract info (step 1)
 */
export const contractInfoSchema = z.object({
  contract: z.object({
    number: nonEmptyString,
    date: isoDate,
  }),
});

/**
 * Vehicle (step 2)
 */
export const vehicleSchema = z.object({
  vehicle: z.object({
    brand_model: nonEmptyString,
    vin: vinSchema,
    km: z
      .number({
        required_error: "errors.required",
        invalid_type_error: "errors.invalidNumber",
      })
      .int("errors.mustBeInteger")
      .min(1, "errors.mustBePositive")
      .max(1_500_000, "errors.tooLarge"),
    first_reg: isoDate,
    ocr_file_url: z.string().url().optional(),
  }),
});

/**
 * Buyer (step 3)
 */
export const buyerSchema = z.object({
  buyer: z.object({
    id: z.number().optional(),
    full_name: nonEmptyString,
    street: nonEmptyString,
    street_no: z.string().optional(),
    zip: nonEmptyString,
    city: nonEmptyString,
    phone: nonEmptyString,
    email: z.string().email("errors.invalidEmail").optional(),
    document_number: nonEmptyString,
    document_authority: nonEmptyString,
  }),
});

/**
 * Price (step 4)
 */
export const priceSchema = z.object({
  price: positiveNumber,
});

/**
 * Full draft (used for Review + final submit readiness)
 * NOTE: This is still FRONTEND-ONLY validation.
 */
export const fullDraftSchema = z.object({
  contract: contractInfoSchema.shape.contract,
  vehicle: vehicleSchema.shape.vehicle,
  buyer: buyerSchema.shape.buyer,
  price: priceSchema.shape.price,
});

/**
 * Helper: validate a partial draft against a step schema
 */
export function validateStep<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { valid: true } | { valid: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { valid: true };
  }

  const fieldErrors: Record<string, string> = {};

  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    fieldErrors[path] = issue.message;
  }

  return { valid: false, errors: fieldErrors };
}

/**
 * Helper: validate entire draft before final submit
 */
export function validateFullDraft(
  draft: unknown
): { valid: true } | { valid: false; errors: Record<string, string> } {
  const result = fullDraftSchema.safeParse(draft);

  if (result.success) {
    return { valid: true };
  }

  const fieldErrors: Record<string, string> = {};

  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    fieldErrors[path] = issue.message;
  }

  return { valid: false, errors: fieldErrors };
}

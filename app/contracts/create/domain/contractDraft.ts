// app/contracts/create/domain/contractDraft.ts

/**
 * Canonical Create-Contract draft shape owned by the frontend.
 * This is the ONLY editable source of truth during the wizard.
 */

export type ContractDraft = {
  contract: {
    number: string;
    date: string; // ISO date: YYYY-MM-DD
  };
  vehicle: {
    brand_model: string;
    vin: string;
    km: number;
    first_reg: string; // ISO date: YYYY-MM-DD
    ocr_file_url?: string;
  };
  buyer: {
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
  price: number;
};

/**
 * Draft lifecycle metadata (NOT editable form fields).
 * Used for persistence, idempotency, and safe retry.
 */
export type ContractDraftMeta = {
  draft_id?: string; // uuid from Neon (contract_drafts.id)
  status: "draft" | "submitted" | "completed";
  idempotency_key: string; // stable per draft for finalize
  finalized_contract_id?: number;
  pdf_url?: string;
  updated_at?: string; // ISO timestamp from server (optional)
};

export const createEmptyContractDraft = (): ContractDraft => ({
  contract: {
    number: "",
    date: "",
  },
  vehicle: {
    brand_model: "",
    vin: "",
    km: 0,
    first_reg: "",
  },
  buyer: {
    full_name: "",
    street: "",
    zip: "",
    city: "",
    phone: "",
  },
  price: 0,
});

/**
 * Creates a stable meta object for a brand-new draft.
 * IMPORTANT: idempotency_key must remain stable for the entire draft lifetime.
 */
export const createNewDraftMeta = (): ContractDraftMeta => ({
  status: "draft",
  idempotency_key: typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `idem_${Date.now()}_${Math.random().toString(16).slice(2)}`,
});

export const isIsoDate = (value: string): boolean => {
  // Strict YYYY-MM-DD check + basic Date validity
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

export const normalizeVin = (vin: string): string =>
  vin.trim().toUpperCase();

export const formatMoneyRON = (amount: number): string => {
  try {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if Intl not available for some reason
    return `${amount.toFixed(2)} RON`;
  }
};

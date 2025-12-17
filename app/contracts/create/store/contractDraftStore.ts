// app/contracts/create/store/contractDraftStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ContractDraft,
  ContractDraftMeta,
} from "../domain/contractDraft";
import {
  createEmptyContractDraft,
  createNewDraftMeta,
} from "../domain/contractDraft";

type ContractDraftState = {
  // ---- Core data ----
  draft: ContractDraft;
  meta: ContractDraftMeta;

  // ---- Wizard UI state (NOT persisted) ----
  currentStep: number;
  isDirty: boolean;
  isSaving: boolean;
  isSubmitting: boolean;

  // ---- Mutators (data only) ----
  updateContract(data: Partial<ContractDraft["contract"]>): void;
  updateVehicle(data: Partial<ContractDraft["vehicle"]>): void;
  updateBuyer(data: Partial<ContractDraft["buyer"]>): void;
  updatePrice(price: number): void;

  // ---- Wizard control ----
  setStep(step: number): void;

  // ---- Persistence ----
  markSaved(draftId: string, updatedAt?: string): void;
  markDirty(): void;

  // ---- Submission lifecycle ----
  markSubmitting(): void;
  markSubmitted(contractId: number, pdfUrl: string): void;

  // ---- Reset ----
  reset(): void;
};

export const useContractDraftStore = create<ContractDraftState>()(
  persist(
    (set, get) => ({
      // --------------------
      // Initial state
      // --------------------
      draft: createEmptyContractDraft(),
      meta: createNewDraftMeta(),

      currentStep: 0,
      isDirty: false,
      isSaving: false,
      isSubmitting: false,

      // --------------------
      // Update helpers
      // --------------------
      updateContract: (data) =>
        set((state) => ({
          draft: {
            ...state.draft,
            contract: { ...state.draft.contract, ...data },
          },
          isDirty: true,
        })),

      updateVehicle: (data) =>
        set((state) => ({
          draft: {
            ...state.draft,
            vehicle: { ...state.draft.vehicle, ...data },
          },
          isDirty: true,
        })),

      updateBuyer: (data) =>
        set((state) => ({
          draft: {
            ...state.draft,
            buyer: { ...state.draft.buyer, ...data },
          },
          isDirty: true,
        })),

      updatePrice: (price) =>
        set((state) => ({
          draft: { ...state.draft, price },
          isDirty: true,
        })),

      // --------------------
      // Wizard navigation
      // --------------------
      setStep: (step) => {
        set({ currentStep: step });
      },

      // --------------------
      // Persistence lifecycle
      // --------------------
      markSaved: (draftId, updatedAt) =>
        set((state) => ({
          meta: {
            ...state.meta,
            draft_id: draftId,
            updated_at: updatedAt ?? state.meta.updated_at,
          },
          isDirty: false,
          isSaving: false,
        })),

      markDirty: () =>
        set({
          isDirty: true,
        }),

      // --------------------
      // Submission lifecycle
      // --------------------
      markSubmitting: () =>
        set({
          isSubmitting: true,
          meta: { ...get().meta, status: "submitted" },
        }),

      markSubmitted: (contractId, pdfUrl) =>
        set((state) => ({
          isSubmitting: false,
          isDirty: false,
          meta: {
            ...state.meta,
            status: "completed",
            finalized_contract_id: contractId,
            pdf_url: pdfUrl,
          },
        })),

      // --------------------
      // Reset everything
      // --------------------
      reset: () =>
        set({
          draft: createEmptyContractDraft(),
          meta: createNewDraftMeta(),
          currentStep: 0,
          isDirty: false,
          isSaving: false,
          isSubmitting: false,
        }),
    }),
    {
      name: "jora-contract-draft",
      /**
       * CRITICAL:
       * Persist ONLY the draft data + meta.
       * Never persist UI flags or step index.
       */
      partialize: (state) => ({
        draft: state.draft,
        meta: state.meta,
      }),
    }
  )
);

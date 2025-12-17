// app/contracts/create/page.tsx

/**
 * Create Contract Page
 * --------------------
 * Entry point for the Create Contract flow.
 *
 * Responsibilities:
 * - Mount the ContractWizard
 * - Activate draft autosave
 * - NOTHING ELSE
 *
 * This file must stay thin.
 * No business logic.
 * No validation.
 * No API calls.
 */

import ContractWizard from "./components/ContractWizard";
import { useAutoSaveDraft } from "./hooks/useAutoSaveDraft";

export default function CreateContractPage() {
  // Enable autosave for the entire lifecycle of this page
  useAutoSaveDraft();

  return (
    <main className="min-h-screen bg-gray-50">
      <ContractWizard />
    </main>
  );
}

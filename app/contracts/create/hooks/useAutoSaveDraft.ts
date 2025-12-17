// app/contracts/create/hooks/useAutoSaveDraft.ts

/**
 * useAutoSaveDraft
 * ----------------
 * Frontend-only autosave mechanism for contract drafts.
 *
 * Responsibilities:
 * - Persist draft to backend WITHOUT involving n8n
 * - Save on:
 *   - dirty state (debounced)
 *   - step change (handled elsewhere)
 *   - page unload / refresh
 *
 * Guarantees:
 * - Stable idempotency is NOT touched here
 * - UI flags are NOT persisted
 * - Safe against rapid typing
 */

import { useEffect, useRef } from "react";
import { useContractDraftStore } from "../store/contractDraftStore";

const AUTOSAVE_INTERVAL_MS = 3000;

export function useAutoSaveDraft() {
  const {
    draft,
    meta,
    isDirty,
    isSaving,
    markSaved,
  } = useContractDraftStore();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Debounced autosave when draft becomes dirty ----
  useEffect(() => {
    if (!isDirty || isSaving) return;

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/contracts/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: meta.draft_id ?? null,
            payload: draft,
          }),
        });

        if (!res.ok) {
          // Intentionally silent — UI should not block user
          return;
        }

        const json = await res.json();
        markSaved(json.id, json.updated_at);
      } catch {
        // Silent failure; retry will happen on next change
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [draft, meta.draft_id, isDirty, isSaving, markSaved]);

  // ---- Save draft on page unload / refresh ----
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isDirty) return;

      // Fire-and-forget sync save
      navigator.sendBeacon(
        "/api/contracts/draft",
        JSON.stringify({
          id: meta.draft_id ?? null,
          payload: draft,
        })
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [draft, meta.draft_id, isDirty]);
}

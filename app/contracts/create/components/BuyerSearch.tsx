// app/contracts/create/components/BuyerSearch.tsx
"use client";

/**
 * BuyerSearch
 * -----------
 * - Searches existing buyers via API
 * - Debounced input
 * - Stateless w.r.t. global store
 * - Emits selected buyer upward
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type BuyerListItem = {
  id: number;
  full_name: string;
  city: string;
  phone: string;
  email?: string;
};

type BuyerSearchProps = {
  onSelect(buyer: BuyerListItem): void;
  onCreateNew(): void;
};

export default function BuyerSearch({
  onSelect,
  onCreateNew,
}: BuyerSearchProps) {
  const t = useTranslations("contracts.create");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BuyerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/buyers/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error("errors.searchFailed");
        }

        const json = await res.json();
        setResults(json.buyers ?? []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "errors.searchFailed");
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {t("buyer.searchLabel")}
      </label>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("buyer.searchPlaceholder")}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {loading && (
        <p className="mt-2 text-sm text-gray-600">
          {t("buyer.searching")}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {t(error)}
        </p>
      )}

      {!loading && query && results.length === 0 && (
        <p className="mt-3 text-sm text-gray-600">
          {t("buyer.noResults")}
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-4 divide-y rounded-md border">
          {results.map((buyer) => (
            <li
              key={buyer.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {buyer.full_name}
                </p>
                <p className="text-sm text-gray-600">
                  {buyer.city} · {buyer.phone}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelect(buyer)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                {t("actions.select")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={onCreateNew}
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("buyer.createNew")}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function ContractDatePage() {
  const [sessionId, setSessionId] = useState(null);
  const [contractNumber, setContractNumber] = useState("");
  const [date, setDate] = useState("");
  const [warning, setWarning] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Read query params: ?session=...&number=...
  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);

    const sess = params.get("session");
    const num = params.get("number");

    if (sess) setSessionId(sess);
    if (num) setContractNumber(num);

    // Default date = today
    if (!date) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, []);

  async function submitDate(force = false) {
    setError("");
    setWarning(null);
    setSubmitting(true);

    try {
      const user_id = localStorage.getItem("user_id");

      const res = await fetch("/api/new-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          session_id: sessionId,
          step: "contract_date",
          contract_number: contractNumber,
          contract_date: date,
          force_date: force
        })
      });

      const data = await res.json();

      // If backend says date is older than last contract
      if (!data.ok && data.reason === "older_than_last") {
        setWarning({
          last_date: data.last_contract_date,
          last_number: data.last_contract_number
        });
        setSubmitting(false);
        return;
      }

      if (!data.ok) {
        setError("Ceva nu a mers. Încearcă din nou.");
        setSubmitting(false);
        return;
      }

      // Date accepted → go to next step (input mode)
      const sessId = data.session_id || sessionId;
      window.location.href = `/contract/new/input-mode?session=${sessId}&number=${contractNumber}`;

    } catch (err) {
      console.error("DATE ERROR:", err);
      setError("Eroare de server. Încearcă mai târziu.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center px-6 py-12 fade">
      <h1 className="text-3xl mb-6 font-bold bg-gradient-to-b from-yellow-300 to-yellow-600 text-transparent bg-clip-text">
        Data contractului
      </h1>

      <div className="w-full max-w-md glass-card p-6 flex flex-col gap-4">

        <p className="text-gray-300">
          Număr contract: <b>{contractNumber || "–"}</b>
        </p>

        <label className="text-sm text-gray-400">
          Alege data contractului
        </label>

        <input
          type="date"
          className="input-glass"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {warning && (
          <div className="text-yellow-300 text-sm bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-3">
            <p>
              Data aleasă (<b>{date}</b>) este mai veche decât ultimul contract:
            </p>
            <p className="mt-1">
              Ultimul contract: <b>{warning.last_number}</b> – {warning.last_date}
            </p>
            <p className="mt-2">
              Poți să <b>forțezi</b> această dată sau să alegi una mai nouă.
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex flex-col gap-3 mt-2">
          {!warning && (
            <button
              disabled={submitting}
              onClick={() => submitDate(false)}
              className="btn-gold"
            >
              {submitting ? "Se verifică..." : "Continuă"}
            </button>
          )}

          {warning && (
            <>
              <button
                disabled={submitting}
                onClick={() => submitDate(true)}
                className="btn-gold"
              >
                {submitting ? "Se procesează..." : "Forțează această dată"}
              </button>
              <button
                disabled={submitting}
                onClick={() => setWarning(null)}
                className="glass-btn"
              >
                Alege altă dată
              </button>
            </>
          )}

          <button
            type="button"
            className="glass-btn"
            onClick={() => window.history.back()}
          >
            Înapoi
          </button>
        </div>
      </div>
    </main>
  );
}

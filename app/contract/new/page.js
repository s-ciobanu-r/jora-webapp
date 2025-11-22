"use client";

import { useEffect, useState } from "react";

export default function NewContractPage() {
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [lastContract, setLastContract] = useState(null);
  const [suggested, setSuggested] = useState(null);
  const [manualEntryMode, setManualEntryMode] = useState(false);
  const [manualNumber, setManualNumber] = useState("");

  // Fetch session + last contract on page load
  useEffect(() => {
    async function init() {
      const user_id = localStorage.getItem("user_id");

      const res = await fetch("/api/new-contract", {
        method: "POST",
        body: JSON.stringify({ user_id })
      }).then(r => r.json());

      setSessionId(res.session_id);
      setLastContract({
        number: res.last_contract_number,
        summary: res.last_contract_summary
      });
      setSuggested(res.suggested_contract_number);
      setLoading(false);
    }

    init();
  }, []);

  if (loading) return <p className="text-white p-10">Se încarcă...</p>;

  return (
    <main className="min-h-screen flex flex-col items-center p-6 text-white bg-black">

      <h1 className="text-3xl mb-6 font-bold bg-gradient-to-b from-yellow-300 to-yellow-600 text-transparent bg-clip-text">
        Contract Nou
      </h1>

      {/* STEP: Suggest Next Contract */}
      {!manualEntryMode && (
        <div className="glass-card w-full max-w-md p-6 flex flex-col gap-4">

          <p className="text-lg">
            Ultimul contract: <b>{lastContract.number}</b><br />
            <span className="text-sm text-gray-300">{lastContract.summary}</span>
          </p>

          <button
            className="btn-gold"
            onClick={() => {
              window.location.href = `/contract/new/date?session=${sessionId}&number=${suggested}`;
            }}
          >
            Folosește {suggested}
          </button>

          <button
            className="glass-btn"
            onClick={() => setManualEntryMode(true)}
          >
            Introdu manual
          </button>
        </div>
      )}

      {/* STEP: Manual Entry */}
      {manualEntryMode && (
        <div className="glass-card w-full max-w-md p-6 flex flex-col gap-4">
          <p className="text-lg">Introduceți număr contract</p>

          <input
            value={manualNumber}
            onChange={(e) => setManualNumber(e.target.value)}
            className="input-glass"
            placeholder="Ex: 2025-49"
          />

          <button
            className="btn-gold"
            onClick={() => {
              window.location.href = `/contract/new/date?session=${sessionId}&number=${manualNumber}`;
            }}
          >
            Continuă
          </button>

          <button className="glass-btn" onClick={() => setManualEntryMode(false)}>
            Înapoi
          </button>
        </div>
      )}

    </main>
  );
}

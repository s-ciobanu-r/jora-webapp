"use client";

import { useEffect, useState } from "react";

export default function NewContractPage() {
  const [lastContract, setLastContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLast() {
      try {
        const res = await fetch("/api/contract/last");
        const data = await res.json();

        if (data?.ok) setLastContract(data.contract);
      } catch (err) {
        console.log("Failed loading last contract:", err);
      }
      setLoading(false);
    }

    loadLast();
  }, []);

  function goNextContract() {
    if (!lastContract) return;
    const next = Number(lastContract.contract_number.split("-")[1]) + 1;
    const nextNumber = `${new Date().getFullYear()}-${next}`;

    window.location.href = `/contract/new/details?number=${nextNumber}`;
  }

  function goManual() {
    window.location.href = "/contract/new/manual";
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center px-6 py-12 fade">
      <h1 className="text-4xl font-bold mb-10 bg-gradient-to-b from-yellow-300 to-yellow-600 text-transparent bg-clip-text drop-shadow-xl tracking-wider">
        Contract Nou
      </h1>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl 
                      border border-white/10 rounded-2xl p-6 shadow-[0_0_45px_rgba(255,215,0,0.2)]">

        <h2 className="text-lg text-gray-300 mb-4">
          Ultimul contract:
        </h2>

        {loading && (
          <p className="text-gray-400">Se încarcă...</p>
        )}

        {!loading && !lastContract && (
          <p className="text-gray-400 mb-4">Nu există contracte.</p>
        )}

        {lastContract && (
          <div className="mb-4 text-gray-200">
            <p>Nr: <b>{lastContract.contract_number}</b></p>
            <p>Data: {lastContract.date?.substring(0,10)}</p>
            <p>Pret: {lastContract.price} EUR</p>
          </div>
        )}

        {lastContract && (
          <button
            onClick={goNextContract}
            className="w-full py-4 bg-gradient-to-br from-yellow-300 to-yellow-600 
                     text-black font-bold rounded-xl text-lg shadow-xl mb-4"
          >
            Folosește următorul contract
          </button>
        )}

        <button
          onClick={goManual}
          className="w-full py-4 bg-white/10 border border-white/20 
                   text-gray-200 font-semibold rounded-xl text-lg"
        >
          Introdu manual
        </button>
      </div>
    </main>
  );
}

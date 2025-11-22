import { useState } from "react";

export default function NewContractPage() {
  const [step, setStep] = useState(1);
  const [contractNumber, setContractNumber] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  function next() {
    setError("");
    setStep(step + 1);
  }

  function back() {
    setError("");
    setStep(step - 1);
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-6 text-white bg-black">
      <h1 className="text-3xl mb-6 font-bold bg-gradient-to-b from-yellow-300 to-yellow-600 text-transparent bg-clip-text">Contract Nou</h1>

      {/* STEP 1 - Contract Number */}
      {step === 1 && (
        <div className="glass-card w-full max-w-md p-6 flex flex-col gap-4">
          <p className="text-lg">Introduceți numărul contractului</p>
          <input
            className="input-glass"
            value={contractNumber}
            onChange={(e) => setContractNumber(e.target.value)}
            placeholder="Ex: 2025-56"
          />
          {error && <p className="text-red-400">{error}</p>}
          <button className="btn-gold" onClick={next}>Continuă</button>
        </div>
      )}

      {/* STEP 2 - Date */}
      {step === 2 && (
        <div className="glass-card w-full max-w-md p-6 flex flex-col gap-4">
          <p className="text-lg">Data contract</p>
          <input
            type="date"
            className="input-glass"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {error && <p className="text-red-400">{error}</p>}

          <div className="flex gap-4">
            <button className="glass-btn flex-1" onClick={back}>Înapoi</button>
            <button className="btn-gold flex-1" onClick={next}>Continuă</button>
          </div>
        </div>
      )}

      {/* STEP 3 - Upload or Manual */}
      {step === 3 && (
        <div className="glass-card w-full max-w-md p-6 flex flex-col gap-4">
          <p className="text-lg">Selectați metoda</p>

          <button className="btn-gold" onClick={() => alert("OCR Coming soon")}>Încarcă Factură (OCR)</button>
          <button className="glass-btn" onClick={() => alert("Manual Coming soon")}>Introducere Manuală</button>

          <button className="glass-btn" onClick={back}>Înapoi</button>
        </div>
      )}
    </main>
  );
}

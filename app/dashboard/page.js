"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    // Not logged in → redirect
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    // Logged in → allow dashboard to render
    setReady(true);
  }, []);

  if (!ready) return null; // prevents flicker

  return (
    <main className="min-h-screen bg-black flex flex-col items-center px-6 py-10 fade">

      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-b 
        from-yellow-300 to-yellow-600 text-transparent bg-clip-text 
        drop-shadow-xl tracking-widest">
        JORA DASHBOARD
      </h1>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl 
          border border-white/10 rounded-2xl p-6 
          shadow-[0_0_45px_rgba(255,215,0,0.15)]">

        <div className="flex flex-col gap-4">

          <button
            onClick={() => window.location.href = "/chat?mode=resume"}
            className="glass-btn"
          >
            🔄 Continuă sesiunea
          </button>

          <button
  onClick={() => window.location.href = "/contract/new"}
  className="glass-btn"
>
  🆕 Contract Nou
</button>

          <button
            onClick={() => window.location.href = "/chat?mode=edit_contract"}
            className="glass-btn"
          >
            ✏️ Editare Contract
          </button>

          <button
            onClick={() => window.location.href = "/chat?mode=qa"}
            className="glass-btn"
          >
            💬 Întrebări & Răspunsuri
          </button>

          <button
            onClick={() => window.location.href = "/analytics"}
            className="glass-btn"
          >
            📊 Analytics
          </button>

          <button
            onClick={() => window.location.href = "/database"}
            className="glass-btn"
          >
            📁 Baza de Date
          </button>

        </div>
      </div>

    </main>
  );
}

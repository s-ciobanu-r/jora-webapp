"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const telegram_id = localStorage.getItem("telegram_id");
    if (!telegram_id) window.location.href = "/login";

    fetch(`/api/session?telegram_id=${telegram_id}`)
      .then(r => r.json())
      .then(setSession);
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center px-6 py-10 fade">

      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-b from-yellow-300 to-yellow-600 text-transparent bg-clip-text drop-shadow-xl tracking-widest">
        JORA DASHBOARD
      </h1>

      {/* GLASS PANEL */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_45px_rgba(255,215,0,0.15)]">

        {/* CONTINUE SESSION */}
        {session?.can_resume && (
          <button
            onClick={() => window.location.href = `https://t.me/YOUR_BOT?start=resume_${session.contract_number}`}
            className="w-full mb-5 py-4 bg-gradient-to-br from-yellow-300 to-yellow-600 text-black font-bold rounded-xl text-lg shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:brightness-110 transition-all"
          >
            Continue: {session.session_title}
          </button>
        )}

        {/* GRID OF OPTIONS */}
        <div className="flex flex-col gap-4">

          <button
            onClick={() => window.location.href = "https://t.me/YOUR_BOT?start=new_contract"}
            className="glass-btn"
          >
            🆕 Contract Nou
          </button>

          <button
            onClick={() => window.location.href = "https://t.me/YOUR_BOT?start=edit_contract"}
            className="glass-btn"
          >
            ✏️ Editare Contract
          </button>

          <button
            onClick={() => window.location.href = "https://t.me/YOUR_BOT?start=qa"}
            className="glass-btn"
          >
            💬 Întrebări & Răspunsuri
          </button>

          <button className="glass-btn">
            📊 Analytics
          </button>

          <button className="glass-btn">
            📁 Baza de Date
          </button>

        </div>
      </div>

    </main>
  );
}

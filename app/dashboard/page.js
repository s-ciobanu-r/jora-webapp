"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      window.location.href = "/login";
      return;
    }

    fetch(`/api/session?user_id=${userId}`)
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => window.location.href = "/login");
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center px-6 py-10 fade">

      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-b from-yellow-300 to-yellow-600 
        text-transparent bg-clip-text drop-shadow-xl tracking-widest">
        JORA DASHBOARD
      </h1>

      {/* MAIN PANEL */}
      <div className="
        w-full max-w-md 
        bg-white/5 
        backdrop-blur-xl 
        border border-white/10 
        rounded-2xl 
        p-6 
        shadow-[0_0_45px_rgba(255,215,0,0.15)]
      ">

        {/* CONTINUE SESSION BUTTON */}
        {session?.can_resume && (
          <button
            onClick={() => window.location.href = `/chat?resume=${session.contract_number}`}
            className="
              w-full mb-6 py-4 
              bg-gradient-to-br from-yellow-300 to-yellow-600 
              text-black font-bold rounded-xl text-lg
              shadow-[0_0_25px_rgba(255,215,0,0.3)]
              hover:brightness-110 transition-all
            "
          >
            Continuă: {session.session_title}
          </button>
        )}

        {/* BUTTON GRID */}
        <div className="flex flex-col gap-4">

          <button
            onClick={() => window.location.href = "/chat?mode=new_contract"}
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

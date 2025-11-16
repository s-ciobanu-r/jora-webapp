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
    <main className="p-6 fade">
      <h1 className="text-3xl text-center font-bold mb-6 bg-gradient-to-r from-yellow-300 to-yellow-600 bg-clip-text text-transparent">
        JORA DASHBOARD
      </h1>

      {session?.can_resume && (
        <button
          onClick={() =>
            window.location.href =
              `https://t.me/YOUR_BOT?start=resume_${session.contract_number}`
          }
          className="w-full p-4 mb-6 rounded bg-yellow-500 text-black font-bold">
          Continue Session: {session.session_title}
        </button>
      )}

      <div className="grid grid-cols-1 gap-4">
        <button 
          className="p-4 rounded bg-black/40 border border-white/20"
          onClick={() => window.location.href = "https://t.me/YOUR_BOT?start=new_contract"}>
          🆕 New Contract
        </button>

        <button 
          className="p-4 rounded bg-black/40 border border-white/20"
          onClick={() => window.location.href = "https://t.me/YOUR_BOT?start=edit_contract"}>
          ✏️ Edit Contract
        </button>

        <button 
          className="p-4 rounded bg-black/40 border border-white/20"
          onClick={() => window.location.href = "https://t.me/YOUR_BOT?start=qa"}>
          💬 Q&A Assistant
        </button>

        <button className="p-4 rounded bg-black/40 border border-white/20">
          📊 Analytics (coming soon)
        </button>

        <button className="p-4 rounded bg-black/40 border border-white/20">
          📚 Database (coming soon)
        </button>
      </div>
    </main>
  );
}
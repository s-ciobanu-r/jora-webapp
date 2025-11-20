"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const MODE_LABELS = {
  resume: "Continuă sesiunea",
  new_contract: "Contract Nou",
  edit_contract: "Editare Contract",
  qa: "Întrebări & Răspunsuri",
  default: "Chat Jora"
};

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState("default");
  const [resumeId, setResumeId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Auth + mode setup
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    const m = searchParams.get("mode") || "default";
    const r = searchParams.get("resume") || null;

    setMode(m);
    setResumeId(r);

    // Intro message
    const label = MODE_LABELS[m] || MODE_LABELS.default;
    setMessages([
      {
        from: "system",
        text: `Ai intrat în modul: ${label}. Poți începe să vorbești cu Jora.`
      }
    ]);

    setReady(true);
  }, [searchParams]);

  // Auto scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    // Add user message locally
    const newMessages = [
      ...messages,
      { from: "user", text }
    ];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          mode,
          resume_id: resumeId,
          // send only last 15 messages as context
          history: newMessages.slice(-15),
          message: text
        })
      }).then(r => r.json());

      if (!res.ok) {
        setMessages(m => [
          ...m,
          {
            from: "system",
            text: "A apărut o eroare. Încearcă din nou."
          }
        ]);
      } else {
        setMessages(m => [
          ...m,
          {
            from: "assistant",
            text: res.reply
          }
        ]);
      }
    } catch (e) {
      setMessages(m => [
        ...m,
        {
          from: "system",
          text: "Nu mă pot conecta la server acum. Mai încearcă puțin mai târziu."
        }
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!ready) return null;

  const headerLabel = MODE_LABELS[mode] || MODE_LABELS.default;

  return (
    <main className="min-h-screen bg-black flex flex-col items-center px-4 py-6 fade">
      {/* HEADER */}
      <div className="w-full max-w-2xl mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold bg-gradient-to-b from-yellow-300 to-yellow-600 text-transparent bg-clip-text tracking-widest drop-shadow-xl">
          {headerLabel.toUpperCase()}
        </h1>

        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="text-sm text-yellow-300/80 hover:text-yellow-200 transition"
        >
          ⬅︎ Înapoi la Dashboard
        </button>
      </div>

      {/* CHAT CARD */}
      <div className="w-full max-w-2xl flex flex-col flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_45px_rgba(255,215,0,0.15)] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.from === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={
                  m.from === "user"
                    ? "max-w-[80%] rounded-2xl px-4 py-3 bg-gradient-to-br from-yellow-300 to-yellow-600 text-black text-sm shadow-[0_0_25px_rgba(255,215,0,0.3)]"
                    : m.from === "assistant"
                    ? "max-w-[80%] rounded-2xl px-4 py-3 bg-white/10 border border-white/10 text-sm text-white/90"
                    : "max-w-[80%] rounded-2xl px-3 py-2 bg-white/5 text-xs text-yellow-200/80 border border-yellow-200/20"
                }
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-white/10 bg-black/40 px-4 py-3 flex flex-col gap-2">
          <div className="flex gap-2 items-end">
            <textarea
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-yellow-400/70 focus:bg-black/40 min-h-[44px] max-h-[120px]"
              placeholder="Scrie mesajul pentru Jora..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                sending || !input.trim()
                  ? "bg-yellow-300/30 text-black/40 cursor-not-allowed"
                  : "bg-gradient-to-br from-yellow-300 to-yellow-600 text-black shadow-[0_0_25px_rgba(255,215,0,0.35)] hover:brightness-110"
              }`}
            >
              {sending ? "..." : "Trimite"}
            </button>
          </div>
          <p className="text-[11px] text-white/40">
            Enter = trimite • Shift+Enter = linie nouă
          </p>
        </div>
      </div>
    </main>
  );
}

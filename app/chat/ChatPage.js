"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import "./styles.css";

const MODE_LABELS = {
  resume: "Continuă sesiunea",
  new_contract: "Contract nou",
  edit_contract: "Editare contract",
  qa: "Întrebări & Răspunsuri"
};

export default function ChatPage() {
  const params = useSearchParams();
  const mode = params.get("mode") || "qa";
  const sessionId = params.get("session") || null;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);

  const bottomRef = useRef();

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("user_id")
      : null;

  // Redirect if somehow no user
  useEffect(() => {
    if (!userId) window.location.href = "/login";
  }, [userId]);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Optional: initial system message per mode
  useEffect(() => {
    const label = MODE_LABELS[mode] || "Chat";
    setSystemInfo({
      title: label,
      desc:
        mode === "new_contract"
          ? "Jora te ghidează pas cu pas să creezi un contract nou."
          : mode === "edit_contract"
          ? "Încarcă sau descrie contractul și Jora te ajută să îl modifici."
          : mode === "resume"
          ? "Reluăm sesiunea existentă. Poți continua exact de unde ai rămas."
          : "Pune orice întrebare legată de contracte, clienți, situații reale."
    });
  }, [mode]);

  async function sendMessage() {
    if (!input.trim() || !userId) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: input,
      time: now
    };

    setMessages(prev => [...prev, userMessage]);
    const textToSend = input;
    setInput("");
    setLoading(true);

    // Call Omega chat backend (proxy to n8n)
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        mode,
        session_id: sessionId,
        message: textToSend,
        history: messages.slice(-15) // last 15 msgs for context
      })
    });

    if (!res.body) {
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let aiText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      aiText += decoder.decode(value);

      // show streaming temp message
      setMessages(prev => [
        ...prev.filter(m => m.id !== "ai-temp"),
        {
          id: "ai-temp",
          sender: "jora",
          text: aiText,
          time: now
        }
      ]);
    }

    // finalize
    setMessages(prev => [
      ...prev.filter(m => m.id !== "ai-temp"),
      {
        id: Date.now() + 1,
        sender: "jora",
        text: aiText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      }
    ]);

    setLoading(false);
  }

  return (
    <main className="chat-container">
      {/* HEADER */}
      <div className="chat-header">
        <h1>JORA Concierge</h1>
        <p className="sub">
          {systemInfo?.title} {sessionId ? `• ${sessionId}` : ""}
        </p>
        {systemInfo?.desc && (
          <p className="sub-desc">{systemInfo.desc}</p>
        )}
      </div>

      {/* MESSAGES AREA */}
      <div className="messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`bubble ${
              msg.sender === "user" ? "user-bubble" : "jora-bubble"
            }`}
          >
            <div className="bubble-text">{msg.text}</div>
            <div className="bubble-time">{msg.time}</div>
          </div>
        ))}

        {loading && (
          <div className="bubble jora-bubble typing">
            <div className="dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* INPUT BAR */}
      <div className="input-bar">
        {/* (Future) attach button for OCR */}
        {/* <button className="attach-btn">📎</button> */}

        <input
          className="input-field"
          placeholder="Spune-i lui Jora ce ai nevoie…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={loading}
        >
          ➤
        </button>
      </div>
    </main>
  );
}

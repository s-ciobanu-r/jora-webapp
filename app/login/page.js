"use client";

import { useState } from "react";

export default function Login() {
  const [error, setError] = useState("");

  async function handleLogin() {
    const username = document.getElementById("user").value;
    const password = document.getElementById("pass").value;

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    }).then(r => r.json());

    if (!res.success) return setError("Invalid credentials");

    localStorage.setItem("telegram_id", res.telegram_id);
    window.location.href = "/dashboard";
  }

  return (
    <main className="flex flex-col items-center p-6 fade">
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-yellow-600 text-transparent bg-clip-text">
        JORA ACCESS
      </h1>

      <input id="user"
        placeholder="Username"
        className="w-full max-w-xs p-3 rounded bg-black/40 border border-white/20 mb-2" />

      <input id="pass"
        type="password"
        placeholder="Password"
        className="w-full max-w-xs p-3 rounded bg-black/40 border border-white/20 mb-4" />

      <button
        onClick={handleLogin}
        className="w-full max-w-xs p-3 rounded bg-gradient-to-br from-yellow-300 to-yellow-600 text-black font-semibold">
        Login
      </button>

      {error && <p className="text-red-400 mt-2">{error}</p>}
    </main>
  );
}
"use client";

import { useState } from "react";

export default function Login() {
  const [error, setError] = useState("");

  async function handleLogin() {
    const username = document.getElementById("user").value.trim();
    const password = document.getElementById("pass").value.trim();

    if (!username || !password) {
      setError("Introduceți numele și parola");
      return;
    }

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    console.log("LOGIN RESPONSE:", data); // DEBUG

    if (!data.success) {
      setError("Datele de autentificare sunt invalide");
      return;
    }

    // Save user session
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("name", data.name);
    localStorage.setItem("role", data.role);

    // ✅ REDIRECT WORKS
    window.location.href = "/dashboard";
  }

  return (
    <main className="container-center fade">

      <h1 className="text-4xl font-bold mb-10 bg-gradient-to-b from-yellow-300 to-yellow-600 text-transparent bg-clip-text drop-shadow-xl tracking-wider">
        JORA
      </h1>

      <div className="w-full max-w-md glass-card">
        <div className="flex flex-col gap-4">

          <input id="user" placeholder="Username" className="input-glass" />
          <input id="pass" type="password" placeholder="Password" className="input-glass" />

          <button onClick={handleLogin} className="btn-gold">
            Autentificare
          </button>

          {error && <p className="text-red-400 text-center mt-2">{error}</p>}
        </div>
      </div>

    </main>
  );
}

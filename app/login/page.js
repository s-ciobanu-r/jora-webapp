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
    }).then(r => r.json());

    if (!res.success) {
      setError("Datele de autentificare sunt invalide");
      return;
    }

    // Store user info for session
    localStorage.setItem("user_id", res.user_id);
    localStorage.setItem("name", res.name);
    localStorage.setItem("role", res.role);

    // Redirect to dashboard
    window.location.href = "/dashboard";
  }

  return (
    <main className="container-center fade">

      {/* LOGO */}
      <h1 className="text-4xl font-bold mb-10 bg-gradient-to-b from-yellow-300 to-yellow-600 text-transparent bg-clip-text drop-shadow-xl tracking-wider">
        JORA
      </h1>

      {/* LOGIN BOX */}
      <div className="w-full max-w-md glass-card">
        <div className="flex flex-col gap-4">

          {/* Username */}
          <input
            id="user"
            placeholder="Username"
            className="input-glass"
          />

          {/* Password */}
          <input
            id="pass"
            type="password"
            placeholder="Password"
            className="input-glass"
          />

          {/* Button */}
          <button
            onClick={handleLogin}
            className="btn-gold"
          >
            Autentificare
          </button>

          {/* Error text */}
          {error && (
            <p className="text-red-400 text-center mt-2">{error}</p>
          )}
        </div>
      </div>

    </main>
  );
}

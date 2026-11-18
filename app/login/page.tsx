"use client";
import { useState } from "react";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      window.location.href = "/week";
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "That didn't work.");
    setBusy(false);
  }

  return (
    <main className="center">
      <form className="card login" onSubmit={submit}>
        <h1>Weekly Compass</h1>
        <p className="muted small">First things first. Enter your code to begin.</p>
        <div className="field">
          <label htmlFor="code">Your code</label>
          <input
            id="code"
            type="text"
            autoComplete="off"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Q2-XXXXXX"
          />
        </div>
        <button className="btn primary" style={{ width: "100%" }} disabled={busy || !code.trim()}>
          {busy ? "Opening…" : "Open my planner"}
        </button>
        <div className="error" role="alert">{error}</div>
      </form>
    </main>
  );
}

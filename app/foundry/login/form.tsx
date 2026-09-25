"use client";
import { useState } from "react";

export default function LoginForm({ setup }: { setup: boolean }) {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  return <form className="space-y-5" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const setupToken = new URLSearchParams(window.location.hash.slice(1)).get("setup");
    try {
      const response = await fetch(`/api/foundry/${setup ? "setup" : "login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: form.get("password"), setupToken }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      window.history.replaceState(null, "", "/foundry/login");
      window.location.replace("/foundry");
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to sign in."); setBusy(false); }
  }}>
    <div><label className="mb-2 block text-sm" htmlFor="password">Password</label>
      <input id="password" name="password" type="password" required minLength={12} autoComplete={setup ? "new-password" : "current-password"} aria-describedby={setup ? "password-rule" : undefined} className="min-h-12 w-full rounded-lg border border-sand/30 bg-coal px-4 text-base outline-none focus:border-glow" />
    </div>
    {setup && <p id="password-rule" className="text-sm text-sand">At least 12 characters. Maximum 72 UTF-8 bytes. Use your private setup link.</p>}
    {error && <p role="alert" className="text-sm text-glow-soft">{error}</p>}
    <button disabled={busy} className="min-h-12 w-full rounded-lg bg-glow px-5 font-medium text-ink transition hover:bg-glow-soft disabled:opacity-50">{busy ? "Please wait…" : setup ? "Set password" : "Sign in"}</button>
  </form>;
}

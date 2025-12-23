"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return setErr("Login failed");
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <p className="text-sm text-slate-600">
          Use the <code className="px-1 py-0.5 bg-slate-100 rounded">ADMIN_PASSWORD</code> set in
          Vercel. Email is optional and only required if you maintain admin users in the database.
        </p>
        <input
          className="w-full border rounded-xl p-3"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded-xl p-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <button className="w-full rounded-xl border p-3">Sign in</button>
      </form>
    </div>
  );
}

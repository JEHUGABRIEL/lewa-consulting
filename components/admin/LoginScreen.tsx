"use client";

import React, { useState } from "react";
import Link from "next/link";
import Mark from "@/components/Mark";
import { API_PATH } from "@/lib/admin/constants";
import { Button, Spinner } from "./ui";











export default function LoginScreen({
  onSuccess,
  successHref = "/admin",
}: {
  onSuccess?: () => void;
  successHref?: string;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Veuillez saisir vos identifiants.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_PATH}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (res.status === 401) {
        setError("Nom d'utilisateur ou mot de passe incorrect.");
      } else if (res.status === 429) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Trop de tentatives. Réessayez plus tard.");
      } else if (!res.ok) {
        setError("Erreur serveur — réessayez plus tard.");
      } else if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = successHref;
      }
    } catch {
      setError("Erreur réseau — serveur injoignable.");
    }
    setBusy(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-4 py-10">
      { }
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-navy/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md animate-slide-up">
        { }
        <div className="overflow-hidden rounded-2xl bg-paper shadow-2xl">
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent"
            aria-hidden="true"
          />
          { }
          <div className="flex flex-col items-center border-b border-border px-8 pb-6 pt-8 text-center">
            <span className="flex h-14 w-auto items-center rounded-xl bg-white p-2 shadow-sm">
              <Mark className="h-10 w-auto" />
            </span>
            <h1 className="mt-4 font-display text-xl font-semibold text-navy">
              Espace d&apos;administration
            </h1>
            <p className="mt-1 text-xs text-muted">Connexion réservée à l&apos;équipe COSI LEWA</p>
          </div>

          { }
          <form onSubmit={submit} className="space-y-4 px-8 py-6">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-navy/70">
                Nom d&apos;utilisateur
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-navy/50 focus:ring-2 focus:ring-navy/10"
                placeholder="admin"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-navy/70">
                Mot de passe
              </span>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 pr-11 text-sm text-ink outline-none transition focus:border-navy/50 focus:ring-2 focus:ring-navy/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-navy/40 transition hover:text-navy"
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            {error && (
              <p className="rounded-lg bg-red/10 px-3 py-2 text-xs font-medium text-red" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full py-2.5" disabled={busy}>
              {busy ? <Spinner className="h-4 w-4 border-white/30 border-t-white" /> : "Se connecter"}
            </Button>
          </form>

          { }
          <div className="flex items-center justify-between border-t border-border bg-navy/[0.02] px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-navy/70 transition hover:text-navy"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Retour au site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}





function EyeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

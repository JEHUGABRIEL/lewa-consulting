"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Mark from "@/components/Mark";
import { Button, Spinner } from "./ui";

type Step = "loading" | "invalid" | "form" | "otp";

const inputCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-navy/50 focus:ring-2 focus:ring-navy/10";

export default function InviteRegistration({ token }: { token: string }) {
  const [step, setStep] = useState<Step>("loading");
  const [invalidMsg, setInvalidMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [otp, setOtp] = useState("");

  const setField = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Vérification via le lien « Valider mon compte » de l'email (?code=)
      // ou via le code OTP saisi : active le compte puis redirige.
      const runVerify = async (code: string) => {
        setBusy(true);
        try {
          const vres = await fetch("/api/admin/register/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ token, code }),
          });
          const vdata = (await vres.json().catch(() => null)) as {
            error?: string;
          } | null;
          if (vres.ok) {
            window.location.href = "/admin";
            return;
          }
          setError(vdata?.error ?? "Vérification impossible.");
        } catch {
          setError("Erreur réseau — serveur injoignable.");
        }
        setBusy(false);
      };

      try {
        const res = await fetch(`/api/admin/invites/${token}`, {
          credentials: "same-origin",
        });
        if (res.status !== 200) {
          const data = (await res.json().catch(() => null)) as {
            reason?: string;
          } | null;
          if (!cancelled) {
            setInvalidMsg(
              data?.reason === "used"
                ? "Cette invitation a déjà été utilisée."
                : data?.reason === "expired"
                  ? "Cette invitation a expiré. Demandez-en une nouvelle."
                  : "Ce lien d'invitation est invalide.",
            );
            setStep("invalid");
          }
          return;
        }
        const data = (await res.json()) as {
          email: string;
          alreadyRegistered: boolean;
          pendingVerification: boolean;
        };
        if (cancelled) return;

        const code = new URLSearchParams(window.location.search).get("code");

        if (data.alreadyRegistered) {
          // Compte déjà actif : l'invitation est consommée, direction le login.
          setInvalidMsg(
            "Un compte a déjà été créé pour cette adresse email. Vous pouvez vous connecter.",
          );
          setStep("invalid");
          return;
        }

        setForm((f) => ({ ...f, email: data.email }));

        if (data.pendingVerification) {
          // Compte créé mais pas encore vérifié (OTP en cours) : on laisse
          // finaliser la validation — via le lien de l'email (code) ou en
          // saisissant le code reçu.
          setStep("otp");
          if (code) await runVerify(code);
          return;
        }

        // Invitation vierge : formulaire de création, ou vérification directe
        // si un code de validation est présent.
        setStep("form");
        if (code) await runVerify(code);
      } catch {
        if (!cancelled) {
          setInvalidMsg("Erreur réseau — serveur injoignable.");
          setStep("invalid");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { firstName, lastName, username, email, password, confirm } = form;
    if (!firstName || !lastName || !username || !email) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token, firstName, lastName, username, email, password }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        devOtp?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error ?? "Erreur serveur.");
        setBusy(false);
        return;
      }
      setDevOtp(data?.devOtp ?? "");
      setError("");
      setStep("otp");
    } catch {
      setError("Erreur réseau — serveur injoignable.");
    }
    setBusy(false);
  };

  const verify = async (code: string) => {
    setError("");
    if (!code.trim()) {
      setError("Veuillez saisir le code reçu par email.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token, code: code.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (res.ok) {
        window.location.href = "/admin";
        return;
      }
      setError(data?.error ?? "Code incorrect.");
    } catch {
      setError("Erreur réseau — serveur injoignable.");
    }
    setBusy(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-4 py-10">
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-navy/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="overflow-hidden rounded-2xl bg-paper shadow-2xl">
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent"
            aria-hidden="true"
          />
          <div className="flex flex-col items-center border-b border-border px-8 pb-6 pt-8 text-center">
            <span className="flex h-14 w-auto items-center rounded-xl bg-white p-2 shadow-sm">
              <Mark className="h-10 w-auto" />
            </span>
            <h1 className="mt-4 font-display text-xl font-semibold text-navy">
              {step === "otp" ? "Vérification de votre compte" : "Création de compte administrateur"}
            </h1>
            <p className="mt-1 text-xs text-muted">
              {step === "otp"
                ? "Saisissez le code reçu par email pour activer votre compte."
                : "Espace d'administration — COSI LEWA Consulting"}
            </p>
          </div>

          {step === "loading" && (
            <div className="flex items-center justify-center px-8 py-16">
              <Spinner className="h-8 w-8" />
            </div>
          )}

          {step === "invalid" && (
            <div className="space-y-4 px-8 py-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red/10 text-red">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
              <p className="text-sm text-ink/80">{invalidMsg}</p>
              <Link
                href="/"
                className="inline-block text-xs font-medium text-navy/70 transition hover:text-navy"
              >
                Retour au site
              </Link>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={submit} className="space-y-4 px-8 py-6">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-navy/70">Prénom</span>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setField("firstName")(e.target.value)}
                    autoComplete="given-name"
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-navy/70">Nom</span>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setField("lastName")(e.target.value)}
                    autoComplete="family-name"
                    className={inputCls}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-navy/70">Nom d&apos;utilisateur</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setField("username")(e.target.value)}
                  autoComplete="username"
                  className={inputCls}
                  placeholder="ex : j.doe"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-navy/70">Adresse email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email")(e.target.value)}
                  autoComplete="email"
                  className={`${inputCls} bg-navy/[0.03]`}
                  readOnly
                />
                <span className="mt-1 block text-[11px] text-muted">
                  Adresse liée à l&apos;invitation.
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-navy/70">Mot de passe</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password")(e.target.value)}
                  autoComplete="new-password"
                  className={inputCls}
                  placeholder="8 caractères minimum"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-navy/70">Confirmation du mot de passe</span>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setField("confirm")(e.target.value)}
                  autoComplete="new-password"
                  className={inputCls}
                />
              </label>

              {error && (
                <p className="rounded-lg bg-red/10 px-3 py-2 text-xs font-medium text-red" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full py-2.5" disabled={busy}>
                {busy ? <Spinner className="h-4 w-4 border-white/30 border-t-white" /> : "Créer mon compte"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void verify(otp);
              }}
              className="space-y-4 px-8 py-6"
            >
              {devOtp && (
                <div className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                    Code affiché en secours
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tracking-[0.3em] text-navy">
                    {devOtp}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    Aucun email envoyé (configuration absente ou échec d&apos;envoi) :
                    utilisez ce code pour valider votre compte.
                  </p>
                </div>
              )}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-navy/70">
                  Code de vérification (6 chiffres)
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  autoFocus
                  className={`${inputCls} text-center font-mono text-lg tracking-[0.5em]`}
                  placeholder="••••••"
                />
              </label>
              <p className="text-[11px] leading-relaxed text-muted">
                Vous pouvez aussi cliquer sur le lien « Valider mon compte » reçu par
                email : la validation se fera automatiquement.
              </p>
              {error && (
                <p className="rounded-lg bg-red/10 px-3 py-2 text-xs font-medium text-red" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full py-2.5" disabled={busy}>
                {busy ? <Spinner className="h-4 w-4 border-white/30 border-t-white" /> : "Valider et accéder au dashboard"}
              </Button>
            </form>
          )}

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
            <Link
              href="/admin/login"
              className="text-xs font-medium text-navy/70 transition hover:text-navy"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Mark from "./Mark";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Veuillez entrer votre adresse email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Adresse email invalide");
      return;
    }

    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="mt-auto border-t border-border bg-navy-deep text-paper/80">
      {/* Accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-gold-bright via-red to-navy" />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-8 sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-4">
        {/* Colonne 1 — Marque */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <Mark className="h-9 w-9 shrink-0" />
            <div>
              <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-gold-bright/70">
                Cabinet
              </span>
              <span className="block font-display text-base leading-tight text-paper">
                COSI Lewa-Consulting Group
              </span>
            </div>
          </div>
          {/* Réseaux sociaux stylisés */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-paper/40">
              Suivez-nous
            </span>
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-paper/15 text-paper/40 transition hover:border-gold-bright/40 hover:text-gold-bright"
                aria-label="Facebook"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-paper/15 text-paper/40 transition hover:border-gold-bright/40 hover:text-gold-bright"
                aria-label="LinkedIn"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-paper/15 text-paper/40 transition hover:border-gold-bright/40 hover:text-gold-bright"
                aria-label="WhatsApp"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-6 border-t border-paper/10 pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-bright/70">
              Newsletter
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-paper/50">
              Recevez nos actualités, sessions de formation et conseils.
            </p>

            {subscribed ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-green/10 px-3.5 py-2.5 text-xs text-green/80">
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Merci de votre inscription&nbsp;!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label htmlFor="footer-email" className="sr-only">
                    Adresse email
                  </label>
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="votre@email.com"
                    className="w-full rounded-lg border border-paper/15 bg-white/5 px-3 py-2 text-xs text-paper placeholder-paper/30 outline-none transition focus:border-gold-bright/50 focus:bg-white/10"
                    aria-invalid={!!error}
                    aria-describedby={error ? "footer-email-error" : undefined}
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg bg-gold-bright/90 px-4 py-2 text-xs font-semibold text-navy transition hover:bg-gold-bright active:scale-95"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      <span className="hidden sm:inline">S&rsquo;abonner</span>
                    </span>
                  </button>
                </div>
                {error && (
                  <p id="footer-email-error" className="mt-1.5 text-[10px] text-red/80" role="alert">
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Colonne 2 — Navigation */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-bright">Navigation</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/" className="flex items-center gap-2 transition hover:text-gold-bright group"><span className="inline-block h-1 w-1 shrink-0 rounded-full bg-paper/20 transition group-hover:bg-gold-bright" />Accueil</Link></li>
            <li><Link href="/services" className="flex items-center gap-2 transition hover:text-gold-bright group"><span className="inline-block h-1 w-1 shrink-0 rounded-full bg-paper/20 transition group-hover:bg-gold-bright" />Notre expertise</Link></li>
            <li><Link href="/formations/comptabilite-finance" className="flex items-center gap-2 transition hover:text-gold-bright group"><span className="inline-block h-1 w-1 shrink-0 rounded-full bg-paper/20 transition group-hover:bg-gold-bright" />Formations</Link></li>
            <li><Link href="/formations/comptabilite-finance" className="flex items-center gap-2 transition hover:text-gold-bright group"><span className="inline-block h-1 w-1 shrink-0 rounded-full bg-paper/20 transition group-hover:bg-gold-bright" />Comptabilité &amp; finance</Link></li>
            <li><Link href="/formations/bureautique-developpement" className="flex items-center gap-2 transition hover:text-gold-bright group"><span className="inline-block h-1 w-1 shrink-0 rounded-full bg-paper/20 transition group-hover:bg-gold-bright" />Bureautique &amp; dév.</Link></li>
          </ul>
        </div>

        {/* Colonne 3 — Services */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-bright">Domaines</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/services" className="transition hover:text-gold-bright">Audit</Link></li>
            <li><Link href="/services" className="transition hover:text-gold-bright">Assistance comptable &amp; fiscale</Link></li>
            <li><Link href="/formations/comptabilite-finance" className="transition hover:text-gold-bright">Formations</Link></li>
          </ul>
        </div>

        {/* Colonne 4 — Contact */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-bright">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-gold-bright/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="leading-snug">Avenue des Martyrs — SOCATEL<br />Bangui, République Centrafricaine</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-gold-bright/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <div className="min-w-0">
                <a href="tel:+23672696700" className="block truncate transition hover:text-gold-bright">+236 72 69 67 00</a>
                <a href="tel:+23672696700" className="block truncate text-paper/50 transition hover:text-gold-bright">+236 72 69 67 00</a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-gold-bright/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href="mailto:cabinetcosi29@gmail.com" className="break-all transition hover:text-gold-bright">
                cabinetcosi29@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Barre inférieure */}
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-paper/40 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p>
              &copy; {new Date().getFullYear()}{" "}
              <span className="text-paper/60">Cabinet COSI Lewa-Consulting Group</span>
            </p>
            <span className="hidden sm:inline text-paper/20">|</span>
            <p>Tous droits réservés</p>
            <span className="hidden sm:inline text-paper/20">|</span>
            <Link href="/mentions-legales" className="transition hover:text-gold-bright">
              Mentions légales
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-paper/30">Bangui, RCA</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-paper/15 text-paper/40 transition hover:border-gold-bright/40 hover:text-gold-bright hover:-translate-y-0.5"
              aria-label="Retour en haut"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 10V2M2 6l4-4 4 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRY_CODES,
  toTelHref,
  toWhatsAppHref,
} from "@/lib/phone";
import { useScrollLock } from "@/lib/scrollLock";

export type EnrollmentFormation = {
  slug: string;
  name: string;
};

const inputCls =
  "w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink placeholder-muted/50 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted";


const OTHER_VALUE = "__other__";

export default function EnrollmentModal({
  open,
  onClose,
  formations,
  initialSlug,
}: {
  open: boolean;
  onClose: () => void;
  formations: EnrollmentFormation[];
  initialSlug: string;
}) {
  const t = useTranslations();
  const options =
    formations.length > 0
      ? formations
      : initialSlug
        ? [{ slug: initialSlug, name: initialSlug }]
        : [];

  const [selected, setSelected] = useState(initialSlug);
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_PHONE_COUNTRY);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [availability, setAvailability] = useState("");
  const [otherFormation, setOtherFormation] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    // Réinitialisation volontaire du formulaire à chaque ouverture.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(initialSlug || options[0]?.slug || "");
    setOtherFormation("");
    setSent(false);
    setSubmitting(false);
    setError("");
    const id = window.setTimeout(() => nameRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialSlug]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useScrollLock(open);


  const isOther = selected === OTHER_VALUE;


  useEffect(() => {
    if (isOther) otherRef.current?.focus();
  }, [isOther]);

  if (!open) return null;

  const selectedName = isOther
    ? otherFormation.trim() || t("enroll.other")
    : options.find((o) => o.slug === selected)?.name || selected;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    if (!selected) {
      setError(t("enroll.required"));
      return;
    }
    if (isOther && !otherFormation.trim()) {
      setError(t("enroll.otherRequired"));
      return;
    }
    if (!name.trim()) {
      setError(t("enroll.required"));
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
      setError(t("enroll.invalidPhone"));
      return;
    }

    // Enregistre la demande dans le dashboard admin. Le canal WhatsApp reste
    // la solution de repli si l'enregistrement échoue (jamais bloquant).
    setSubmitting(true);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch("/api/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            formation: selectedName,
            name: name.trim(),
            phone: phone.trim(),
            countryCode,
            email: email.trim(),
            availability: availability.trim(),
          }),
        });
        if (!res.ok) {
          console.warn("[enroll] enregistrement refusé par le serveur :", res.status);
        }
      } finally {
        window.clearTimeout(timeout);
      }
    } catch (err) {
      console.warn("[enroll] enregistrement impossible — repli WhatsApp :", err);
    } finally {
      setSubmitting(false);
    }

    const message = t("enroll.waMessage", {
      formation: selectedName,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || "—",
      availability: availability.trim() || "—",
    });
    const url = `${toWhatsAppHref(t("common.phone"))}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const benefits = [
    { icon: "certif", label: t("enroll.benefit1") },
    { icon: "seats", label: t("enroll.benefit2") },
    { icon: "reply", label: t("enroll.benefit3") },
  ];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t("enroll.title")}
    >
      { }
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      { }
      <div className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-paper shadow-2xl animate-scale-in sm:rounded-2xl lg:flex-row">
        { }
        <aside className="relative hidden shrink-0 overflow-hidden bg-gradient-to-br from-navy to-navy-deep text-paper lg:flex lg:w-80 lg:flex-col">
          { }
          <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
            <svg className="h-full w-full opacity-[0.05]" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="60,480 150,410 240,480 150,550" fill="#C99A2E" />
              <polygon points="300,80 370,120 370,200 300,240 230,200 230,120" fill="#C99A2E" />
              <circle cx="350" cy="470" r="90" stroke="#C99A2E" strokeWidth="0.5" />
              <circle cx="40" cy="90" r="70" stroke="#C99A2E" strokeWidth="0.5" />
              <line x1="0" y1="330" x2="400" y2="330" stroke="#C99A2E" strokeWidth="0.5" strokeDasharray="3 6" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-1 flex-col p-7">
            { }
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-bright">
              <span className="inline-block h-px w-5 bg-gold-bright/50" />
              {t("enroll.eyebrow")}
            </p>

            { }
            <h2 className="mt-3 font-display text-2xl leading-tight text-paper">
              {t("enroll.asideTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-paper/70">
              {t("enroll.asideLead")}
            </p>

            { }
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-paper/50">
                {t("enroll.formation")}
              </p>
              <div className="mt-2 flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-bright/20 text-gold-bright">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <p className="font-display text-sm font-semibold leading-snug text-paper">
                  {selectedName}
                </p>
              </div>
            </div>

            { }
            <ul className="mt-6 space-y-3">
              {benefits.map((b) => (
                <li key={b.icon} className="flex items-center gap-3 text-sm text-paper/80">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-bright/15 text-gold-bright">
                    {b.icon === "certif" && (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        <path d="M8 7h8" />
                        <path d="M8 11h5" />
                      </svg>
                    )}
                    {b.icon === "seats" && (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      </svg>
                    )}
                    {b.icon === "reply" && (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    )}
                  </span>
                  {b.label}
                </li>
              ))}
            </ul>

            { }
            <div className="mt-auto space-y-2 border-t border-white/10 pt-5 text-xs text-paper/60">
              <a
                href={toTelHref(t("common.phone"))}
                className="group flex items-center gap-2 transition hover:text-paper"
              >
                <svg className="h-3.5 w-3.5 shrink-0 text-gold-bright/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {t("common.phone")}
              </a>
              <a
                href={`mailto:${t("common.email")}`}
                className="group flex items-center gap-2 transition hover:text-paper"
              >
                <svg className="h-3.5 w-3.5 shrink-0 text-gold-bright/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="truncate">{t("common.email")}</span>
              </a>
            </div>
          </div>
        </aside>

        { }
        <div className="flex min-w-0 flex-1 flex-col">
          { }
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-6 sm:px-8 lg:px-10">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                <span className="inline-block h-px w-4 bg-gold/50" />
                {t("enroll.eyebrow")}
              </p>
              <h2 className="mt-1.5 font-display text-xl leading-tight text-navy sm:text-2xl">
                {t("enroll.title")}
              </h2>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-muted">
                {t("enroll.subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("enroll.close")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/[0.06] text-navy transition-all duration-300 hover:rotate-90 hover:bg-navy/[0.12]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          { }
          <div className="overflow-y-auto px-6 py-7 sm:px-8 lg:px-10">
            {sent ? (
              <div className="flex flex-col items-center py-10 text-center" role="status" aria-live="polite">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green/10">
                  <svg className="h-8 w-8 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </span>
                <h3 className="mt-5 font-display text-xl text-navy">
                  {t("enroll.successTitle")}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                  {t("enroll.successText", { phone: t("common.phone") })}
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-paper transition-all duration-300 hover:bg-navy-deep hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {t("enroll.close")}
                  </button>
                  <a
                    href={toWhatsAppHref(t("common.phone"))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-ink/70 transition hover:border-navy/30 hover:text-navy"
                  >
                    <svg className="h-4 w-4 text-green" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    {t("enroll.waOpen")}
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                { }
                <div>
                  <label htmlFor="enroll-formation" className={labelCls}>
                    {t("enroll.formation")} <span className="text-red">*</span>
                  </label>
                  <select
                    id="enroll-formation"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className={`${inputCls} cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22 fill=%22none%22 stroke=%22%23635C4C%22 stroke-width=%221.5%22><path d=%22M3 4.5L6 7.5L9 4.5%22/></svg>')] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
                  >
                    {options.map((o) => (
                      <option key={o.slug} value={o.slug}>
                        {o.name}
                      </option>
                    ))}
                    <option value={OTHER_VALUE}>{t("enroll.other")}</option>
                  </select>
                </div>

                { }
                {isOther && (
                  <div className="mt-3 animate-fade-in">
                    <label htmlFor="enroll-other" className={labelCls}>
                      {t("enroll.otherLabel")} <span className="text-red">*</span>
                    </label>
                    <input
                      ref={otherRef}
                      id="enroll-other"
                      type="text"
                      autoComplete="off"
                      value={otherFormation}
                      onChange={(e) => {
                        setOtherFormation(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder={t("enroll.otherPlaceholder")}
                      className={inputCls}
                    />
                  </div>
                )}

                { }
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="enroll-name" className={labelCls}>
                      {t("enroll.name")} <span className="text-red">*</span>
                    </label>
                    <input
                      ref={nameRef}
                      id="enroll-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder={t("enroll.namePlaceholder")}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label htmlFor="enroll-phone" className={labelCls}>
                      {t("enroll.phone")} <span className="text-red">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        id="enroll-country-code"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label={t("enroll.countryCode")}
                        className="w-[9.5rem] shrink-0 cursor-pointer rounded-lg border border-border bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                      >
                        {PHONE_COUNTRY_CODES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        id="enroll-phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder={t("enroll.phonePlaceholder")}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                { }
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted/70">
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  {t("enroll.phoneHint")}
                </p>

                { }
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="enroll-email" className={labelCls}>
                      {t("enroll.email")}
                    </label>
                    <input
                      id="enroll-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("enroll.emailPlaceholder")}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label htmlFor="enroll-availability" className={labelCls}>
                      {t("enroll.availability")}
                    </label>
                    <input
                      id="enroll-availability"
                      type="text"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      placeholder={t("enroll.availabilityPlaceholder")}
                      className={inputCls}
                    />
                  </div>
                </div>

                { }
                {error && (
                  <p className="mt-4 flex items-center gap-2 rounded-lg bg-red/10 px-3.5 py-2.5 text-xs font-medium text-red" role="alert">
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </p>
                )}

                { }
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-bright px-7 py-3.5 text-sm font-semibold text-navy shadow-sm transition-all duration-300 hover:bg-gold hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-gold-bright disabled:hover:shadow-sm"
                  >
                    {submitting ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    )}
                    {submitting ? t("enroll.submitting") || t("enroll.submit") : t("enroll.submit")}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-ink/70 transition hover:border-navy/30 hover:text-navy"
                  >
                    {t("enroll.cancel")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

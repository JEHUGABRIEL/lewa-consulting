"use client";

import React, { useEffect, useRef, useState } from "react";
import { API_PATH } from "@/lib/admin/constants";






export type FieldOption = { value: string; label: string };

export type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "image";
  options?: FieldOption[];
  required?: boolean;
  placeholder?: string;

  autoFrom?: string;
};



export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-navy text-paper hover:bg-navy/90 shadow-sm",
    secondary:
      "border border-navy/25 bg-white text-navy hover:border-navy/50 hover:bg-navy/[0.03]",
    danger: "bg-red text-white hover:bg-red/90 shadow-sm",
    ghost: "text-navy/60 hover:bg-navy/[0.05] hover:text-navy",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}



export function FieldInput({
  field,
  value,
  onChange,
  notify,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  notify?: (msg: string, type?: "success" | "error") => void;
}) {
  const base =
    "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-navy/50 focus:ring-2 focus:ring-navy/10";
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${API_PATH}/upload`, {
        method: "POST",
        credentials: "same-origin",
        body,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Échec de l'import de l'image.");
      }
      const data = (await res.json()) as { url: string };
      onChange(data.url);
      notify?.("Image importée avec succès.");
    } catch (err) {
      notify?.(err instanceof Error ? err.message : "Échec de l'import de l'image.", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const labelNode = (
    <span className="mb-1.5 block text-xs font-semibold text-navy/70">
      {field.label}
      {field.required && <span className="ml-0.5 text-red">*</span>}
    </span>
  );

  if (field.type === "image") {
    return (
      <div className="block">
        {labelNode}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              className={`${base} flex-1`}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-navy/25 bg-white px-3 py-2 text-xs font-semibold text-navy transition hover:border-navy/50 hover:bg-navy/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? <Spinner className="h-3.5 w-3.5" /> : <UploadIcon />}
              {uploading ? "Import…" : "Importer"}
            </button>
          </div>
          {value && (
            <span className="block overflow-hidden rounded-lg border border-border bg-navy/[0.03]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" className="h-28 w-full object-cover" />
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <label className="block">
      {labelNode}
      {field.type === "textarea" ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`${base} resize-y`}
        />
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} cursor-pointer`}
        >
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={base}
        />
      )}
    </label>
  );
}



export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {





  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // Verrouille html ET body : `overflow-x: clip` sur <html> (globals.css)
    // empêche `overflow: hidden` posé sur <body> seul de verrouiller le viewport.
    document.documentElement.classList.add("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${width} overflow-hidden rounded-2xl bg-paper shadow-2xl animate-scale-in`}
      >
        { }
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent"
          aria-hidden="true"
        />
        <div className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-8 sm:py-5">
          <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-navy/50 transition hover:rotate-90 hover:bg-navy/[0.06] hover:text-navy"
            aria-label="Fermer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="scrollbar-thin max-h-[70vh] overflow-y-auto overflow-x-clip px-6 py-6 sm:px-8">{children}</div>
      </div>
    </div>
  );
}



export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmer",
  danger = true,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} width="max-w-lg">
      <div className="flex items-start gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            danger ? "bg-red/10 text-red" : "bg-gold/15 text-gold"
          }`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm leading-relaxed text-ink/80">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}



export type Toast = { id: number; message: string; type: "success" | "error" };

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg animate-slide-up ${
            t.type === "success"
              ? "bg-navy text-paper"
              : "bg-red text-white"
          }`}
        >
          {t.type === "success" ? (
            <svg className="h-4 w-4 shrink-0 text-gold-bright" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}



export function Badge({ children, tone = "gold" }: { children: React.ReactNode; tone?: "gold" | "navy" | "red" | "green" }) {
  const tones: Record<string, string> = {
    gold: "bg-gold/12 text-gold",
    navy: "bg-navy/[0.07] text-navy",
    red: "bg-red/10 text-red",
    green: "bg-green/10 text-green",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-white/50 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </span>
      <p className="font-display text-base font-semibold text-navy">{title}</p>
      <p className="max-w-xs text-xs text-muted">{message}</p>
    </div>
  );
}

export function Spinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-navy/20 border-t-gold ${className}`}
      aria-hidden="true"
    />
  );
}

function UploadIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

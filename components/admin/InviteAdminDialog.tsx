"use client";

import React, { useEffect, useState } from "react";
import { publicInviteLink } from "@/lib/admin/constants";
import { Button, Modal, Spinner } from "./ui";

type PendingInvite = {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  expired: boolean;
};

export default function InviteAdminDialog({
  onClose,
  notify,
}: {
  onClose: () => void;
  notify: (msg: string, type?: "success" | "error") => void;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{
    link: string;
    title: string;
    note: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [emailConfigured, setEmailConfigured] = useState(false);

  const loadInvites = async () => {
    try {
      const res = await fetch("/api/admin/invites", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        invites: PendingInvite[];
        emailConfigured: boolean;
      };
      setInvites(data.invites ?? []);
      setEmailConfigured(Boolean(data.emailConfigured));
    } catch {
      // silencieux : la liste est un bonus
    }
  };

  useEffect(() => {
    // Chargement initial des invitations à l'ouverture du dialogue.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadInvites();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const targetEmail = email.trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        link?: string;
        alreadyPending?: boolean;
        emailDelivered?: boolean;
        emailConfigured?: boolean;
      } | null;
      if (!res.ok) {
        setError(data?.error ?? "Création de l'invitation impossible.");
        setBusy(false);
        return;
      }
      if (data?.emailConfigured !== undefined) setEmailConfigured(data.emailConfigured);
      if (data?.link) {
        const delivered = Boolean(data.emailDelivered);
        const alreadyPending = Boolean(data.alreadyPending);
        // Le lien n'est affiché qu'en secours : email non envoyé (configuration
        // absente ou échec) ou invitation déjà en attente pour cette adresse.
        setCreated(
          delivered
            ? null
            : {
                link: data.link,
                title: alreadyPending
                  ? "Invitation déjà en attente"
                  : "Email non envoyé — lien en secours",
                note: alreadyPending
                  ? "Une invitation est déjà en attente pour cette adresse : le lien ci-dessous est toujours valable."
                  : "L'email n'a pas pu être envoyé (configuration absente ou échec d'envoi). Copiez ce lien et transmettez-le à votre collaborateur.",
              },
        );
        setEmail("");
        setCopied(false);
        if (alreadyPending) {
          notify("Une invitation est déjà en attente pour cette adresse.");
        } else if (delivered) {
          notify(`Invitation envoyée à ${targetEmail}.`);
        } else {
          notify("Invitation créée — email non envoyé, copiez le lien en secours.");
        }
        void loadInvites();
      }
    } catch {
      setError("Erreur réseau — serveur injoignable.");
    }
    setBusy(false);
  };

  const copy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Impossible de copier le lien automatiquement.", "error");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <Modal
      open
      onClose={onClose}
      title="Inviter un administrateur"
      width="max-w-2xl"
    >
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-muted">
          Saisissez l&apos;adresse email de la personne à inviter, puis cliquez sur
          « Envoyer » : le lien d&apos;invitation lui sera envoyé par email.
          Elle n&apos;aura plus qu&apos;à créer son compte et valider son adresse avec
          le code reçu{emailConfigured ? "" : " (en secours, le lien s'affichera ci-dessous)"}.
        </p>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-navy/70">
              Adresse email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="collaborateur@exemple.com"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-navy/50 focus:ring-2 focus:ring-navy/10"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-red/10 px-3 py-2 text-xs font-medium text-red" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy} className="w-full py-2.5">
            {busy ? <Spinner className="h-4 w-4 border-white/30 border-t-white" /> : "Envoyer le lien d'invitation"}
          </Button>
        </form>

        {created && (
          <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
              {created.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{created.note}</p>
            <p className="mt-2 break-all rounded-lg bg-white p-3 font-mono text-xs text-navy">
              {created.link}
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" className="flex-1 py-2" onClick={() => void copy(created.link)}>
                {copied ? "Copié ✓" : "Copier le lien"}
              </Button>
              <Button
                variant="secondary"
                className="py-2"
                onClick={() => window.open(created.link, "_blank", "noopener,noreferrer")}
              >
                Ouvrir
              </Button>
            </div>
          </div>
        )}

        {invites.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Invitations en cours
            </p>
            <ul className="divide-y divide-border rounded-xl border border-border bg-white">
              {invites.slice(0, 6).map((inv) => (
                <li key={inv.token} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy">{inv.email}</p>
                    <p className="text-[11px] text-muted">
                      {inv.used ? "Utilisée" : inv.expired ? "Expirée" : `Envoyée le ${formatDate(inv.createdAt)}`}
                    </p>
                  </div>
                  {!inv.used && !inv.expired && (
                    <button
                      type="button"
                      onClick={() =>
                        void copy(publicInviteLink(inv.token))
                      }
                      className="shrink-0 rounded-lg border border-navy/25 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-navy/50 hover:bg-navy/[0.03]"
                    >
                      {copied ? "Copié ✓" : "Copier le lien"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}

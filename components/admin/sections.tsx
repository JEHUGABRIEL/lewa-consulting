"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ActivityAction,
  ActivityEvent,
  ActivityEventInput,
  AdminStore,
  EmailTemplates,
  EnrollmentRequest,
} from "@/lib/admin/constants";
import { publicInviteLink, slugify } from "@/lib/admin/constants";
import {
  formatPhoneDisplay,
  toE164,
  toEnrollmentWhatsAppHref,
} from "@/lib/phone";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  FieldInput,
  Modal,
  Spinner,
} from "./ui";
import InviteAdminDialog from "./InviteAdminDialog";

export type SectionKey =
  | "overview"
  | "formations"
  | "services"
  | "actualites"
  | "partenaires"
  | "temoignages"
  | "inscriptions"
  | "emails"
  | "utilisateurs"
  | "activite";

type AnyItem = Record<string, string>;

type Column = {
  key: string;
  label: string;
  className?: string;
  render?: (item: AnyItem) => React.ReactNode;
};


const PAGE_SIZE = 6;

// Champs pleine largeur dans les grilles des modales (création/édition et détail).
const isWideField = (type: Field["type"]) => type === "textarea" || type === "image";

// Soft delete : un élément de la corbeille a `deletedAt` posé.
const isDeleted = (item: { deletedAt?: string }): boolean => Boolean(item.deletedAt);

const CRUD_TRASH_FILTERS: { value: "all" | "active" | "deleted"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Actifs" },
  { value: "deleted", label: "Corbeille" },
];






export function CrudSection({
  title,
  description,
  singular,
  fields,
  columns,
  items,
  onChange,
  identityKey,
  newItem,
  notify,
}: {
  title: string;
  description: string;
  singular: string;
  fields: Field[];
  columns: Column[];
  items: AnyItem[];

  onChange: (next: AnyItem[], event: ActivityEventInput) => void;

  identityKey: string;
  newItem: () => AnyItem;
  notify: (msg: string, type?: "success" | "error") => void;
}) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<
    { mode: "create" } | { mode: "edit"; item: AnyItem } | { mode: "view"; item: AnyItem } | null
  >(null);
  const [form, setForm] = useState<AnyItem>({});
  const [toDelete, setToDelete] = useState<AnyItem | null>(null);
  const [toPurge, setToPurge] = useState<AnyItem | null>(null);
  const [trashFilter, setTrashFilter] = useState<"all" | "active" | "deleted">("all");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const trashCount = items.filter(isDeleted).length;
  const activeCount = items.length - trashCount;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const scoped = items.filter((it) => {
      const removed = isDeleted(it);
      if (trashFilter === "active" && removed) return false;
      if (trashFilter === "deleted" && !removed) return false;
      return true;
    });
    if (!q) return scoped;
    return scoped.filter((it) =>
      Object.values(it).some((v) => String(v ?? "").toLowerCase().includes(q)),
    );
  }, [items, search, trashFilter]);



  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, filtered.length);
  const visible = filtered.slice(start, end);

  const openCreate = () => {
    setForm(newItem());
    setError("");
    setModal({ mode: "create" });
  };

  const openEdit = (item: AnyItem) => {

    const prefill: AnyItem = {};
    for (const f of fields) prefill[f.key] = item[f.key] ?? "";
    setForm(prefill);
    setError("");
    setModal({ mode: "edit", item });
  };

  const handleSubmit = () => {

    for (const f of fields) {
      if (f.required && !form[f.key]?.trim()) {
        setError(`Le champ « ${f.label} » est obligatoire.`);
        return;
      }
    }
    const next = { ...form };


    next.updatedAt = new Date().toISOString();


    if (fields.some((f) => f.key === "slug") && !next.slug?.trim()) {
      const source = fields.find((f) => f.key === "slug")?.autoFrom;
      next.slug = slugify(next[source ?? "name"] || "element");
    }

    if (modal?.mode === "create") {

      // La corbeille (soft delete) ne bloque pas la recréation d'un identifiant.
      if (items.some((it) => !isDeleted(it) && it[identityKey] === next[identityKey])) {
        setError(`Un élément avec cet identifiant « ${next[identityKey]} » existe déjà.`);
        return;
      }
      onChange([...items, next], { action: "create", label: next[identityKey] });


      setPage(Math.floor(items.length / PAGE_SIZE) + 1);
      notify(`${singular} créé(e) avec succès.`);
    } else if (modal?.mode === "edit") {
      const current = modal.item;
      const exists = items.some(
        (it) => it !== current && !isDeleted(it) && it[identityKey] === next[identityKey],
      );
      if (exists) {
        setError(`Un élément avec cet identifiant « ${next[identityKey]} » existe déjà.`);
        return;
      }
      onChange(items.map((it) => (it === current ? next : it)), {
        action: "update",
        label: next[identityKey],
      });
      notify(`${singular} modifié(e) avec succès.`);
    }
    setModal(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    onChange(
      items.map((it) =>
        it === toDelete ? { ...it, deletedAt: new Date().toISOString() } : it,
      ),
      { action: "delete", label: toDelete[identityKey] },
    );
    notify(`${singular} déplacé(e) dans la corbeille — restauration possible à tout moment.`);
    setToDelete(null);
  };

  const restoreItem = (item: AnyItem) => {
    const next = { ...item };
    delete next.deletedAt;
    onChange(
      items.map((it) => (it === item ? next : it)),
      { action: "update", label: item[identityKey] },
    );
    notify(`${singular} restauré(e).`);
  };

  const confirmPurge = () => {
    if (!toPurge) return;
    onChange(items.filter((it) => it !== toPurge), {
      action: "delete",
      label: `${toPurge[identityKey]} (définitif)`,
    });
    notify(`${singular} supprimé(e) définitivement.`);
    setToPurge(null);
  };

  return (
    <div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-navy">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>

      { }
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher…"
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-navy/50 focus:ring-2 focus:ring-navy/10"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1 self-start rounded-lg border border-border bg-white p-1 sm:self-auto" aria-label="Filtre corbeille">
            {CRUD_TRASH_FILTERS.map((f) => {
              const count =
                f.value === "all" ? items.length : f.value === "active" ? activeCount : trashCount;
              const active = trashFilter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => {
                    setTrashFilter(f.value);
                    setPage(1);
                  }}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                    active
                      ? "bg-navy text-paper shadow-sm"
                      : "text-navy/60 hover:bg-navy/[0.05] hover:text-navy"
                  }`}
                >
                  {f.label}
                  <span className={`tabular ${active ? "text-paper/70" : "text-muted/70"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
        <Button onClick={openCreate} className="shrink-0 px-6 py-2.5">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter
        </Button>
      </div>

      { }
      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={items.length === 0 ? `Aucun ${singular.toLowerCase()}` : "Aucun résultat"}
              message={
                items.length === 0
                  ? `Cliquez sur « Ajouter » pour créer le premier élément.`
                  : "Essayez une autre recherche."
              }
            />
          </div>
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-navy/[0.03]">
                  {columns.map((c) => (
                    <th key={c.key} className={`border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted ${c.className ?? ""}`}>
                      {c.label}
                    </th>
                  ))}
                  <th className="border-l border-border/70 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item, i) => {
                  const removed = isDeleted(item);
                  return (
                  <tr
                    key={item[identityKey] ?? i}
                    className={`border-b border-border/80 last:border-0 transition hover:bg-navy/[0.02] ${
                      removed ? "bg-navy/[0.015] opacity-60" : ""
                    }`}
                  >
                    {columns.map((c) => (
                      <td key={c.key} className={`border-l border-border/70 first:border-l-0 px-4 py-3.5 align-middle ${c.className ?? ""}`}>
                        {c.render ? c.render(item) : <span className="line-clamp-2">{item[c.key] || "—"}</span>}
                      </td>
                    ))}
                    <td className="border-l border-border/70 px-4 py-3.5 text-right">
                      {removed ? (
                        <div className="inline-flex items-center gap-1">
                          <Badge tone="red">Corbeille</Badge>
                          <IconBtn label="Restaurer" onClick={() => restoreItem(item)} title="Restaurer cet élément">
                            <RestoreIcon />
                          </IconBtn>
                          <IconBtn label="Supprimer définitivement" onClick={() => setToPurge(item)} title="Supprimer définitivement" danger>
                            <TrashIcon />
                          </IconBtn>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <IconBtn label="Voir" onClick={() => setModal({ mode: "view", item })} title="Voir le détail">
                            <EyeIcon />
                          </IconBtn>
                          <IconBtn label="Modifier" onClick={() => openEdit(item)} title="Modifier">
                            <PencilIcon />
                          </IconBtn>
                          <IconBtn label="Supprimer" onClick={() => setToDelete(item)} title="Déplacer dans la corbeille" danger>
                            <TrashIcon />
                          </IconBtn>
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      { }
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {pageCount > 1 && (
          <nav className="flex items-center gap-1" aria-label={`Pagination — ${title}`}>
            <PageBtn
              label="Page précédente"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </PageBtn>
            {pageList(current, pageCount).map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="px-1 text-xs text-muted/50" aria-hidden="true">
                  …
                </span>
              ) : (
                <PageBtn key={p} label={`Page ${p}`} active={p === current} onClick={() => setPage(p)}>
                  {p}
                </PageBtn>
              ),
            )}
            <PageBtn
              label="Page suivante"
              disabled={current === pageCount}
              onClick={() => setPage(current + 1)}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </PageBtn>
          </nav>
        )}
      </div>

      { }
      <Modal
        open={modal?.mode === "create" || modal?.mode === "edit"}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? `Modifier — ${singular}` : `Nouveau — ${singular}`}
        width="max-w-3xl"
      >
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {fields.map((f) => {
            const wide = isWideField(f.type);
            return (
              <div key={f.key} className={`min-w-0 ${wide ? "sm:col-span-2" : ""}`}>
                <FieldInput
                  field={f}
                  value={form[f.key] ?? ""}
                  onChange={(v) => {
                    setForm((prev) => ({ ...prev, [f.key]: v }));
                    setError("");
                  }}
                  notify={notify}
                />
              </div>
            );
          })}
          {error && (
            <p
              className="rounded-lg bg-red/10 px-3 py-2 text-xs font-medium text-red sm:col-span-2"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="secondary" onClick={() => setModal(null)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            {modal?.mode === "edit" ? "Enregistrer" : "Créer"}
          </Button>
        </div>
      </Modal>

      { }
      <Modal
        open={modal?.mode === "view"}
        onClose={() => setModal(null)}
        title={`Détail — ${singular}`}
        width="max-w-3xl"
      >
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {fields.map((f) => {
            const v = modal?.mode === "view" ? modal.item[f.key] : "";
            // Texte alternatif : réutilise le champ imageAlt de l'entité s'il existe.
            const alt =
              modal?.mode === "view" && f.type === "image"
                ? (modal.item.imageAlt ?? "")
                : "";
            const wide = isWideField(f.type);
            return (
              <div key={f.key} className={`min-w-0 ${wide ? "sm:col-span-2" : ""}`}>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {f.label}
                </dt>
                <dd className="mt-1.5 min-w-0 break-words text-sm text-ink">
                  {f.type === "select" && v
                    ? f.options?.find((o) => o.value === v)?.label ?? v
                    : v || "—"}
                </dd>
                {f.type === "image" && v && (
                  <span className="mt-2.5 block overflow-hidden rounded-lg border border-border bg-navy/[0.03]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v} alt={alt} className="h-36 w-full object-cover" />
                  </span>
                )}
              </div>
            );
          })}
        </dl>
        <div className="mt-7 flex justify-end border-t border-border/70 pt-5">
          <Button variant="secondary" onClick={() => setModal(null)}>
            Fermer
          </Button>
        </div>
      </Modal>

      { }
      <ConfirmDialog
        open={toDelete !== null}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Déplacer dans la corbeille"
        message={
          <>
            Voulez-vous vraiment déplacer{" "}
            <strong className="text-navy">{toDelete?.[identityKey]}</strong> dans la corbeille ?
            L&apos;élément ne sera plus visible sur le site, mais vous pourrez le restaurer à tout moment.
          </>
        }
        confirmLabel="Déplacer dans la corbeille"
      />

      <ConfirmDialog
        open={toPurge !== null}
        onCancel={() => setToPurge(null)}
        onConfirm={confirmPurge}
        title="Supprimer définitivement"
        message={
          <>
            Supprimer définitivement{" "}
            <strong className="text-navy">{toPurge?.[identityKey]}</strong> ? Cette action est
            irréversible : l&apos;élément sera définitivement perdu.
          </>
        }
        confirmLabel="Supprimer définitivement"
      />
    </div>
  );
}







function PageBtn({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
        active
          ? "border-navy bg-navy text-paper shadow-sm"
          : "border-border bg-white text-navy/70 hover:border-navy/40 hover:text-navy"
      } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-navy/70`}
    >
      {children}
    </button>
  );
}





function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}



function IconBtn({
  children,
  onClick,
  title,
  label,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  label: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={label}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-red/20 text-red/70 hover:border-red/40 hover:bg-red/5 hover:text-red disabled:hover:border-red/20 disabled:hover:bg-transparent disabled:hover:text-red/70"
          : "border-border text-navy/50 hover:border-navy/30 hover:bg-navy/[0.04] hover:text-navy disabled:hover:border-border disabled:hover:bg-transparent disabled:hover:text-navy/50"
      }`}
    >
      {children}
    </button>
  );
}

const iconProps = {
  className: "h-3.5 w-3.5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function EyeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg {...iconProps}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg {...iconProps}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg {...iconProps}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg {...iconProps}>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg {...iconProps}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg {...iconProps}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg {...iconProps}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
function RestoreIcon() {
  return (
    <svg {...iconProps}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg {...iconProps}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}





export const formationColumns: Column[] = [
  {
    key: "name",
    label: "Formation",
    render: (it) => (
      <div className="flex items-center gap-3">
        <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-navy/[0.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.image} alt="" className="h-full w-full object-cover" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">{it.name || it.slug}</p>
          <p className="truncate text-[11px] text-muted">{it.slug}</p>
        </div>
      </div>
    ),
  },
  {
    key: "category",
    label: "Catégorie",
    render: (it) => (
      <Badge tone="navy">{it.category === "compta" ? "Comptabilité & Finance" : "Bureautique & Dev."}</Badge>
    ),
  },
  {
    key: "price",
    label: "Prix (FCFA)",
    render: (it) => <span className="font-semibold tabular text-navy">{it.price || "—"}</span>,
  },
  {
    key: "level",
    label: "Niveau",
    render: (it) => <Badge>{it.level || "—"}</Badge>,
  },
];

export const serviceColumns: Column[] = [
  {
    key: "name",
    label: "Service",
    render: (it) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/12 text-gold">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">{it.name || it.slug}</p>
          <p className="truncate text-[11px] text-muted">{it.slug}</p>
        </div>
      </div>
    ),
  },
  {
    key: "icon",
    label: "Icône",
    render: (it) => <span className="font-mono text-xs text-muted">{it.icon || "—"}</span>,
  },
];

export const postColumns: Column[] = [
  {
    key: "name",
    label: "Article",
    render: (it) => (
      <div className="flex items-center gap-3">
        <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-navy/[0.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.image} alt="" className="h-full w-full object-cover" />
        </span>
        <div className="min-w-0">
          <p className="max-w-[320px] truncate font-medium text-navy">{it.name || it.slug}</p>
          <p className="truncate text-[11px] text-muted">{it.slug}</p>
        </div>
      </div>
    ),
  },
  {
    key: "category",
    label: "Catégorie",
    render: (it) => <Badge tone="navy">{it.category || "—"}</Badge>,
  },
];

export const partnerColumns: Column[] = [
  {
    key: "name",
    label: "Partenaire",
    render: (it) => (
      <div className="flex items-center gap-3">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.image} alt="" className="h-full w-full object-contain p-1" />
        </span>
        <p className="truncate font-medium text-navy">{it.name || "—"}</p>
      </div>
    ),
  },
  {
    key: "tagline",
    label: "Slogan",
    render: (it) => <span className="text-muted">{it.tagline || "—"}</span>,
  },
];

export const testimonialColumns: Column[] = [
  {
    key: "name",
    label: "Témoignage",
    render: (it) => (
      <div className="flex items-center gap-3">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-navy/[0.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.image} alt="" className="h-full w-full object-cover" />
        </span>
        <p className="truncate font-medium text-navy">{it.name || "—"}</p>
      </div>
    ),
  },
];



























const ENROLLMENT_FILTERS: {
  value: "all" | EnrollmentRequest["status"] | "deleted";
  label: string;
}[] = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Traitées" },
  { value: "deleted", label: "Corbeille" },
];

export function EnrollmentsSection({
  items,
  notify,
  onRefresh,
}: {
  items: EnrollmentRequest[];
  notify: (msg: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<"all" | EnrollmentRequest["status"] | "deleted">("all");
  const [toDelete, setToDelete] = useState<EnrollmentRequest | null>(null);
  const [toPurge, setToPurge] = useState<EnrollmentRequest | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<EnrollmentRequest | null>(null);
  const [startDate, setStartDate] = useState("");
  const [startDateError, setStartDateError] = useState("");

  const activeItems = items.filter((i) => !isDeleted(i));
  const pendingCount = activeItems.filter((i) => i.status === "pending").length;
  const confirmedCount = activeItems.length - pendingCount;
  const trashCount = items.length - activeItems.length;

  // Référence « maintenant » fixée au montage pour afficher l'état du rappel
  // (pas d'appel à Date.now() pendant le rendu — pureté React).
  const [nowRef] = useState(() => Date.now());

  const filtered = useMemo(() => {
    const sorted = [...items].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    if (filter === "deleted") return sorted.filter(isDeleted);
    if (filter === "all") return sorted;
    return sorted.filter((i) => !isDeleted(i) && i.status === filter);
  }, [items, filter]);

  const run = async (body: Record<string, unknown>, busyKey: string) => {
    setBusyId(busyKey);
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        emailDelivered?: boolean;
        emailConfigured?: boolean;
      } | null;
      if (!res.ok || !data?.ok) {
        notify(data?.error ?? "Action impossible.", "error");
        return null;
      }
      return data;
    } catch {
      notify("Erreur réseau — serveur injoignable.", "error");
      return null;
    } finally {
      setBusyId(null);
    }
  };

  const openConfirm = (item: EnrollmentRequest) => {
    setConfirming(item);
    setStartDate("");
    setStartDateError("");
  };

  const confirmOne = () => {
    if (!confirming) return;
    // La date de début est facultative mais recommandée : sans elle, aucun rappel J-48h.
    if (startDate && Number.isNaN(new Date(startDate).getTime())) {
      setStartDateError("Date invalide.");
      return;
    }
    const item = confirming;
    void run(
      {
        action: "confirm",
        id: item.id,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
      },
      item.id,
    ).then((d) => {
      if (!d) return;
      notify(`Demande de ${item.name} marquée comme traitée.`);
      if (startDate) {
        notify(
          `Rappel automatique programmé 48h avant le ${new Date(
            startDate,
          ).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}.`,
        );
      }
      if (d.emailDelivered) {
        notify(`Email de confirmation envoyé à ${item.email}.`);
      } else if (item.email) {
        notify(
          "Email non envoyé — utilisez le bouton WhatsApp pour contacter le demandeur.",
          "error",
        );
      } else {
        notify(
          "Aucun email fourni — contactez le demandeur par téléphone ou WhatsApp.",
        );
      }
      onRefresh();
      setConfirming(null);
    });
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const item = toDelete;
    void run({ action: "delete", id: item.id }, item.id).then((d) => {
      if (!d) return;
      notify("Demande déplacée dans la corbeille.");
      onRefresh();
      setToDelete(null);
    });
  };

  const restoreOne = (item: EnrollmentRequest) => {
    void run({ action: "restore", id: item.id }, item.id).then((d) => {
      if (!d) return;
      notify("Demande restaurée.");
      onRefresh();
    });
  };

  const confirmPurge = () => {
    if (!toPurge) return;
    const item = toPurge;
    void run({ action: "purge", id: item.id }, item.id).then((d) => {
      if (!d) return;
      notify("Demande supprimée définitivement.");
      onRefresh();
      setToPurge(null);
    });
  };

  return (
    <div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-navy">
          Demandes d&apos;inscription
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Les demandes envoyées depuis le formulaire d&apos;inscription du site arrivent ici.
          Confirmez une demande pour la marquer comme traitée.
        </p>
      </div>

      { }
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {ENROLLMENT_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              filter === f.value
                ? "border-navy bg-navy text-paper shadow-sm"
                : "border-border bg-white text-navy/60 hover:border-navy/40 hover:text-navy"
            }`}
          >
            {f.label}
            {f.value === "pending" && pendingCount > 0 && (
              <span
                className={`ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                  filter === f.value ? "bg-paper/20 text-paper" : "bg-gold text-navy"
                }`}
              >
                {pendingCount}
              </span>
            )}
            {f.value === "confirmed" && confirmedCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-navy/[0.08] px-1 text-[9px] font-bold text-navy">
                {confirmedCount}
              </span>
            )}
            {f.value === "deleted" && trashCount > 0 && (
              <span
                className={`ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                  filter === "deleted" ? "bg-paper/20 text-paper" : "bg-red/10 text-red"
                }`}
              >
                {trashCount}
              </span>
            )}
          </button>
        ))}
      </div>

      { }
      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={items.length === 0 ? "Aucune demande" : "Aucun résultat"}
              message={
                items.length === 0
                  ? "Les demandes d'inscription envoyées depuis le site apparaîtront ici."
                  : "Aucune demande dans cette catégorie."
              }
            />
          </div>
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-navy/[0.03]">
                  <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Demandeur
                  </th>
                  <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Contact
                  </th>
                  <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Disponibilité
                  </th>
                  <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Début de session
                  </th>
                  <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Reçue le
                  </th>
                  <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Statut
                  </th>
                  <th className="border-l border-border/70 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr
                    key={e.id}
                    className={`border-b border-border/80 last:border-0 transition hover:bg-navy/[0.02] ${
                      e.deletedAt ? "bg-navy/[0.015] opacity-60" : ""
                    }`}
                  >
                    <td className="border-l border-border/70 first:border-l-0 px-4 py-3.5 align-middle">
                      <p className="font-medium text-navy">{e.name}</p>
                      <p className="max-w-[280px] truncate text-[11px] text-muted" title={e.formation}>
                        {e.formation}
                      </p>
                    </td>
                    <td className="border-l border-border/70 px-4 py-3.5 align-middle">
                      <a
                        href={`tel:${toE164(e.phone, e.countryCode) ?? e.phone}`}
                        className="font-medium text-navy transition hover:text-gold"
                      >
                        {formatPhoneDisplay(e.phone, e.countryCode)}
                      </a>
                      {e.email && (
                        <p className="max-w-[220px] truncate text-[11px] text-muted" title={e.email}>
                          {e.email}
                        </p>
                      )}
                    </td>
                    <td className="max-w-[180px] truncate border-l border-border/70 px-4 py-3.5 align-middle text-xs text-ink/70" title={e.availability || ""}>
                      {e.availability || "—"}
                    </td>
                    <td className="border-l border-border/70 px-4 py-3.5 align-middle">
                      {e.startDate ? (
                        <div className="min-w-0">
                          <time dateTime={e.startDate} className="block text-xs font-medium text-navy">
                            {formatActivityDate(e.startDate)}
                          </time>
                          {e.reminderSentAt ? (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-semibold text-green">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Rappel envoyé
                            </span>
                          ) : new Date(e.startDate).getTime() > nowRef ? (
                            <span className="mt-1 inline-flex items-center rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
                              Rappel J-48h programmé
                            </span>
                          ) : (
                            <span className="mt-1 inline-flex items-center rounded-full bg-navy/[0.06] px-2 py-0.5 text-[10px] font-semibold text-navy/60">
                              Session passée
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted/60">—</span>
                      )}
                    </td>
                    <td className="border-l border-border/70 px-4 py-3.5 align-middle text-xs text-muted">
                      <time dateTime={e.createdAt}>{formatActivityDate(e.createdAt)}</time>
                    </td>
                    <td className="border-l border-border/70 px-4 py-3.5 align-middle">
                      {e.deletedAt ? (
                        <Badge tone="red">Supprimée</Badge>
                      ) : e.status === "pending" ? (
                        <Badge tone="gold">En attente</Badge>
                      ) : (
                        <Badge tone="green">Traitée</Badge>
                      )}
                    </td>
                    <td className="border-l border-border/70 px-4 py-3.5 text-right align-middle">
                      {e.deletedAt ? (
                        <div className="inline-flex items-center gap-1.5">
                          <IconBtn
                            label="Restaurer"
                            title="Restaurer la demande"
                            disabled={busyId === e.id}
                            onClick={() => restoreOne(e)}
                          >
                            <RestoreIcon />
                          </IconBtn>
                          <IconBtn
                            label="Supprimer définitivement"
                            title="Supprimer définitivement la demande"
                            danger
                            disabled={busyId === e.id}
                            onClick={() => setToPurge(e)}
                          >
                            <TrashIcon />
                          </IconBtn>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={toEnrollmentWhatsAppHref(
                              e.phone,
                              {
                                name: e.name,
                                formation: e.formation,
                              },
                              e.countryCode,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Message WhatsApp au demandeur"
                            aria-label="Message WhatsApp au demandeur"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-green/30 bg-green/10 text-green transition hover:border-green/50 hover:bg-green/15"
                          >
                            <WhatsAppIcon />
                          </a>
                          {e.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => openConfirm(e)}
                              disabled={busyId === e.id}
                              title="Marquer comme traitée (et programmer le rappel)"
                              className="inline-flex items-center gap-1 rounded-lg border border-green/25 bg-green/10 px-2.5 py-1.5 text-[11px] font-semibold text-green transition hover:border-green/50 hover:bg-green/15 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {busyId === e.id ? (
                                <Spinner className="h-3.5 w-3.5 border-green/30 border-t-green" />
                              ) : (
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                              Confirmer
                            </button>
                          )}
                          <IconBtn
                            label="Supprimer"
                            title="Déplacer dans la corbeille"
                            danger
                            disabled={busyId === e.id}
                            onClick={() => setToDelete(e)}
                          >
                            <TrashIcon />
                          </IconBtn>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      { }
      <ConfirmDialog
        open={toDelete !== null}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Déplacer dans la corbeille"
        message={
          <>
            Voulez-vous vraiment déplacer la demande de{" "}
            <strong className="text-navy">{toDelete?.name}</strong> pour la formation{" "}
            <strong className="text-navy">{toDelete?.formation}</strong> dans la corbeille ?
            Elle pourra être restaurée à tout moment.
          </>
        }
        confirmLabel="Déplacer dans la corbeille"
      />

      <ConfirmDialog
        open={toPurge !== null}
        onCancel={() => setToPurge(null)}
        onConfirm={confirmPurge}
        title="Supprimer définitivement"
        message={
          <>
            Supprimer définitivement la demande de{" "}
            <strong className="text-navy">{toPurge?.name}</strong> pour la formation{" "}
            <strong className="text-navy">{toPurge?.formation}</strong> ? Cette action est
            irréversible.
          </>
        }
        confirmLabel="Supprimer définitivement"
      />

      { }
      <Modal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title={`Confirmer — ${confirming?.name ?? ""}`}
        width="max-w-lg"
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-navy/[0.03] p-4">
            <p className="text-xs text-muted">Formation</p>
            <p className="mt-0.5 font-medium text-navy">{confirming?.formation}</p>
            <p className="mt-2 text-xs text-muted">Téléphone</p>
            <a
              href={`tel:${toE164(confirming?.phone ?? "", confirming?.countryCode) ?? confirming?.phone ?? ""}`}
              className="mt-0.5 inline-block font-medium text-navy transition hover:text-gold"
            >
              {formatPhoneDisplay(confirming?.phone ?? "", confirming?.countryCode)}
            </a>
            {confirming?.email && (
              <>
                <p className="mt-2 text-xs text-muted">Email</p>
                <p className="mt-0.5 break-words text-sm text-ink">{confirming.email}</p>
              </>
            )}
          </div>

          <div>
            <label
              htmlFor="enroll-start-date"
              className="block text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Date de début de la session
            </label>
            <p className="mt-1 text-[11px] text-muted/80">
              Facultatif mais recommandé : un rappel automatique par email sera envoyé
              48h avant cette date. Sans date, aucun rappel n&apos;est programmé.
            </p>
            <input
              id="enroll-start-date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setStartDateError("");
              }}
              className="mt-2.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-navy/50 focus:ring-2 focus:ring-navy/10"
            />
            {startDateError && (
              <p className="mt-1.5 text-xs font-medium text-red" role="alert">
                {startDateError}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="secondary" onClick={() => setConfirming(null)}>
            Annuler
          </Button>
          <Button onClick={confirmOne} disabled={busyId === confirming?.id}>
            {busyId === confirming?.id ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="h-3.5 w-3.5 border-paper/40 border-t-paper" />
                Confirmation…
              </span>
            ) : (
              "Confirmer"
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}


const EMAIL_KINDS: {
  key: keyof EmailTemplates;
  title: string;
  description: string;
  placeholder: string;
}[] = [
  {
    key: "confirmation",
    title: "Email de confirmation",
    description:
      "Envoyé au demandeur quand vous confirmez sa demande d'inscription.",
    placeholder: "Bonjour {name}, …",
  },
  {
    key: "reminder",
    title: "Email de rappel J-48h",
    description:
      "Rappel automatique envoyé 48h avant le début de la session.",
    placeholder: "Bonjour {name}, …",
  },
];

const EMAIL_PLACEHOLDERS: { token: string; label: string }[] = [
  { token: "{name}", label: "Nom du demandeur" },
  { token: "{formation}", label: "Nom de la formation" },
  { token: "{startDate}", label: "Date de début (rappel uniquement)" },
];

export function EmailTemplatesSection({
  templates,
  onSave,
  notify,
}: {
  templates: Partial<EmailTemplates> | undefined;
  onSave: (next: Partial<EmailTemplates>) => void;
  notify: (msg: string, type?: "success" | "error") => void;
}) {
  const [draft, setDraft] = useState<Partial<EmailTemplates> | null>(null);

  const value = draft ?? templates ?? {};

  const setKind = (kind: keyof EmailTemplates, patch: { subject: string; body: string }) =>
    setDraft((prev) => ({
      ...(prev ?? templates ?? {}),
      [kind]: patch,
    }));

  const save = () => {
    onSave(value);
    notify("Modèles d'emails enregistrés.");
    setDraft(null);
  };

  return (
    <div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-navy">
          Emails automatiques
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Personnalisez le contenu des emails envoyés automatiquement aux
          demandeurs. Utilisez les variables ci-dessous pour insérer les
          informations de chaque demande.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {EMAIL_PLACEHOLDERS.map((p) => (
          <span
            key={p.token}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-[11px] text-muted"
            title={p.label}
          >
            <code className="font-mono font-semibold text-gold">{p.token}</code>
            <span className="text-muted/80">{p.label}</span>
          </span>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        {EMAIL_KINDS.map((k) => {
          const t = value[k.key] ?? { subject: "", body: "" };
          return (
            <div
              key={k.key}
              className="rounded-2xl border border-border bg-white shadow-sm"
            >
              <div className="border-b border-border/70 px-6 py-4">
                <h3 className="font-display text-base font-semibold text-navy">{k.title}</h3>
                <p className="mt-0.5 text-xs text-muted">{k.description}</p>
              </div>
              <div className="space-y-4 px-6 py-5">
                <div>
                  <label
                    htmlFor={`email-${k.key}-subject`}
                    className="mb-1.5 block text-xs font-semibold text-navy/70"
                  >
                    Objet
                  </label>
                  <input
                    id={`email-${k.key}-subject`}
                    type="text"
                    value={t.subject}
                    onChange={(e) => setKind(k.key, { ...t, subject: e.target.value })}
                    placeholder="Objet de l'email"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-navy/50 focus:ring-2 focus:ring-navy/10"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`email-${k.key}-body`}
                    className="mb-1.5 block text-xs font-semibold text-navy/70"
                  >
                    Contenu
                  </label>
                  <textarea
                    id={`email-${k.key}-body`}
                    rows={7}
                    value={t.body}
                    onChange={(e) => setKind(k.key, { ...t, body: e.target.value })}
                    placeholder={k.placeholder}
                    className="w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm leading-relaxed text-ink outline-none transition focus:border-navy/50 focus:ring-2 focus:ring-navy/10"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      { }
      <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-border/70 pt-5">
        {draft && (
          <Button variant="secondary" onClick={() => setDraft(null)}>
            Annuler
          </Button>
        )}
        <Button
          onClick={save}
          disabled={
            !draft ||
            !value.confirmation?.subject.trim() ||
            !value.confirmation?.body.trim() ||
            !value.reminder?.subject.trim() ||
            !value.reminder?.body.trim()
          }
        >
          Enregistrer les modèles
        </Button>
      </div>
    </div>
  );
}


const ACTIVITY_PAGE_SIZE = 10;

const ACTIVITY_FILTERS: { value: ActivityAction | "all"; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "login", label: "Connexions" },
  { value: "logout", label: "Déconnexions" },
  { value: "create", label: "Créations" },
  { value: "update", label: "Modifications" },
  { value: "delete", label: "Suppressions" },
  { value: "content", label: "Contenus" },
];

const ACTION_META: Record<
  ActivityAction,
  { label: string; tone: "gold" | "navy" | "red" | "green" }
> = {
  login: { label: "Connexion", tone: "green" },
  logout: { label: "Déconnexion", tone: "navy" },
  create: { label: "Création", tone: "green" },
  update: { label: "Modification", tone: "gold" },
  delete: { label: "Suppression", tone: "red" },
  content: { label: "Contenu", tone: "navy" },
};

const ENTITY_LABELS: Record<string, string> = {
  formations: "Formations",
  services: "Services",
  posts: "Actualités",
  partners: "Partenaires",
  testimonials: "Témoignages",
  enrollments: "Demandes d'inscription",
  contenus: "Contenus",
  admins: "Administrateurs",
};


function formatActivityDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}







export function ActivitySection({
  store,
  notify,
  onReset,
}: {
  store: AdminStore;
  notify: (msg: string, type?: "success" | "error") => void;
  onReset: () => void;
}) {
  const [filter, setFilter] = useState<ActivityAction | "all">("all");
  const [page, setPage] = useState(1);
  const [confirmReset, setConfirmReset] = useState(false);

  const events = useMemo(() => store.activity ?? [], [store.activity]);
  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.action === filter);
  }, [events, filter]);


  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.at.localeCompare(a.at)),
    [filtered],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / ACTIVITY_PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * ACTIVITY_PAGE_SIZE;
  const visible = sorted.slice(start, start + ACTIVITY_PAGE_SIZE);

  const handleReset = () => {
    onReset();
    setConfirmReset(false);
    setFilter("all");
    setPage(1);
    notify("Journal d'activité réinitialisé.");
  };

  return (
    <div>
      { }
      <div>
        <h2 className="font-display text-2xl font-semibold text-navy">Journal d&apos;activité</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Retrouvez ici l&apos;historique de tout ce qui se passe dans votre espace : connexions,
          ajouts, modifications et suppressions. Seules les 200 dernières actions sont conservées.
        </p>
      </div>

      { }
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setFilter(f.value);
                setPage(1);
              }}
              aria-pressed={filter === f.value}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.value
                  ? "border-navy bg-navy text-paper shadow-sm"
                  : "border-border bg-white text-navy/60 hover:border-navy/40 hover:text-navy"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {events.length > 0 && (
          <Button
            variant="danger"
            onClick={() => setConfirmReset(true)}
            className="shrink-0"
          >
            <TrashIcon />
            Réinitialiser
          </Button>
        )}
      </div>

      { }
      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {sorted.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Aucune activité"
              message={
                events.length === 0
                  ? "Le journal se remplit à la première connexion ou opération."
                  : "Aucun événement de ce type pour le moment."
              }
            />
          </div>
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-navy/[0.03]">
                  <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Action
                  </th>
                  <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Détail
                  </th>
                  <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Utilisateur
                  </th>
                  <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    IP
                  </th>
                  <th className="border-l border-border/70 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => {



                  const meta =
                    ACTION_META[e.action as ActivityAction] ?? {
                      label: e.action,
                      tone: "navy" as const,
                    };
                  return (
                    <tr key={e.id} className="border-b border-border/80 last:border-0 transition hover:bg-navy/[0.02]">
                      <td className="border-l border-border/70 first:border-l-0 px-4 py-3.5 align-middle">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </td>
                      <td className="border-l border-border/70 first:border-l-0 px-4 py-3.5 align-middle">
                        <span className="text-[11px] font-medium text-muted">
                          {ENTITY_LABELS[e.entity ?? ""] ?? e.entity}
                        </span>
                        {e.label && (
                          <span className="ml-2 text-navy">
                            <code className="rounded bg-navy/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-navy">
                              {e.label}
                            </code>
                          </span>
                        )}
                      </td>
                      <td className="border-l border-border/70 first:border-l-0 px-4 py-3.5 align-middle font-medium text-navy">{e.username}</td>
                      <td className="border-l border-border/70 px-4 py-3.5 align-middle text-xs text-muted/70">{e.ip ?? "—"}</td>
                      <td className="border-l border-border/70 px-4 py-3.5 text-right align-middle text-xs text-muted">
                        <time dateTime={e.at}>{formatActivityDate(e.at)}</time>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      { }
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {pageCount > 1 && (
          <nav className="flex items-center gap-1" aria-label="Pagination — activité">
            <PageBtn
              label="Page précédente"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </PageBtn>
            {pageList(current, pageCount).map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="px-1 text-xs text-muted/50" aria-hidden="true">
                  …
                </span>
              ) : (
                <PageBtn key={p} label={`Page ${p}`} active={p === current} onClick={() => setPage(p)}>
                  {p}
                </PageBtn>
              ),
            )}
            <PageBtn
              label="Page suivante"
              disabled={current === pageCount}
              onClick={() => setPage(current + 1)}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </PageBtn>
          </nav>
        )}
      </div>

      { }
      <ConfirmDialog
        open={confirmReset}
        onCancel={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Réinitialiser le journal d'activité"
        message={
          <>
            Voulez-vous vraiment effacer les{" "}
            <strong className="text-navy">
              {events.length} événement{events.length > 1 ? "s" : ""}
            </strong>{" "}
            du journal d&apos;activité ? Cette action est définitive et ne peut pas être annulée.
          </>
        }
        confirmLabel="Réinitialiser"
      />
    </div>
  );
}


function RecentActivity({ events }: { events: ActivityEvent[] }) {
  const recent = useMemo(
    () => [...events].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5),
    [events],
  );
  if (recent.length === 0) {
    return <p className="text-sm text-muted">Aucune activité pour le moment.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {recent.map((e) => {
        const meta =
          ACTION_META[e.action as ActivityAction] ?? {
            label: e.action,
            tone: "navy" as const,
          };
        return (
          <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <span className="min-w-0 flex-1 truncate text-ink">
              <span className="text-muted">{ENTITY_LABELS[e.entity ?? ""] ?? e.entity}</span>
              {e.label && <span className="ml-1.5 text-navy">« {e.label} »</span>}
            </span>
            <span className="text-xs text-muted/70">{formatActivityDate(e.at)}</span>
          </li>
        );
      })}
    </ul>
  );
}





export function Overview({
  store,
  onNavigate,
  notify,
}: {
  store: AdminStore;
  onNavigate: (s: SectionKey) => void;
  notify: (msg: string, type?: "success" | "error") => void;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);

  const stats = [
    { key: "formations" as const, label: "Formations", count: store.formations.length },
    { key: "services" as const, label: "Services", count: store.services.length },
    { key: "actualites" as const, label: "Actualités", count: store.posts.length },
    { key: "partenaires" as const, label: "Partenaires", count: store.partners.length },
    { key: "temoignages" as const, label: "Témoignages", count: store.testimonials.length },
    {
      key: "inscriptions" as const,
      label: "Demandes d'inscription",
      count: (store.enrollments ?? []).filter((e) => e.status === "pending").length,
    },
    { key: "activite" as const, label: "Activité", count: store.activity?.length ?? 0 },
  ];

  return (
    <div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-navy">Tableau de bord</h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <button
            key={s.key}
            onClick={() => onNavigate(s.key)}
            className="group flex flex-col gap-2 rounded-2xl border border-border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-md"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="block truncate text-[11px] font-semibold uppercase tracking-wider text-muted">
                {s.label}
              </span>
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-gold/40 transition group-hover:scale-125 group-hover:bg-gold"
                aria-hidden="true"
              />
            </span>
            <span className="block text-3xl font-bold leading-none tabular text-navy">{s.count}</span>
          </button>
        ))}
      </div>


      { }
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-navy">
            Administrateurs
          </h3>
          <p className="mt-1 text-xs text-muted">
            Invitez un collaborateur à rejoindre l&apos;espace d&apos;administration.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => onNavigate("utilisateurs")}>
            Gérer
          </Button>
          <Button onClick={() => setInviteOpen(true)}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M19 8v6" />
              <path d="M22 11h-6" />
            </svg>
            Inviter un admin
          </Button>
        </div>
      </div>

      {inviteOpen && (
        <InviteAdminDialog
          onClose={() => setInviteOpen(false)}
          notify={notify}
        />
      )}

      { }
      <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-navy">
            Activité récente
          </h3>
          {(store.activity?.length ?? 0) > 0 && (
            <Button variant="ghost" onClick={() => onNavigate("activite")}>
              Tout voir
            </Button>
          )}
        </div>
        <div className="mt-3">
          <RecentActivity events={store.activity ?? []} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gestion des utilisateurs (comptes administrateurs & invitations)
// ---------------------------------------------------------------------------

type AdminUserRow = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  createdAt: string;
  invitedBy: string;
};

type InviteRow = {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  expired: boolean;
};

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initialsOf(u: AdminUserRow): string {
  const first = u.firstName?.[0] ?? "";
  const last = u.lastName?.[0] ?? "";
  const fromName = `${first}${last}`.trim().toUpperCase();
  return fromName || u.username.slice(0, 2).toUpperCase();
}

export function UsersSection({
  notify,
}: {
  notify: (msg: string, type?: "success" | "error") => void;
}) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminUserRow | null>(null);
  const [toCancelInvite, setToCancelInvite] = useState<InviteRow | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "same-origin" });
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as {
        users: AdminUserRow[];
        invites: InviteRow[];
        emailConfigured: boolean;
      };
      setUsers(data.users ?? []);
      setInvites(data.invites ?? []);
      setEmailConfigured(Boolean(data.emailConfigured));
    } catch {
      notify("Impossible de charger les utilisateurs.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    // Chargement initial des comptes et invitations à l'ouverture de la section.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const run = async (
    body: Record<string, unknown>,
    busyKey: string,
  ): Promise<{
    error?: string;
    users?: AdminUserRow[];
    invites?: InviteRow[];
    emailDelivered?: boolean;
  } | null> => {
    setBusyId(busyKey);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        users?: AdminUserRow[];
        invites?: InviteRow[];
        emailDelivered?: boolean;
      } | null;
      if (!res.ok || !data) {
        notify(data?.error ?? "Action impossible.", "error");
        return null;
      }
      if (Array.isArray(data.users)) setUsers(data.users);
      if (Array.isArray(data.invites)) setInvites(data.invites);
      return data;
    } catch {
      notify("Erreur réseau — serveur injoignable.", "error");
      return null;
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = (u: AdminUserRow) => {
    void run(
      { action: u.active ? "deactivate" : "activate", userId: u.id },
      u.id,
    ).then((d) => {
      if (d) {
        notify(
          u.active
            ? `Compte « ${u.username} » désactivé.`
            : `Compte « ${u.username} » activé.`,
        );
      }
    });
  };

  const confirmDeleteUser = () => {
    if (!toDelete) return;
    const u = toDelete;
    // Soft delete : « supprimer » un compte le désactive — il reste récupérable.
    void run({ action: "deactivate", userId: u.id }, u.id).then((d) => {
      if (d) notify(`Compte « ${u.username} » désactivé — il reste récupérable.`);
    });
    setToDelete(null);
  };

  const cancelInvite = (inv: InviteRow) => {
    void run({ action: "deleteInvite", inviteToken: inv.token }, inv.token).then(
      (d) => {
        if (d) notify(`Invitation annulée pour ${inv.email}.`);
      },
    );
    setToCancelInvite(null);
  };

  const resendInvite = (inv: InviteRow) => {
    void run({ action: "resendInvite", inviteToken: inv.token }, inv.token).then(
      (d) => {
        if (!d) return;
        notify(
          d.emailDelivered
            ? `Invitation renvoyée à ${inv.email}.`
            : "Email non configuré — copiez le lien pour l'envoyer manuellement.",
        );
      },
    );
  };

  const copyLink = async (key: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
    } catch {
      notify("Impossible de copier le lien automatiquement.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div>
      { }
      <div>
        <h2 className="font-display text-2xl font-semibold text-navy">Utilisateurs</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Gérez les comptes administrateurs du cabinet : activez ou désactivez
          un accès, supprimez un compte et suivez les invitations en attente.
        </p>
      </div>

      { }
      {invites.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-navy">
              Invitations en attente
            </h3>
            <Button onClick={() => setInviteOpen(true)} className="shrink-0">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6" />
                <path d="M22 11h-6" />
              </svg>
              Inviter un admin
            </Button>
          </div>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[580px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-navy/[0.03]">
                    <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Email
                    </th>
                    <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Envoyée le
                    </th>
                    <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Statut
                    </th>
                    <th className="border-l border-border/70 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((inv) => {
                    const active = !inv.used && !inv.expired;
                    return (
                      <tr
                        key={inv.token}
                        className="border-b border-border/80 last:border-0 transition hover:bg-navy/[0.02]"
                      >
                        <td className="border-l border-border/70 first:border-l-0 px-4 py-3.5 align-middle font-medium text-navy">
                          {inv.email}
                        </td>
                        <td className="border-l border-border/70 px-4 py-3.5 align-middle text-xs text-muted">
                          {formatDateShort(inv.createdAt)}
                        </td>
                        <td className="border-l border-border/70 first:border-l-0 px-4 py-3.5 align-middle">
                          {inv.used ? (
                            <Badge tone="navy">Utilisée</Badge>
                          ) : inv.expired ? (
                            <Badge tone="red">Expirée</Badge>
                          ) : (
                            <Badge tone="gold">En attente</Badge>
                          )}
                        </td>
                        <td className="border-l border-border/70 px-4 py-3.5 text-right align-middle">
                          <div className="inline-flex items-center gap-1">
                            {active && (
                              <>
                                <IconBtn
                                  label="Copier le lien"
                                  title="Copier le lien d'invitation"
                                  disabled={busyId === inv.token}
                                  onClick={() =>
                                    void copyLink(inv.token, publicInviteLink(inv.token))
                                  }
                                >
                                  {copiedKey === inv.token ? <CheckIcon /> : <CopyIcon />}
                                </IconBtn>
                                <IconBtn
                                  label="Renvoyer"
                                  title="Renvoyer l'invitation par email"
                                  disabled={busyId === inv.token}
                                  onClick={() => resendInvite(inv)}
                                >
                                  <RefreshIcon />
                                </IconBtn>
                              </>
                            )}
                            <IconBtn
                              label="Annuler"
                              title="Annuler l'invitation"
                              danger
                              disabled={busyId === inv.token}
                              onClick={() => setToCancelInvite(inv)}
                            >
                              <XIcon />
                            </IconBtn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      { }
      <div className="mt-8">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-navy">
          Comptes administrateurs
        </h3>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {users.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Aucun compte"
                message="Les comptes apparaissent ici après qu'un collaborateur a accepté une invitation et validé son adresse."
              />
            </div>
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-navy/[0.03]">
                    <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Utilisateur
                    </th>
                    <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Email
                    </th>
                    <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Statut
                    </th>
                    <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Invité par
                    </th>
                    <th className="border-l border-border/70 first:border-l-0 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Créé le
                    </th>
                    <th className="border-l border-border/70 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border/80 last:border-0 transition hover:bg-navy/[0.02]"
                    >
                      <td className="border-l border-border/70 first:border-l-0 px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-paper">
                            {initialsOf(u)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-navy">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="truncate text-[11px] text-muted">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[220px] truncate border-l border-border/70 px-4 py-3.5 align-middle text-sm text-ink/80" title={u.email}>
                        {u.email}
                      </td>
                      <td className="border-l border-border/70 first:border-l-0 px-4 py-3.5 align-middle">
                        {u.active ? (
                          <Badge tone="green">Actif</Badge>
                        ) : (
                          <Badge tone="red">Inactif</Badge>
                        )}
                      </td>
                      <td className="max-w-[150px] truncate border-l border-border/70 px-4 py-3.5 align-middle text-xs text-muted" title={u.invitedBy || "—"}>
                        {u.invitedBy || "—"}
                      </td>
                      <td className="border-l border-border/70 px-4 py-3.5 align-middle text-xs text-muted">
                        {formatDateShort(u.createdAt)}
                      </td>
                      <td className="border-l border-border/70 px-4 py-3.5 text-right align-middle">
                        <div className="inline-flex items-center gap-1">
                          <IconBtn
                            label={u.active ? "Désactiver" : "Activer"}
                            title={
                              u.active
                                ? "Désactiver le compte"
                                : "Activer le compte"
                            }
                            disabled={busyId === u.id}
                            onClick={() => toggleActive(u)}
                          >
                            {u.active ? <PauseIcon /> : <PlayIcon />}
                          </IconBtn>
                          <IconBtn
                            label="Désactiver"
                            title="Désactiver le compte (suppression en douceur, récupérable)"
                            danger
                            disabled={busyId === u.id}
                            onClick={() => setToDelete(u)}
                          >
                            <TrashIcon />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      { }
      {emailConfigured && (
        <p className="mt-4 text-xs text-muted/70">
          Les invitations sont envoyées par email (Resend). En cas de configuration
          absente, le lien reste copiable manuellement.
        </p>
      )}

      {inviteOpen && (
        <InviteAdminDialog
          onClose={() => setInviteOpen(false)}
          notify={notify}
        />
      )}

      { }
      <ConfirmDialog
        open={toDelete !== null}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDeleteUser}
        title="Désactiver le compte"
        message={
          <>
            Voulez-vous vraiment désactiver le compte de{" "}
            <strong className="text-navy">
              {toDelete?.firstName} {toDelete?.lastName}
            </strong>{" "}
            ({toDelete?.username}) ? L&apos;accès à l&apos;espace d&apos;administration sera
            immédiatement bloqué, mais le compte reste récupérable (réactivation possible).
          </>
        }
        confirmLabel="Désactiver le compte"
      />

      <ConfirmDialog
        open={toCancelInvite !== null}
        onCancel={() => setToCancelInvite(null)}
        onConfirm={() => toCancelInvite && cancelInvite(toCancelInvite)}
        title="Annuler l'invitation"
        message={
          <>
            Voulez-vous vraiment annuler l&apos;invitation envoyée à{" "}
            <strong className="text-navy">{toCancelInvite?.email}</strong> ?
            Le lien ne sera plus valable.
          </>
        }
        confirmLabel="Annuler l'invitation"
        danger={false}
      />
    </div>
  );
}

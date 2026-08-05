"use client";

import React, { useCallback, useEffect, useState } from "react";
import Mark from "@/components/Mark";
import {
  type ActivityEventInput,
  type AdminStore,
  API_PATH,
  formationCategories,
  formationLevels,
  postCategories,
  serviceIcons,
} from "@/lib/admin/constants";
import { Button, ConfirmDialog, Spinner, Toasts, type Field, type Toast } from "./ui";
import LoginScreen from "./LoginScreen";
import {
  ActivitySection,
  CrudSection,
  EmailTemplatesSection,
  EnrollmentsSection,
  Overview,
  UsersSection,
  type SectionKey,
  formationColumns,
  serviceColumns,
  postColumns,
  partnerColumns,
  testimonialColumns,
} from "./sections";





const formationFields: Field[] = [
  { key: "name", label: "Nom de la formation", type: "text", required: true, placeholder: "Ex : Comptabilité bancaire" },
  { key: "slug", label: "Slug (URL)", type: "text", autoFrom: "name", placeholder: "Auto-généré depuis le nom" },
  { key: "category", label: "Catégorie", type: "select", required: true, options: formationCategories },
  { key: "price", label: "Prix (FCFA)", type: "text", required: true, placeholder: "Ex : 75 000" },
  { key: "level", label: "Niveau", type: "select", options: formationLevels },
  { key: "image", label: "Image", type: "image", placeholder: "https://res.cloudinary.com/… ou cliquez sur Importer" },
];

const serviceFields: Field[] = [
  { key: "name", label: "Nom du service", type: "text", required: true },
  { key: "slug", label: "Slug (URL)", type: "text", autoFrom: "name", placeholder: "Auto-généré depuis le nom" },
  { key: "icon", label: "Icône", type: "select", required: true, options: serviceIcons },
  { key: "image", label: "Image", type: "image", placeholder: "https://res.cloudinary.com/… ou cliquez sur Importer" },
];

const postFields: Field[] = [
  { key: "name", label: "Titre de l'article", type: "text", required: true },
  { key: "slug", label: "Slug (URL)", type: "text", autoFrom: "name", placeholder: "Auto-généré depuis le nom" },
  { key: "category", label: "Catégorie", type: "select", required: true, options: postCategories },
  { key: "image", label: "Image", type: "image", placeholder: "https://… ou cliquez sur Importer" },
];

const partnerFields: Field[] = [
  { key: "name", label: "Nom du partenaire", type: "text", required: true },
  { key: "tagline", label: "Slogan", type: "text", placeholder: "Ex : Banque panafricaine" },
  { key: "image", label: "Logo", type: "image", placeholder: "https://… ou cliquez sur Importer" },
  { key: "imageAlt", label: "Texte alternatif", type: "text" },
];

const testimonialFields: Field[] = [
  { key: "name", label: "Nom", type: "text", required: true },
  { key: "imageAlt", label: "Texte alternatif", type: "text" },
  { key: "image", label: "Photo", type: "image", placeholder: "https://… ou cliquez sur Importer" },
];





type Status = "loading" | "loggedOut" | "loggedIn";

const SECTIONS: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Tableau de bord", icon: <DashboardIcon /> },
  { key: "formations", label: "Formations", icon: <CapIcon /> },
  { key: "services", label: "Services", icon: <BriefcaseIcon /> },
  { key: "actualites", label: "Actualités", icon: <NewsIcon /> },
  { key: "partenaires", label: "Partenaires", icon: <PartnersIcon /> },
  { key: "temoignages", label: "Témoignages", icon: <ChatIcon /> },
  { key: "inscriptions", label: "Demandes d'inscription", icon: <ClipboardIcon /> },
  { key: "emails", label: "Emails", icon: <MailIcon /> },
  { key: "utilisateurs", label: "Utilisateurs", icon: <UsersIcon /> },
  { key: "activite", label: "Activité", icon: <ActivityIcon /> },
];

export default function AdminApp() {
  const [status, setStatus] = useState<Status>("loading");
  const [store, setStore] = useState<AdminStore | null>(null);
  const [storeError, setStoreError] = useState(false);
  const [section, setSection] = useState<SectionKey>("overview");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const notify = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const fetchStore = useCallback(async () => {
    try {
      const res = await fetch(API_PATH, { credentials: "same-origin" });
      if (!res.ok) throw new Error("unauthorized");
      const data = (await res.json()) as AdminStore;
      setStore(data);
      setStoreError(false);
      return true;
    } catch {
      setStoreError(true);
      return false;
    }
  }, []);



  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_PATH}/session`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("session");
      const data = (await res.json()) as { authenticated: boolean };
      if (data.authenticated) {
        setStatus("loggedIn");
        fetchStore();
      } else {
        setStatus("loggedOut");
      }
    } catch {
      setStatus("loggedOut");
    }
  }, [fetchStore]);

  useEffect(() => {
    const id = setTimeout(fetchSession, 0);
    return () => clearTimeout(id);
  }, [fetchSession]);

  const handleLoginSuccess = async () => {
    setStatus("loggedIn");
    const okStore = await fetchStore();
    if (!okStore) notify("Impossible de charger le contenu depuis le serveur.", "error");
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_PATH}/logout`, { method: "POST", credentials: "same-origin" });
    } catch {

    }


    window.location.replace("/admin/login");
  };

  const saveStore = useCallback(
    async (next: AdminStore, event?: ActivityEventInput, resetActivity = false) => {
      setStore(next);
      try {



        const res = await fetch(API_PATH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            ...next,
            activityEvent: event,
            ...(resetActivity ? { resetActivity: true } : {}),
          }),
        });
        if (!res.ok) throw new Error("save failed");



        const saved = (await res.json()) as AdminStore;
        setStore(saved);
      } catch {
        notify("Échec de l'enregistrement sur le serveur.", "error");
        fetchStore();  
      }
    },
    [notify, fetchStore],
  );

  




  const setList = (key: keyof AdminStore, entity: string) =>
    (items: unknown[], event: ActivityEventInput) => {
      if (!store) return;
      saveStore(
        { ...store, [key]: items as never },
        { ...event, entity },
      );
    };



  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (status === "loggedOut") {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-[#F4F2EC]">
      { }
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy-deep text-paper/80 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation admin"
      >
        { }
        <div className="relative flex items-center gap-3 border-b border-paper/10 px-5 py-5">
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent"
            aria-hidden="true"
          />
          <span className="flex h-9 w-auto shrink-0 items-center rounded-lg bg-white p-1">
            <Mark className="h-6 w-auto" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-paper">COSI LEWA</p>
            <p className="text-[9px] font-medium tracking-[0.25em] text-gold-bright/70">admin</p>
          </div>
        </div>

        { }
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setSection(s.key);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                section === s.key
                  ? "bg-gold/15 text-gold-bright"
                  : "text-paper/60 hover:bg-paper/[0.06] hover:text-paper"
              }`}
            >
              <span className="shrink-0 opacity-80">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        { }
        <div className="space-y-1 border-t border-paper/10 px-3 py-4">
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red/70 transition hover:bg-red/10 hover:text-red"
          >
            <LogoutIcon />
            Déconnexion
          </button>
        </div>
      </aside>

      { }
      <div className="flex min-h-screen w-full flex-col md:pl-64">
        { }
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-paper/95 px-4 py-3 backdrop-blur md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-navy transition hover:border-navy/30"
            aria-label="Ouvrir le menu"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <p className="font-display text-sm font-semibold text-navy">
            {SECTIONS.find((s) => s.key === section)?.label}
          </p>
          <span className="w-9" />
        </header>

        {
}
        <main className="w-full flex-1 px-4 py-8 sm:px-8">
          {storeError ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red/20 bg-red/5 px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold text-navy">
                Impossible de charger les données
              </p>
              <p className="max-w-sm text-sm text-muted">
                Impossible de récupérer vos données pour le moment. Réessayez dans quelques instants.
              </p>
              <Button
                onClick={() => {
                  setStoreError(false);
                  fetchStore();
                }}
              >
                Réessayer
              </Button>
            </div>
          ) : !store ? (
            <div className="flex items-center justify-center py-24">
              <Spinner className="h-10 w-10" />
            </div>
          ) : (
            <>
              {section === "overview" && (
                <Overview store={store} onNavigate={setSection} notify={notify} />
              )}

              {section === "formations" && (
                <CrudSection
                  title="Formations"
                  description="Gérez les formations professionnelles du cabinet."
                  singular="Formation"
                  fields={formationFields}
                  columns={formationColumns}
                  items={store.formations as never}
                  onChange={setList("formations", "formations")}
                  identityKey="slug"
                  newItem={() => ({
                    slug: "",
                    category: "compta",
                    image: "",
                    price: "",
                    level: "debutant",
                    name: "",
                  })}
                  notify={notify}
                />
              )}

              {section === "services" && (
                <CrudSection
                  title="Services"
                  description="Gérez les six domaines d'expertise du cabinet."
                  singular="Service"
                  fields={serviceFields}
                  columns={serviceColumns}
                  items={store.services as never}
                  onChange={setList("services", "services")}
                  identityKey="slug"
                  newItem={() => ({ slug: "", icon: "audit", image: "", name: "" })}
                  notify={notify}
                />
              )}

              {section === "actualites" && (
                <CrudSection
                  title="Actualités"
                  description="Gérez les articles et annonces publiés sur le site."
                  singular="Article"
                  fields={postFields}
                  columns={postColumns}
                  items={store.posts as never}
                  onChange={setList("posts", "posts")}
                  identityKey="slug"
                  newItem={() => ({ slug: "", category: "formations", image: "", name: "" })}
                  notify={notify}
                />
              )}

              {section === "partenaires" && (
                <CrudSection
                  title="Partenaires"
                  description="Gérez les organisations qui font confiance au cabinet."
                  singular="Partenaire"
                  fields={partnerFields}
                  columns={partnerColumns}
                  items={store.partners as never}
                  onChange={setList("partners", "partners")}
                  identityKey="name"
                  newItem={() => ({ name: "", tagline: "", image: "", imageAlt: "" })}
                  notify={notify}
                />
              )}

              {section === "temoignages" && (
                <CrudSection
                  title="Témoignages"
                  description="Gérez les témoignages clients affichés sur la page d'accueil."
                  singular="Témoignage"
                  fields={testimonialFields}
                  columns={testimonialColumns}
                  items={store.testimonials as never}
                  onChange={setList("testimonials", "testimonials")}
                  identityKey="name"
                  newItem={() => ({ name: "", image: "", imageAlt: "" })}
                  notify={notify}
                />
              )}

              {section === "inscriptions" && (
                <EnrollmentsSection
                  items={store.enrollments ?? []}
                  notify={notify}
                  onRefresh={() => void fetchStore()}
                />
              )}

              {section === "emails" && (
                <EmailTemplatesSection
                  templates={store.emailTemplates}
                  onSave={(next) =>
                    saveStore(
                      { ...store, emailTemplates: next },
                      { action: "content", entity: "emails", label: "Modèles d'emails" },
                    )
                  }
                  notify={notify}
                />
              )}

              {section === "utilisateurs" && <UsersSection notify={notify} />}

              {section === "activite" && (
                <ActivitySection
                  store={store}
                  notify={notify}
                  onReset={() => saveStore({ ...store, activity: [] }, undefined, true)}
                />
              )}
            </>
          )}
        </main>

        <footer className="border-t border-border px-4 py-4 text-center text-[11px] text-muted/60 md:pl-64">
          Espace d&apos;administration — COSI LEWA Consulting
        </footer>
      </div>

      { }
      <ConfirmDialog
        open={confirmLogout}
        onCancel={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Se déconnecter"
        message={
          <>
            Voulez-vous vraiment quitter l&apos;espace d&apos;administration ? Vous devrez
            vous reconnecter pour accéder à nouveau au dashboard.
          </>
        }
        confirmLabel="Se déconnecter"
      />

      <Toasts toasts={toasts} />
    </div>
  );
}





const iconProps = {
  className: "h-4 w-4",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function DashboardIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}
function CapIcon() {
  return (
    <svg {...iconProps}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
function NewsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9" />
      <path d="M2 19a3 3 0 0 0 3 3" />
      <line x1="10" y1="8" x2="18" y2="8" />
      <line x1="10" y1="12" x2="18" y2="12" />
      <line x1="10" y1="16" x2="14" y2="16" />
    </svg>
  );
}
function PartnersIcon() {
  return (
    <svg {...iconProps}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg {...iconProps}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function ActivityIcon() {
  return (
    <svg {...iconProps}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg {...iconProps}>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 6L2 7" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg {...iconProps}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg {...iconProps}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}


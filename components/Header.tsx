"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Mark from "./Mark";
import { servicesData } from "@/lib/services";
import { formationCategories, comptaFinance, bureautiqueDev, featuredFormations } from "@/lib/formations";

// Lookup rapide image Unsplash par titre de service
const serviceImageMap = new Map<string, string>(
  servicesData.map((s) => [s.title, s.image]),
);

const categoryFormations: Record<string, { name: string; slug: string; price: string; image: string }[]> = {
  compta: comptaFinance.map((f) => ({ name: f.name, slug: f.slug, price: f.price, image: f.image })),
  bureautique: bureautiqueDev.map((f) => ({ name: f.name, slug: f.slug, price: f.price, image: f.image })),
};

// ---- Données pour le mega-menu Notre expertise ----

const expertiseItems = [
  {
    href: "/services/expertise-comptable",
    label: "Expertise comptable",
    desc: "Un accompagnement sur mesure au plus proche de vos enjeux",
    tags: ["TPE", "PME", "ONG", "Institution"],
    icon: "compta",
  },
  {
    href: "/services/conseil-aux-entreprises",
    label: "Conseil aux entreprises",
    desc: "Des conseils avisés au moment opportun",
    tags: ["PME", "ONG", "Institution"],
    icon: "conseil",
  },
  {
    href: "/services/gestion-sociale-rh",
    label: "Gestion sociale et RH",
    desc: "Sécurisez la gestion de vos ressources humaines",
    tags: ["TPE", "PME", "ONG"],
    icon: "rh",
  },
  {
    href: "/services/formation-professionnelle",
    label: "Formation professionnelle",
    desc: "Certificat, attestation et CV professionnel à la clé",
    tags: ["TPE", "PME", "ONG", "Institution"],
    icon: "formation",
  },
  {
    href: "/services/gestion-privee",
    label: "Gestion privée",
    desc: "Conseils en investissements et prévoyance",
    tags: ["Dirigeants", "Particuliers"],
    icon: "privee",
  },
  {
    href: "/services/conseil-juridique-fiscal",
    label: "Conseil juridique et fiscal",
    desc: "Accompagnement juridique et fiscal personnalisé",
    tags: ["PME", "ONG"],
    icon: "juridique",
  },
];

const sectorsItems = [
  { label: "BTP & Construction", href: "/services", icon: "btp" },
  { label: "ONG & Économie Sociale", href: "/services", icon: "ong" },
  { label: "Commerce & Distribution", href: "/services", icon: "commerce" },
  { label: "Banque & Microfinance", href: "/services", icon: "banque" },
  { label: "Santé", href: "/services", icon: "sante" },
  { label: "Éducation & Formation", href: "/formations/comptabilite-finance", icon: "education" },
  { label: "Secteur Public", href: "/services", icon: "public" },
  { label: "Transport & Mobilités", href: "/services", icon: "transport" },
  { label: "Hôtellerie & Restauration", href: "/services", icon: "hotel" },
];

const resourcesItems = [
  { label: "Articles & analyses", href: "/actualites", icon: "articles" },
  { label: "Guides & dossiers", href: "/actualites", icon: "guides" },
  { label: "Nos formations", href: "/formations/comptabilite-finance", icon: "formations" },
  { label: "FAQ", href: "/contact", icon: "faq" },
  { label: "Contact expert", href: "/contact", icon: "contact" },
  { label: "WhatsApp", href: "https://wa.me/23672696700", icon: "whatsapp", external: true },
];

const expertiseIcon = (icon: string, size?: string) => {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  switch (icon) {
    case "compta":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="3" width="20" height="18" rx="2" />
          <line x1="6" y1="7" x2="18" y2="7" />
          <line x1="6" y1="11" x2="18" y2="11" />
          <line x1="6" y1="15" x2="12" y2="15" />
        </svg>
      );
    case "conseil":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "rh":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "formation":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8 7h8" />
          <path d="M8 11h6" />
        </svg>
      );
    case "privee":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "juridique":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    // Icons secteurs (small)
    case "btp":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 22L12 2l10 20H2z" />
          <path d="M12 12v4" />
        </svg>
      );
    case "ong":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      );
    case "commerce":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case "banque":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="3 21 21 21 21 14" />
          <polyline points="3 14 3 21 21 21 21 14" />
          <line x1="12" y1="3" x2="12" y2="7" />
          <path d="M3 10l9-7 9 7" />
        </svg>
      );
    case "sante":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case "education":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case "public":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "transport":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case "hotel":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 21V3h18v18H3z" />
          <path d="M7 7h4v4H7z" />
          <path d="M13 7h4v4h-4z" />
          <path d="M7 13h10v4H7z" />
        </svg>
      );
    // Icons ressources (small)
    case "articles":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "guides":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "formations":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        </svg>
      );
    case "faq":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "contact":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
    default:
      return null;
  }
};

// ---- Composant accordéon pour le menu mobile ----

function MobileAccordion({
  label,
  icon,
  active,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition ${
          active
            ? "bg-navy/[0.06] text-navy"
            : "text-ink/80 hover:bg-navy/[0.04] hover:text-navy"
        }`}
      >
        <span className="flex items-center gap-3">
          <span className="text-navy/50">{icon}</span>
          <span>{label}</span>
        </span>
        <svg
          className={`h-4 w-4 text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-2 mt-1 space-y-0.5 border-l-2 border-navy/[0.06] pb-2 pl-2">
          {children}
        </div>
      </div>
    </div>
  );
}

type NavLink = {
  href: string;
  label: string;
  submenu?: { href: string; label: string }[];
};

const links: NavLink[] = [
  { href: "/", label: "Accueil" },
  {
    href: "/services",
    label: "Notre expertise",
    submenu: expertiseItems.map((s) => ({ href: s.href, label: s.label })),
  },
  {
    href: "/formations/comptabilite-finance",
    label: "Formations",
    submenu: [
      ...formationCategories.map((c) => ({
        href: `/formations/${c.slug}`,
        label: c.label,
      })),
    ],
  },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(formationCategories[0]?.id ?? null);
  const [locale, setLocale] = useState("fr");
  const pathname = usePathname();
  const router = useRouter();
  const formationsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
    setLocale(match ? match[1] : "fr");
  }, []);

  const switchLocale = (lang: string) => {
    document.cookie = `locale=${lang};path=/;max-age=31536000`;
    setLocale(lang);
    router.refresh();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    };
  }, []);

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Fermer le dropdown au clic en dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const inFormations = formationsRef.current?.contains(e.target as Node);
      const inServices = servicesRef.current?.contains(e.target as Node);
      if (!inFormations && !inServices) {
        setHoveredDropdown(null);
      }
    }
    if (hoveredDropdown) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [hoveredDropdown]);

  // Helper pour savoir si un lien (ou un de ses sous-liens) est actif
  const isActive = (l: NavLink): boolean => {
    if (l.href === "/") return pathname === "/";
    // Pour les liens avec sous-menu, matcher toute page sous leur préfixe
    if (l.submenu) {
      if (l.label === "Formations") return pathname.startsWith("/formations");
      if (l.label === "Notre expertise") return pathname.startsWith("/services");
      return pathname.startsWith(l.href);
    }
    return pathname.startsWith(l.href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-border/60 bg-paper/92 shadow-xs backdrop-blur-md"
          : "border-border bg-paper"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 transition-all duration-300 ${
          scrolled ? "py-3" : "py-4"
        }`}
      >
        <Link href="/" className="flex items-center gap-3 group">
          <Mark className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:scale-105" />
          <span className="font-display leading-tight">
            <span className="block text-[0.62rem] tracking-[0.2em] text-muted uppercase">Cabinet</span>
            <span
              className={`block font-semibold text-navy transition-all duration-300 ${
                scrolled ? "text-sm" : "text-base sm:text-lg"
              }`}
            >
              COSI LEWA
            </span>
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const active = isActive(l);

            if (l.submenu) {
              return (
                <div
                  key={l.href}
                  className="relative"
                  ref={l.label === "Formations" ? formationsRef : l.label === "Notre expertise" ? servicesRef : undefined}
                  onMouseEnter={() => {
                    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
                    setHoveredDropdown(l.href);
                    if (l.label === "Notre expertise") setHoveredCategory(null);
                    if (l.label === "Formations") setHoveredCategory(formationCategories[0]?.id ?? null);
                  }}
                  onMouseLeave={() => {
                    dropdownTimer.current = setTimeout(() => setHoveredDropdown(null), 150);
                  }}
                >
                  <Link
                    href={l.href}
                    className={`group relative flex items-center gap-1 border-b-2 pb-1 text-sm font-medium transition ${
                      active
                        ? "border-red text-navy"
                        : "border-transparent text-ink/70 hover:text-navy"
                    }`}
                  >
                    {l.label}
                    {/* Chevron */}
                    <svg
                      className={`h-3 w-3 transition-transform duration-200 ${
                        hoveredDropdown === l.href ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" />
                    </svg>
                    {!active && (
                      <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-0 bg-red/40 transition-all duration-300 group-hover:w-full" />
                    )}
                  </Link>

                  {/* Dropdown — Notre expertise : méga-menu riche */}
                  {hoveredDropdown === l.href && l.label === "Notre expertise" && (
                    <div className="absolute left-1/2 top-full pt-2 -translate-x-1/2 animate-slide-down">
                      <div className="w-[880px] overflow-hidden rounded-xl border border-border bg-paper shadow-lg">
                        {/* Section services */}
                        <div className="p-6 pb-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                            <span className="inline-block h-px w-4 bg-gold/50" />
                            Nos expertises
                          </div>
                          <p className="mt-1.5 text-xs text-muted/80 max-w-xl">
                            Guider les entrepreneurs et éclairer leurs décisions pour tracer les chemins de la réussite.
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-px bg-border px-6">
                          {expertiseItems.map((s) => (
                            <Link
                              key={s.label}
                              href={s.href}
                              onClick={() => setHoveredDropdown(null)}                            className="group flex flex-col gap-2.5 rounded-lg bg-paper p-4 transition hover:bg-navy/[0.02] -mx-1 px-4"
                          >
                              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                                <img
                                  src={serviceImageMap.get(s.label)?.replace("w=600&q=80", "w=80&h=80&fit=crop&q=50")}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-navy leading-snug">{s.label}</p>
                                <p className="mt-0.5 text-[11px] text-muted leading-snug">{s.desc}</p>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {s.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="inline-flex items-center rounded-full bg-navy/[0.06] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-navy/70"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Section secteurs + ressources */}
                        <div className="grid grid-cols-2 gap-px bg-border mt-3 mx-6 rounded-lg overflow-hidden">
                          {/* Secteurs */}
                          <div className="bg-navy/[0.02] p-5">
                            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                              </svg>
                              Votre secteur
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {sectorsItems.map((s) => (
                                <Link
                                  key={s.label}
                                  href={s.href}
                                  onClick={() => setHoveredDropdown(null)}
                                  className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-[11px] font-medium text-ink/70 transition hover:border-navy/30 hover:bg-navy/[0.02] hover:text-navy"
                                >
                                  <span className="text-navy/50 group-hover:text-navy/80 transition-colors">
                                    {expertiseIcon(s.icon, "sm")}
                                  </span>
                                  {s.label}
                                </Link>
                              ))}
                            </div>
                          </div>

                          {/* Ressources */}
                          <div className="bg-paper p-5">
                            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                              </svg>
                              Nos ressources
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {resourcesItems.map((r) => {
                                const LinkComponent = r.external ? "a" : Link;
                                const linkProps = r.external
                                  ? { href: r.href, target: "_blank", rel: "noopener noreferrer" }
                                  : { href: r.href, onClick: () => setHoveredDropdown(null) };
                                return (
                                  <LinkComponent
                                    key={r.label}
                                    {...linkProps}
                                    className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium text-ink/70 transition hover:bg-navy/[0.04] hover:text-navy"
                                  >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
                                      {expertiseIcon(r.icon, "sm")}
                                    </span>
                                    <span>{r.label}</span>
                                  </LinkComponent>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Lien tout voir */}
                        <div className="border-t border-border px-6 py-3">
                          <Link
                            href="/services"
                            onClick={() => setHoveredDropdown(null)}
                            className="group inline-flex items-center gap-1 text-xs font-medium text-navy transition hover:text-red"
                          >
                            <span>Découvrir toutes nos expertises</span>
                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dropdown — Formations : mega menu avec sidebar */}
                  {hoveredDropdown === l.href && l.label === "Formations" && (
                    <div className="absolute left-1/2 top-full pt-2 -translate-x-1/2 animate-slide-down">
                      <div className="flex w-[720px] overflow-hidden rounded-xl border border-border bg-paper shadow-lg">
                        {/* Sidebar — catégories */}
                        <div className="w-44 shrink-0 border-r border-border bg-navy/[0.02]">
                          <div className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                            Catégories
                          </div>
                          {formationCategories.map((c) => {
                            const count = categoryFormations[c.id]?.length ?? 0;
                            const isHovered = hoveredCategory === c.id;
                            return (
                              <button
                                key={c.id}
                                onMouseEnter={() => setHoveredCategory(c.id)}
                                onClick={() => {
                                  setHoveredDropdown(null);
                                  router.push(`/formations/${c.slug}`);
                                }}
                                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                                  isHovered
                                    ? "bg-paper text-navy font-medium"
                                    : "text-ink/70 hover:bg-paper/60 hover:text-navy"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition ${isHovered ? "bg-gold" : "bg-gold/40"}`} />
                                  {c.label}
                                </span>
                                <span className="text-[10px] text-muted/60 tabular">{count}</span>
                              </button>
                            );
                          })}

                        </div>

                        {/* Panneau — formations de la catégorie survolée */}
                        <div className="flex-1 p-4">
                          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                            {hoveredCategory
                              ? formationCategories.find((c) => c.id === hoveredCategory)?.label ?? ""
                              : "Choisissez une catégorie"}
                          </div>
                          <div className="space-y-1">
                            {hoveredCategory && categoryFormations[hoveredCategory] ? (
                              categoryFormations[hoveredCategory].map((f) => (
                                <Link
                                  key={f.slug}
                                  href={`/formations/${f.slug}`}
                                  onClick={() => setHoveredDropdown(null)}
                                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-ink/70 transition hover:bg-navy/[0.04] hover:text-navy"
                                >
                                  <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md">
                                    <img
                                      src={f.image.replace("w=600&q=80", "w=48&h=48&fit=crop&q=50")}
                                      alt=""
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  </span>
                                  <span className="flex-1 min-w-0 truncate">{f.name}</span>
                                  <span className="font-mono text-[10px] text-muted/60 tabular shrink-0">
                                    {f.price} FCFA
                                  </span>
                                </Link>
                              ))
                            ) : (
                              <p className="py-6 text-center text-xs text-muted/50">
                                Passez la souris sur une catégorie
                              </p>
                            )}
                          </div>

                        </div>

                        {/* Colonne — formations vedettes */}
                        <div className="w-52 shrink-0 border-l border-border bg-gradient-to-b from-gold/[0.03] to-transparent">
                          <div className="flex items-center gap-1.5 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gold">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            Formations vedettes
                          </div>
                          <div className="space-y-1 px-2">
                            {featuredFormations.map((f) => (
                              <Link
                                key={f.slug}
                                href={`/formations/${f.slug}`}
                                onClick={() => setHoveredDropdown(null)}
                                className="group flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-gold/[0.06]"
                              >
                                <span className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
                                  <img
                                    src={f.image.replace("w=600&q=80", "w=64&h=64&fit=crop&q=50")}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                </span>
                                <span className="min-w-0 leading-snug text-ink/70 group-hover:text-navy">
                                  <span className="block truncate">{f.name}</span>
                                  <span className="mt-0.5 block text-[10px] text-muted/60">
                                    {f.price} FCFA
                                  </span>
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            const isContact = l.href === "/contact";

            if (isContact) {
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`ml-auto rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "border-navy bg-navy text-paper"
                      : "border-navy/30 text-navy hover:border-navy hover:bg-navy/[0.04]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            }

            return (
              <Link
                key={l.href}
                href={l.href}
                className={`group relative border-b-2 pb-1 text-sm font-medium transition ${
                  active
                    ? "border-red text-navy"
                    : "border-transparent text-ink/70 hover:text-navy"
                }`}
              >
                {l.label}
                {!active && (
                  <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-0 bg-red/40 transition-all duration-300 group-hover:w-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sélecteur de langue desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <button
            onClick={() => switchLocale("fr")}
            className={`relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition ${
              locale === "fr"
                ? "bg-navy text-paper"
                : "text-muted hover:bg-navy/[0.06] hover:text-navy"
            }`}
            aria-label="Français"
          >
            FR
          </button>
          <span className="text-muted/40 text-[10px]">/</span>
          <button
            onClick={() => switchLocale("en")}
            className={`relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition ${
              locale === "en"
                ? "bg-navy text-paper"
                : "text-muted hover:bg-navy/[0.06] hover:text-navy"
            }`}
            aria-label="English"
          >
            EN
          </button>
        </div>

        {/* Bouton menu mobile hamburger */}
        <button
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
        >
          <span
            className={`h-[1.5px] w-6 bg-navy transition-all duration-300 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[1.5px] w-6 bg-navy transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-[1.5px] w-6 bg-navy transition-all duration-300 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Menu mobile drawer professionnel */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm bg-paper shadow-2xl md:hidden transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation principale"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <Mark className="h-8 w-8 shrink-0" />
            <div>
              <span className="block text-[0.55rem] tracking-[0.2em] text-muted uppercase">Cabinet</span>
              <span className="block text-sm font-semibold text-navy">COSI Lewa-Consulting</span>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/[0.06] text-navy transition hover:bg-navy/[0.12]"
            aria-label="Fermer le menu"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable navigation */}
        <div className="overflow-y-auto" style={{ height: "calc(100% - 140px)" }}>
          <nav className="space-y-1 px-5 py-4">
            {/* Accueil */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                pathname === "/"
                  ? "bg-navy text-paper"
                  : "text-ink/80 hover:bg-navy/[0.04] hover:text-navy"
              }`}
            >
              <svg className="h-5 w-5 shrink-0 text-current opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Accueil</span>
            </Link>

            {/* Notre expertise */}
            <MobileAccordion
              label="Notre expertise"
              icon={
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="18" rx="2" />
                  <line x1="6" y1="7" x2="18" y2="7" />
                  <line x1="6" y1="11" x2="18" y2="11" />
                  <line x1="6" y1="15" x2="12" y2="15" />
                </svg>
              }
              active={pathname.startsWith("/services")}
              isOpen={mobileAccordion === "services"}
              onToggle={() => setMobileAccordion(mobileAccordion === "services" ? null : "services")}
            >
              {expertiseItems.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  onClick={() => { setOpen(false); setMobileAccordion(null); }}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 transition hover:bg-navy/[0.04]"
                >
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    <img
                      src={serviceImageMap.get(s.label)?.replace("w=600&q=80", "w=80&h=80&fit=crop&q=50")}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy">{s.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted leading-snug line-clamp-1">{s.desc}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full bg-navy/[0.06] px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wider text-navy/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </MobileAccordion>

            {/* Formations */}
            <MobileAccordion
              label="Formations"
              icon={
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              }
              active={pathname.startsWith("/formations")}
              isOpen={mobileAccordion === "formations"}
              onToggle={() => setMobileAccordion(mobileAccordion === "formations" ? null : "formations")}
            >
              {formationCategories.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    <span className="inline-block h-1 w-1 rounded-full bg-gold/60" />
                    {cat.label}
                  </div>
                  <div className="space-y-0.5">
                    {(categoryFormations[cat.id] || []).map((f) => (
                      <Link
                        key={f.slug}
                        href={`/formations/${f.slug}`}
                        onClick={() => { setOpen(false); setMobileAccordion(null); }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-navy/[0.04]"
                      >
                        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
                          <img
                            src={f.image.replace("w=600&q=80", "w=48&h=48&fit=crop&q=50")}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                        <span className="flex-1 text-sm text-ink/80 leading-snug">{f.name}</span>
                        <span className="shrink-0 font-mono text-[10px] text-muted/60 tabular">{f.price} FCFA</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </MobileAccordion>

            {/* Contact */}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className={`mt-3 flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition ${
                pathname.startsWith("/contact")
                  ? "border-navy bg-navy text-paper"
                  : "border-navy/30 text-navy hover:border-navy hover:bg-navy/[0.04]"
              }`}
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Contact</span>
            </Link>
          </nav>
        </div>

        {/* Drawer footer — coordonnées + langue */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-gradient-to-t from-paper via-paper to-transparent px-5 py-4">
          {/* Sélecteur de langue mobile */}
          <div className="mb-3 flex items-center justify-center gap-1">
            <button
              onClick={() => switchLocale("fr")}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                locale === "fr"
                  ? "bg-navy text-paper"
                  : "bg-navy/[0.06] text-muted hover:bg-navy/[0.12] hover:text-navy"
              }`}
            >
              FR
            </button>
            <button
              onClick={() => switchLocale("en")}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                locale === "en"
                  ? "bg-navy text-paper"
                  : "bg-navy/[0.06] text-muted hover:bg-navy/[0.12] hover:text-navy"
              }`}
            >
              EN
            </button>
          </div>

          <div className="space-y-2.5">
            <a
              href="tel:+23672696700"
              className="flex items-center gap-2.5 text-xs text-muted transition hover:text-navy"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>+236 72 69 67 00</span>
            </a>
            <a
              href="mailto:cabinetcosi29@gmail.com"
              className="flex items-center gap-2.5 text-xs text-muted transition hover:text-navy"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>cabinetcosi29@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

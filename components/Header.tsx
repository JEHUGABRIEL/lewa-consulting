"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Mark from "./Mark";
import { servicesData } from "@/lib/services";
import { toTelHref, toWhatsAppHref } from "@/lib/phone";
import { formationCategories, comptaFinance, bureautiqueDev, featuredFormations } from "@/lib/formations";

// Lookup rapide image par slug de service
const serviceImageMap = new Map<string, string>(
  servicesData.map((s) => [s.slug, s.image]),
);

const categoryFormations: Record<string, { slug: string; price: string; image: string }[]> = {
  compta: comptaFinance.map((f) => ({ slug: f.slug, price: f.price, image: f.image })),
  bureautique: bureautiqueDev.map((f) => ({ slug: f.slug, price: f.price, image: f.image })),
};

// Clé i18n du libellé d'une catégorie de formations
const categoryTitleKey = (id: string) =>
  id === "compta" ? "formations.catComptaTitle" : "formations.catBureautiqueTitle";

// ---- Clés de traduction pour le mega-menu ----

const expertiseItems = [
  { slug: "audit-et-assurance", key: "auditEtAssurance", icon: "audit" },
  { slug: "expertise-comptable-finance", key: "expertiseComptableFinance", icon: "compta" },
  { slug: "conseil-gouvernance-organisationnel", key: "conseilGouvernance", icon: "conseil" },
  { slug: "formation-renforcement-capacites", key: "formationRenforcement", icon: "formation" },
  { slug: "accompagnement-entreprises", key: "accompagnementEntreprises", icon: "briefcase" },
  { slug: "evenements-professionnels", key: "evenementsProfessionnels", icon: "event" },
];

const sectorsItems = [
  { key: "institutionsPubliques", href: "/services", icon: "public" },
  { key: "ongNationales", href: "/services", icon: "ong" },
  { key: "agencesNationsUnies", href: "/services", icon: "globe" },
  { key: "entreprisesPrivees", href: "/services", icon: "commerce" },
  { key: "banquesFinancieres", href: "/services", icon: "banque" },
  { key: "projetsBailleurs", href: "/services", icon: "briefcase" },
  { key: "collectivitesTerritoriales", href: "/services", icon: "pin" },
  { key: "etablissementsEnseignement", href: "/services", icon: "education" },
];

const resourcesItems = [
  { key: "articles", href: "/actualites", icon: "articles" },
  { key: "guides", href: "/actualites", icon: "guides" },
  { key: "ourFormations", href: "/formations/comptabilite-finance", icon: "formations" },
  { key: "faq", href: "/contact", icon: "faq" },
  { key: "contactExpert", href: "/contact", icon: "contact" },
  // href WhatsApp surchargé au rendu via toWhatsAppHref(t('common.phone')) — valeur ici = simple placeholder
  { key: "whatsapp", href: "https://wa.me/23672696700", icon: "whatsapp", external: true },
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
    case "formation":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8 7h8" />
          <path d="M8 11h6" />
        </svg>
      );
    case "audit":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-9-9" />
          <polyline points="21 3 12 12 14 12 14 16 11 16" />
          <path d="M21 3h-4" />
        </svg>
      );
    case "event":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <polyline points="9 15 11 17 15 13" />
        </svg>
      );
    // Icons secteurs (small)
    case "globe":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "briefcase":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "pin":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
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
    case "education":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case "bureautique":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="20" height="13" rx="2" ry="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      );
    case "public":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
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
        aria-expanded={isOpen}
        className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
          active
            ? "bg-navy/[0.06] text-navy"
            : "text-ink/80 hover:bg-navy/[0.04] hover:text-navy"
        }`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
              isOpen || active
                ? "bg-gold/15 text-gold"
                : "bg-navy/[0.05] text-navy/60 group-hover:bg-navy/[0.08]"
            }`}
          >
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${
            isOpen ? "rotate-180 text-gold" : ""
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
          isOpen ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0"
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
  key: string;
  submenu?: { href: string; label: string }[];
};

const links: NavLink[] = [
  { href: "/", key: "home" },
  {
    href: "/services",
    key: "expertise",
    submenu: expertiseItems.map((s) => ({ href: `/services/${s.slug}`, label: "" })),
  },
  {
    href: "/formations/comptabilite-finance",
    key: "formations",
    submenu: [
      ...formationCategories.map((c) => ({
        href: `/formations/${c.slug}`,
        label: "",
      })),
    ],
  },
  { href: "/a-propos", key: "about" },
];

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(formationCategories[0]?.id ?? null);
  const pathname = usePathname();
  const router = useRouter();
  const formationsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Changer de langue : navigue vers la même page préfixée par la nouvelle
  // locale (/fr/… ⇄ /en/…). `usePathname`/`useRouter` viennent de
  // @/i18n/navigation → le pathname est sans préfixe, la locale est injectée.
  const switchLocale = (lang: string) => {
    router.replace(pathname, { locale: lang as "fr" | "en" });
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
  // + gérer le focus : déplacer vers le drawer à l'ouverture, restaurer le bouton menu à la fermeture
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const menuButton = menuButtonRef.current;
      // Focus direct sur le bouton fermer (premier élément tabbable) — pas de timer
      closeButtonRef.current?.focus();
      return () => {
        document.body.style.overflow = "";
        menuButton?.focus();
      };
    }
    document.body.style.overflow = "";
  }, [open]);

  // Piéger le focus dans le drawer (Tab) tant qu'il est ouvert
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusables = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select, textarea, input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!drawer.contains(document.activeElement)) {
        // Focus échappé du drawer (cas limite) → on le ramène au premier élément
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Fermer le menu mobile avec la touche Échap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
    if (l.submenu) {
      if (l.key === "formations") return pathname.startsWith("/formations");
      if (l.key === "expertise") return pathname.startsWith("/services");
      return pathname.startsWith(l.href);
    }
    return pathname.startsWith(l.href);
  };

  // Fermer le drawer mobile et réinitialiser les accordéons
  const closeDrawer = () => {
    setOpen(false);
    setMobileAccordion(null);
  };

  return (
    <>
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
          <Mark className="h-9 w-auto shrink-0 transition-transform duration-300 group-hover:scale-105" priority />
          <span className="font-display leading-tight">
            <span
              className={`block font-semibold text-navy transition-all duration-300 ${
                scrolled ? "text-sm" : "text-base sm:text-lg"
              }`}
            >
              {/* « COSI » masqué sur mobile (seul « LEWA » reste à côté du logo) */}
              <span className="hidden sm:inline">COSI </span>LEWA
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
                  ref={l.key === "formations" ? formationsRef : l.key === "expertise" ? servicesRef : undefined}
                  onMouseEnter={() => {
                    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
                    setHoveredDropdown(l.href);
                    if (l.key === "expertise") setHoveredCategory(null);
                    if (l.key === "formations") setHoveredCategory(formationCategories[0]?.id ?? null);
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
                    {t(`nav.${l.key}`)}
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
                  {hoveredDropdown === l.href && l.key === "expertise" && (
                    <div className="absolute left-1/2 top-full pt-2 -translate-x-1/2 animate-slide-down">
                      <div className="w-[880px] overflow-hidden rounded-xl bg-paper shadow-lg">
                        {/* Section services */}
                        <div className="p-6 pb-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                            <span className="inline-block h-px w-4 bg-gold/50" />
                            {t('nav.ourExpertises')}
                          </div>
                          <p className="mt-1.5 text-xs text-muted/80 max-w-xl">
                            {t('nav.expertiseDesc')}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-px bg-border px-6">
                          {expertiseItems.map((s) => (
                            <Link
                              key={s.key}
                              href={`/services/${s.slug}`}
                              onClick={() => setHoveredDropdown(null)}
                              className="group flex flex-col gap-2.5 rounded-lg bg-paper p-4 transition hover:bg-navy/[0.02] -mx-1"
                            >
                              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                                <Image
                                  src={serviceImageMap.get(s.slug)?.split("?")[0] ?? ""}
                                  alt=""
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-navy leading-snug">{t(`services.items.${s.slug}.title`)}</p>
                                <p className="mt-0.5 text-[11px] text-muted leading-snug">{t(`services.items.${s.slug}.short`)}</p>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {t(`services.items.${s.slug}.tags`).split("\n").map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center rounded-full bg-navy/[0.06] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-navy/70"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-auto flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gold opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                                <span>{t('common.learnMore')}</span>
                                <span className="transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Section secteurs + ressources */}
                        <div className="grid grid-cols-2 gap-px bg-border mt-3 mx-6 rounded-lg overflow-hidden">
                          {/* Secteurs */}
                          <div className="bg-navy/[0.02] p-5">
                            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                              </svg>
                              {t('nav.yourSector')}
                            </p>
                            <p className="mb-3 text-[11px] leading-snug text-muted/70">
                              {t('nav.yourSectorLead')}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {sectorsItems.map((s) => (
                                <Link
                                  key={s.key}
                                  href={s.href}
                                  onClick={() => setHoveredDropdown(null)}
                                  className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-[11px] font-medium text-ink/70 transition hover:border-navy/30 hover:bg-navy/[0.02] hover:text-navy"
                                >
                                  <span className="text-navy/50 group-hover:text-navy/80 transition-colors">
                                    {expertiseIcon(s.icon, "sm")}
                                  </span>
                                  {t(`nav.${s.key}`)}
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
                              {t('nav.ourResources')}
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {resourcesItems.map((r) => {
                                const LinkComponent = r.external ? "a" : Link;
                                const href = r.key === "whatsapp" ? toWhatsAppHref(t('common.phone')) : r.href;
                                const linkProps = r.external
                                  ? { href, target: "_blank", rel: "noopener noreferrer" }
                                  : { href, onClick: () => setHoveredDropdown(null) };
                                return (
                                  <LinkComponent
                                    key={r.key}
                                    {...linkProps}
                                    className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium text-ink/70 transition hover:bg-navy/[0.04] hover:text-navy"
                                  >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
                                      {expertiseIcon(r.icon, "sm")}
                                    </span>
                                    <span>{t(`nav.${r.key}`)}</span>
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
                            <span>{t('nav.discoverAll')}</span>
                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dropdown — Formations : mega menu avec sidebar */}
                  {hoveredDropdown === l.href && l.key === "formations" && (
                    <div className="absolute left-1/2 top-full pt-2 -translate-x-1/2 animate-slide-down">
                      <div className="flex max-h-[calc(100vh-6rem)] w-[720px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl bg-paper shadow-lg">
                        {/* Sidebar — catégories */}
                        <div className="w-44 shrink-0 border-r border-border bg-navy/[0.02]">
                          <div className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                            {t('nav.categories')}
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
                                  {t(categoryTitleKey(c.id))}
                                </span>
                                <span className="text-[10px] text-muted/60 tabular">{count}</span>
                              </button>
                            );
                          })}

                        </div>

                        {/* Panneau — formations de la catégorie survolée */}
                        <div className="min-w-0 flex-1 p-4">
                          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                            {hoveredCategory
                              ? t(categoryTitleKey(hoveredCategory))
                              : t('nav.chooseCategory')}
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
                                    <Image
                                      src={f.image.split("?")[0]}
                                      alt=""
                                      fill
                                      sizes="28px"
                                      className="object-cover"
                                    />
                                  </span>
                                  <span className="flex-1 min-w-0 truncate">{t(`formations.items.${f.slug}.name`)}</span>
                                </Link>
                              ))
                            ) : (
                              <p className="py-6 text-center text-xs text-muted/50">
                                {t('nav.hoverCategory')}
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
                            {t('nav.featuredFormations')}
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
                                  <Image
                                    src={f.image.split("?")[0]}
                                    alt=""
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                  />
                                </span>
                                <span className="min-w-0 leading-snug text-ink/70 group-hover:text-navy">
                                  <span className="block truncate">{t(`formations.items.${f.slug}.name`)}</span>
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
                {t(`nav.${l.key}`)}
                {!active && (
                  <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-0 bg-red/40 transition-all duration-300 group-hover:w-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sélecteur de langue desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <select
            value={locale}
            onChange={(e) => switchLocale(e.target.value)}
            aria-label={t('common.language')}
            className="cursor-pointer rounded-full border border-navy/20 bg-paper px-3 py-1.5 text-xs font-semibold text-navy outline-none transition hover:border-navy/40 focus:border-navy/60 focus:ring-2 focus:ring-navy/10"
          >
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>

          {/* Lien Contact — juste après le sélecteur de langue */}
          <Link
            href="/contact"
            className={`inline-flex items-center rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
              pathname.startsWith("/contact")
                ? "border-navy bg-navy text-paper"
                : "border-navy/30 text-navy hover:border-navy hover:bg-navy/[0.04]"
            }`}
          >
            {t('nav.contact')}
          </Link>
        </div>

        {/* Actions mobiles — langue + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Sélecteur de langue mobile (rapide, à côté du hamburger) */}
          <div className="relative">
            <select
              value={locale}
              onChange={(e) => switchLocale(e.target.value)}
              aria-label={t('common.language')}
              className="cursor-pointer appearance-none rounded-full border border-navy/20 bg-paper py-1.5 pl-3 pr-7 text-xs font-semibold text-navy outline-none transition hover:border-navy/40 focus:border-navy/60 focus:ring-2 focus:ring-navy/10"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
            {/* Chevron décoratif (le select natif masque le sien) */}
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-navy/50"
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
          </div>

          <button
            ref={menuButtonRef}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-xl border border-border bg-paper transition hover:border-navy/30 hover:bg-navy/[0.04] active:scale-95"
            onClick={() => setOpen((o) => !o)}
            aria-label={t('nav.openMenu')}
            aria-expanded={open}
            aria-controls="mobile-drawer"
          >
            <span
              className={`h-[1.5px] w-5 bg-navy transition-all duration-300 ${
                open ? "translate-y-[6.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[1.5px] w-5 bg-navy transition-all duration-300 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-[1.5px] w-5 bg-navy transition-all duration-300 ${
                open ? "-translate-y-[6.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </header>

      {/* Menu mobile — overlay + drawer placés HORS du <header> :
          le backdrop-filter appliqué au header dès qu'on scrolle créerait
          un containing block qui casserait le position:fixed du drawer
          (son contenu devenait alors visible au swipe). */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-navy/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        id="mobile-drawer"
        ref={drawerRef}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-[70] flex w-[86vw] max-w-sm flex-col bg-paper shadow-2xl md:hidden transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.mainNav')}
      >
        {/* Drawer header — liseré doré + marque */}
        <div className="relative flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent"
            aria-hidden="true"
          />
          <Link href="/" className="flex items-center gap-3" onClick={closeDrawer}>
            <Mark className="h-8 w-auto shrink-0" />
            <div>
              <span className="block font-display text-sm font-semibold text-navy">COSI LEWA</span>
            </div>
          </Link>
          <button
            ref={closeButtonRef}
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/[0.06] text-navy transition-all duration-300 hover:rotate-90 hover:bg-navy/[0.12]"
            aria-label={t('nav.closeMenu')}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-1 px-4 py-4">
            {/* Accueil */}
            <Link
              href="/"
              onClick={closeDrawer}
              aria-current={pathname === "/" ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                pathname === "/"
                  ? "bg-navy text-paper"
                  : "text-ink/80 hover:bg-navy/[0.04] hover:text-navy"
              }`}
            >
              <svg className="h-5 w-5 shrink-0 text-current opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{t('nav.home')}</span>
            </Link>

            {/* Notre expertise */}
            <MobileAccordion
              label={t('nav.expertise')}
              icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              }
              active={pathname.startsWith("/services")}
              isOpen={mobileAccordion === "services"}
              onToggle={() => setMobileAccordion(mobileAccordion === "services" ? null : "services")}
            >
              {expertiseItems.map((s) => (
                <Link
                  key={s.key}
                  href={`/services/${s.slug}`}
                  onClick={closeDrawer}
                  aria-current={pathname === `/services/${s.slug}` ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                    pathname === `/services/${s.slug}`
                      ? "bg-navy/[0.06] text-navy"
                      : "text-ink/75 hover:bg-navy/[0.04] hover:text-navy"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/[0.05] text-navy/70 transition-colors group-hover:bg-gold/15 group-hover:text-gold">
                    {expertiseIcon(s.icon, "sm")}
                  </span>
                  <span className="flex-1 text-sm leading-snug">{t(`services.items.${s.slug}.title`)}</span>
                  <svg className="h-3.5 w-3.5 shrink-0 text-muted/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ))}
              {/* Lien tout voir */}
              <Link
                href="/services"
                onClick={closeDrawer}
                className="group flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gold transition hover:text-gold-bright"
              >
                <span>{t('nav.discoverAll')}</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
              </Link>
            </MobileAccordion>

            {/* Formations */}
            <MobileAccordion
              label={t('nav.formations')}
              icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              }
              active={pathname.startsWith("/formations")}
              isOpen={mobileAccordion === "formations"}
              onToggle={() => setMobileAccordion(mobileAccordion === "formations" ? null : "formations")}
            >
              {formationCategories.map((cat) => {
                const count = categoryFormations[cat.id]?.length ?? 0;
                return (
                  <Link
                    key={cat.id}
                    href={`/formations/${cat.slug}`}
                    onClick={closeDrawer}
                    aria-current={pathname.startsWith(`/formations/${cat.slug}`) ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                      pathname.startsWith(`/formations/${cat.slug}`)
                        ? "bg-navy/[0.06] text-navy"
                        : "text-ink/75 hover:bg-navy/[0.04] hover:text-navy"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/[0.05] text-navy/70 transition-colors group-hover:bg-gold/15 group-hover:text-gold">
                      {expertiseIcon(cat.id === "compta" ? "compta" : "bureautique", "sm")}
                    </span>
                    <span className="flex-1 text-sm leading-snug">{t(categoryTitleKey(cat.id))}</span>
                    <span className="shrink-0 rounded-full bg-navy/[0.06] px-2 py-0.5 text-[10px] font-semibold tabular text-muted">
                      {count}
                    </span>
                  </Link>
                );
              })}
              {/* Lien tout voir */}
              <Link
                href="/formations/comptabilite-finance"
                onClick={closeDrawer}
                className="group flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gold transition hover:text-gold-bright"
              >
                <span>{t('common.allFormations')}</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
              </Link>
            </MobileAccordion>

            {/* À propos */}
            <Link
              href="/a-propos"
              onClick={closeDrawer}
              aria-current={pathname.startsWith("/a-propos") ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                pathname.startsWith("/a-propos")
                  ? "bg-navy text-paper"
                  : "text-ink/80 hover:bg-navy/[0.04] hover:text-navy"
              }`}
            >
              <svg className="h-5 w-5 shrink-0 text-current opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>{t('nav.about')}</span>
            </Link>

            {/* Contact — CTA */}
            <Link
              href="/contact"
              onClick={closeDrawer}
              aria-current={pathname.startsWith("/contact") ? "page" : undefined}
              className={`mt-2 flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                pathname.startsWith("/contact")
                  ? "bg-navy text-paper"
                  : "bg-gold text-navy hover:bg-gold-bright"
              }`}
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>{t('nav.contact')}</span>
            </Link>
          </nav>
        </div>

        {/* Drawer footer — coordonnées */}
        <div className="shrink-0 border-t border-border bg-paper px-5 py-4">
          {/* Coordonnées */}
          <div className="space-y-2.5">
            <a
              href={toTelHref(t('common.phone'))}
              className="group flex items-center gap-2.5 text-xs text-muted transition hover:text-navy"
            >
              <svg className="h-3.5 w-3.5 shrink-0 text-navy/40 transition-colors group-hover:text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{t('common.phone')}</span>
            </a>
            <a
              href={toWhatsAppHref(t('common.phone'))}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 text-xs text-muted transition hover:text-navy"
            >
              <svg className="h-3.5 w-3.5 shrink-0 text-navy/40 transition-colors group-hover:text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span>{t('nav.whatsapp')}</span>
            </a>
            <a
              href={`mailto:${t('common.email')}`}
              className="group flex items-center gap-2.5 text-xs text-muted transition hover:text-navy"
            >
              <svg className="h-3.5 w-3.5 shrink-0 text-navy/40 transition-colors group-hover:text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span className="truncate">{t('common.email')}</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

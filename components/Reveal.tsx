"use client";

import { useRef, useEffect, type ReactNode, type ElementType } from "react";

/**
 * Animated reveal au scroll — progressive enhancement.
 *
 * ⚠ Principe : le contenu est TOUJOURS visible dans le HTML servi par le
 * serveur (aucun `opacity: 0` au premier rendu). L'animation ne s'applique
 * qu'aux éléments qui sont HORS de l'écran au moment de l'hydratation :
 *  - élément dans le viewport → on ajoute `visible` immédiatement (pas de
 *    masquage, pas de clignotement, pas d'attente du JS) ;
 *  - élément hors-écran → on ajoute `.reveal-anim` (masqué) puis on observe
 *    pour le faire apparaître à l'arrivée au scroll.
 *
 * Résultat : sur connexion lente, on ne voit jamais « juste les
 * arrière-plans » — le texte et les images sont affichés dès le HTML.
 */
export default function Reveal({
  children,
  className = "",
  as = "div",
  delay,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "span" | "li";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Applique un délai personnalisé si fourni
    if (delay != null) {
      el.style.transitionDelay = `${delay}ms`;
    }

    // Déjà visible au chargement → rien à cacher, on marque simplement visible
    const rect = el.getBoundingClientRect();
    const inViewport =
      rect.top < window.innerHeight && rect.bottom > 0;

    if (inViewport) {
      el.classList.add("visible");
      return;
    }

    // Hors-écran → animation à l'arrivée au scroll
    el.classList.add("reveal-anim");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const Tag = (as || "div") as ElementType;

  return (
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}

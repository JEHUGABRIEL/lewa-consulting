"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type HeroSlide = {
  src: string;
  alt?: string;
};

/**
 * HeroSlider — diaporama de fonds animés pour les sections hero.
 *
 * - Crossfade entre les slides via transition d'opacité
 * - Auto-play avec intervalle configurable (défaut : 5 s)
 * - Pause au survol
 * - Indicateurs de navigation (dots) cliquables
 * - L'overlay navy est appliqué par-dessus tous les slides
 */
export default function HeroSlider({
  slides,
  interval = 5000,
  overlay = true,
  className = "",
  onSlideChange,
}: {
  slides: (string | HeroSlide)[];
  interval?: number;
  overlay?: boolean;
  className?: string;
  onSlideChange?: (index: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Évite l'hydratation mismatch (premier rendu serveur = slide 0)
  useEffect(() => { setIsClient(true); }, []);

  const total = slides.length;

  // Notifie le parent du slide actif
  useEffect(() => {
    if (onSlideChange) onSlideChange(current);
  }, [current, onSlideChange]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  // Auto-play
  useEffect(() => {
    if (total <= 1 || paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, paused, interval, next]);

  if (total === 0) return null;

  // Normalise les slides en objets { src, alt }
  const items: HeroSlide[] = slides.map((s) =>
    typeof s === "string" ? { src: s } : s,
  );

  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides empilés — seul le slide actif est visible */}
      {items.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-out"
          style={{
            backgroundImage: `url("${slide.src}")`,
            opacity: isClient && i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0,
          }}
          role="img"
          aria-label={slide.alt ?? ""}
        />
      ))}

      {/* Overlay navy pour lisibilité */}
      {overlay && (
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-navy-deep/85 via-navy/75 to-navy/65" />
      )}

    </div>
  );
}

"use client";

import { useState } from "react";
import Container from "./Container";
import Mark from "./Mark";
import HeroSlider from "./HeroSlider";

export default function PageHeader({
  texts,
  backgrounds,
  backgroundImage,
}: {
  /**
   * Contenu texte par slide. La longueur doit correspondre
   * au nombre de backgrounds pour un slider cohérent.
   */
  texts: { title: string; lead?: string }[];
  /** Tableau de fonds pour le slider (prioritaire sur backgroundImage) */
  backgrounds?: string[];
  /** Fond unique (rétrocompatibilité) */
  backgroundImage?: string;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Détermine les slides : backgrounds > backgroundImage > aucun
  const slides = backgrounds && backgrounds.length > 0
    ? backgrounds
    : backgroundImage
      ? [backgroundImage]
      : [];
  const hasSlides = slides.length > 0;
  const hasSlider = slides.length > 1;

  // Texte du slide actif (fallback sur le premier texte)
  const active = texts[currentSlide] ?? texts[0] ?? { title: "" };

  return (
    <div
      className={`relative overflow-hidden border-b ${
        hasSlides ? "border-navy-deep" : "border-border bg-gradient-to-b from-white to-paper"
      }`}
    >
      {/* Top accent bar — gradient doré → rouge → navy */}
      <div className="relative z-20 h-[3px] w-full bg-gradient-to-r from-gold-bright via-red to-navy" />

      {/* Slider ou fond unique */}
      {hasSlides && (
        <HeroSlider
          slides={slides}
          interval={5000}
          onSlideChange={setCurrentSlide}
        />
      )}

      {/* Décor géométrique subtil (logo en transparence) */}
      <div
        className={`pointer-events-none absolute -right-20 -top-16 z-10 select-none ${
          hasSlides ? "text-white/[0.06]" : "text-navy/[0.04]"
        }`}
        aria-hidden="true"
      >
        <Mark className="h-48 w-48" />
      </div>

      <Container
        className={`relative z-10 ${
          hasSlides ? "py-[7.5rem] sm:py-[10.5rem]" : "py-[6.75rem] sm:py-[9rem]"
        }`}
      >
        {/* Décor en haut à gauche */}
        {!hasSlides && (
          <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 select-none opacity-[0.03]" aria-hidden="true">
            <svg viewBox="0 0 48 48" className="h-full w-full">
              <polygon points="24,3 42,13.5 42,34.5 24,45 6,34.5 6,13.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
        )}

<div key={currentSlide} className="animate-fade-in">
          <h1
            className={`mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-5xl animate-scale-in delay-100 ${
              hasSlides ? "text-white" : "text-navy"
            }`}
          >
            {active.title}
          </h1>

          {active.lead && (
            <>
              {/* Sépareur décoratif */}
              <div className="mt-6 w-16 bg-gold-bright/50 animate-draw-line delay-200" style={{ height: "1px" }} />
              <p
                className={`mt-5 max-w-2xl leading-relaxed animate-slide-up delay-300 ${
                  hasSlides ? "text-white/80" : "text-ink/70"
                }`}
              >
                {active.lead}
              </p>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

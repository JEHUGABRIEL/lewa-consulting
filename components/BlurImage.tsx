"use client";

import { useState, useRef, useEffect } from "react";

type BlurImageProps = {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  width?: number;
  height?: number;
};

/**
 * Génère une miniature floutée pour Unsplash via le paramètre `?w=`
 * Exemple : https://images.unsplash.com/photo-xxx?w=600&q=80
 *   → miniature : https://images.unsplash.com/photo-xxx?w=20&q=30&blur
 */
function makeUnsplashBlurUrl(src: string): string | null {
  if (!src.includes("images.unsplash.com")) return null;

  // Supprime les paramètres existants pour les remplacer
  const base = src.split("?")[0];
  return `${base}?w=20&q=30&blur`;
}

export default function BlurImage({
  src,
  alt,
  placeholderSrc,
  className = "",
  width,
  height,
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const blurUrl = placeholderSrc ?? makeUnsplashBlurUrl(src);

  // Intersection Observer pour ne charger que quand visible
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "200px" }, // commence à charger 200px avant
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Préchargement de l'image pleine taille
  useEffect(() => {
    if (!inView) return;

    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = src;
  }, [inView, src]);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder flouté (toujours présent jusqu'au chargement) */}
      {blurUrl && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
          style={{
            backgroundImage: `url("${blurUrl}")`,
            filter: "blur(20px)",
            transform: "scale(1.1)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Image réelle (fade in après chargement) */}
      <img
        src={inView ? src : undefined}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

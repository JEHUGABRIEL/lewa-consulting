"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";


const subscribeToNothing = () => () => {};

type HeroSlide = {
  src: string;
  alt?: string;
};










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


  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  const total = slides.length;


  useEffect(() => {
    if (onSlideChange) onSlideChange(current);
  }, [current, onSlideChange]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);


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


  const items: HeroSlide[] = slides.map((s) =>
    typeof s === "string" ? { src: s } : s,
  );

  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      { }
      {items[0] && (
        <link rel="preload" as="image" href={items[0].src} fetchPriority="high" />
      )}

      { }
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

      { }
      {overlay && (
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-navy-deep/85 via-navy/75 to-navy/65" />
      )}

    </div>
  );
}

"use client";

import { useRef, useEffect, type ReactNode, type ElementType } from "react";

/**
 * Animated reveal au scroll.
 * Wrapper qui applique la classe `.visible` quand l'élément entre dans le viewport.
 * Utilise IntersectionObserver — pas de dépendance externe.
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

"use client";

import { useRef, useEffect, type ReactNode, type ElementType } from "react";















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


    if (delay != null) {
      el.style.transitionDelay = `${delay}ms`;
    }


    const rect = el.getBoundingClientRect();
    const inViewport =
      rect.top < window.innerHeight && rect.bottom > 0;

    if (inViewport) {
      el.classList.add("visible");
      return;
    }


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

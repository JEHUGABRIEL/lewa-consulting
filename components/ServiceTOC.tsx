"use client";

import { useEffect, useState } from "react";

type TocItem = {
  id: string;
  label: string;
};







export default function ServiceTOC({
  title,
  items,
}: {
  title: string;
  items: TocItem[];
}) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },

      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={title} className="rounded-xl bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        <span className="inline-block h-px w-4 bg-gold/50" />
        {title}
      </p>
      <ul className="mt-3 space-y-0.5">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-navy/[0.06] font-medium text-navy"
                    : "text-ink/60 hover:bg-navy/[0.03] hover:text-navy"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full transition ${
                    isActive ? "bg-gold" : "bg-gold/30 group-hover:bg-gold/60"
                  }`}
                />
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

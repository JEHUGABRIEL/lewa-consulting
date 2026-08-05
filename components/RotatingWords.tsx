"use client";

import { useEffect, useState } from "react";







export default function RotatingWords({
  words,
  interval = 2600,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={className}>
      { }
      <span className="sr-only">{words.join(" ")}</span>
      <span aria-hidden="true" className="relative block h-[1.4em] overflow-hidden">
        <span
          className="flex flex-col transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(${-index * 1.4}em)` }}
        >
          {words.map((w) => (
            <span key={w} className="flex h-[1.4em] items-center leading-none">
              {w}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

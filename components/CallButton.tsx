"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toTelHref } from "@/lib/phone";


const SWAP_INTERVAL = 3000;

export default function CallButton() {
  const t = useTranslations("common");
  const [hovered, setHovered] = useState(false);
  const [numberIndex, setNumberIndex] = useState(0);

  const phone = t("phone");
  const phone2 = t("phone2");
  const numbers = [phone, phone2];
  const currentNumber = numbers[numberIndex % numbers.length];


  useEffect(() => {
    if (!hovered) return;
    const id = setInterval(() => setNumberIndex((i) => i + 1), SWAP_INTERVAL);
    return () => clearInterval(id);
  }, [hovered]);

  return (
    <a
      href={toTelHref(phone)}
      aria-label={`${t("callUs")} — ${phone} / ${phone2}`}
      className="group fixed left-5 top-1/2 z-40 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-gold-bright shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
      onMouseEnter={() => {
        setHovered(true);
        setNumberIndex(0);  
      }}
      onMouseLeave={() => setHovered(false)}
    >
      { }
      <span
        className="absolute inset-0 -z-10 animate-ping-slow rounded-full bg-gold-bright/40"
        aria-hidden="true"
      />
      { }
      <svg
        className="h-6 w-6 text-navy"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>

      { }
      <span
        className="pointer-events-none absolute left-full ml-3 flex -translate-x-1 items-center overflow-hidden rounded-xl bg-gradient-to-b from-gold to-gold-bright opacity-0 shadow-lg ring-1 ring-navy/10 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden="true"
      >
        <span
          key={numberIndex}
          className="animate-fade-in whitespace-nowrap px-4 py-2.5 font-mono text-xs font-semibold tabular text-navy"
        >
          {currentNumber}
        </span>
      </span>
    </a>
  );
}

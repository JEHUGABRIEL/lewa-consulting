"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { knowledge, fallback, findAnswer } from "@/lib/chatbot";

type Message = {
  role: "bot" | "user";
  text: string;
};

// ---- Composant ChatBot ----

export default function ChatBot() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [welcomeShown, setWelcomeShown] = useState(false);
  const [userTyped, setUserTyped] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Message d'accueil au premier dépliage
  useEffect(() => {
    if (open && !welcomeShown) {
      setWelcomeShown(true);
      setMessages([
        {
          role: "bot",
          text: t('chatbot.greeting'),
        },
      ]);
    }
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, welcomeShown, t]);

  // Scroll en bas à chaque nouveau message ou changement de statut typing
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // Nettoyage du timer au démontage
  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  const botReply = useCallback((text: string) => {
    setIsTyping(true);
    typingTimer.current = setTimeout(() => {
      const matched = findAnswer(text);
      setMessages((prev) => [...prev, { role: "bot", text: matched ?? fallback }]);
      setIsTyping(false);
    }, 600);
  }, []);

  function handleQuickReply(answer: string) {
    botReply(answer);
  }

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setUserTyped(true);
    botReply(text);
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
          open ? "bg-navy-deep rotate-45" : "bg-gold-bright"
        }`}
        aria-label={open ? t('chatbot.close') || "Fermer le chat" : t('chatbot.open') || "Ouvrir le chat"}
      >
        {open ? (
          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Fenêtre de chat */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('chatbot.title')}
        className={`fixed bottom-24 right-5 z-50 w-[calc(100vw-2rem)] max-w-sm origin-bottom-right overflow-hidden rounded-2xl border border-border bg-white shadow-2xl transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-navy to-navy-deep px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-bright text-navy text-sm font-bold">
              C
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{t('chatbot.title')}</p>
              <p className="text-[10px] text-white/55">{t('chatbot.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex h-80 flex-col gap-3 overflow-y-auto px-5 py-4" role="log" aria-live="polite" aria-label={t('chatbot.title')}>
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse-glow" />
                {t('chatbot.chooseTopic') || "Choisissez un sujet ci-dessous"}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-navy text-white rounded-br-md"
                    : "bg-paper text-ink/85 border border-border rounded-bl-md"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* Indicateur de saisie */}
          {isTyping && (
            <div className="flex justify-start" aria-hidden="true">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-paper px-4 py-3">
                <span className="flex h-2 w-2 animate-bounce rounded-full bg-gold/60" style={{ animationDelay: "0ms" }} />
                <span className="flex h-2 w-2 animate-bounce rounded-full bg-gold/60" style={{ animationDelay: "150ms" }} />
                <span className="flex h-2 w-2 animate-bounce rounded-full bg-gold/60" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Quick replies — visibles tant que l'utilisateur n'a pas tapé */}
        {!userTyped && (
          <div className="flex flex-wrap gap-2 px-5 pb-3">
            {knowledge.map((k) => (
              <button
                key={k.label}
                onClick={() => handleQuickReply(k.answer)}
                className="rounded-full border border-border bg-paper px-3 py-1.5 text-[11px] font-medium text-ink/75 transition-all duration-200 hover:border-navy/30 hover:bg-navy/5 hover:text-navy"
              >
                {k.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatbot.placeholder')}
            className="min-w-0 flex-1 rounded-full border border-border bg-paper px-4 py-2 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors duration-200 focus:border-navy/40"
            aria-label={t('chatbot.placeholder')}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-all duration-200 hover:bg-navy-deep disabled:opacity-40"
            aria-label={t('chatbot.send')}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}

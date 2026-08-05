"use client";

import { useEffect } from "react";

/**
 * Verrouille le défilement de la page (html + body) tant que `active` est vrai.
 *
 * Il faut verrouiller les DEUX éléments : `globals.css` applique
 * `overflow-x: clip` sur `html`, ce qui empêche `overflow: hidden` posé
 * uniquement sur `body` de se propager au viewport — le fond continuerait
 * donc de défiler derrière une modale ou un drawer.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [active]);
}

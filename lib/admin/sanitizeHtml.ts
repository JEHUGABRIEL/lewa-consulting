// ---------------------------------------------------------------------------
// Assainissement HTML par liste blanche (server-side, sans DOM).
//
// Le contenu éditable du dashboard (`store.content`) est fusionné dans les
// messages i18n (src/i18n/request.ts) et une partie est rendue via
// `dangerouslySetInnerHTML` sur le site public (à-propos, mentions légales,
// pages formations…). Sans filtrage, un administrateur — rôle unique et
// auto-inscriptible par invitation — pourrait injecter un XSS persistant
// touchant TOUS les visiteurs. On restreint donc le HTML autorisé à un petit
// ensemble de balises de mise en forme et d'attributs sûrs, et on neutralise
// tout gestionnaire d'évènement (`on*`) et les schémas d'URL dangereux.
//
// Approche liste blanche (plus sûre qu'une liste noire) : toute balise non
// autorisée est supprimée (son texte est conservé), tout attribut non autorisé
// est retiré, et les URLs des liens sont limitées à http(s)/mailto/tel/ancres
// et chemins relatifs.
// ---------------------------------------------------------------------------

const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "br",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "u",
  "ul",
]);

// Attributs autorisés par balise. `class` est permis pour préserver le style
// existant (ex. liens des mentions légales). `href` uniquement sur les liens.
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "class", "target", "rel"]),
  span: new Set(["class"]),
  p: new Set(["class"]),
  strong: new Set(["class"]),
  b: new Set(["class"]),
  em: new Set(["class"]),
  i: new Set(["class"]),
  u: new Set(["class"]),
  ul: new Set(["class"]),
  ol: new Set(["class"]),
  li: new Set(["class"]),
  br: new Set([]),
};

// Schémas d'URL autorisés pour `href`. Tout le reste (javascript:, data:,
// vbscript:…) est rejeté et le lien est neutralisé.
const SAFE_URL_RE = /^(https?:|mailto:|tel:|#|\/(?!\/))/i;

function escapeText(text: string): string {
  // On échappe uniquement `<` et `>` : les entités déjà présentes (&amp;, …)
  // ne doivent pas être doublement encodées.
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isSafeHref(raw: string): boolean {
  // Supprime les caractères de contrôle et espaces que les navigateurs
  // ignorent (ex. "java\tscript:") avant de tester le schéma.
  const cleaned = raw.replace(/[\x00-\x20]+/g, "").trim();
  if (cleaned === "") return false;
  return SAFE_URL_RE.test(cleaned);
}

function sanitizeAttributes(tag: string, attrsRaw: string): string {
  const allowed = ALLOWED_ATTRS[tag] ?? new Set<string>();
  const out: string[] = [];
  const attrRe =
    /([a-zA-Z][a-zA-Z0-9-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(attrsRaw)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? "";
    // Toujours refuser les gestionnaires d'évènement et `style`.
    if (name.startsWith("on") || name === "style") continue;
    if (!allowed.has(name)) continue;
    if (name === "href" && !isSafeHref(value)) continue;
    const safeValue = value.replace(/"/g, "&quot;");
    out.push(`${name}="${safeValue}"`);
  }
  // `target=_blank` sans `rel` expose au tabnabbing → on force `rel`.
  if (tag === "a" && /target\s*=\s*["']?_blank/i.test(attrsRaw)) {
    if (!out.some((a) => a.startsWith("rel="))) {
      out.push('rel="noopener noreferrer"');
    }
  }
  return out.length ? " " + out.join(" ") : "";
}

/**
 * Assainit une chaîne HTML issue d'une source semi-fiable (contenu admin).
 * Conserve un petit ensemble de balises de mise en forme et supprime tout le
 * reste (scripts, iframes, gestionnaires d'évènement, URLs dangereuses).
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string" || input === "") return "";

  // 1) Retire entièrement les blocs exécutables/imbriqués et les commentaires.
  const html = input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|svg|math)\b[\s\S]*?<\/\1\s*>/gi, "")
    // Balises orphelines de ces mêmes éléments (sans fermeture).
    .replace(/<\/?(script|style|iframe|object|embed|svg|math)\b[^>]*>/gi, "");

  // 2) Parcourt les balises restantes ; texte hors balise → échappé.
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*?)\s*(\/?)>/g;
  let result = "";
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html)) !== null) {
    result += escapeText(html.slice(lastIndex, m.index));
    lastIndex = tagRe.lastIndex;

    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    const attrsRaw = m[3] ?? "";
    const selfClose = m[4] === "/";

    if (!ALLOWED_TAGS.has(tag)) {
      // Balise non autorisée : on la supprime, on garde le texte alentour.
      continue;
    }
    if (closing) {
      result += `</${tag}>`;
    } else {
      const attrs = sanitizeAttributes(tag, attrsRaw);
      const isVoid = tag === "br";
      result += isVoid
        ? `<${tag}${attrs} />`
        : `<${tag}${attrs}${selfClose ? " /" : ""}>`;
    }
  }
  result += escapeText(html.slice(lastIndex));
  return result;
}

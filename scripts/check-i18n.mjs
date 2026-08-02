#!/usr/bin/env node
/**
 * Vérifie la qualité des fichiers de traduction messages/fr.json et messages/en.json.
 *
 * Usage :
 *   npm run check:i18n
 *
 * Quatre contrôles :
 *   1. PARITÉ — les deux fichiers définissent exactement les mêmes clés.
 *   2. CLÉS INUTILISÉES — clés définies dans les messages mais jamais
 *      référencées dans le code (app/, components/, lib/, src/).
 *   3. CLÉS MANQUANTES — clés utilisées dans le code mais absentes des messages.
 *   4. RÉSOLUTION services.items.* — pour chaque slug de lib/services.ts, les
 *      champs attendus (title, short, desc, imageAlt, tags, details, points)
 *      doivent exister et être non vides dans les deux locales.
 *      Détecte un domaine ajouté sans traduction, un champ manquant ou vide,
 *      ou un cache de traduction périmé (serveur dev qui sert d'anciens messages).
 *
 * L'analyse de couverture prend en charge :
 *   - les appels statiques : t('a.b'), t("a.b"), t.raw('a.b')
 *   - les clés dynamiques (template literals) : t(`nav.${l.key}`),
 *     t(`formations.items.${slug}.name`), t(`cta.${prefix}Title`)…
 *     → expansion à partir des données réelles (slugs, nav keys, préfixes CTA)
 *   - les tableaux de clés passés à t() : t(heroTitleKeys[i])
 *   - les namespaces : getTranslations("Metadata") / getTranslations("common")
 *     (y compris le shadowing quand un fichier déclare deux fois `t` —
 *     une fois avec namespace pour generateMetadata, une fois sans pour la page)
 *   - les motifs non résolubles (ex: testimonials.quote${idx}) → wildcard :
 *     toutes les clés dont le préfixe statique correspond sont considérées
 *     utilisées (précaution : ne pas bloquer la CI sur un faux positif).
 *
 * - Sortie 0 : tous les contrôles passent.
 * - Sortie 1 : divergence de parité, clés inutilisées ou clés manquantes.
 */

import { readFile } from "node:fs/promises";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILES = ["messages/fr.json", "messages/en.json"];
const CODE_DIRS = ["app", "components", "lib", "src"];

/** Champs attendus par la page détail /services/[slug] pour chaque domaine. */
const SERVICE_ITEM_FIELDS = [
  "title",
  "short",
  "desc",
  "imageAlt",
  "tags",
  "details",
  "points",
];

/** Aplatit un objet imbriqué en un ensemble de chemins de clés "a.b.c". */
function flatten(obj, prefix = "", out = new Set()) {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, full, out);
    } else {
      out.add(full);
    }
  }
  return out;
}

async function loadMessages(file) {
  const absPath = path.join(ROOT, file);
  try {
    const raw = await readFile(absPath, "utf8");
    return { file, data: JSON.parse(raw), error: null };
  } catch (err) {
    return { file, data: null, error: err };
  }
}

function printKeyList(keys, indent = "  ") {
  for (const key of keys) console.error(`${indent}• ${key}`);
}

// ---------------- Analyse de couverture code ↔ messages ----------------

/** Liste récursive des fichiers .ts/.tsx sous un répertoire. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name.startsWith(".")
    ) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Extrait les slugs d'un tableau typé nommé (ex: comptaFinance: FormationRow[] = [...]). */
function extractSlugs(src, arrayName) {
  const re = new RegExp(
    `${arrayName}\\s*:\\s*[A-Za-z]+\\[\\]\\s*=\\s*\\[([\\s\\S]*?)\\];`,
  );
  const m = src.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/slug:\s*"([^"]+)"/g)].map((x) => x[1]);
}

/** Extrait les valeurs de pageKeyMap dans CTASection.tsx (préfixes CTA). */
function extractCtaPrefixes(src) {
  const m = src.match(/const pageKeyMap[\s\S]*?= \{\s*([\s\S]*?)\s*\};/);
  if (!m) return [];
  return [...m[1].matchAll(/: "([^"]+)"/g)].map((x) => x[1]).filter(Boolean);
}

/**
 * Extrait les clés i18n réellement utilisées par les templates `nav.${v.field}`.
 * Pour chaque template, on remonte au `.map((v => ...)` le plus proche qui
 * introduit la variable `v`, puis on lit les valeurs `key:` de son tableau.
 * (Évite les faux positifs comme expertiseItems dont les clés ne servent pas
 * au préfixe nav.* — elles sont utilisées via services.items.${slug}.*.)
 */
function extractNavKeys(src) {
  const keys = new Set();
  const processed = new Set();
  const templateRe = /nav\.\$\{(\w+)\.(\w+)\}/g;
  let m;
  while ((m = templateRe.exec(src))) {
    const v = m[1];
    const before = src.slice(0, m.index);
    // (v) => ... — la parenthèse fermante est obligatoire dans le pattern.
    const mapRe = new RegExp(`(\\w+)\\.map\\(\\s*\\(${v}\\)\\s*=>`, "g");
    let mm;
    let arrayName = null;
    while ((mm = mapRe.exec(before)) !== null) arrayName = mm[1];
    if (!arrayName || processed.has(arrayName)) continue;
    processed.add(arrayName);
    const declRe = new RegExp(
      `const ${arrayName}(?:\\s*:\\s*[A-Za-z<>\\[\\], ]+)?\\s*=\\s*\\[([\\s\\S]*?)\\];`,
    );
    const decl = src.match(declRe);
    if (decl) {
      for (const k of decl[1].matchAll(/\bkey:\s*"([^"]+)"/g)) keys.add(k[1]);
    }
  }
  return [...keys];
}

/** Jeux de valeurs pour l'expansion des clés dynamiques. */
function buildValueSets() {
  const read = (p) => readFileSync(path.join(ROOT, p), "utf8");
  const formationsSrc = read("lib/formations.ts");
  const servicesSrc = read("lib/services.ts");
  const postsSrc = read("lib/posts.ts");
  const headerSrc = read("components/Header.tsx");
  const ctaSrc = read("components/CTASection.tsx");

  return {
    formationSlugs: [
      ...new Set([
        ...extractSlugs(formationsSrc, "comptaFinance"),
        ...extractSlugs(formationsSrc, "bureautiqueDev"),
      ]),
    ],
    serviceSlugs: [...new Set(extractSlugs(servicesSrc, "servicesData"))],
    postSlugs: [...new Set(extractSlugs(postsSrc, "posts"))],
    navKeys: extractNavKeys(headerSrc),
    ctaPrefixes: extractCtaPrefixes(ctaSrc),
  };
}

/**
 * Expansion d'une clé dynamique (template literal avec ${...}).
 * Retourne la liste des clés réelles, ou null si non résoluble.
 */
function expandDynamic(template, sets) {
  const placeholders = (template.match(/\$\{[^}]+\}/g) || []).length;
  if (placeholders !== 1) return null;
  const prefix = template.slice(0, template.indexOf("${"));
  let values = null;
  if (prefix === "cta.") values = sets.ctaPrefixes;
  else if (prefix === "nav.") values = sets.navKeys;
  else if (prefix.startsWith("formations.items.")) values = sets.formationSlugs;
  else if (prefix.startsWith("services.items.")) values = sets.serviceSlugs;
  else if (prefix.startsWith("posts.")) values = sets.postSlugs;
  // Jeu de valeurs vide → on ne peut pas résoudre (évite de marquer
  // toutes les clés du préfixe comme inutilisées ; on retombe sur le wildcard).
  if (!values || values.length === 0) return null;
  return values.map((v) => template.replace(/\$\{[^}]+\}/g, v));
}

/**
 * Analyse un fichier : retourne { refs, wildcard }.
 * - refs : clés référencées (statiques + expansions + tableaux)
 * - wildcard : préfixes couverts par un motif dynamique non résolu
 *   (les clés sous ces préfixes sont considérées comme potentiellement utilisées)
 */
function analyzeFile(src, sets, namespaces) {
  const lines = src.split("\n");
  const refs = new Set();
  const wildcard = new Set();
  let ns = "";

  // Le namespace est optionnel : getTranslations() → racine,
  // getTranslations("Metadata") → préfixe Metadata.
  const declRe =
    /\bconst\s+t\s*=\s*(?:await\s+)?(?:use|get)Translations\(\s*(?:"([^"]*)")?\s*\)/;
  // t(...) et tr(...) — `tr` reçoit `t` en prop dans les carrousels (testimonials).
  // [,)] tolère les appels multi-arguments : t('a.b', { count }) → capture 'a.b'.
  const callRe = /\b(?:t|tr)(?:\.raw)?\(\s*([`'"])(.*?)\1\s*[,)]/g;
  const literalRe = /(['"])([a-zA-Z][\w-]*(\.[a-zA-Z0-9][\w-]*)+)\1/g;

  for (const line of lines) {
    const d = line.match(declRe);
    if (d) ns = d[1] ? `${d[1]}.` : "";

    callRe.lastIndex = 0;
    let m;
    while ((m = callRe.exec(line))) {
      const raw = m[2];
      if (raw.includes("${")) {
        const expanded = expandDynamic(raw, sets);
        if (expanded) {
          expanded.forEach((k) => refs.add(ns + k));
        } else {
          const prefix = raw.slice(0, raw.indexOf("${"));
          // Un préfixe vide (template commençant par ${…}) rendrait le
          // wildcard "" et masquerait TOUTES les clés → on l'ignore.
          if (prefix) wildcard.add(ns + prefix.replace(/\.$/, ""));
        }
      } else {
        refs.add(ns + raw);
      }
    }
  }

  // Literaux en forme de clé (ex: 'formations.catComptaTitle',
  // tableaux heroTitleKeys = ['hero.slide1Title', …])
  if (/\b(?:use|get)Translations\(/.test(src)) {
    literalRe.lastIndex = 0;
    let m;
    while ((m = literalRe.exec(src))) {
      const key = m[2];
      if (namespaces.has(key.split(".")[0])) refs.add(key);
    }
  }

  return { refs, wildcard };
}

async function main() {
  const loaded = await Promise.all(FILES.map(loadMessages));

  // Erreur de lecture / JSON invalide → bloquant
  const parseErrors = loaded.filter((l) => l.error);
  if (parseErrors.length > 0) {
    console.error("✗ Échec de lecture ou de parsing :");
    for (const l of parseErrors) {
      console.error(`  • ${l.file} : ${l.error.message}`);
    }
    console.error(
      "\nConseil : corrigez le JSON concerné puis relancez `npm run check:i18n`.",
    );
    process.exitCode = 1;
    return;
  }

  const [fr, en] = loaded.map((l) => flatten(l.data));
  let exitCode = 0;

  // ---- 1. Parité fr/en ----
  const missingInEn = [...fr].filter((key) => !en.has(key)).sort();
  const missingInFr = [...en].filter((key) => !fr.has(key)).sort();

  if (missingInEn.length === 0 && missingInFr.length === 0) {
    console.log(`✓ Parité fr/en OK — ${fr.size} clés identiques dans les deux fichiers.`);
  } else {
    console.error(`✗ Divergence fr/en détectée (fr : ${fr.size} clés, en : ${en.size} clés) :`);
    if (missingInEn.length > 0) {
      console.error(`\nClés présentes dans fr.json mais absentes d'en.json (${missingInEn.length}) :`);
      printKeyList(missingInEn);
    }
    if (missingInFr.length > 0) {
      console.error(`\nClés présentes dans en.json mais absentes de fr.json (${missingInFr.length}) :`);
      printKeyList(missingInFr);
    }
    exitCode = 1;
  }

  // ---- 2 & 3. Couverture code ↔ messages ----
  const sets = buildValueSets();
  // Garde-fou : si une extraction de données échoue silencieusement (tableau
  // renommé, type différent…), on le signale au lieu de produire des faux positifs.
  for (const [name, values] of Object.entries(sets)) {
    if (values.length === 0) {
      console.error(`⚠ Jeu de valeurs vide pour « ${name} » — vérifiez l'extraction (tableau renommé ? type différent ?).`);
    }
  }
  const namespaces = new Set(Object.keys(loaded[0].data));
  const files = CODE_DIRS.flatMap((d) => walk(path.join(ROOT, d)));

  const referenced = new Set();
  const wildcard = new Set();
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    const { refs, wildcard: w } = analyzeFile(src, sets, namespaces);
    for (const r of refs) referenced.add(r);
    for (const ww of w) wildcard.add(ww);
  }

  const wildcardArr = [...wildcard];
  // Wildcard : préfixe statique d'un motif dynamique non résolu.
  // `testimonials.quote${idx}` → préfixe "testimonials.quote" couvre
  // testimonials.quote0/1/2 ; `cta.${prefix}Title` → "cta." couvre tout cta.*.
  const coveredByWildcard = (k) =>
    wildcardArr.some((w) => k === w || k.startsWith(w));

  const unused = [...fr]
    .filter((k) => !referenced.has(k) && !coveredByWildcard(k))
    .sort();
  const missing = [...referenced].filter((k) => !fr.has(k)).sort();

  console.log("");
  if (unused.length > 0) {
    console.error(
      `✗ Clés inutilisées (définies dans les messages mais jamais référencées dans le code) — ${unused.length} :`,
    );
    printKeyList(unused);
    console.error("\nSupprimez ces clés ou corrigez les références pour les utiliser.");
    exitCode = 1;
  } else {
    console.log(
      `✓ Couverture : aucune clé inutilisée (${fr.size} clés définies, ${referenced.size} références trouvées).`,
    );
  }

  if (missing.length > 0) {
    console.error(
      `✗ Clés manquantes (utilisées dans le code mais absentes des messages) — ${missing.length} :`,
    );
    printKeyList(missing);
    console.error("\nAjoutez ces clés dans messages/fr.json et messages/en.json.");
    exitCode = 1;
  } else {
    console.log("✓ Couverture : aucune clé manquante.");
  }

  // ---- 4. Résolution des clés dynamiques services.items.* ----
  // ⚠ SERVICE_ITEM_FIELDS est partagé avec src/i18n/request.ts :
  // mettez à jour les deux listes en même temps.
  const resolutionErrors = [];
  for (const slug of sets.serviceSlugs) {
    for (const field of SERVICE_ITEM_FIELDS) {
      const key = `services.items.${slug}.${field}`;
      for (const l of loaded) {
        const value = l.data?.services?.items?.[slug]?.[field];
        if (typeof value !== "string" || value.trim() === "") {
          resolutionErrors.push(`${key} (${l.file})`);
        }
      }
    }
  }

  console.log("");
  if (sets.serviceSlugs.length === 0) {
    // Extraction des slugs échouée silencieusement : ne jamais afficher
    // « OK » sans avoir rien vérifié — on fait échouer la CI à la place.
    console.error(
      "✗ Résolution services.items.* — aucun slug extrait de lib/services.ts (tableau renommé ? type différent ?).",
    );
    exitCode = 1;
  } else if (resolutionErrors.length > 0) {
    console.error(
      `✗ Résolution services.items.* — ${resolutionErrors.length} champ(s) manquant(s) ou vide(s) :`,
    );
    printKeyList(resolutionErrors);
    console.error(
      "\nComplétez ces clés dans messages/fr.json et messages/en.json pour chaque slug de lib/services.ts.",
    );
    exitCode = 1;
  } else {
    console.log(
      `✓ Résolution services.items.* OK — ${sets.serviceSlugs.length} domaine(s) × ${SERVICE_ITEM_FIELDS.length} champs résolus dans fr et en.`,
    );
  }

  process.exitCode = exitCode;
}

main();

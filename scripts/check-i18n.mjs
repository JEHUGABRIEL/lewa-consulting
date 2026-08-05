#!/usr/bin/env node


































import { readFile } from "node:fs/promises";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILES = ["messages/fr.json", "messages/en.json"];
const CODE_DIRS = ["app", "components", "lib", "src"];


const SERVICE_ITEM_FIELDS = [
  "title",
  "short",
  "desc",
  "imageAlt",
  "tags",
  "details",
  "points",
];


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


function extractSlugs(src, arrayName) {
  const re = new RegExp(
    `${arrayName}\\s*:\\s*[A-Za-z]+\\[\\]\\s*=\\s*\\[([\\s\\S]*?)\\];`,
  );
  const m = src.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/slug:\s*"([^"]+)"/g)].map((x) => x[1]);
}


function extractCtaPrefixes(src) {
  const m = src.match(/const pageKeyMap[\s\S]*?= \{\s*([\s\S]*?)\s*\};/);
  if (!m) return [];
  return [...m[1].matchAll(/: "([^"]+)"/g)].map((x) => x[1]).filter(Boolean);
}


// lib/admin/public.ts construit les clés de témoignages par index à l'exécution
// (t[`name${i}`], t[`quote${i}`], t[`role${i}`], t[`org${i}`] sur l'objet
// `msgs.testimonials`). Ces accès sont dynamiques : le contrôle statique ne les
// voit pas. On les considère utilisés tant que le pattern est présent dans le
// code ET que les index correspondants existent dans les messages.
function extractTestimonialIndexedKeys(src, flattenedKeys) {
  const fields = new Set();
  const re = /t\[`(name|quote|role|org)\$\{i\}`\]/g;
  let m;
  while ((m = re.exec(src)) !== null) fields.add(m[1]);
  if (fields.size === 0) return [];

  let maxIndex = -1;
  for (const key of flattenedKeys) {
    const mm = key.match(/^testimonials\.name(\d+)$/);
    if (mm) maxIndex = Math.max(maxIndex, Number(mm[1]));
  }
  if (maxIndex < 0) return [];

  const keys = [];
  for (let i = 0; i <= maxIndex; i++) {
    for (const field of fields) keys.push(`testimonials.${field}${i}`);
  }
  return keys;
}








function extractNavKeys(src) {
  const keys = new Set();
  const processed = new Set();
  const templateRe = /nav\.\$\{(\w+)\.(\w+)\}/g;
  let m;
  while ((m = templateRe.exec(src))) {
    const v = m[1];
    const before = src.slice(0, m.index);

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


  if (!values || values.length === 0) return null;
  return values.map((v) => template.replace(/\$\{[^}]+\}/g, v));
}







function analyzeFile(src, sets, namespaces) {
  const lines = src.split("\n");
  const refs = new Set();
  const wildcard = new Set();
  let ns = "";



  const declRe =
    /\bconst\s+t\s*=\s*(?:await\s+)?(?:use|get)Translations\(\s*(?:"([^"]*)")?\s*\)/;


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


          if (prefix) wildcard.add(ns + prefix.replace(/\.$/, ""));
        }
      } else {
        refs.add(ns + raw);
      }
    }
  }



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


  const sets = buildValueSets();


  for (const [name, values] of Object.entries(sets)) {
    if (values.length === 0) {
      console.error(`⚠ Jeu de valeurs vide pour « ${name} » — vérifiez l'extraction (tableau renommé ? type différent ?).`);
    }
  }
  const dynamicKeys = new Set(
    extractTestimonialIndexedKeys(
      readFileSync(path.join(ROOT, "lib", "admin", "public.ts"), "utf8"),
      fr,
    ),
  );
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



  const coveredByWildcard = (k) =>
    wildcardArr.some((w) => k === w || k.startsWith(w));

  const unused = [...fr]
    .filter((k) => !referenced.has(k) && !coveredByWildcard(k))
    .filter((k) => !dynamicKeys.has(k))
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

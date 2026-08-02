#!/usr/bin/env node
/**
 * Vérifie les images référencées dans le code :
 *  1. les URLs d'images Unsplash sont vivantes (statut HTTP 200) ;
 *  2. les URLs d'images Cloudinary (res.cloudinary.com) sont vivantes ;
 *  3. les chemins d'images locales (public/*) existent sur disque.
 *
 * Usage :
 *   npm run check:images
 *
 * Fonctionnement (URLs Unsplash) :
 *   - scanne app/, components/, lib/, src/ et messages/*.json pour les URLs
 *     https://images.unsplash.com/photo-* (dédupliquées, query params ignorés)
 *   - teste chaque URL avec fetch (builtin Node, aucune dépendance)
 *     en demandant une miniature (?w=20&q=30) pour limiter le poids
 *   - concurrency limitée (6 requêtes en parallèle) + timeout 15 s par requête
 *   - ignore le placeholder « photo-xxx » (exemple dans les commentaires)
 *
 * Fonctionnement (URLs Cloudinary) :
 *   - scanne les mêmes répertoires pour les URLs
 *     https://res.cloudinary.com/<cloud>/image/upload/…
 *   - teste chaque URL avec des query params miniatures
 *     (?w=20&q=30) pour limiter le poids — la forme « chemin »
 *     (…/w_20,q_30/<public_id>) renverrait un 400 quand le dossier du
 *     public_id ressemble à un paramètre (ex. « qui_sommes_nous/ »)
 *
 * Fonctionnement (images locales) :
 *   - scanne les mêmes répertoires (code + messages/*.json pour les contenus
 *     de blog traduits) pour les chemins racine `/…` se terminant
 *     par une extension image (.png, .jpeg, .jpg, .webp, .avif, .gif, .svg)
 *   - ignore les URLs externes (https://…, //…, data:, blob:) ainsi que les
 *     chemins encastrés dans une URL externe (ex. cdn.example.com/logo.png
 *     ou res.cloudinary.com/…/images/logo.png)
 *   - vérifie que chaque chemin existe sous public/ (sensible à la casse,
 *     ce qui détecte les fautes de casse type « ONFP.png » vs « onfp.png »)
 *
 * - Sortie 0 : toutes les URLs répondent 200 ET tous les fichiers locaux existent.
 * - Sortie 1 : au moins une URL morte ou un fichier local manquant.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import https from "node:https";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CODE_DIRS = ["app", "components", "lib", "src"];
const MESSAGES_DIR = "messages";
const TS_RE = /\.(ts|tsx)$/;
const JSON_RE = /\.json$/;
const URL_RE = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+/g;
const CLOUDINARY_RE = /https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\/[a-zA-Z0-9_/.-]+/g;
const PLACEHOLDER_RE = /photo-xxx/;
const LOCAL_IMG_RE = /\/[a-zA-Z0-9_/.-]+\.(png|jpe?g|webp|avif|gif|svg)/gi;

/** Liste récursive des fichiers (par extension) sous un répertoire. */
function walk(dir, extRe = TS_RE, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name.startsWith(".")
    ) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, extRe, out);
    else if (extRe.test(entry.name)) out.push(full);
  }
  return out;
}

/** Extrait les URLs Unsplash uniques d'un fichier (sans query params). */
function extractUrls(src) {
  const urls = new Set();
  URL_RE.lastIndex = 0;
  let m;
  while ((m = URL_RE.exec(src)) !== null) {
    if (PLACEHOLDER_RE.test(m[0])) continue; // exemple de doc, pas une vraie image
    urls.add(m[0]);
  }
  return [...urls];
}

/** Extrait les chemins d'images locales uniques d'un fichier (sans query params). */
function extractLocalPaths(src) {
  const paths = new Set();
  LOCAL_IMG_RE.lastIndex = 0;
  let m;
  while ((m = LOCAL_IMG_RE.exec(src)) !== null) {
    const raw = m[0];
    // Exclut les URLs externes / protocole-relatives / données embarquées
    if (
      raw.startsWith("//") ||
      raw.startsWith("http:") ||
      raw.startsWith("https:") ||
      raw.startsWith("data:") ||
      raw.startsWith("blob:")
    ) {
      continue;
    }
    // Exclut les chemins encastrés dans une URL externe sans schéma
    // (ex. « cdn.example.com/logo.png » → `/logo.png` est précédé d'un
    // caractère de mot ou d'un point). Un vrai chemin local est précédé
    // d'un guillemet, d'une parenthèse, d'un espace ou du début du texte.
    const prev = src[m.index - 1];
    if (prev && /[\w.]/.test(prev)) {
      continue;
    }
    // Exclut les segments d'une URL Cloudinary (res.cloudinary.com/…/upload/…)
    // — sinon « /images/logo.png » serait faussement considéré comme local.
    const before = src.slice(Math.max(0, m.index - 60), m.index);
    if (before.includes("res.cloudinary.com")) {
      continue;
    }
    paths.add(raw.split("?")[0]);
  }
  return [...paths];
}

/** Extrait les URLs Cloudinary uniques d'un fichier (sans query params). */
function extractCloudinaryUrls(src) {
  const urls = new Set();
  CLOUDINARY_RE.lastIndex = 0;
  let m;
  while ((m = CLOUDINARY_RE.exec(src)) !== null) {
    urls.add(m[0]);
  }
  return [...urls];
}

/** Exécute fn sur les items avec une limite de parallélisme. */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

/** Teste une URL : retourne { base, ok, status, error }. */
async function checkUrl(base) {
  const url = `${base}?w=20&q=30`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": "lewa-consulting check-images (CI)" },
    });
    // Consomme/annule le corps pour libérer la connexion (HEAD non fiable chez Unsplash)
    await res.body?.cancel?.();
    return { base, ok: res.ok, status: res.status, error: null };
  } catch (err) {
    return {
      base,
      ok: false,
      status: 0,
      error: err.name === "AbortError" ? "timeout (15s)" : err.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Teste une URL Cloudinary : ajoute des query params miniatures
 * (?w=20&q=30) pour limiter le poids du téléchargement.
 *
 * Utilise https.get avec family: 4 (IPv4 forcé) : res.cloudinary.com publie
 * des enregistrements AAAA (IPv6) dont le routage échoue dans certains
 * environnements (CI, réseaux sans IPv6) — undici/fetch timeout alors que
 * curl et https.get passent en IPv4. Le CDN reste joignable en IPv4 partout.
 */
function checkCloudinaryUrl(base) {
  const clean = base.split("?")[0];
  const url = `${clean}?w=20&q=30`;

  return new Promise((resolve) => {
    let timer;
    const req = https.get(
      url,
      {
        family: 4,
        headers: { "user-agent": "lewa-consulting check-images (CI)" },
      },
      (res) => {
        clearTimeout(timer);
        // Consomme le corps pour libérer la connexion
        res.resume();
        res.on("end", () =>
          resolve({
            base,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            error: null,
          }),
        );
      },
    );
    req.on("error", (err) => {
      clearTimeout(timer);
      resolve({ base, ok: false, status: 0, error: err.message });
    });
    timer = setTimeout(() => req.destroy(new Error("timeout (15s)")), 15000);
  });
}

async function main() {
  const files = [
    ...CODE_DIRS.flatMap((d) => walk(path.join(ROOT, d))),
    ...walk(path.join(ROOT, MESSAGES_DIR), JSON_RE),
  ];
  let fail = false;

  // ---- 1. URLs Unsplash ----
  const urlSet = new Set();
  for (const file of files) {
    for (const u of extractUrls(readFileSync(file, "utf8"))) urlSet.add(u);
  }
  const urls = [...urlSet].sort();

  if (urls.length > 0) {
    console.log(`Vérification de ${urls.length} URL(s) d'images Unsplash…\n`);
    const results = await mapLimit(urls, 6, checkUrl);
    const dead = results.filter((r) => !r.ok);

    if (dead.length > 0) {
      for (const d of dead) {
        console.error(`✗ ${d.base} → ${d.status || d.error}`);
      }
      console.error(
        `\n✗ ${dead.length} URL(s) morte(s) détectée(s) sur ${urls.length}.`,
      );
      console.error("Remplacez-les par des images Unsplash valides puis relancez `npm run check:images`.");
      fail = true;
    } else {
      console.log(`✓ Toutes les ${urls.length} URL(s) d'images sont vivantes (200).`);
    }
  } else {
    console.log("✓ Aucune URL d'image Unsplash détectée dans le code.");
  }

  // ---- 1bis. URLs Cloudinary ----
  const cloudSet = new Set();
  for (const file of files) {
    for (const u of extractCloudinaryUrls(readFileSync(file, "utf8"))) cloudSet.add(u);
  }
  const clouds = [...cloudSet].sort();

  if (clouds.length > 0) {
    console.log(`Vérification de ${clouds.length} URL(s) d'images Cloudinary…\n`);
    const results = await mapLimit(clouds, 6, checkCloudinaryUrl);
    const dead = results.filter((r) => !r.ok);

    if (dead.length > 0) {
      for (const d of dead) {
        console.error(`✗ ${d.base} → ${d.status || d.error}`);
      }
      console.error(
        `\n✗ ${dead.length} URL(s) Cloudinary morte(s) détectée(s) sur ${clouds.length}.`,
      );
      console.error("Vérifiez le cloud/public_id puis relancez `npm run check:images`.");
      fail = true;
    } else {
      console.log(`✓ Toutes les ${clouds.length} URL(s) Cloudinary sont vivantes (200).`);
    }
  } else {
    console.log("✓ Aucune URL d'image Cloudinary détectée dans le code.");
  }

  // ---- 2. Images locales (public/*) ----
  const localSet = new Set();
  for (const file of files) {
    for (const p of extractLocalPaths(readFileSync(file, "utf8"))) localSet.add(p);
  }
  const locals = [...localSet].sort();

  if (locals.length > 0) {
    const missing = locals.filter(
      (p) => !existsSync(path.join(ROOT, "public", p)),
    );

    if (missing.length > 0) {
      for (const p of missing) {
        console.error(`✗ ${p} → fichier introuvable sous public/`);
      }
      console.error(
        `\n✗ ${missing.length} fichier(s) local(aux) manquant(s) sur ${locals.length} référencé(s).`,
      );
      console.error(
        "Ajoutez le fichier dans public/ ou corrigez le chemin, puis relancez `npm run check:images`.",
      );
      fail = true;
    } else {
      console.log(`✓ Tous les ${locals.length} chemin(s) d'images locales existent dans public/.`);
    }
  } else {
    console.log("✓ Aucune image locale référencée dans le code.");
  }

  if (fail) process.exitCode = 1;
}

main();

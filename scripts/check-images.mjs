#!/usr/bin/env node







































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



const CLOUDINARY_RE = /https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\/[a-zA-Z0-9_,/.-]+/g;
const PLACEHOLDER_RE = /photo-xxx/;
const LOCAL_IMG_RE = /\/[a-zA-Z0-9_/.-]+\.(png|jpe?g|webp|avif|gif|svg)/gi;


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


function extractUrls(src) {
  const urls = new Set();
  URL_RE.lastIndex = 0;
  let m;
  while ((m = URL_RE.exec(src)) !== null) {
    if (PLACEHOLDER_RE.test(m[0])) continue;  
    urls.add(m[0]);
  }
  return [...urls];
}


function extractLocalPaths(src) {
  const paths = new Set();
  LOCAL_IMG_RE.lastIndex = 0;
  let m;
  while ((m = LOCAL_IMG_RE.exec(src)) !== null) {
    const raw = m[0];

    if (
      raw.startsWith("//") ||
      raw.startsWith("http:") ||
      raw.startsWith("https:") ||
      raw.startsWith("data:") ||
      raw.startsWith("blob:")
    ) {
      continue;
    }




    const prev = src[m.index - 1];
    if (prev && /[\w.]/.test(prev)) {
      continue;
    }


    const before = src.slice(Math.max(0, m.index - 60), m.index);
    if (before.includes("res.cloudinary.com")) {
      continue;
    }
    paths.add(raw.split("?")[0]);
  }
  return [...paths];
}


function extractCloudinaryUrls(src) {
  const urls = new Set();
  CLOUDINARY_RE.lastIndex = 0;
  let m;
  while ((m = CLOUDINARY_RE.exec(src)) !== null) {
    urls.add(m[0]);
  }
  return [...urls];
}


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

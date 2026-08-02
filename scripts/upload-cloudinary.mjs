#!/usr/bin/env node
/**
 * Upload des images locales (public/) vers Cloudinary.
 *
 * Règles de nommage :
 *   - public_id = chemin relatif sous public/ sans l'extension
 *     (ex. public/logo_partenaires/ecobank.png → logo_partenaires/ecobank)
 *   - d'où une URL déterministe :
 *     https://res.cloudinary.com/<CLOUD_NAME>/image/upload/logo_partenaires/ecobank.png
 *
 * Usage :
 *   npm run upload:images
 *
 * Prérequis : .env.local avec CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 * CLOUDINARY_API_SECRET (chargés automatiquement par le SDK).
 *
 * Idempotent : le paramètre `overwrite: true` remplace l'asset existant.
 * Sortie 0 si tout réussit, 1 en cas d'échec.
 */

import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const IMG_RE = /\.(png|jpe?g|webp|avif|gif|svg)$/i;

// Charge .env.local si présent (le SDK ne lit pas ce fichier seul)
try {
  process.loadEnvFile(path.join(ROOT, ".env.local"));
} catch {
  /* pas de .env.local — on s'appuie sur les variables d'environnement */
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Liste récursive des fichiers images sous un répertoire. */
function walkImages(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkImages(full, out);
    else if (IMG_RE.test(entry.name)) out.push(full);
  }
  return out;
}

/** Convertit un chemin de fichier en public_id déterministe. */
function toPublicId(filePath) {
  const rel = path.relative(PUBLIC_DIR, filePath);
  return rel.replace(/\.[^.]+$/, "").replace(/\\/g, "/");
}

async function main() {
  const files = walkImages(PUBLIC_DIR).sort();
  console.log(`${files.length} image(s) locale(s) détectée(s) sous public/\n`);

  let fail = false;
  for (const file of files) {
    const publicId = toPublicId(file);
    try {
      const result = await cloudinary.uploader.upload(file, {
        public_id: publicId,
        overwrite: true,
        resource_type: "auto",
        use_filename: false,
      });
      console.log(`✓ ${publicId} → ${result.secure_url}`);
    } catch (err) {
      console.error(`✗ ${publicId} → ${err.message}`);
      fail = true;
    }
  }

  console.log("");
  if (fail) {
    console.error("Au moins un upload a échoué (exit 1).");
    process.exitCode = 1;
  } else {
    console.log("Tous les uploads ont réussi.");
  }
}

main();

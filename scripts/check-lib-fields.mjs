#!/usr/bin/env node
/**
 * Vérifie que les champs des objets de données de lib/*.ts sont bien
 * consommés par le code, pour prévenir les futurs champs orphelins.
 *
 * Usage :
 *   npm run check:lib
 *
 * Fonctionnement :
 *   - scanne lib/*.ts pour les exports de données :
 *       export const X: Type[] = [ { … }, … ];   (tableaux d'objets)
 *       export const X = { … };                  (objets simples)
 *   - extrait les noms de champs des littéraux d'objets
 *     (les valeurs de chaînes — URLs, textes — sont retirées pour ne pas
 *     polluer l'extraction, ex. « https: » dans une URL d'image)
 *   - pour chaque champ, vérifie que le nom apparaît au moins une fois
 *     ailleurs dans le code (app/, components/, lib/, src/ — hors fichier
 *     de définition)
 *   - un champ jamais référencé = orphelin → sortie 1
 *
 * Limites assumées (conservatrices, pas de faux positifs) :
 *   - un champ dont le NOM apparaît ailleurs pour un autre objet
 *     (ex. « desc » utilisé par les services) n'est pas signalé
 *   - les exports typés Record<string, …> (indexés par clé dynamique,
 *     ex. serviceFormations) sont ignorés
 *   - les types, helpers et fonctions ne sont pas vérifiés (champs seuls)
 *
 * - Sortie 0 : tous les champs des données lib/*.ts sont référencés ailleurs.
 * - Sortie 1 : au moins un champ orphelin (ou aucune donnée extraite,
 *   ce qui signale une extraction cassée plutôt qu'un faux « OK »).
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CODE_DIRS = ["app", "components", "lib", "src"];

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

/** Retire chaînes et commentaires, puis retourne les noms de champs uniques. */
function keysOf(block) {
  const cleaned = block
    .replace(/`[^`]*`/g, " ")
    .replace(/"[^"]*"/g, " ")
    .replace(/'[^']*'/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ");
  return [
    ...new Set(
      [...cleaned.matchAll(/([a-zA-Z_$][\w$]*)\s*:/g)].map((x) => x[1]),
    ),
  ];
}

/**
 * Extrait les champs des exports de données d'un fichier lib.
 * Retourne [{ exportName, field }] — dédupliqué par (export, champ).
 */
function extractDataFields(src) {
  const seen = new Set();
  const out = [];

  const push = (exportName, fields) => {
    for (const field of fields) {
      const key = `${exportName}.${field}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ exportName, field });
      }
    }
  };

  // Tableaux d'objets : export const X(: Type)? = [ … ];
  // Capture jusqu'au premier « ]; » (gère les déclarations mono-ligne
  // comme allFormations = […]; sans déborder sur la suite du fichier).
  const arrayRe = /export const (\w+)\s*(?::\s*[^=\n]+)?\s*=\s*\[([\s\S]*?)\];/g;
  let m;
  while ((m = arrayRe.exec(src)) !== null) {
    push(m[1], keysOf(m[2]));
  }

  // Objets simples : export const X = { … };
  const objRe = /export const (\w+)\s*=\s*\{([\s\S]*?)\n\};/g;
  while ((m = objRe.exec(src)) !== null) {
    push(m[1], keysOf(m[2]));
  }

  return out;
}

/** Nombre d'occurrences du mot (bords de mot) dans le texte. */
function countWord(text, word) {
  const re = new RegExp(`\\b${word}\\b`, "g");
  return (text.match(re) || []).length;
}

async function main() {
  const allFiles = CODE_DIRS.flatMap((d) => walk(path.join(ROOT, d)));
  const texts = new Map(allFiles.map((f) => [f, readFileSync(f, "utf8")]));
  const libFiles = allFiles.filter(
    (f) => f.startsWith(path.join(ROOT, "lib")) && f.endsWith(".ts"),
  );

  const orphans = [];
  let totalFields = 0;
  let checkedExports = 0;

  for (const file of libFiles) {
    const entries = extractDataFields(texts.get(file));
    if (entries.length > 0) checkedExports++;
    for (const { exportName, field } of entries) {
      totalFields++;
      let occurrences = 0;
      for (const [otherFile, t] of texts) {
        if (otherFile === file) continue; // hors fichier de définition
        occurrences += countWord(t, field);
      }
      if (occurrences === 0) {
        orphans.push(
          `${path.relative(ROOT, file)} (${exportName}) — champ « ${field} » jamais référencé ailleurs`,
        );
      }
    }
  }

  console.log("Vérification des champs des objets de données de lib/*.ts…\n");

  if (checkedExports === 0) {
    console.error(
      "✗ Aucun export de données extrait de lib/*.ts — vérifiez la structure des fichiers (tableau renommé ? syntaxe différente ?).",
    );
    process.exitCode = 1;
    return;
  }

  if (orphans.length > 0) {
    console.error(`✗ ${orphans.length} champ(s) orphelin(s) sur ${totalFields} champ(s) contrôlé(s) :`);
    for (const o of orphans) console.error(`  • ${o}`);
    console.error(
      "\nSupprimez ces champs ou consommez-les dans le code, puis relancez `npm run check:lib`.",
    );
    process.exitCode = 1;
  } else {
    console.log(
      `✓ Les ${totalFields} champ(s) de ${checkedExports} export(s) de données de lib/*.ts sont tous consommés par le code.`,
    );
  }
}

main();

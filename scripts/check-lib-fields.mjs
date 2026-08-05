#!/usr/bin/env node































import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CODE_DIRS = ["app", "components", "lib", "src"];


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




  const arrayRe = /export const (\w+)\s*(?::\s*[^=\n]+)?\s*=\s*\[([\s\S]*?)\];/g;
  let m;
  while ((m = arrayRe.exec(src)) !== null) {
    push(m[1], keysOf(m[2]));
  }


  const objRe = /export const (\w+)\s*=\s*\{([\s\S]*?)\n\};/g;
  while ((m = objRe.exec(src)) !== null) {
    push(m[1], keysOf(m[2]));
  }

  return out;
}


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
        if (otherFile === file) continue;  
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

#!/usr/bin/env node

































import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ZONE_DIRS = ["app/admin", "app/api/admin", "components/admin", "lib/admin"];
const FILE_RE = /\.(ts|tsx|js|jsx|mjs)$/;


function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (FILE_RE.test(entry.name)) out.push(full);
  }
  return out;
}


const BLOCKED_PATTERNS = [
  { label: "mutation CSSOM `.style.`", re: /\.style\./g },
  { label: "CSSOM `.setProperty(` / `.removeProperty(`", re: /\.(?:set|remove)Property\s*\(/g },
  { label: "CSSOM `.cssText`", re: /\.cssText/g },
  { label: "CSSOM `setAttribute('style', …)`", re: /setAttribute\s*\(\s*["']style["']/g },
  { label: "prop React `style={{ … }}` (objet)", re: /\bstyle\s*=\s*\{\s*\{/g },
  { label: "prop React `style={\`…\`}` (template)", re: /\bstyle\s*=\s*\{\s*`/g },
];






function stripCommentsAndStrings(src) {
  return src
    .replace(/`[^`]*`/g, " ")
    .replace(/"(?:[^"\\]|\\.)*"/g, " ")
    .replace(/'(?:[^'\\]|\\.)*'/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ");
}


function lineOf(src, index) {
  return src.slice(0, index).split("\n").length;
}

async function main() {
  const files = ZONE_DIRS.flatMap((d) => walk(path.join(ROOT, d)));
  const violations = [];

  console.log("Vérification des styles inline dans la zone admin (compatibilité CSP à nonce)…\n");

  for (const file of files) {
    const src = readFileSync(file, "utf8");
    const code = stripCommentsAndStrings(src);
    for (const { label, re } of BLOCKED_PATTERNS) {
      let m;
      while ((m = re.exec(code)) !== null) {
        violations.push(
          `${path.relative(ROOT, file)}:${lineOf(src, m.index)} — ${label}`,
        );

        re.lastIndex = m.index + Math.max(1, m[0].length);
      }
    }
  }

  if (violations.length > 0) {
    console.error(
      `✗ ${violations.length} style(s) inline bloqué(s) par la CSP trouvé(s) dans la zone admin :`,
    );
    for (const v of violations) console.error(`  • ${v}`);
    console.error(
      "\nLa CSP de /admin repose sur un nonce (style-src avec nonce → 'unsafe-inline' ignoré).\n" +
        "Remplacez le style inline par une classe (ex. verrouillage du scroll via\n" +
        "`document.body.classList`, cf. components/admin/ui.tsx) puis relancez `npm run check:csp-admin`.",
    );
    process.exitCode = 1;
  } else {
    console.log(
      `✓ Aucun style inline dans la zone admin (${files.length} fichier(s) contrôlé(s)) — compatible avec la CSP à nonce.`,
    );
  }
}

main();

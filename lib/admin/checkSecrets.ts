// ---------------------------------------------------------------------------
// Vérification des secrets critiques au démarrage (protection #6 & #7).
//
// En production, refuse le démarrage si :
//   - ADMIN_SESSION_SECRET est absent ou trop court (< 32 octets hexadécimal) ;
//   - ADMIN_PASSWORD est absent, trop court (< 12 caractères), ou contient une
//     valeur par défaut connue (« admin », « admin123 », « change-me », …).
//
// En développement local, on affiche un avertissement mais on laisse passer
// (pour ne pas bloquer le flux de travail des développeurs).
//
// Utilisation : appelez `checkSecretsOrExit()` au tout début de `server.ts` ou
// dans l'entrypoint Next.js (ex. `instrumentation.ts` ou un layout racine).
// ---------------------------------------------------------------------------

const KNOWN_WEAK_PASSWORDS = new Set([
  "admin",
  "admin123",
  "password",
  "change-me",
  "changeme",
  "test",
  "demo",
  "lewa",
  "letmein",
  "12345678",
]);

// Seuil minimal pour le secret de session : 32 octets hexadécimal = 64 caractères.
// (Généré via `openssl rand -hex 32`.)
const MIN_SESSION_SECRET_LENGTH = 64;

// Seuil minimal pour le mot de passe admin en production.
const MIN_ADMIN_PASSWORD_LENGTH = 12;

/**
 * Vérifie que les secrets admin sont définis et robustes. En production,
 * lève une erreur et termine le processus si la vérification échoue. En
 * développement, affiche un avertissement mais laisse démarrer.
 */
export function checkSecretsOrExit(): void {
  const isProd = process.env.NODE_ENV === "production";
  const errors: string[] = [];

  // 1. Vérification de ADMIN_SESSION_SECRET
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!sessionSecret || sessionSecret.trim().length === 0) {
    errors.push(
      `ADMIN_SESSION_SECRET est absent. Génération : openssl rand -hex 32`,
    );
  } else if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) {
    errors.push(
      `ADMIN_SESSION_SECRET est trop court (${sessionSecret.length} caractères, ` +
        `minimum ${MIN_SESSION_SECRET_LENGTH}). Génération : openssl rand -hex 32`,
    );
  }

  // 2. Vérification de ADMIN_PASSWORD
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.trim().length === 0) {
    errors.push(`ADMIN_PASSWORD est absent.`);
  } else if (adminPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
    errors.push(
      `ADMIN_PASSWORD est trop court (${adminPassword.length} caractères, ` +
        `minimum ${MIN_ADMIN_PASSWORD_LENGTH} en production).`,
    );
  } else if (KNOWN_WEAK_PASSWORDS.has(adminPassword.toLowerCase())) {
    errors.push(
      `ADMIN_PASSWORD utilise une valeur connue faible : « ${adminPassword} ». ` +
        `Utilisez un mot de passe unique et robuste.`,
    );
  }

  // 3. Gestion selon l'environnement
  if (errors.length === 0) {
    if (!isProd) {
      console.log("[checkSecrets] ✓ Secrets vérifiés (dev).");
    }
    return;
  }

  const message = [
    "",
    "═".repeat(80),
    "  ⚠️  SECRETS ADMIN FAIBLES OU MANQUANTS",
    "═".repeat(80),
    "",
    ...errors.map((e) => `  • ${e}`),
    "",
    "Actions requises :",
    "  1. Générer un ADMIN_SESSION_SECRET robuste : openssl rand -hex 32",
    "  2. Définir un ADMIN_PASSWORD robuste (≥ 12 caractères, unique)",
    "  3. Mettre à jour les variables d'environnement (Vercel / .env.local)",
    "",
    isProd
      ? "Le serveur ne peut pas démarrer en production avec des secrets faibles."
      : "En développement, ce n'est qu'un avertissement — mais changez-les avant",
    isProd ? "" : "de déployer en production.",
    "═".repeat(80),
    "",
  ].join("\n");

  if (isProd) {
    console.error(message);
    // En production, refuser le démarrage.
    process.exit(1);
  } else {
    // En développement, afficher l'avertissement et continuer.
    console.warn(message);
  }
}

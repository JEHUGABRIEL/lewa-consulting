// ---------------------------------------------------------------------------
// Point d'entrée d'instrumentation Next.js — appelé une seule fois au
// démarrage du serveur, avant que Next ne commence à traiter des requêtes.
//
// Utilisé ici pour vérifier que les secrets admin critiques (ADMIN_SESSION_SECRET,
// ADMIN_PASSWORD) sont définis et robustes en production — refuse le démarrage
// si les valeurs sont absentes, trop courtes ou correspondent à des mots de
// passe connus faibles (« admin », « admin123 », « change-me », …).
//
// En développement local, seul un avertissement est affiché (pour ne pas
// bloquer le workflow des développeurs qui testent avec des valeurs locales).
//
// Référence : https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
// ---------------------------------------------------------------------------

export async function register() {
  // checkSecretsOrExit() utilise process.exit(), une API Node.js absente du
  // runtime Edge (celui de proxy.ts/middleware). instrumentation.ts est
  // chargé dans les deux runtimes : on n'importe donc ce module que côté
  // Node, pour ne pas le bundler dans l'Edge et éviter l'avertissement
  // "A Node.js API is used ... not supported in the Edge Runtime".
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { checkSecretsOrExit } = await import("./lib/admin/checkSecrets");
    checkSecretsOrExit();
  }
}
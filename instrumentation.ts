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

import { checkSecretsOrExit } from "./lib/admin/checkSecrets";

export function register() {
  checkSecretsOrExit();
}

# Cabinet COSI Lewa-Consulting Group — Site web

Site institutionnel multi-pages pour le Cabinet COSI Lewa-Consulting Group (Bangui, RCA),
cabinet d'audit, d'assistance comptable et fiscale, et centre de formations professionnelles.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Polices : Fraunces (titres), Inter (texte courant), IBM Plex Mono (chiffres/tarifs)

## Pages
Toutes les routes existent en `/fr/…` et `/en/…` (locale à préfixer) :

- `/` — Accueil : présentation du cabinet et domaines d'intervention
- `/services` — Liste des 6 domaines d'expertise (Audit, Expertise comptable & finance, Conseil en gouvernance, Formation & renforcement des capacités, Accompagnement des entreprises, Événements professionnels)
- `/services/[slug]` — Détail d'un domaine : prestations, déroulement en 4 étapes, formations liées
- `/formations/bureautique-developpement` — Formations Bureautique & Développement (fiches tarifaires)
- `/formations/comptabilite-finance` — Formations Comptabilité & Finance (fiches tarifaires)
- `/formations/[slug]` — Fiche détaillée d'une formation : tarif, niveau, durée, contenu
- `/actualites` — Actualités du cabinet (articles de blog)
- `/actualites/[slug]` — Article d'actualité complet
- `/a-propos` — Mission, approche, clientèle
- `/contact` — Coordonnées, WhatsApp, Facebook, carte
- `/mentions-legales` — Mentions légales : éditeur, hébergement, propriété intellectuelle, données personnelles

## Zone d'administration (`/admin`)

Dashboard protégé pour gérer le contenu du site (formations, services, actualités, partenaires,
témoignages, textes du site) et les **demandes d'inscription** envoyées depuis le formulaire
public, sans toucher au code. Il inclut un **journal d'activité** (section « Activité ») qui
retrace les connexions et toutes les opérations effectuées. Accès :
`http://localhost:3000/admin` — redirige automatiquement vers `/admin/login` si non connecté.

Les identifiants sont fournis **uniquement** par variables d'environnement : il n'existe
**aucun identifiant ni secret par défaut dans le code**, en développement comme en
production (l'authentification lève une erreur explicite si une variable manque). Copiez
`.env.example` vers `.env.local` et adaptez :

| Variable | Rôle | Exemple (dev) |
|---|---|---|
| `ADMIN_USERNAME` | Nom d'utilisateur | `admin` |
| `ADMIN_PASSWORD` | Mot de passe | `change-me` |
| `ADMIN_SESSION_SECRET` | Secret HMAC-SHA256 des cookies de session (génération : `openssl rand -hex 32`) | valeur aléatoire |
| `SUPABASE_URL` + `SUPABASE_SECRET_KEY` | Connexion PostgreSQL (stockage du contenu) | absentes → mode fichier |
| `RESEND_API_KEY` | Clé API Resend pour les emails d'invitation et de vérification (OTP) | absente → mode démo (code affiché à l'écran) |
| `ADMIN_INVITE_FROM_EMAIL` | Expéditeur des emails (domaine vérifié sur Resend, sinon `onboarding@resend.dev` en test) | `onboarding@resend.dev` |
| `SITE_URL` | Domaine public des **liens d'invitation** (emails + boutons « Copier ») — sans elle, `https://www.lewaconsultingroup.com` est utilisé. Indispensable en dev local, où `req.nextUrl.origin` vaudrait `http://localhost:3000` (lien inutilisable par le collaborateur) | domaine de production |
| `CRON_SECRET` | Secret du cron de **rappels J-48h** (`Authorization: Bearer`) — sans elle, `/api/cron/reminders` refuse (503) | `openssl rand -hex 32` |
| `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` | **WhatsApp Business Cloud API (Meta)** pour envoyer les rappels J-48h par WhatsApp (template approuvé) | absentes → rappel envoyé par email |

La session est un token signé transporté dans un cookie `httpOnly` + `SameSite=Lax`
(`Secure` en prod), valable 7 jours.

### Stockage des données

- **Source de vérité** : PostgreSQL via Supabase, table `admin_store` (une seule ligne,
  tout le contenu en JSONB — migration `supabase/migrations/0001_admin_store.sql`).
  La table a RLS activée **sans aucune policy** : seule la clé SECRÈTE (côté serveur) peut la
  lire/écrire, la clé publishable (client) ne peut rien voir, même en cas de fuite.
- **Secours automatique** : si les variables Supabase sont absentes ou la base injoignable
  (table non migrée, réseau coupé…), le store retombe sur `data/admin-store.json`. Chaque
  écriture en base met aussi à jour ce fichier (miroir de secours) — sans Supabase, il devient
  la source de fait.
- **Seed automatique** : à la première lecture (base vide ou fichier absent), le store est
  initialisé depuis les données statiques du site (`lib/*.ts`).
- **Protection brute-force** : après 5 échecs de connexion consécutifs depuis la même IP,
  le login est bloqué 15 minutes (`data/admin-login-attempts.json`).
- **Rate limit OTP** : la génération de codes de vérification est plafonnée à 5 par heure
  et par adresse email, et la vérification à 10 tentatives par fenêtre de 15 minutes et par
  IP (en complément des 5 essais autorisés par invitation) — `data/admin-otp-rate.json`,
  compteur relâché après une vérification réussie.
- **Journal d'activité (audit)** : chaque connexion, déconnexion et opération réalisée dans
  le dashboard (création, modification, suppression d'un élément, édition de contenus) est
  enregistrée avec l'auteur, l'horodatage et l'IP — consultable dans la section « Activité »
  (filtres par type + pagination, du plus récent au plus ancien). Le journal est plafonné à
  **200 événements** (le plus ancien est évincé) et les événements sont écrits exclusivement
  côté serveur (`lib/admin/activity.ts`) — le client ne fournit jamais l'historique. Un
  bouton **« Réinitialiser »** (avec modale de confirmation) permet à un administrateur
  d'**effacer tout le journal** en une fois (flag `resetActivity` de l'API — un payload ne
  contenant que ce flag est rejeté : le reset ne peut pas vider silencieusement le contenu).
- **Suppression en douceur (soft delete)** : « Supprimer » un élément (formation, service,
  article, partenaire, témoignage, demande d'inscription) le **déplace dans la corbeille**
  (`deletedAt` posé dans le store) au lieu de le détruire. Il disparaît immédiatement du
  site public (`lib/admin/public.ts` filtre les supprimés), reste visible **grisé** dans sa
  section avec un onglet **« Corbeille »** et peut être **restauré** à tout moment. Une
  **suppression définitive** (purge) reste possible depuis la corbeille, après confirmation.
  Un compte administrateur « supprimé » est simplement **désactivé** (récupérable). Les
  rappels J-48h ignorent les demandes en corbeille.
- **Publication** : les pages publiques relisent le contenu via le store (repli sur les
  données statiques si indisponible) ; en production, elles sont régénérées par ISR (60 s)
  et immédiatement à chaque sauvegarde du dashboard.

Fichiers de référence : `app/admin/**`, `app/api/admin/**`, `lib/admin/**`, `.env.example`.

### Invitation d'administrateurs

Depuis le tableau de bord (carte « Administrateurs »), un admin peut **inviter un
collaborateur** en saisissant son adresse email. Un **lien d'invitation** (valable 7 jours)
est généré et envoyé par email (Resend) — le lien reste aussi copiable manuellement depuis
le dashboard si l'email n'est pas configuré. Les comptes ainsi créés peuvent ensuite se
connecter avec leur propre nom d'utilisateur et mot de passe, en plus des identifiants
`ADMIN_USERNAME`/`ADMIN_PASSWORD`.

> **Liens vers le domaine public** : les emails d'invitation (et de validation OTP) ainsi que
> les boutons « Copier le lien » du dashboard pointent toujours vers le **domaine public**
> (`SITE_URL` ou `https://www.lewaconsultingroup.com`), jamais vers `localhost` — même quand
> le dashboard est utilisé depuis un serveur local, où l'origin vaudrait `http://localhost:3000`.

Déroulé côté invité :

1. Le lien ouvre `/admin/invite/<token>` (page publique, sans session requise).
2. Un formulaire demande **prénom, nom, nom d'utilisateur, email (verrouillé sur
   l'invitation), mot de passe + confirmation**.
3. Un **code OTP à 6 chiffres** (valable 10 min, 5 tentatives max, génération plafonnée
   à 5/heure par adresse) et un **lien de validation** sont envoyés par email.
4. En saisissant l'OTP **ou** en cliquant sur le lien de l'email, le compte est activé
   et l'invité est **connecté automatiquement** et redirigé vers le dashboard `/admin`.

Sécurité : mots de passe hachés en **scrypt** (sel aléatoire par compte), OTP stocké en
HMAC-SHA256, token d'invitation 192 bits, lien de validation 256 bits, journal d'activité
(`entity: admins`) pour chaque invitation et activation.

Les comptes et invitations sont stockés **séparément du contenu** dans la table Supabase
`admin_users` (une seule ligne JSONB, migration `supabase/migrations/0002_admin_users.sql`,
RLS sans policy) avec repli sur `data/admin-users.json` — jamais exposés au client.

**Mode démo** : sans `RESEND_API_KEY`, les emails ne sont pas envoyés ; le lien
d'invitation s'affiche dans le dashboard et le code OTP s'affiche à l'écran de
l'invité (et dans les logs serveur) pour pouvoir tester le flux complet en local.

### Demandes d'inscription

Chaque formulaire « S'inscrire » rempli sur le site (modal d'inscription aux formations)
est enregistré dans le dashboard, section **« Demandes d'inscription »** — en plus du
message WhatsApp qui s'ouvre pour le contact direct. La demande arrive en quelques secondes,
sans aucune configuration.

Ce que l'admin peut faire :

- **Consulter** : nom du demandeur, formation choisie, téléphone (cliquable en `tel:`),
  email, disponibilités et horodatage de réception ;
- **Filtrer** par statut — « En attente » (badge doré) ou « Traitée » (badge vert) — avec
  compteurs ;
- **Confirmer** une demande pour la marquer comme traitée (statut `confirmed`, horodatage
  `confirmedAt`) — c'est l'action « fermer » qui indique que c'est fait. La confirmation
  ouvre une modale qui permet de saisir la **date/heure de début de la session** :
  le **rappel automatique J-48h** est alors programmé (email au demandeur, 48h avant
  le début) ;
- **Envoyer un rappel** : à la confirmation, un **email de confirmation est envoyé au
  demandeur** (Resend) s'il a fourni une adresse et que l'email est configuré ; sinon le
  dashboard invite à utiliser le **bouton WhatsApp** (lien `wa.me` pré-rempli, un clic)
  présent sur chaque ligne ;
- **Supprimer** définitivement une demande (avec confirmation) ;
- La carte **« Tableau de bord »** affiche le nombre de demandes en attente (cliquable).

Fonctionnement :

- **Côté public** (`POST /api/enroll`) : le formulaire envoie la demande au serveur **avant**
  d'ouvrir WhatsApp ; si l'enregistrement échoue (serveur injoignable), WhatsApp reste la
  solution de repli (jamais bloquant, timeout 5 s). L'endpoint valide les champs (nom,
  téléphone ≥ 8 chiffres, email formaté) et applique un **anti-spam** : 5 demandes par heure
  et par IP (`data/enroll-limits.json`, purgé automatiquement).
- **Côté stockage** : les demandes sont enregistrées dans le champ `enrollments` du store
  (`admin_store` en base, miroir fichier). Le champ est créé automatiquement à la première
  lecture — aucune migration nécessaire.
- **Confirmation côté serveur** (`POST /api/admin/enrollments`, session requise) :
  `{ action: "confirm", id }` marque la demande comme traitée, journalise l'opération et
  envoie l'email de confirmation (`sendEnrollmentConfirmationEmail`) — réponse avec
  `emailDelivered`/`emailConfigured` pour piloter les notifications du dashboard ;
  `{ action: "confirm", id, startDate }` enregistre aussi la date de début de session
  (ISO) qui déclenche le rappel J-48h ; `{ action: "delete", id }` supprime la demande.
- **Rappel automatique J-48h** (`GET/POST /api/cron/reminders`, protégé par
  `CRON_SECRET`) : à chaque passage, il parcourt les demandes confirmées avec `startDate`
  dans la fenêtre « début − 48 h ≤ maintenant < début » et sans `reminderSentAt`, puis
  pose `reminderSentAt` (anti-doublon — un seul envoi par demande). **Canal prioritaire :
  WhatsApp Business** (template `rappel_formation`, numéro normalisé en E.164 grâce à
  l'indicatif pays choisi au formulaire) quand `WHATSAPP_ACCESS_TOKEN` +
  `WHATSAPP_PHONE_NUMBER_ID` sont configurés et le numéro exploitable ; **sinon email**
  (`sendEnrollmentReminderEmail`). Sans aucun canal, la demande est ignorée (comptée) ;
  en cas d'échec réel d'envoi, elle est retentée au passage suivant.
  Déclenchement : `vercel.json` définit un **cron horaire** sur Vercel (header
  `Authorization: Bearer $CRON_SECRET` ajouté automatiquement) ; sur un hébergeur
  classique, branchez un cron externe (cron-job.org, GitHub Actions…) sur
  `https://<domaine>/api/cron/reminders` avec le même header.
- **Journal d'activité** : les confirmations, suppressions **et envois de rappel** de
  demandes sont tracés (`entity: enrollments`, rappels sous « système »).

Fichiers de référence : `app/api/enroll/route.ts`, `app/api/admin/enrollments/route.ts`,
`components/EnrollmentModal.tsx`, `components/admin/sections.tsx` (section
`EnrollmentsSection`), `lib/admin/email.ts`, `lib/admin/reminders.ts`,
`lib/admin/whatsapp.ts`, `lib/phone.ts`, `lib/admin/constants.ts`,
`app/api/cron/reminders/route.ts`, `vercel.json`.

## Démarrer en local
```bash
npm install
npm run dev
```
Ouvrir http://localhost:3000

## Build de production
```bash
npm run build
npm start
```

## Déploiement en production

Prérequis avant la mise en ligne (Vercel ou tout hébergeur Node/Next.js).

### 1. Générer le secret de session admin

`ADMIN_SESSION_SECRET` signe les cookies de session de la zone `/admin` (HMAC-SHA256).
**Obligatoire en production** : l'authentification lève une erreur s'il manque.

```bash
openssl rand -hex 32
```

Placez la valeur dans la variable d'environnement du déploiement (jamais dans le code ni
en dur dans le dépôt).

### 2. Définir les variables d'environnement

Voir `.env.example` pour le modèle complet. Variables requises en production :

| Variable | Requise | Rôle |
|---|---|---|
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | **Oui** | Identifiants de la zone admin — obligatoires dans tous les environnements (aucun défaut dans le code) |
| `ADMIN_SESSION_SECRET` | **Oui** | Secret HMAC des cookies de session (généré à l'étape 1) |
| `SUPABASE_URL` | **Oui** | URL du projet Supabase (Settings → API) |
| `SUPABASE_SECRET_KEY` | **Oui** | Clé SECRÈTE serveur (stockage du contenu) — ne jamais l'exposer côté client |
| `SUPABASE_PUBLISHABLE_KEY` | Selon usage | Clé publishable (client) |
| `SUPABASE_JWKS_URL` | Selon usage | URL JWKS du projet |
| `RESEND_API_KEY` | Selon usage | Envoi des emails d'invitation admin (https://resend.com/api-keys) — sans elle, mode démo (OTP affiché à l'écran) |
| `ADMIN_INVITE_FROM_EMAIL` | Selon usage | Expéditeur des emails — domaine vérifié sur Resend |
| `SITE_URL` | Selon usage | Domaine public des liens d'invitation (par défaut `https://www.lewaconsultingroup.com`) — requis si vous travaillez en local et que des emails doivent quand même pointer vers le site public |
| `CRON_SECRET` | **Si rappels J-48h souhaités** | Secret du cron de rappels (`Authorization: Bearer`) — sans elle, `/api/cron/reminders` refuse (503). Génération : `openssl rand -hex 32` |

Sans `SUPABASE_URL`/`SUPABASE_SECRET_KEY`, le site fonctionne en repli fichier
(`data/admin-store.json`) : acceptable en dev, **déconseillé en production**.

### 3. Exécuter la migration Supabase

Le contenu admin est stocké dans la table PostgreSQL `admin_store` (une seule ligne JSONB,
RLS activée **sans aucune policy** : seule la clé serveur accède aux données), et les
comptes/invitations dans `admin_users` (même modèle). Les migrations sont dans
`supabase/migrations/0001_admin_store.sql` et `supabase/migrations/0002_admin_users.sql`.

**Option A — SQL Editor (recommandé, sans outillage)** :

1. Ouvrez le tableau de bord Supabase → **SQL Editor**.
2. Collez le contenu de `supabase/migrations/0001_admin_store.sql` **puis**
   `supabase/migrations/0002_admin_users.sql`.
3. Exécutez. Les tables sont créées avec RLS (aucune policy → la clé publishable client ne
   peut rien lire, même en cas de fuite).

**Option B — CLI Supabase** (v2+, installable via `npm i -g supabase`) :

```bash
supabase login
supabase link --project-ref <project-ref>   # Settings → Project Settings → Reference ID
supabase db push                            # applique supabase/migrations/*.sql
```

**Vérification** : dans SQL Editor, `select * from admin_store;` doit retourner zéro ligne
au premier lancement — le site **seedera** automatiquement le contenu depuis les données
statiques (`lib/*`) à la première lecture. Sans migration appliquée, surveillez les logs
serveur pour le message `[admin] readStore (Postgres) indisponible — repli sur le fichier`.

### 4. Construire et démarrer

```bash
npm ci
npm run build
npm start
```

Détails complémentaires sur le stockage et les secrets dans la section
[Zone d'administration](#zone-dadministration-admin).

## Vérifications
Cinq contrôles de qualité s'exécutent en CI (GitHub Actions, workflows `.github/workflows/`)
à chaque push sur `master` et sur pull request. Ils utilisent uniquement des modules Node
natifs — aucune dépendance à installer.

```bash
# 1. Traductions : parité fr/en, clés inutilisées ou manquantes, résolution services.items.*
npm run check:i18n

# 2. Images : URLs Unsplash et Cloudinary vivantes (HTTP 200) + chemins d'images locales existants sous public/
npm run check:images

# 3. Données : chaque champ des objets de données de lib/*.ts est consommé par le code
#    (détecte les champs orphelins, ex. initials, bgFrom, pattern)
npm run check:lib

# 4. Parcours admin E2E : redirection vers le login, connexion, dashboard, création d'un
#    contenu via l'API, publication sur la fiche publique ET sa page de catégorie,
#    suppression en douceur (corbeille + fiche 404 + retrait de la catégorie),
#    restauration (republiée) puis purge définitive, puis demandes d'inscription
#    (soumission publique → apparition en attente → confirmation → rappel J-48h via le
#    cron → corbeille → restauration → purge), réinitialisation du journal d'activité
#    (vidage + persistance + contenu intact), déconnexion, journal d'activité
#    (login/création/suppression/confirmation/rappel/logout)
npm run check:admin

# 5. Zone admin : aucun style inline (mutations CSSOM ou prop React style=) —
#    bloqués par la CSP à nonce de /admin ('unsafe-inline' ignoré quand un nonce est présent)
npm run check:csp-admin
```

Chaque contrôle se termine avec `exit code 1` en cas d'échec — ce qui bloque la CI.

### Détail des scripts

| Commande | Script | Contrôles effectués |
|---|---|---|
| `npm run check:i18n` | `scripts/check-i18n.mjs` | Parité fr/en ; clés définies mais jamais référencées ; clés utilisées mais absentes ; résolution des clés dynamiques `services.items.*` pour chaque slug de `lib/services.ts` |
| `npm run check:images` | `scripts/check-images.mjs` | URLs `images.unsplash.com` **et** `res.cloudinary.com` répondent 200 (concurrency limitée) ; chemins locaux `/…` (code + `messages/*.json`) existent sous `public/` |
| `npm run upload:images` | `scripts/upload-cloudinary.mjs` | Upload des images locales de `public/` vers Cloudinary (public_id déterministes, idempotent) |
| `npm run check:lib` | `scripts/check-lib-fields.mjs` | Champs des exports de données de `lib/*.ts` référencés ailleurs dans le code (hors fichier de définition) ; ignore les `Record<…>` indexés par clé |
| `npm run check:admin` | `scripts/check-admin-e2e.mjs` | Démarre lui-même un serveur `next dev` (port éphémère) et déroule le parcours admin : `/admin` → login → dashboard → `POST /api/admin` (création d'une formation de test) → fiche publique `/fr/formations/{slug}` (200 + nom affiché) → page de catégorie `/fr/formations/comptabilite-finance` (200 + nom affiché) → `POST /api/admin` (suppression) → 404 sur la fiche → retrait de la page de catégorie → **demandes d'inscription** : `POST /api/enroll` public (201 + id, payload invalide → 400) → apparition en `pending` dans le store → `POST /api/admin/enrollments` `{ action: "confirm", startDate }` (→ `confirmed` + `confirmedAt` + `startDate`, email tenté via Resend) → **rappel J-48h** : `/api/cron/reminders` sans secret (403/503), avec secret (200, rappel envoyé, `reminderSentAt` posé), second passage sans re-envoi → `POST /api/admin/enrollments` `{ action: "delete" }` (→ disparition du store) → déconnexion → accès protégé (307/401). Le **journal d'activité** est vérifié à chaque étape : événements « connexion », « création », « suppression », « confirmation », « rappel » et « déconnexion » attendus dans le store. Restaure le store d'origine en fin de test, même en cas d'échec. ⚠ Arrêtez votre serveur `next dev` avant de lancer ce contrôle (dossier `.next` et store `data/admin-store.json` partagés) |
| `npm run check:csp-admin` | `scripts/check-csp-admin.mjs` | Scanne `app/admin`, `components/admin` et `lib/admin` : aucune mutation CSSOM (`.style.`, `.setProperty(`/`.removeProperty(`, `.cssText`, `setAttribute('style')`) ni prop React `style=` — bloqués par la CSP à nonce de `/admin` (`'unsafe-inline'` ignoré par les navigateurs dès qu'un nonce est présent, même en dev). Les commentaires/chaînes sont ignorés (on contrôle le code exécutable) |

Les **pages par catégorie de formations** sont couvertes par `check:admin` : le test
vérifie qu'une formation créée via l'API apparaît sur la page de sa catégorie (200 + nom)
puis en disparaît après suppression. La formation de test étant créée en catégorie
« compta », c'est `/formations/comptabilite-finance` qui est sondée — le mécanisme étant
identique pour `/formations/bureautique-developpement` (même composant de rendu).

### Workflow CI `check-admin-e2e` (`.github/workflows/check-admin-e2e.yml`)

**Déclenchement** :

- **Push sur `master`** — à chaque commit poussé sur la branche principale.
- **Pull request** — à chaque ouverture ou mise à jour d'une PR.

Le workflow définit un groupe `concurrency` par branche (`cancel-in-progress: true`) : si un
nouveau commit arrive pendant qu'un run est en cours, le run en cours est **annulé** au profit
du plus récent (économie de minutes GitHub Actions).

**Déroulé du job** (`ubuntu-latest`, Node.js 20) :

1. `actions/checkout@v4` — récupère le code
2. `actions/setup-node@v4` (`node-version: 20`)
3. `npm ci` — installation exacte des dépendances depuis `package-lock.json`
4. `node scripts/check-admin-e2e.mjs` — le test démarre lui-même son propre serveur
   `next dev` sur un port éphémère, puis déroule le parcours complet

**Secrets utilisés** (réglages du dépôt → Settings → Secrets and variables → Actions) :

| Secret | Rôle | Défaut (fixture de test) |
|---|---|---|
| `ADMIN_USERNAME` | Identifiant attendu par la zone admin | `admin` |
| `ADMIN_PASSWORD` | Mot de passe attendu | `admin123` |

Ces secrets sont **optionnels** : s'ils ne sont pas définis, le test utilise des identifiants
de fixture `admin`/`admin123`, transmis **explicitement** au serveur de test par le script
(`scripts/check-admin-e2e.mjs`) — il ne s'agit pas d'identifiants en dur dans le code du
site. Pour tester la connexion avec des identifiants personnalisés (les mêmes que ceux de
`.env.local`), définissez ces deux secrets.

Les quatre autres workflows (`check-i18n.yml`, `check-images.yml`, `check-lib-fields.yml`,
`check-csp-admin.yml`) suivent le même schéma de déclenchement et n'utilisent aucun secret.

## Structure
- `app/*/page.tsx` — une page par route, chacune avec ses propres métadonnées SEO
- `components/Header.tsx`, `components/Footer.tsx` — navigation et pied de page, communs à
  toutes les pages via `app/layout.tsx`
- `components/Container.tsx`, `components/PageHeader.tsx` — mise en page partagée
- `app/globals.css` — palette (navy / gold / red sur fond papier) et tokens de design

## À personnaliser avant mise en ligne
- Coordonnées GPS exactes dans `app/contact/page.tsx` (la carte utilise actuellement une
  recherche par adresse texte)
- Métadonnées SEO globales (`app/layout.tsx`) : image Open Graph, favicon définitif
- Domaine et hébergement (Vercel recommandé pour Next.js)

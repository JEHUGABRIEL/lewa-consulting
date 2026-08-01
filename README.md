# Cabinet COSI Lewa-Consulting Group — Site web

Site institutionnel multi-pages pour le Cabinet COSI Lewa-Consulting Group (Bangui, RCA),
cabinet d'audit, d'assistance comptable et fiscale, et centre de formations professionnelles.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Polices : Fraunces (titres), Inter (texte courant), IBM Plex Mono (chiffres/tarifs)

## Pages
- `/` — Accueil : présentation du cabinet et domaines d'intervention
- `/services` — Détail des 6 domaines d'expertise (Audit, Expertise comptable & finance, Conseil en gouvernance, Formation & renforcement des capacités, Accompagnement des entreprises, Événements professionnels)
- `/formations` — Grille tarifaire complète, sous forme de tableaux
- `/a-propos` — Mission, approche, clientèle
- `/contact` — Coordonnées, WhatsApp, Facebook, carte

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

## Vérifications
Trois contrôles de qualité s'exécutent en CI (GitHub Actions, workflows `.github/workflows/`)
à chaque push sur `master` et sur pull request. Ils utilisent uniquement des modules Node
natifs — aucune dépendance à installer.

```bash
# 1. Traductions : parité fr/en, clés inutilisées ou manquantes, résolution services.items.*
npm run check:i18n

# 2. Images : URLs Unsplash vivantes (HTTP 200) + chemins d'images locales existants sous public/
npm run check:images

# 3. Données : chaque champ des objets de données de lib/*.ts est consommé par le code
#    (détecte les champs orphelins, ex. initials, bgFrom, pattern)
npm run check:lib
```

Chaque contrôle se termine avec `exit code 1` en cas d'échec — ce qui bloque la CI.

### Détail des scripts

| Commande | Script | Contrôles effectués |
|---|---|---|
| `npm run check:i18n` | `scripts/check-i18n.mjs` | Parité fr/en ; clés définies mais jamais référencées ; clés utilisées mais absentes ; résolution des clés dynamiques `services.items.*` pour chaque slug de `lib/services.ts` |
| `npm run check:images` | `scripts/check-images.mjs` | URLs `images.unsplash.com` répondent 200 (concurrency limitée) ; chemins locaux `/…` (code + `messages/*.json`) existent sous `public/` |
| `npm run check:lib` | `scripts/check-lib-fields.mjs` | Champs des exports de données de `lib/*.ts` référencés ailleurs dans le code (hors fichier de définition) ; ignore les `Record<…>` indexés par clé |

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

# Cabinet COSI Lewa-Consulting Group — Site web

Site institutionnel multi-pages pour le Cabinet COSI Lewa-Consulting Group (Bangui, RCA),
cabinet d'audit, d'assistance comptable et fiscale, et centre de formations professionnelles.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Polices : Fraunces (titres), Inter (texte courant), IBM Plex Mono (chiffres/tarifs)

## Pages
- `/` — Accueil : présentation du cabinet et domaines d'intervention
- `/services` — Détail des 3 offres (Audit, Assistance comptable & fiscale, Formations)
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

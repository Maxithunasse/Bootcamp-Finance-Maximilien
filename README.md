# Skynova

> Le laboratoire independant qui decode les complements alimentaires.
> Score d'efficacite, prix au gramme de principe actif, alternatives recommandees. En 3 secondes.

Projet realise dans le cadre du Bootcamp Ops & Product — Delta Business School (mai 2026).

## Stack technique

- **Frontend** : HTML / CSS / JS vanilla (pas de framework, pas de build step)
- **Backend & BDD** : [Supabase](https://supabase.com) (Postgres + Auth + Storage)
- **Polices** : Geist, Geist Mono, Instrument Serif (via Google Fonts CDN)
- **Icones** : [Lucide](https://lucide.dev) via CDN unpkg
- **Routing** : par hash (`#home`, `#scan`, `#product/:id`...) — une seule SPA
- **Deploiement** : GitHub Pages

## Lancer en local

1. Cloner le repo : `git clone https://github.com/Maxithunasse/Bootcamp-Finance-Maximilien.git`
2. Renseigner `config.js` avec tes credentials Supabase (Project URL + anon key)
3. Ouvrir `index.html` dans un navigateur (Chrome / Firefox recommande)

Aucun `npm install`, aucun build. Le projet est volontairement zero-config.

## Architecture des fichiers

```
/
├── index.html       # SPA unique (header + main + footer)
├── style.css        # Design system + tous les styles
├── app.js           # Routing par hash + Supabase + render
├── config.js        # Credentials Supabase (a remplir)
└── README.md        # Ce fichier
```

## Routes

| Hash             | Page                |
|------------------|---------------------|
| `#home`          | Landing             |
| `#methodologie`  | Page methodologie   |
| `#decode`        | Blog editorial      |
| `#categories`    | Hub des 7 univers   |
| `#manifesto`     | Manifeste           |
| `#pricing`       | Plans Free/Premium  |
| `#auth`          | Login / Signup      |
| `#onboarding`    | Onboarding 4 etapes |
| `#lab`           | Dashboard perso     |
| `#scan`          | Scanner produit     |
| `#search`        | Recherche BDD       |
| `#product/:id`   | Fiche produit       |

## Statut

Projet en construction par phases (voir le brief du projet).
Phase actuelle : **Phase 0 — Fondations** (design system + header + footer + routing).

## URL deployee

GitHub Pages : *(a renseigner apres premiere mise en ligne)*

## Licence

Projet etudiant, usage pedagogique.

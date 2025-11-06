# Encyclopédie Pokémon - Région de Kanto

Application web complète d'encyclopédie Pokémon avec gestion de collection personnelle et suivi médical, construite avec Next.js, React, PostgreSQL et Prisma.

## Fonctionnalités

### 1. Encyclopédie Pokémon
- Liste complète des 151 Pokémon de la région de Kanto
- Filtrage par type
- Recherche par nom
- Affichage détaillé avec toutes les informations :
  - Statistiques de base
  - Types et capacités
  - Conditions d'évolution
  - Sprites normaux et shiny
  - Différences de genre

### 2. Collection Personnelle
- Authentification utilisateur (Dresseur/Soigneur)
- Gestion de votre collection de Pokémon
- Création d'équipes (jusqu'à 6 Pokémon)
- Statistiques et KPI de votre collection
- Suivi des Pokémon favoris
- Informations détaillées : niveau, nature, Pokéball, IVs

### 3. Suivi Médical (Centres Pokémon)
- Réservé aux utilisateurs avec le rôle "Soigneur"
- Dossiers médicaux complets
- Suivi de l'état de santé (HP, statut)
- Historique des soins
- Liste des centres Pokémon de Kanto

## Technologies

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS
- **Base de données:** PostgreSQL
- **ORM:** Prisma
- **Authentification:** NextAuth.js
- **PWA:** next-pwa (mode hors-ligne)
- **API externe:** PokeAPI

## Installation

### Prérequis

- Node.js 18+
- PostgreSQL
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
   ```bash
   git clone <votre-repo>
   cd pokemon-encyclopedia
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la base de données**
   
   Créez une base de données PostgreSQL :
   ```bash
   createdb pokemon_encyclopedia
   ```

   Créez un fichier `.env` à la racine du projet :
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/pokemon_encyclopedia"
   NEXTAUTH_SECRET="votre-secret-aleatoire-ici"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialiser la base de données**
   ```bash
   # Créer les tables
   npm run db:push
   
   # Peupler avec les 151 Pokémon de Kanto via PokeAPI
   npm run db:seed
   ```
   
   ⚠️ Le seed prend environ 15-20 minutes car il récupère les données de 151 Pokémon depuis PokeAPI.

5. **Lancer l'application en développement**
   ```bash
   npm run dev
   ```

6. **Ouvrir l'application**
   ```
   http://localhost:3000
   ```

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build de production
- `npm start` - Lance le serveur de production
- `npm run lint` - Lint du code
- `npm run db:push` - Synchronise le schéma Prisma avec la base
- `npm run db:seed` - Peuple la base de données avec les Pokémon
- `npm run db:studio` - Ouvre Prisma Studio (interface graphique)

## Structure du projet

```
pokemon-encyclopedia/
├── app/
│   ├── api/
│   │   ├── auth/          # Routes d'authentification
│   │   ├── pokemon/       # API Pokémon
│   │   ├── collection/    # API Collection
│   │   └── medical/       # API Dossiers médicaux
│   ├── encyclopedia/      # Pages encyclopédie
│   ├── collection/        # Pages collection
│   ├── medical/           # Pages centre Pokémon
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── components/
│   ├── pokemon/           # Composants Pokémon
│   └── ui/                # Composants UI réutilisables
├── lib/
│   ├── prisma.ts          # Client Prisma
│   ├── auth.ts            # Utilitaires auth
│   └── utils.ts           # Utilitaires divers
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   └── seed.ts            # Script de seed avec PokeAPI
└── public/
    ├── manifest.json      # Manifest PWA
    └── fonts/             # Police Pokémon
```

## Schéma de base de données

Le projet utilise les modèles suivants :

- **User** - Utilisateurs (Dresseurs/Soigneurs)
- **Pokemon** - Données encyclopédiques des Pokémon
- **PokemonType** - Types des Pokémon
- **Ability** - Talents/Capacités
- **Move** - Attaques
- **Collection** - Collections personnelles
- **CollectionEntry** - Pokémon dans une collection
- **Team** - Équipes de Pokémon
- **TeamMember** - Membres d'une équipe
- **PokeCenter** - Centres Pokémon
- **MedicalRecord** - Dossiers médicaux

## API Routes

### Pokémon
- `GET /api/pokemon` - Liste tous les Pokémon (avec filtres)
- `GET /api/pokemon/[id]` - Détails d'un Pokémon

### Collection
- `GET /api/collection` - Votre collection
- `POST /api/collection` - Ajouter un Pokémon
- `PUT /api/collection/[id]` - Modifier un Pokémon
- `DELETE /api/collection/[id]` - Retirer un Pokémon

### Équipes
- `GET /api/teams` - Vos équipes
- `POST /api/teams` - Créer une équipe
- `PUT /api/teams/[id]` - Modifier une équipe

### Soins (Soigneurs uniquement)
- `GET /api/medical` - Liste des dossiers médicaux
- `POST /api/medical` - Créer un dossier médical
- `PUT /api/medical/[id]` - Mettre à jour un dossier

## Fonctionnalités PWA

L'application fonctionne en mode hors-ligne grâce à :
- Service Worker automatique
- Cache des données Pokémon
- Mode standalone sur mobile

## Prochaines étapes

- [ ] Compléter toutes les pages de l'application
- [ ] Ajouter les composants UI manquants
- [ ] Implémenter la gestion des attaques/capacités
- [ ] Ajouter les statistiques et graphiques
- [ ] Améliorer le système d'authentification
- [ ] Ajouter les tests unitaires

## Licence

MIT

## Auteur

Projet créé pour Ynov M1 - Gestion IT

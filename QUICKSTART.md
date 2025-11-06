# Guide de démarrage rapide - Encyclopédie Pokémon

## Configuration rapide (5 minutes)

### 1. Installer PostgreSQL

Si vous n'avez pas PostgreSQL :
- **Windows**: Téléchargez depuis https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

### 2. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE pokemon_encyclopedia;

# Créer un utilisateur (optionnel)
CREATE USER pokemonuser WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE pokemon_encyclopedia TO pokemonuser;

# Quitter
\q
```

### 3. Installer les dépendances du projet

```bash
cd pokemon-encyclopedia
npm install
```

### 4. Configurer les variables d'environnement

Créez un fichier `.env` :

```bash
# Copier le fichier exemple
cp .env.example .env
```

Modifier `.env` avec vos informations :

```env
DATABASE_URL="postgresql://postgres:votre_password@localhost:5432/pokemon_encyclopedia"
NEXTAUTH_SECRET="generer-une-cle-aleatoire-ici"
NEXTAUTH_URL="http://localhost:3000"
```

Pour générer une clé secrète :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Initialiser la base de données

```bash
# Créer les tables
npm run db:push

# Importer les 151 Pokémon depuis PokeAPI (prend 15-20 min)
npm run db:seed
```

### 6. Lancer l'application

```bash
npm run dev
```

Ouvrez votre navigateur sur http://localhost:3000

## Fonctionnalités disponibles

✅ **Encyclopédie complète**
- Naviguez vers `/encyclopedia`
- 151 Pokémon de Kanto avec toutes leurs données
- Filtrage par type
- Recherche par nom

✅ **API Rest disponible**
- `GET /api/pokemon` - Liste des Pokémon
- `GET /api/pokemon/[id]` - Détails d'un Pokémon

## Prochaines étapes pour compléter le projet

### À développer :

1. **Module Collection personnelle** (`/collection`)
   - Page de connexion/inscription
   - Gestion de la collection
   - Création d'équipes

2. **Module Suivi médical** (`/medical`)
   - Interface soigneurs
   - Dossiers médicaux
   - Centres Pokémon

3. **Composants UI**
   - Cartes Pokémon interactives
   - Modales de détails
   - Formulaires

4. **Authentification**
   - Finaliser NextAuth
   - Pages de login/signup
   - Protection des routes

## Commandes utiles

```bash
# Développement
npm run dev              # Lance le serveur de dev

# Base de données
npm run db:push          # Sync le schéma Prisma
npm run db:seed          # Peuple la DB avec PokeAPI
npm run db:studio        # Interface graphique Prisma

# Production
npm run build            # Build de production
npm start                # Lance la production

# Utilitaires
npm run lint             # Vérifie le code
```

## Résolution de problèmes

### Erreur de connexion PostgreSQL
- Vérifiez que PostgreSQL est démarré
- Vérifiez vos identifiants dans le `.env`

### Erreur lors du seed
- Vérifiez votre connexion internet (utilise PokeAPI)
- Le seed peut prendre 15-20 minutes, c'est normal

### Port 3000 déjà utilisé
```bash
# Utiliser un autre port
PORT=3001 npm run dev
```

## Structure actuelle du projet

```
pokemon-encyclopedia/
├── app/
│   ├── api/              ✅ Routes API créées
│   ├── encyclopedia/     ✅ Page encyclopédie créée
│   ├── collection/       ⏳ À développer
│   ├── medical/          ⏳ À développer
│   └── layout.tsx        ✅ Layout principal créé
├── prisma/
│   ├── schema.prisma     ✅ Schéma complet (15 modèles)
│   └── seed.ts           ✅ Script seed avec PokeAPI
└── README.md             ✅ Documentation complète
```

## Ressources

- **PokeAPI**: https://pokeapi.co/
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

Bon développement ! 🎮✨

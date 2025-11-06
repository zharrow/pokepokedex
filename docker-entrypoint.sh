#!/bin/sh
set -e

echo "🐳 Démarrage de l'application Pokemon Encyclopedia..."

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL..."
until pg_isready -h postgres -p 5432 -U pokemon > /dev/null 2>&1; do
  echo "PostgreSQL n'est pas encore prêt - attente..."
  sleep 2
done

echo "✅ PostgreSQL est prêt!"

# Générer Prisma Client
echo "🔧 Génération du Prisma Client..."
npx prisma generate

# Pousser le schéma vers la DB
echo "📊 Création/Mise à jour des tables..."
npx prisma db push --skip-generate

echo "🚀 Lancement de l'application..."

# Message pour le seed
echo ""
echo "ℹ️  Pour importer les 151 Pokémon de Kanto, lancez dans un autre terminal:"
echo "   docker-compose exec app npm run db:seed"
echo ""

# Exécuter la commande passée en argument
exec "$@"

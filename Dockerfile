FROM node:18-alpine

WORKDIR /app

# Installer postgresql-client pour pg_isready
RUN apk add --no-cache postgresql-client

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Copier le reste des fichiers
COPY . .

# Générer Prisma Client
RUN npx prisma generate

# Exposer le port
EXPOSE 3000

# Script de démarrage
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

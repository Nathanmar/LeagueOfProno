FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de configuration
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Installer les dépendances
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod=false

# Copier le code source
COPY src ./src
COPY tsconfig.json ./

# Build
RUN pnpm run build

# Nettoyer les dépendances de dev
RUN pnpm install --frozen-lockfile --prod

# Exposer le port
EXPOSE 3001

# Commande de démarrage
CMD ["pnpm", "start"]

# ----------------------------
# STAGE 1: Instalación y build
# ----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos package.json y lockfile de tu servidor
COPY apps/server/package.json apps/server/package-lock.json ./

RUN npm ci

# Copiamos el resto del código de tu servidor
COPY apps/server ./

# Generamos cliente de Prisma
RUN npx prisma generate

# Compilamos TypeScript
RUN npm run build

# Eliminamos devDependencies
RUN npm prune --production


# ----------------------------
# STAGE 2: Imagen de producción
# ----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Módulos y build desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/prisma      ./prisma
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
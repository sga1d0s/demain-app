# ----------------------------
# STAGE 1: build
# ----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# 1) Copia sólo las deps de tu API
COPY apps/server/package.json apps/server/package-lock.json* ./
RUN npm ci

# 2) Copia solamente el schema de Prisma, TS config y tu código fuente
COPY apps/server/prisma    ./prisma
COPY apps/server/tsconfig.json ./
COPY apps/server/src       ./src

# 3) Genera el Prisma Client (no necesita conectar a la BBDD)
RUN npx prisma generate --schema=./prisma/schema.prisma

# 4) Compila tu TypeScript a JavaScript en dist/
RUN npm run build

# 5) Poda las devDependencies para dejar sólo las reales
RUN npm prune --production


# ----------------------------
# STAGE 2: imagen de producción
# ----------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# 1) Trae sólo lo imprescindible desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/package.json ./

# 2) Variables por defecto (puedes sobreescribirlas en docker-compose)
ENV NODE_ENV=production
ENV PORT=3000

# 3) Expón el puerto
EXPOSE 3000

# 4) Arranca tu servidor compilado
CMD ["node", "dist/index.js"]
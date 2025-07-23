# ----------------------------
# STAGE 1: Instalación y build
# ----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# 1) Solo deps de tu API
COPY apps/server/package.json apps/server/package-lock.json* ./
RUN npm install --loglevel verbose

# 2) El código fuente y el esquema de Prisma
COPY apps/server/src ./src
COPY apps/server/prisma ./prisma
COPY apps/server/tsconfig.json ./

# 3) Genera el cliente y compila
RUN npx prisma generate
RUN npm run build

# 4) Poda devDependencies
RUN npm prune --production


# ----------------------------
# STAGE 2: Imagen de producción
# ----------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Copia solo lo que queda en builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/prisma      ./prisma
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/index.js"]
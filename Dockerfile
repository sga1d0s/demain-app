# ----------------------------
# STAGE 1: Instalación y build
# ----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# 1) Copiamos sólo el package.json y el lockfile (si existe)
COPY apps/server/package.json apps/server/package-lock.json* ./

# 2) Instalamos dependencias siempre via npm install y con salida verbosa
RUN npm install --loglevel verbose

# 3) Copiamos el resto del código de la API
COPY apps/server/ ./

# 4) Generamos el cliente de Prisma
RUN npx prisma generate

# 5) Compilamos TypeScript
RUN npm run build

# 6) Eliminamos devDependencies para aligerar la imagen final
RUN npm prune --production


# ----------------------------
# STAGE 2: Imagen de producción
# ----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# 1) Traemos node_modules y build desde el builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/prisma      ./prisma
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
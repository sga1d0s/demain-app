# ----------------------------
# STAGE 1: Instalación y build
# ----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# 1) Copiamos sólo package.json y lockfile de tu API
COPY apps/server/package.json apps/server/package-lock.json* ./

# 2) Instalamos TODO (incluye Prisma CLI y TS)
RUN npm ci

# 3) Copiamos schema y código fuente
COPY apps/server/prisma ./prisma
COPY apps/server/tsconfig.json ./
COPY apps/server/src     ./src

# 4) Generamos el cliente de Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# 5) Compilamos TypeScript
RUN npm run build

# 6) Guardamos el cliente generado en un tmp
RUN mkdir -p /prisma-client \
 && cp -R node_modules/.prisma /prisma-client/.prisma

# 7) Eliminamos devDependencies, dejando sólo @prisma/client y deps de producción
RUN npm prune --production


# ----------------------------
# STAGE 2: Imagen de producción
# ----------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# 1) Traemos node_modules “limpios”
COPY --from=builder /app/node_modules      ./node_modules

# 2) Restauramos el cliente de Prisma que guardamos…
COPY --from=builder /prisma-client/.prisma ./node_modules/.prisma

# 3) Copiamos el build y el schema (por si lo necesitas en runtime)
COPY --from=builder /app/dist   ./dist
COPY --from=builder /app/prisma ./prisma

# 4) Copiamos package.json (por si tu entrypoint lo necesita)
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# 5) Arranca tu servidor compilado
CMD ["node", "dist/index.js"]
# ----------------------------
# STAGE 1: Instalación y build
# ----------------------------
FROM node:20-alpine AS builder

# Ponemos todo bajo /app
WORKDIR /app

# 1) Copiamos solo package.json y package-lock.json de tu API
COPY apps/server/package.json apps/server/package-lock.json* ./

# 2) Instalamos dependencias (npm ci si hay lockfile, npm install si no)
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

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

# 2) Variables por defecto (sobre-escribibles desde docker-compose)
ENV NODE_ENV=production
ENV PORT=3000

# 3) Exponemos el puerto de la API
EXPOSE 3000

# 4) Arrancamos el servidor desde el código compilado
CMD ["node", "dist/index.js"]
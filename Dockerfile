# ----------------------------
# STAGE 1: Instalación y build
# ----------------------------
FROM node:20-alpine AS builder

# Directorio de trabajo para tu API
WORKDIR /app

# Copia sólo el package.json y (si existe) el package-lock de tu servidor
COPY apps/server/package.json apps/server/package-lock.json* ./

# Instala dependencias (npm ci si hay lockfile, npm install si no)
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copia el resto del código de tu servidor
COPY apps/server/ ./

# Genera el cliente de Prisma
RUN npx prisma generate

# Compila TypeScript a JavaScript en dist/
RUN npm run build

# Elimina devDependencies para la imagen final
RUN npm prune --production


# ----------------------------
# STAGE 2: Imagen de producción
# ----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Trae módulos y artefactos compilados del builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/prisma      ./prisma
COPY --from=builder /app/package.json ./

# Variables por defecto (se pueden sobreescribir en docker-compose)
ENV NODE_ENV=production
ENV PORT=3000

# Exponemos el puerto de la API
EXPOSE 3000

# Arrancamos tu servidor
CMD ["node", "dist/index.js"]
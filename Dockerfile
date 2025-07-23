# ----------------------------
# STAGE 1: Instalación y build
# ----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos sólo el package.json y lockfile de tu servidor (ajustado a tu ruta)
COPY app/server/package.json app/server/package-lock.json* ./

# Mostramos el directorio para debug (puedes quitarlo después)
RUN ls -l && pwd

# Instalamos dependencias
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copiamos el resto del código de la API
COPY app/server/ ./

# Generamos el cliente de Prisma
RUN npx prisma generate

# Compilamos TypeScript
RUN npm run build

# Eliminamos devDependencies para aligerar la imagen
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

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
# STAGE 1: build
FROM node:20-alpine AS builder
WORKDIR /app

# Sólo deps de tu servidor
COPY apps/server/package.json apps/server/package-lock.json* ./
RUN npm ci

# Código + TS build
COPY apps/server/ ./
RUN npx prisma generate \
 && npm run build \
 && npm prune --production

# STAGE 2: producción
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/prisma      ./prisma
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "dist/index.js"]
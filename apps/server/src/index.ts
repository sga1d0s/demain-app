import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Configura CORS para el bundler de Expo (+ opciones útiles)
app.use(
  cors({
    origin: [
      "http://localhost:8081",      // Expo Web
      "http://192.168.1.96:19000",   // Expo DevTools
      "exp://192.168.1.96:19000",    // Expo Go (si usas esa URL)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,      // responde 200 en los OPTIONS
  })
);
app.use(express.json());

// — health check —
// index.ts (módulo Express / Prisma)
app.get("/health", async (req, res) => {
  try {
    // 1) Ping básico
    await prisma.$queryRaw`SELECT 1`;

    // 2) Obtener nombre de la DB
    // Para Postgres:
    const result = await prisma.$queryRaw<
      { name: string }[]
    >`SELECT current_database() AS name`;
    const dbName = result[0]?.name ?? "unknown";

    res.json({ status: "ok", db: "reachable", dbName });
  } catch (error) {
    console.error("DB health check failed:", error);
    res
      .status(500)
      .json({ status: "error", db: "unreachable", dbName: null });
  }
});

// … tus otras rutas …

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
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
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    // Asegúrate de que here también se envíen las cabeceras CORS
    res.json({ status: "ok", db: "reachable" });
  } catch (error) {
    console.error("DB health check failed:", error);
    res.status(500).json({ status: "error", db: "unreachable" });
  }
});

// … tus otras rutas …

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
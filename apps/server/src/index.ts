import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "connect-src 'self' http://localhost:3000 http://192.168.1.96:3000; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:;"
  );
  next();
});

app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://192.168.1.96:19000",
      "exp://192.168.1.96:19000",
      "https://demainapp.dnsalias.com",

    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    // 1) Ping básico
    await prisma.$queryRaw`SELECT 1`;

    // 2) Nombre de la base de datos
    const nameResult = await prisma.$queryRaw<{ name: string }[]>`
      SELECT current_database() AS name
    `;
    const dbName = nameResult[0]?.name ?? "unknown";

    // 3) Puerto real de la instancia de Postgres
    const portResult = await prisma.$queryRaw<{ port: number }[]>`
      SELECT inet_server_port() AS port
    `;
    const dbPort = portResult[0]?.port ?? null;

    return res.json({
      status: "ok",
      db: "reachable",
      dbName,
      dbPort,
    });
  } catch (error) {
    console.error("DB health check failed:", error);
    return res.status(500).json({
      status: "error",
      db: "unreachable",
      dbName: null,
      dbPort: null,
    });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
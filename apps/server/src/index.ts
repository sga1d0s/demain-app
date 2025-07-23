import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.send({ status: "ok" });
});

// … más rutas …

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
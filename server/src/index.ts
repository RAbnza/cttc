import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import { vocabRouter } from "./routes/vocab.js";
import { env } from "./utils/env.js";

dotenv.config();

const app = express();
const port = env.port;
const clientOrigin = env.clientOrigin;

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/vocab", vocabRouter);

const mongoUri = env.mongoUri;
if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("MongoDB connection failed", error);
    });
} else {
  console.log("MONGODB_URI not set; running without database connection");
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

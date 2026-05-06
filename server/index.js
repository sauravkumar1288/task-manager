import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import dbConnection from "./utils/connectDB.js";

dotenv.config();

const app = express();

/* -------------------- CORS -------------------- */

const allowedOrigins = [
  "https://zoological-inspiration-production.up.railway.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Cookie");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

/* -------------------- BASIC ROUTES -------------------- */

app.get("/", (req, res) => {
  res.status(200).send("Server is LIVE ✅");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* -------------------- ROUTES -------------------- */

app.use("/api", routes);

/* -------------------- ERROR HANDLING -------------------- */

app.use(routeNotFound);
app.use(errorHandler);

/* -------------------- SERVER START -------------------- */

const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

console.log("PORT FROM RAILWAY:", PORT);

dbConnection()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB CONNECTION FAILED:", err);
  });

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});
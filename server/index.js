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

/* -------------------- BASIC ROUTES (KEEP FIRST) -------------------- */

// Root route → Railway health check fix
app.get("/", (req, res) => {
  res.status(200).send("Server is LIVE ✅");
});

// Optional health route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* -------------------- MIDDLEWARE -------------------- */

app.use(
  cors({
    origin: [
      "https://mern-task-manager-app.netlify.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* -------------------- ROUTES -------------------- */

app.use("/api", routes);

/* -------------------- ERROR HANDLING -------------------- */

app.use(routeNotFound);
app.use(errorHandler);

/* -------------------- DATABASE -------------------- */

dbConnection();

/* -------------------- SERVER START -------------------- */

const PORT = process.env.PORT || 5000;

// Debug (important)
console.log("PORT FROM RAILWAY:", PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

/* -------------------- CRASH DEBUG -------------------- */

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});
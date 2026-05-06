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

/* -------------------- BASIC ROUTES -------------------- */

// Root route (important for Railway)
app.get("/", (req, res) => {
  res.status(200).send("Server is LIVE ✅");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* -------------------- MIDDLEWARE -------------------- */

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://zoological-inspiration-production.up.railway.app",
        "http://localhost:3000",
        "http://localhost:3001",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
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

/* -------------------- SERVER START -------------------- */

const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

console.log("PORT FROM RAILWAY:", PORT);

/* 🔥 IMPORTANT: start server AFTER DB connects */

dbConnection()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB CONNECTION FAILED:", err);
  });

/* -------------------- CRASH DEBUG -------------------- */

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import dbConnection from "./utils/connectDB.js";

dotenv.config();

// Connect Database
dbConnection();

const app = express();

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

// optional logging
app.use(morgan("dev"));

/* -------------------- ROOT ROUTE (IMPORTANT) -------------------- */

app.get("/", (req, res) => {
  res.send("API is running...");
});

/* -------------------- ROUTES -------------------- */

app.use("/api", routes);

/* -------------------- ERROR HANDLING -------------------- */

app.use(routeNotFound);
app.use(errorHandler);

/* -------------------- PORT FIX (CRITICAL) -------------------- */

// Railway provides dynamic PORT — DO NOT hardcode
const PORT = process.env.PORT;

// Debug log (to verify Railway port)
console.log("PORT FROM RAILWAY:", PORT);

/* -------------------- START SERVER -------------------- */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
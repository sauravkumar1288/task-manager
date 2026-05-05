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

// Middleware
app.use(
  cors({
    origin: [
      "https://mern-task-manager-app.netlify.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Optional (enable if needed)
app.use(morgan("dev"));

/* -------------------- IMPORTANT -------------------- */
// Root route (fixes "Application failed to respond")
app.get("/", (req, res) => {
  res.send("API is running...");
});

/* -------------------------------------------------- */

// Routes
app.use("/api", routes);

// Error Handling
app.use(routeNotFound);
app.use(errorHandler);

// Server listen (Railway compatible)
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
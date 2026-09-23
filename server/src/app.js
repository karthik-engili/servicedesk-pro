import express from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Configure CORS
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server) or matching origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health ping (backward compatibility)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ServiceDesk Pro API is running",
  });
});

// Main API Router
app.use("/api", apiRouter);

// 404 handler for undefined routes
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

export default app;
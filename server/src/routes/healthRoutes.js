import { Router } from "express";
import { getDbStatus } from "../config/db.js";
import { sendSuccess } from "../utils/response.js";

const router = Router();

router.get("/", (req, res) => {
  const db = getDbStatus();
  const isHealthy = db.status === "connected";

  return sendSuccess(res, {
    statusCode: isHealthy ? 200 : 503,
    message: isHealthy
      ? "ServiceDesk Pro API is healthy and operational"
      : "ServiceDesk Pro API is running with degraded database connectivity",
    data: {
      status: isHealthy ? "UP" : "DEGRADED",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      database: db,
    },
  });
});

const handleSeed = async (req, res, next) => {
  try {
    const { seedDatabase } = await import("../config/seed.js");
    await seedDatabase(false);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Database seeded successfully with demo users, assets, departments, SLA policies, and knowledge articles.",
    });
  } catch (error) {
    next(error);
  }
};

router.post("/seed", handleSeed);
router.get("/seed", handleSeed);

export default router;

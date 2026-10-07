import { Router } from "express";
import { sendSuccess } from "../utils/response.js";

const router = Router();

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

router.post("/", handleSeed);
router.get("/", handleSeed);

export default router;

import { Router } from "express";
import * as aiController from "../controllers/aiController.js";
import { authenticate } from "../middleware/auth.js";
import {
  validateTicketId,
  validateApplyCategory,
  validateApplyPriority,
} from "../validators/aiValidator.js";

const router = Router();

// All AI routes require authentication
router.use(authenticate);

// Ticket Analysis & Intelligence
router.post("/tickets/:id/analyze", validateTicketId, aiController.analyzeTicket);
router.get("/tickets/:id/history", validateTicketId, aiController.getHistory);
router.get("/tickets/:id/recommendations", validateTicketId, aiController.getRecommendations);
router.post("/tickets/:id/solution-draft", validateTicketId, aiController.generateSolutionDraft);

// Human-Controlled Suggestion Application
router.post(
  "/tickets/:id/apply-category",
  validateTicketId,
  validateApplyCategory,
  aiController.applyCategory
);
router.post(
  "/tickets/:id/apply-priority",
  validateTicketId,
  validateApplyPriority,
  aiController.applyPriority
);

export default router;

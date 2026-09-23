import { Router } from "express";
import * as ticketController from "../controllers/ticketController.js";
import * as commentController from "../controllers/commentController.js";
import * as workLogController from "../controllers/workLogController.js";
import { authenticate } from "../middleware/auth.js";
import {
  validateCreateTicket,
  validateUpdateTicket,
  validateAssignTicket,
  validateResolveTicket,
} from "../validators/ticketValidator.js";
import { validateComment } from "../validators/commentValidator.js";
import { validateWorkLog } from "../validators/workLogValidator.js";

const router = Router();

// All ticket routes require authentication
router.use(authenticate);

// Ticket CRUD
router.post("/", validateCreateTicket, ticketController.createTicket);
router.get("/", ticketController.listTickets);
router.get("/:id", ticketController.getTicketById);
router.patch("/:id", validateUpdateTicket, ticketController.updateTicket);

// Explicit Lifecycle State Actions
router.post("/:id/assign", validateAssignTicket, ticketController.assignTicket);
router.post("/:id/start", ticketController.startTicket);
router.post("/:id/resolve", validateResolveTicket, ticketController.resolveTicket);
router.post("/:id/reopen", ticketController.reopenTicket);
router.post("/:id/close", ticketController.closeTicket);

// Audit Trail
router.get("/:id/audit", ticketController.getTicketAuditLogs);

// Comments Sub-resource
router.get("/:id/comments", commentController.getComments);
router.post("/:id/comments", validateComment, commentController.addComment);

// Work Logs Sub-resource
router.get("/:id/worklogs", workLogController.getWorkLogs);
router.post("/:id/worklogs", validateWorkLog, workLogController.addWorkLog);

export default router;

import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// List users (Admin, IT Manager, Technician)
router.get(
  "/",
  authorize("system_admin", "it_manager", "technician"),
  userController.listUsers
);

// Get user profile by ID
router.get("/:id", userController.getUserById);

// Update user (Self or Admin)
router.patch("/:id", userController.updateUser);

export default router;

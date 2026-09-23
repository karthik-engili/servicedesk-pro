import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
} from "../validators/authValidator.js";

const router = Router();

// Public auth endpoints
router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/refresh", validateRefreshToken, authController.refreshToken);

// Protected auth endpoints
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;

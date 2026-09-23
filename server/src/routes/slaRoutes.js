import { Router } from "express";
import * as slaController from "../controllers/slaController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validateCreateSla, validateUpdateSla } from "../validators/slaValidator.js";

const router = Router();

// All SLA routes require authentication
router.use(authenticate);

// Public / Authenticated read-only SLA inspection
router.get("/", slaController.listPolicies);
router.get("/:id", slaController.getPolicyById);

// Manager / Admin configuration
router.post(
  "/",
  authorize("system_admin", "it_manager"),
  validateCreateSla,
  slaController.createPolicy
);

router.patch(
  "/:id",
  authorize("system_admin", "it_manager"),
  validateUpdateSla,
  slaController.updatePolicy
);

router.delete(
  "/:id",
  authorize("system_admin", "it_manager"),
  slaController.deletePolicy
);

export default router;

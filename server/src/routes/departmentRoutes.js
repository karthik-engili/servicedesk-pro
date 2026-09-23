import { Router } from "express";
import * as departmentController from "../controllers/departmentController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import {
  validateCreateDepartment,
  validateUpdateDepartment,
} from "../validators/departmentValidator.js";

const router = Router();

// Public / Authenticated read-only access to departments
router.get("/", departmentController.listDepartments);
router.get("/:id", departmentController.getDepartmentById);

// Protected routes for department management
router.post(
  "/",
  authenticate,
  authorize("system_admin", "it_manager"),
  validateCreateDepartment,
  departmentController.createDepartment
);

router.patch(
  "/:id",
  authenticate,
  authorize("system_admin", "it_manager"),
  validateUpdateDepartment,
  departmentController.updateDepartment
);

export default router;

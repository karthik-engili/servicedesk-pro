import { Router } from "express";
import * as vendorController from "../controllers/vendorController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import {
  validateCreateVendor,
  validateUpdateVendor,
} from "../validators/vendorValidator.js";

const router = Router();

router.use(authenticate);

// List & view vendors
router.get("/", vendorController.listVendors);
router.get("/:id", vendorController.getVendorById);

// Create and update (Admin, IT Manager, Asset Manager)
router.post(
  "/",
  authorize("system_admin", "it_manager", "asset_manager"),
  validateCreateVendor,
  vendorController.createVendor
);

router.patch(
  "/:id",
  authorize("system_admin", "it_manager", "asset_manager"),
  validateUpdateVendor,
  vendorController.updateVendor
);

// Delete (System Admin only)
router.delete("/:id", authorize("system_admin"), vendorController.deleteVendor);

export default router;

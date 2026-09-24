import { Router } from "express";
import * as assetController from "../controllers/assetController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import {
  validateCreateAsset,
  validateUpdateAsset,
  validateAssignAsset,
} from "../validators/assetValidator.js";

const router = Router();

router.use(authenticate);

// Aggregation & Special routes (declared before /:id)
router.get("/summary", assetController.getAssetSummary);
router.get("/warranty/expiring", assetController.getExpiringWarranties);

// Core CRUD
router.post(
  "/",
  authorize("system_admin", "it_manager", "asset_manager"),
  validateCreateAsset,
  assetController.createAsset
);
router.get("/", assetController.listAssets);
router.get("/:id", assetController.getAssetById);
router.patch(
  "/:id",
  authorize("system_admin", "it_manager", "asset_manager"),
  validateUpdateAsset,
  assetController.updateAsset
);
router.delete("/:id", authorize("system_admin"), assetController.deleteAsset);

// Explicit Lifecycle Actions
router.post(
  "/:id/assign",
  authorize("system_admin", "it_manager", "asset_manager"),
  validateAssignAsset,
  assetController.assignAsset
);
router.post(
  "/:id/unassign",
  authorize("system_admin", "it_manager", "asset_manager"),
  assetController.unassignAsset
);
router.post(
  "/:id/repair",
  authorize("system_admin", "it_manager", "asset_manager", "technician"),
  assetController.sendForRepair
);
router.post(
  "/:id/return",
  authorize("system_admin", "it_manager", "asset_manager", "technician"),
  assetController.returnFromRepair
);
router.post(
  "/:id/replace",
  authorize("system_admin", "it_manager", "asset_manager"),
  assetController.replaceAsset
);
router.post(
  "/:id/retire",
  authorize("system_admin", "it_manager", "asset_manager"),
  assetController.retireAsset
);
router.post("/:id/report-lost", assetController.reportLost);
router.post(
  "/:id/recover",
  authorize("system_admin", "it_manager", "asset_manager"),
  assetController.recoverAsset
);

// Related Sub-resources
router.get("/:id/history", assetController.getAssetHistory);
router.get("/:id/tickets", assetController.getAssetTickets);

export default router;

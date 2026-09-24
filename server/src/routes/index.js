import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import slaRoutes from "./slaRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import assetRoutes from "./assetRoutes.js";
import vendorRoutes from "./vendorRoutes.js";
import articleRoutes from "./articleRoutes.js";
import aiRoutes from "./aiRoutes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/departments", departmentRoutes);
apiRouter.use("/tickets", ticketRoutes);
apiRouter.use("/sla", slaRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/assets", assetRoutes);
apiRouter.use("/vendors", vendorRoutes);
apiRouter.use("/articles", articleRoutes);
apiRouter.use("/ai", aiRoutes);

export default apiRouter;

import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import slaRoutes from "./slaRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/departments", departmentRoutes);
apiRouter.use("/tickets", ticketRoutes);
apiRouter.use("/sla", slaRoutes);
apiRouter.use("/notifications", notificationRoutes);

export default apiRouter;

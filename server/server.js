import "dotenv/config";
import mongoose from "mongoose";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { startSlaEscalationJob, stopSlaEscalationJob } from "./src/jobs/slaEscalationJob.js";

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed demo accounts and configuration if unseeded (e.g. fresh Render/Atlas deployments)
    try {
      const User = (await import("./src/models/User.js")).default;
      const adminExists = await User.findOne({ email: "admin@servicedesk.local" });
      if (!adminExists) {
        console.log("🌱 No admin user found in database. Auto-seeding initial demo data...");
        const { seedDatabase } = await import("./src/config/seed.js");
        await seedDatabase(false);
        console.log("✅ Auto-seed completed successfully!");
      }
    } catch (seedErr) {
      console.error("⚠️ Auto-seed check error:", seedErr.message);
    }

    server = app.listen(PORT, () => {
      console.log(`🚀 ServiceDesk Pro server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    });

    // Start background SLA monitoring job (checks every 60 seconds)
    startSlaEscalationJob(60000);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

const handleGracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  stopSlaEscalationJob();

  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await mongoose.connection.close(false);
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

startServer();
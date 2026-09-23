import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./db.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import SlaPolicy from "../models/SlaPolicy.js";

const DEMO_PASSWORD = "Password@123";

export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting ServiceDesk Pro database seed...");
    await connectDB();

    // 1. Seed Departments
    const departmentsData = [
      { name: "Information Technology", description: "Internal IT, Infrastructure and Helpdesk" },
      { name: "Human Resources", description: "People, onboarding and workplace benefits" },
      { name: "Facilities & Operations", description: "Office facilities, badges and supplies" },
    ];

    const departmentMap = {};
    for (const d of departmentsData) {
      let dept = await Department.findOne({ name: d.name });
      if (!dept) {
        dept = await Department.create(d);
        console.log(` Created department: ${d.name}`);
      }
      departmentMap[d.name] = dept._id;
    }

    // 2. Seed Default SLA Policies
    const slaData = [
      {
        name: "Critical Priority SLA",
        priority: "CRITICAL",
        responseTimeMinutes: 30,
        resolutionTimeMinutes: 240,
        businessHoursOnly: false,
      },
      {
        name: "High Priority SLA",
        priority: "HIGH",
        responseTimeMinutes: 60,
        resolutionTimeMinutes: 480,
        businessHoursOnly: true,
      },
      {
        name: "Medium Priority SLA",
        priority: "MEDIUM",
        responseTimeMinutes: 240,
        resolutionTimeMinutes: 1440,
        businessHoursOnly: true,
      },
      {
        name: "Low Priority SLA",
        priority: "LOW",
        responseTimeMinutes: 480,
        resolutionTimeMinutes: 2880,
        businessHoursOnly: true,
      },
    ];

    for (const s of slaData) {
      const exists = await SlaPolicy.findOne({ priority: s.priority });
      if (!exists) {
        await SlaPolicy.create(s);
        console.log(` Created SLA Policy: ${s.priority}`);
      }
    }

    // 3. Seed Demo Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, salt);

    const usersData = [
      {
        name: "System Admin",
        email: "admin@servicedesk.local",
        passwordHash,
        role: "system_admin",
        department: departmentMap["Information Technology"],
        status: "active",
        isEmailVerified: true,
      },
      {
        name: "IT Service Manager",
        email: "manager@servicedesk.local",
        passwordHash,
        role: "it_manager",
        department: departmentMap["Information Technology"],
        status: "active",
        isEmailVerified: true,
      },
      {
        name: "Alex Technician",
        email: "tech1@servicedesk.local",
        passwordHash,
        role: "technician",
        department: departmentMap["Information Technology"],
        status: "active",
        isEmailVerified: true,
      },
      {
        name: "Jane Employee",
        email: "employee1@servicedesk.local",
        passwordHash,
        role: "employee",
        department: departmentMap["Human Resources"],
        status: "active",
        isEmailVerified: true,
      },
    ];

    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        await User.create(u);
        console.log(` Created user: ${u.email} (${u.role})`);
      }
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("Demo credentials:");
    console.log(" - Admin: admin@servicedesk.local / Password@123");
    console.log(" - Manager: manager@servicedesk.local / Password@123");
    console.log(" - Technician: tech1@servicedesk.local / Password@123");
    console.log(" - Employee: employee1@servicedesk.local / Password@123");
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

if (process.argv[1]?.endsWith("seed.js")) {
  seedDatabase();
}

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./db.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import SlaPolicy from "../models/SlaPolicy.js";
import Vendor from "../models/Vendor.js";
import Asset from "../models/Asset.js";
import Article from "../models/Article.js";
import ArticleVersion from "../models/ArticleVersion.js";

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

    // 3. Seed Demo Users (including asset_manager)
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
        name: "Marcus Asset Manager",
        email: "assetmgr@servicedesk.local",
        passwordHash,
        role: "asset_manager",
        department: departmentMap["Facilities & Operations"],
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

    const userMap = {};
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(` Created user: ${u.email} (${u.role})`);
      }
      userMap[u.email] = user;
    }

    // 4. Seed Vendors
    const vendorsData = [
      {
        name: "Dell Technologies",
        contactPerson: "Sarah Jenkins",
        email: "enterprisesupport@dell.local",
        phone: "+1-800-456-3355",
        address: "One Dell Way, Round Rock, TX",
        website: "https://dell.com",
        status: "ACTIVE",
      },
      {
        name: "Apple Enterprise",
        contactPerson: "David Miller",
        email: "business@apple.local",
        phone: "+1-800-692-7753",
        address: "One Apple Park Way, Cupertino, CA",
        website: "https://apple.com",
        status: "ACTIVE",
      },
      {
        name: "Cisco Systems",
        contactPerson: "Rachel Green",
        email: "tac@cisco.local",
        phone: "+1-800-553-2447",
        address: "170 West Tasman Dr., San Jose, CA",
        website: "https://cisco.com",
        status: "ACTIVE",
      },
    ];

    const vendorMap = {};
    for (const v of vendorsData) {
      let vendor = await Vendor.findOne({ name: v.name });
      if (!vendor) {
        vendor = await Vendor.create({ ...v, createdBy: userMap["admin@servicedesk.local"]._id });
        console.log(` Created vendor: ${v.name}`);
      }
      vendorMap[v.name] = vendor._id;
    }

    // 5. Seed Assets
    const now = new Date();
    const assetsData = [
      {
        assetTag: "SD-AST-1001",
        name: "Dell Latitude 5430",
        description: "14-inch Intel Core i7 laptop",
        category: "LAPTOP",
        serialNumber: "DELL-LAT-987654",
        manufacturer: "Dell",
        model: "Latitude 5430",
        purchaseCost: 1250,
        purchaseDate: new Date("2025-01-15"),
        warrantyExpiry: new Date("2028-01-15"),
        status: "AVAILABLE",
        location: "Floor 2 - IT Storage Room A",
        department: departmentMap["Information Technology"],
        vendor: vendorMap["Dell Technologies"],
      },
      {
        assetTag: "SD-AST-1002",
        name: "MacBook Pro 16\"",
        description: "Apple M3 Pro 36GB RAM laptop",
        category: "LAPTOP",
        serialNumber: "APPL-MBP-123456",
        manufacturer: "Apple",
        model: "MacBook Pro 16",
        purchaseCost: 2899,
        purchaseDate: new Date("2025-03-01"),
        warrantyExpiry: new Date("2027-03-01"),
        status: "ASSIGNED",
        location: "Remote / HR Office",
        department: departmentMap["Human Resources"],
        assignedTo: userMap["employee1@servicedesk.local"]._id,
        assignedDate: new Date("2025-03-05"),
        assignedBy: userMap["admin@servicedesk.local"]._id,
        vendor: vendorMap["Apple Enterprise"],
      },
      {
        assetTag: "SD-AST-1003",
        name: "Dell UltraSharp 27\" 4K",
        description: "U2723QE USB-C Hub Monitor",
        category: "MONITOR",
        serialNumber: "DELL-MON-456789",
        manufacturer: "Dell",
        model: "U2723QE",
        purchaseCost: 550,
        purchaseDate: new Date("2025-02-10"),
        warrantyExpiry: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // expires in 15 days
        status: "AVAILABLE",
        location: "Floor 2 - Desk Setup Depot",
        department: departmentMap["Information Technology"],
        vendor: vendorMap["Dell Technologies"],
      },
      {
        assetTag: "SD-AST-1004",
        name: "Cisco Catalyst 9200",
        description: "48-Port PoE+ Gigabit Network Switch",
        category: "NETWORK",
        serialNumber: "CSCO-SW-789012",
        manufacturer: "Cisco",
        model: "C9200L-48P-4G",
        purchaseCost: 3400,
        purchaseDate: new Date("2024-06-01"),
        warrantyExpiry: new Date("2029-06-01"),
        status: "AVAILABLE",
        location: "Server Room 1 - Rack B",
        department: departmentMap["Information Technology"],
        vendor: vendorMap["Cisco Systems"],
      },
    ];

    for (const a of assetsData) {
      let asset = await Asset.findOne({ assetTag: a.assetTag });
      if (!asset) {
        await Asset.create({ ...a, createdBy: userMap["admin@servicedesk.local"]._id });
        console.log(` Created asset: ${a.assetTag} (${a.name})`);
      }
    }

    // 6. Seed Knowledge Base Articles
    const articlesData = [
      {
        title: "How to reset a corporate password",
        summary: "Step-by-step instructions to securely change or reset your enterprise account password.",
        content: "To reset your corporate password:\n1. Navigate to the self-service portal (https://identity.servicedesk.local).\n2. Authenticate with your registered MFA method.\n3. Enter a new password containing at least 12 characters, including uppercase, lowercase, numbers, and symbols.\n4. Avoid reusing any of your last 5 passwords.\n5. Click Submit and wait 60 seconds for Active Directory synchronization across all services.",
        category: "PASSWORDS",
        tags: ["password", "reset", "login", "security", "credentials"],
        visibility: "PUBLIC",
        status: "PUBLISHED",
        author: userMap["admin@servicedesk.local"]._id,
        helpfulCount: 24,
        viewCount: 150,
      },
      {
        title: "VPN connection troubleshooting guide",
        summary: "Resolve common VPN gateway disconnects, timeout errors, and tunnel handshake issues.",
        content: "If your corporate VPN fails to connect:\n1. Ensure your local Wi-Fi connection is stable.\n2. Disconnect and re-open the VPN client application.\n3. Verify that your DNS servers are set to automatic DHCP.\n4. If error 809 or timeout occurs, restart your home router to clear UDP port 4500 state.\n5. If issues persist, verify your multi-factor push notification was confirmed within 30 seconds.",
        category: "VPN",
        tags: ["vpn", "network", "connection", "tunnel", "remote"],
        visibility: "PUBLIC",
        status: "PUBLISHED",
        author: userMap["tech1@servicedesk.local"]._id,
        helpfulCount: 19,
        viewCount: 120,
      },
      {
        title: "Office printer not responding or offline",
        summary: "Troubleshooting steps for network printers, paper jams, and print spooler errors.",
        content: "When experiencing printer failures:\n1. Verify the printer display shows 'Ready' with no error codes.\n2. In Windows Settings -> Printers & Scanners, verify the default queue is online.\n3. Clear stuck print jobs: Run Services.msc -> Restart 'Print Spooler'.\n4. Reconnect to the shared queue: \\\\printserver.local\\Floor2-LaserJet.\n5. If physical hardware error displays, submit a hardware ticket.",
        category: "PRINTER",
        tags: ["printer", "offline", "spooler", "paper", "hardware"],
        visibility: "PUBLIC",
        status: "PUBLISHED",
        author: userMap["tech1@servicedesk.local"]._id,
        helpfulCount: 11,
        viewCount: 85,
      },
      {
        title: "Corporate email client configuration",
        summary: "Configure Outlook and mobile mail clients with OAuth2 and modern authentication.",
        content: "To set up company email on your laptop or smartphone:\n1. Open Microsoft Outlook or your native iOS/Android Mail app.\n2. Enter your full email address (e.g. employee@servicedesk.local).\n3. Select 'Sign in with Work or School Account'.\n4. Complete the multi-factor authentication prompt.\n5. Ensure Exchange ActiveSync or IMAP over TLS is selected with server outlook.office365.com.",
        category: "EMAIL",
        tags: ["email", "outlook", "mail", "exchange", "setup"],
        visibility: "PUBLIC",
        status: "PUBLISHED",
        author: userMap["admin@servicedesk.local"]._id,
        helpfulCount: 15,
        viewCount: 95,
      },
      {
        title: "Laptop Wi-Fi connectivity and certificate troubleshooting",
        summary: "Fix Wi-Fi connection drops, 802.1X certificate errors, and roaming lag on company laptops.",
        content: "When connecting to the 'Corp-Secure-WPA3' network:\n1. Toggle Airplane Mode on for 5 seconds, then toggle off.\n2. Forget the network 'Corp-Secure-WPA3' and reconnect.\n3. Ensure EAP-TLS certificate is valid in Windows Certificate Store (Current User -> Personal).\n4. If certificate expired, connect via ethernet to pull fresh GPO certificate updates.",
        category: "NETWORK",
        tags: ["wifi", "network", "laptop", "wireless", "certificate"],
        visibility: "PUBLIC",
        status: "PUBLISHED",
        author: userMap["tech1@servicedesk.local"]._id,
        helpfulCount: 14,
        viewCount: 110,
      },
      {
        title: "Procedure for handling locked domain accounts",
        summary: "Standard operating procedure for identifying repeat lockout causes and unlocking accounts.",
        content: "Repeated account lockouts usually stem from cached credentials on mobile devices or background services.\n1. Verify active lockout in Active Directory Users & Computers.\n2. Disconnect mobile device Wi-Fi to stop stale sync queries.\n3. Check Windows Credential Manager and clear expired entries.\n4. Unlock account and test login on single workstation before re-enabling mobile sync.",
        category: "ACCOUNT_ACCESS",
        tags: ["lockout", "account", "security", "domain", "active-directory"],
        visibility: "INTERNAL",
        status: "PUBLISHED",
        author: userMap["manager@servicedesk.local"]._id,
        helpfulCount: 8,
        viewCount: 65,
      },
      {
        title: "Multi-factor authentication (MFA) troubleshooting",
        summary: "How to transfer Authenticator app to a new phone and troubleshoot missed push notifications.",
        content: "If you are not receiving MFA push notifications:\n1. Verify your mobile device has internet connectivity.\n2. Open Microsoft Authenticator and tap 'Refresh' or manually generate a 6-digit code.\n3. Check that notifications are permitted in phone system settings.\n4. If you have replaced your phone, contact the Helpdesk for a temporary 24-hour bypass code.",
        category: "SECURITY",
        tags: ["mfa", "authenticator", "2fa", "security", "phone"],
        visibility: "PUBLIC",
        status: "PUBLISHED",
        author: userMap["admin@servicedesk.local"]._id,
        helpfulCount: 22,
        viewCount: 140,
      },
      {
        title: "Approved software installation and licensing request workflow",
        summary: "Process for requesting non-standard software, license assignment, and architectural approval.",
        content: "All software installed on company assets must be approved:\n1. Check the Company Self-Service Portal for pre-approved packages.\n2. If not listed, submit a Software Request ticket including business justification.\n3. Department manager approval is required for license purchase.\n4. IT Security reviews compatibility before silent deployment via MDM.",
        category: "SOFTWARE",
        tags: ["software", "install", "license", "approval", "compliance"],
        visibility: "INTERNAL",
        status: "PUBLISHED",
        author: userMap["manager@servicedesk.local"]._id,
        helpfulCount: 9,
        viewCount: 75,
      },
      {
        title: "Recognizing and reporting phishing attempts",
        summary: "Best practices for spotting fraudulent emails and reporting suspicious messages.",
        content: "Indicators of phishing:\n1. Mismatched sender address (e.g., support@servicedesk-security.xyz instead of official domain).\n2. Artificial urgency demanding immediate action to avoid penalty.\n3. Unexpected attachments or requests to enter credentials.\n4. Action: Click the 'Report Phishing' button in Outlook immediately. Never forward suspicious attachments.",
        category: "SECURITY",
        tags: ["phishing", "email", "security", "spam", "fraud"],
        visibility: "PUBLIC",
        status: "PUBLISHED",
        author: userMap["admin@servicedesk.local"]._id,
        helpfulCount: 30,
        viewCount: 210,
      },
      {
        title: "Standard operating procedure for lost or stolen company devices",
        summary: "Immediate critical actions to report and remotely isolate lost company hardware.",
        content: "If a company laptop or smartphone is lost or stolen:\n1. Immediately report the incident by calling the 24/7 Security Hotline.\n2. Submit a Lost Asset report in ServiceDesk Pro.\n3. IT Security will initiate a remote device wipe via Intune/MDM.\n4. Passwords for all synced services will be revoked and regenerated.\n5. File a formal police report if stolen off-premises.",
        category: "HARDWARE",
        tags: ["lost", "stolen", "device", "laptop", "security", "wipe"],
        visibility: "INTERNAL",
        status: "PUBLISHED",
        author: userMap["manager@servicedesk.local"]._id,
        helpfulCount: 12,
        viewCount: 88,
      },
      {
        title: "Laptop display and external monitor troubleshooting",
        summary: "Troubleshooting steps for laptop black screen, external monitor detection, and display adapter reset.",
        content: "If your laptop screen remains black or external monitor receives no signal:\n1. Force restart: Disconnect charger, hold power button for 30 seconds, then reconnect and boot.\n2. Wake display: Press Windows Key + Ctrl + Shift + B to restart graphics driver.\n3. Test external display via HDMI or Thunderbolt to isolate LCD panel failure.\n4. Check device manager for display driver warning flags.\n5. If internal screen remains unlit while external works, submit a hardware repair request.",
        category: "HARDWARE",
        tags: ["display", "screen", "monitor", "laptop", "hdmi", "hardware", "black"],
        visibility: "PUBLIC",
        status: "PUBLISHED",
        author: userMap["tech1@servicedesk.local"]._id,
        helpfulCount: 26,
        viewCount: 180,
      },
      {
        title: "Troubleshooting operating system crashes and blue screen (BSOD) errors",
        summary: "Resolving repeated Windows BSOD stop codes, memory dumps, and corrupt update drivers.",
        content: "To diagnose and recover from BSOD crashes:\n1. Note the stop code (e.g. CRITICAL_PROCESS_DIED, DPC_WATCHDOG_VIOLATION).\n2. Boot Windows in Safe Mode with Networking.\n3. Roll back recently installed updates: Settings -> Windows Update -> Update History -> Uninstall Updates.\n4. Run system file scan: sfc /scannow in admin command prompt.\n5. If repeated blue screens persist, re-image system via IT deployment portal.",
        category: "SOFTWARE",
        tags: ["crash", "bluescreen", "bsod", "windows", "software", "reboot", "dump"],
        visibility: "PUBLIC",
        status: "PUBLISHED",
        author: userMap["tech1@servicedesk.local"]._id,
        helpfulCount: 17,
        viewCount: 115,
      },
    ];

    for (const art of articlesData) {
      let existingArticle = await Article.findOne({ title: art.title });
      if (!existingArticle) {
        const created = await Article.create({
          ...art,
          department: departmentMap["Information Technology"],
          publishedAt: new Date(),
          createdBy: art.author,
          updatedBy: art.author,
        });

        await ArticleVersion.create({
          article: created._id,
          versionNumber: 1,
          title: created.title,
          summary: created.summary,
          content: created.content,
          category: created.category,
          tags: created.tags,
          visibility: created.visibility,
          changedBy: art.author,
          changeNote: "Initial publication seed",
        });

        console.log(` Created Knowledge Article: "${art.title}" (${art.category})`);
      }
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("Demo credentials:");
    console.log(" - Admin: admin@servicedesk.local / Password@123");
    console.log(" - Manager: manager@servicedesk.local / Password@123");
    console.log(" - Asset Manager: assetmgr@servicedesk.local / Password@123");
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

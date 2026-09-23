import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import slaService from "../services/slaService.js";
import auditService from "../services/auditService.js";
import notificationService from "../services/notificationService.js";

let intervalTimer = null;
let isJobRunning = false;

export const runSlaCheck = async () => {
  if (isJobRunning) return;
  isJobRunning = true;

  try {
    const activeTickets = await Ticket.find({
      status: { $in: ["OPEN", "ASSIGNED", "IN_PROGRESS", "REOPENED"] },
    }).populate("slaPolicy");

    for (const ticket of activeTickets) {
      const newStatus = slaService.evaluateTicketSla(ticket);
      const prevStatus = ticket.slaStatus;

      // Handle SLA Breach
      if (newStatus === "BREACHED" && !ticket.slaBreached) {
        ticket.slaStatus = "BREACHED";
        ticket.slaBreached = true;

        if (!ticket.escalationTriggered) {
          ticket.escalationTriggered = true;

          // Notify managers and admin
          const notifyRoles =
            ticket.slaPolicy?.escalationNotifyRoles || ["it_manager", "system_admin"];
          const managers = await User.find({
            role: { $in: notifyRoles },
            status: "active",
          });

          for (const manager of managers) {
            await notificationService.createNotification({
              recipient: manager._id,
              type: "SLA_BREACH",
              message: `🚨 SLA BREACH: Ticket ${ticket.ticketNumber} (${ticket.priority}) has breached its resolution deadline!`,
              ticket: ticket._id,
            });
          }

          // Also notify assigned technician
          if (ticket.assignedTo) {
            await notificationService.createNotification({
              recipient: ticket.assignedTo,
              type: "SLA_BREACH",
              message: `🚨 SLA BREACH: Your assigned ticket ${ticket.ticketNumber} has breached its deadline!`,
              ticket: ticket._id,
            });
          }

          await auditService.logAction({
            entityType: "Ticket",
            entityId: ticket._id,
            action: "SLA_BREACHED",
            details: `SLA breach triggered at ${new Date().toISOString()}`,
          });

          await auditService.logAction({
            entityType: "Ticket",
            entityId: ticket._id,
            action: "ESCALATION_TRIGGERED",
            details: `Escalation alerts sent to ${managers.length} managers`,
          });
        }

        await ticket.save();
      } else if (newStatus === "APPROACHING" && prevStatus !== "APPROACHING") {
        ticket.slaStatus = "APPROACHING";

        const notifyTarget = ticket.assignedTo || ticket.createdBy;
        if (notifyTarget) {
          await notificationService.createNotification({
            recipient: notifyTarget,
            type: "SLA_WARNING",
            message: `⚠️ SLA Warning: Ticket ${ticket.ticketNumber} is approaching its deadline.`,
            ticket: ticket._id,
          });
        }

        await auditService.logAction({
          entityType: "Ticket",
          entityId: ticket._id,
          action: "SLA_WARNING",
          details: `Ticket deadline approaching within warning threshold`,
        });

        await ticket.save();
      } else if (newStatus !== prevStatus) {
        ticket.slaStatus = newStatus;
        await ticket.save();
      }
    }
  } catch (err) {
    console.error("Error running SLA escalation job:", err.message);
  } finally {
    isJobRunning = false;
  }
};

export const startSlaEscalationJob = (intervalMs = 60000) => {
  if (intervalTimer) return;
  console.log(`⏱️ SLA Escalation monitor started (interval: ${intervalMs / 1000}s)`);

  // Run initial check right away
  runSlaCheck();

  intervalTimer = setInterval(runSlaCheck, intervalMs);
};

export const stopSlaEscalationJob = () => {
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
    console.log("⏱️ SLA Escalation monitor stopped.");
  }
};

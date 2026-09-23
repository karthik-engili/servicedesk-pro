import SlaPolicy from "../models/SlaPolicy.js";
import AppError from "../utils/appError.js";

const DEFAULT_SLA_TARGETS = {
  CRITICAL: { responseTimeMinutes: 30, resolutionTimeMinutes: 240 },
  HIGH: { responseTimeMinutes: 60, resolutionTimeMinutes: 480 },
  MEDIUM: { responseTimeMinutes: 240, resolutionTimeMinutes: 1440 },
  LOW: { responseTimeMinutes: 480, resolutionTimeMinutes: 2880 },
};

export const addBusinessMinutes = (startDate, minutesToAdd) => {
  let current = new Date(startDate);
  let remainingMinutes = minutesToAdd;

  const BUSINESS_START_HOUR = 9;
  const BUSINESS_END_HOUR = 18;

  while (remainingMinutes > 0) {
    const day = current.getDay();

    if (day === 0) {
      // Sunday -> Monday 09:00
      current.setDate(current.getDate() + 1);
      current.setHours(BUSINESS_START_HOUR, 0, 0, 0);
      continue;
    }

    if (day === 6) {
      // Saturday -> Monday 09:00
      current.setDate(current.getDate() + 2);
      current.setHours(BUSINESS_START_HOUR, 0, 0, 0);
      continue;
    }

    const currentHour = current.getHours();
    const currentMin = current.getMinutes();

    if (currentHour < BUSINESS_START_HOUR) {
      current.setHours(BUSINESS_START_HOUR, 0, 0, 0);
      continue;
    }

    if (currentHour >= BUSINESS_END_HOUR) {
      current.setDate(current.getDate() + 1);
      current.setHours(BUSINESS_START_HOUR, 0, 0, 0);
      continue;
    }

    const minutesLeftToday = (BUSINESS_END_HOUR - currentHour) * 60 - currentMin;

    if (remainingMinutes <= minutesLeftToday) {
      current = new Date(current.getTime() + remainingMinutes * 60000);
      remainingMinutes = 0;
    } else {
      remainingMinutes -= minutesLeftToday;
      current.setDate(current.getDate() + 1);
      current.setHours(BUSINESS_START_HOUR, 0, 0, 0);
    }
  }

  return current;
};

class SlaService {
  async getPolicyForPriority(priority) {
    let policy = await SlaPolicy.findOne({ priority, isActive: true });
    if (!policy) {
      const defaults = DEFAULT_SLA_TARGETS[priority] || DEFAULT_SLA_TARGETS.MEDIUM;
      policy = await SlaPolicy.findOneAndUpdate(
        { priority },
        {
          name: `Default ${priority} SLA Policy`,
          priority,
          responseTimeMinutes: defaults.responseTimeMinutes,
          resolutionTimeMinutes: defaults.resolutionTimeMinutes,
          businessHoursOnly: true,
          isActive: true,
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    }
    return policy;
  }

  calculateDeadlines(policy, startTime = new Date()) {
    const { responseTimeMinutes, resolutionTimeMinutes, businessHoursOnly } = policy;

    let responseDeadline;
    let resolutionDeadline;

    if (businessHoursOnly) {
      responseDeadline = addBusinessMinutes(startTime, responseTimeMinutes);
      resolutionDeadline = addBusinessMinutes(startTime, resolutionTimeMinutes);
    } else {
      responseDeadline = new Date(startTime.getTime() + responseTimeMinutes * 60000);
      resolutionDeadline = new Date(startTime.getTime() + resolutionTimeMinutes * 60000);
    }

    return { responseDeadline, resolutionDeadline };
  }

  evaluateTicketSla(ticket) {
    const now = new Date();

    if (["RESOLVED", "CLOSED"].includes(ticket.status)) {
      if (ticket.resolvedAt && ticket.resolutionDeadline) {
        return ticket.resolvedAt <= ticket.resolutionDeadline ? "MET" : "BREACHED";
      }
      return "MET";
    }

    // Check resolution breach
    if (ticket.resolutionDeadline && now > ticket.resolutionDeadline) {
      return "BREACHED";
    }

    // Check response breach if unassigned / unresponded
    if (!ticket.respondedAt && ticket.responseDeadline && now > ticket.responseDeadline) {
      return "BREACHED";
    }

    // Check approaching status (within 25% or 60 mins of deadline)
    if (ticket.resolutionDeadline) {
      const msRemaining = ticket.resolutionDeadline.getTime() - now.getTime();
      const warningWindowMs = 60 * 60000; // 60 mins
      if (msRemaining > 0 && msRemaining <= warningWindowMs) {
        return "APPROACHING";
      }
    }

    return "WITHIN_SLA";
  }

  // Policy CRUD
  async listPolicies() {
    return SlaPolicy.find().sort({ createdAt: -1 });
  }

  async getPolicyById(id) {
    const policy = await SlaPolicy.findById(id);
    if (!policy) {
      throw new AppError("SLA Policy not found.", 404);
    }
    return policy;
  }

  async createPolicy(payload) {
    const existing = await SlaPolicy.findOne({ priority: payload.priority });
    if (existing) {
      throw new AppError(
        `An active SLA Policy for priority '${payload.priority}' already exists.`,
        409
      );
    }
    return SlaPolicy.create(payload);
  }

  async updatePolicy(id, updates) {
    const policy = await SlaPolicy.findById(id);
    if (!policy) {
      throw new AppError("SLA Policy not found.", 404);
    }

    if (updates.priority && updates.priority !== policy.priority) {
      const duplicate = await SlaPolicy.findOne({
        priority: updates.priority,
        _id: { $ne: id },
      });
      if (duplicate) {
        throw new AppError(
          `An SLA Policy for priority '${updates.priority}' already exists.`,
          409
        );
      }
      policy.priority = updates.priority;
    }

    if (updates.name !== undefined) policy.name = updates.name.trim();
    if (updates.responseTimeMinutes !== undefined)
      policy.responseTimeMinutes = updates.responseTimeMinutes;
    if (updates.resolutionTimeMinutes !== undefined)
      policy.resolutionTimeMinutes = updates.resolutionTimeMinutes;
    if (updates.businessHoursOnly !== undefined)
      policy.businessHoursOnly = updates.businessHoursOnly;
    if (updates.isActive !== undefined) policy.isActive = updates.isActive;
    if (updates.escalationNotifyRoles !== undefined)
      policy.escalationNotifyRoles = updates.escalationNotifyRoles;

    return policy.save();
  }

  async deletePolicy(id) {
    const policy = await SlaPolicy.findByIdAndDelete(id);
    if (!policy) {
      throw new AppError("SLA Policy not found.", 404);
    }
    return true;
  }
}

export default new SlaService();

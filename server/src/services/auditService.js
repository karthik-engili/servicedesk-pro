import AuditLog from "../models/AuditLog.js";

class AuditService {
  async logAction({
    entityType = "Ticket",
    entityId,
    action,
    performedBy = null,
    previousState = null,
    newState = null,
    details = "",
  }) {
    try {
      return await AuditLog.create({
        entityType,
        entityId,
        action,
        performedBy,
        previousState,
        newState,
        details,
      });
    } catch (err) {
      console.error("Failed to write audit log:", err.message);
      // Non-blocking for primary transaction
      return null;
    }
  }

  async getAuditLogs(entityId, { page = 1, limit = 50 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find({ entityId })
        .populate("performedBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments({ entityId }),
    ]);

    return { logs, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
  }
}

export default new AuditService();

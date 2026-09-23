import Notification from "../models/Notification.js";
import AppError from "../utils/appError.js";

class NotificationService {
  async createNotification({ recipient, type, message, ticket = null }) {
    try {
      if (!recipient) return null;
      return await Notification.create({
        recipient,
        type,
        message,
        ticket,
      });
    } catch (err) {
      console.error("Failed to create notification:", err.message);
      return null;
    }
  }

  async getUserNotifications(userId, { unreadOnly = false, page = 1, limit = 20 } = {}) {
    const query = { recipient: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate("ticket", "ticketNumber title status priority")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new AppError("Notification not found.", 404);
    }

    notification.isRead = true;
    await notification.save();
    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
    return true;
  }
}

export default new NotificationService();

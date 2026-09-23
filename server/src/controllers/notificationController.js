import notificationService from "../services/notificationService.js";
import { sendSuccess } from "../utils/response.js";

export const getUserNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, page, limit } = req.query;
    const result = await notificationService.getUserNotifications(req.user._id, {
      unreadOnly: unreadOnly === "true",
      page,
      limit,
    });
    return sendSuccess(res, {
      statusCode: 200,
      message: "Notifications retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Notification marked as read.",
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    return sendSuccess(res, {
      statusCode: 200,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    next(error);
  }
};

import workLogService from "../services/workLogService.js";
import { sendSuccess } from "../utils/response.js";

export const getWorkLogs = async (req, res, next) => {
  try {
    const workLogs = await workLogService.getWorkLogs(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Work logs retrieved successfully.",
      data: { workLogs },
    });
  } catch (error) {
    next(error);
  }
};

export const addWorkLog = async (req, res, next) => {
  try {
    const { description, timeSpentMinutes } = req.body;
    const workLog = await workLogService.addWorkLog(
      { ticketId: req.params.id, description, timeSpentMinutes },
      req.user
    );
    return sendSuccess(res, {
      statusCode: 201,
      message: "Work log recorded successfully.",
      data: { workLog },
    });
  } catch (error) {
    next(error);
  }
};

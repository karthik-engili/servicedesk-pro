import commentService from "../services/commentService.js";
import { sendSuccess } from "../utils/response.js";

export const getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getComments(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Comments retrieved successfully.",
      data: { comments },
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { message, isInternal } = req.body;
    const comment = await commentService.addComment(
      { ticketId: req.params.id, message, isInternal },
      req.user
    );
    return sendSuccess(res, {
      statusCode: 201,
      message: "Comment added successfully.",
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
};

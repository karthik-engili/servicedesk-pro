import aiService from "../services/ai/aiService.js";
import { sendSuccess } from "../utils/response.js";

export const analyzeTicket = async (req, res, next) => {
  try {
    const result = await aiService.analyzeTicket(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Ticket analysis completed successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const result = await aiService.getAnalysisHistory(req.params.id, req.user, req.query);
    return sendSuccess(res, {
      statusCode: 200,
      message: "AI analysis history retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const result = await aiService.getRecommendations(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Knowledge base article recommendations retrieved.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const generateSolutionDraft = async (req, res, next) => {
  try {
    const result = await aiService.generateSolutionDraft(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Troubleshooting solution draft generated.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const applyCategory = async (req, res, next) => {
  try {
    const ticket = await aiService.applyCategory(
      req.params.id,
      req.body.category,
      req.user
    );
    return sendSuccess(res, {
      statusCode: 200,
      message: "Ticket category successfully updated from AI recommendation.",
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export const applyPriority = async (req, res, next) => {
  try {
    const ticket = await aiService.applyPriority(
      req.params.id,
      req.body.priority,
      req.user
    );
    return sendSuccess(res, {
      statusCode: 200,
      message: "Ticket priority successfully updated from AI recommendation with recalculated SLA.",
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

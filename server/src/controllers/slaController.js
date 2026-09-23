import slaService from "../services/slaService.js";
import { sendSuccess } from "../utils/response.js";

export const listPolicies = async (req, res, next) => {
  try {
    const policies = await slaService.listPolicies();
    return sendSuccess(res, {
      statusCode: 200,
      message: "SLA policies retrieved successfully.",
      data: { policies },
    });
  } catch (error) {
    next(error);
  }
};

export const getPolicyById = async (req, res, next) => {
  try {
    const policy = await slaService.getPolicyById(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: "SLA policy retrieved successfully.",
      data: { policy },
    });
  } catch (error) {
    next(error);
  }
};

export const createPolicy = async (req, res, next) => {
  try {
    const policy = await slaService.createPolicy(req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "SLA policy created successfully.",
      data: { policy },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePolicy = async (req, res, next) => {
  try {
    const policy = await slaService.updatePolicy(req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "SLA policy updated successfully.",
      data: { policy },
    });
  } catch (error) {
    next(error);
  }
};

export const deletePolicy = async (req, res, next) => {
  try {
    await slaService.deletePolicy(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: "SLA policy deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

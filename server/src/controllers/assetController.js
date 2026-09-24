import assetService from "../services/assetService.js";
import { sendSuccess } from "../utils/response.js";

export const createAsset = async (req, res, next) => {
  try {
    const asset = await assetService.createAsset(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Asset created successfully.",
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

export const listAssets = async (req, res, next) => {
  try {
    const result = await assetService.listAssets(req.query, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Assets retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetSummary = async (req, res, next) => {
  try {
    const summary = await assetService.getAssetSummary(req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset summary statistics retrieved.",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpiringWarranties = async (req, res, next) => {
  try {
    const assets = await assetService.getExpiringWarranties(req.query.days, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Assets with expiring warranties retrieved.",
      data: { assets },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetById = async (req, res, next) => {
  try {
    const asset = await assetService.getAssetById(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset retrieved successfully.",
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (req, res, next) => {
  try {
    const asset = await assetService.updateAsset(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset updated successfully.",
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    await assetService.deleteAsset(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// --- Lifecycle Actions ---

export const assignAsset = async (req, res, next) => {
  try {
    const asset = await assetService.assignAsset(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset assigned successfully.",
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

export const unassignAsset = async (req, res, next) => {
  try {
    const asset = await assetService.unassignAsset(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset unassigned successfully.",
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

export const sendForRepair = async (req, res, next) => {
  try {
    const asset = await assetService.sendForRepair(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset marked as under repair.",
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

export const returnFromRepair = async (req, res, next) => {
  try {
    const asset = await assetService.returnFromRepair(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset returned from repair to available stock.",
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

export const replaceAsset = async (req, res, next) => {
  try {
    const asset = await assetService.replaceAsset(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset marked as replaced.",
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

export const retireAsset = async (req, res, next) => {
  try {
    const asset = await assetService.retireAsset(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset retired successfully.",
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

export const reportLost = async (req, res, next) => {
  try {
    const asset = await assetService.reportLost(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset reported lost. Incident recorded.",
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

export const recoverAsset = async (req, res, next) => {
  try {
    const asset = await assetService.recoverAsset(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset marked as recovered.",
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetHistory = async (req, res, next) => {
  try {
    const history = await assetService.getAssetHistory(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset lifecycle history retrieved.",
      data: { history },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetTickets = async (req, res, next) => {
  try {
    const tickets = await assetService.getAssetTickets(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Asset tickets retrieved successfully.",
      data: { tickets },
    });
  } catch (error) {
    next(error);
  }
};

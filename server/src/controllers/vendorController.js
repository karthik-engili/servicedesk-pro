import vendorService from "../services/vendorService.js";
import { sendSuccess } from "../utils/response.js";

export const createVendor = async (req, res, next) => {
  try {
    const vendor = await vendorService.createVendor(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Vendor created successfully.",
      data: { vendor },
    });
  } catch (error) {
    next(error);
  }
};

export const listVendors = async (req, res, next) => {
  try {
    const result = await vendorService.listVendors(req.query);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Vendors retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorById = async (req, res, next) => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Vendor retrieved successfully.",
      data: { vendor },
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (req, res, next) => {
  try {
    const vendor = await vendorService.updateVendor(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Vendor updated successfully.",
      data: { vendor },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVendor = async (req, res, next) => {
  try {
    await vendorService.deleteVendor(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Vendor deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

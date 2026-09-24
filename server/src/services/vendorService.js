import Vendor from "../models/Vendor.js";
import Asset from "../models/Asset.js";
import AppError from "../utils/appError.js";

class VendorService {
  async createVendor(payload, requestingUser) {
    const existing = await Vendor.findOne({
      name: { $regex: new RegExp(`^${payload.name.trim()}$`, "i") },
    });

    if (existing) {
      throw new AppError(`Vendor '${payload.name.trim()}' already exists.`, 409);
    }

    const vendor = new Vendor({
      name: payload.name.trim(),
      contactPerson: payload.contactPerson ? payload.contactPerson.trim() : "",
      email: payload.email ? payload.email.toLowerCase().trim() : null,
      phone: payload.phone ? payload.phone.trim() : "",
      address: payload.address ? payload.address.trim() : "",
      website: payload.website ? payload.website.trim() : "",
      status: payload.status || "ACTIVE",
      notes: payload.notes ? payload.notes.trim() : "",
      createdBy: requestingUser._id,
      updatedBy: requestingUser._id,
    });

    return vendor.save();
  }

  async listVendors({ search, status, page = 1, limit = 20 } = {}) {
    const query = {};

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { contactPerson: regex }, { email: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum),
      Vendor.countDocuments(query),
    ]);

    return {
      vendors,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  async getVendorById(id) {
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      throw new AppError("Vendor not found.", 404);
    }
    return vendor;
  }

  async updateVendor(id, updates, requestingUser) {
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      throw new AppError("Vendor not found.", 404);
    }

    if (updates.name && updates.name.trim().toLowerCase() !== vendor.name.toLowerCase()) {
      const existing = await Vendor.findOne({
        name: { $regex: new RegExp(`^${updates.name.trim()}$`, "i") },
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError(`Vendor '${updates.name.trim()}' already exists.`, 409);
      }
      vendor.name = updates.name.trim();
    }

    if (updates.contactPerson !== undefined) vendor.contactPerson = updates.contactPerson.trim();
    if (updates.email !== undefined) vendor.email = updates.email ? updates.email.toLowerCase().trim() : null;
    if (updates.phone !== undefined) vendor.phone = updates.phone.trim();
    if (updates.address !== undefined) vendor.address = updates.address.trim();
    if (updates.website !== undefined) vendor.website = updates.website.trim();
    if (updates.status !== undefined) vendor.status = updates.status;
    if (updates.notes !== undefined) vendor.notes = updates.notes.trim();

    vendor.updatedBy = requestingUser._id;
    return vendor.save();
  }

  async deleteVendor(id) {
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      throw new AppError("Vendor not found.", 404);
    }

    // Guard: Check if any active asset references this vendor
    const activeAssetCount = await Asset.countDocuments({
      vendor: id,
      status: { $ne: "RETIRED" },
    });

    if (activeAssetCount > 0) {
      throw new AppError(
        `Cannot delete vendor '${vendor.name}' because ${activeAssetCount} active asset(s) reference it.`,
        400
      );
    }

    await Vendor.findByIdAndDelete(id);
    return true;
  }
}

export default new VendorService();

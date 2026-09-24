import Asset from "../models/Asset.js";
import AssetHistory from "../models/AssetHistory.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Vendor from "../models/Vendor.js";
import AppError from "../utils/appError.js";
import { isValidAssetTransition } from "../utils/constants.js";
import auditService from "./auditService.js";
import notificationService from "./notificationService.js";

class AssetService {
  async createAsset(payload, requestingUser) {
    const assetTag = payload.assetTag.toUpperCase().trim();

    // Check duplicate assetTag
    const existingTag = await Asset.findOne({ assetTag });
    if (existingTag) {
      throw new AppError(`Asset with tag '${assetTag}' already exists.`, 409);
    }

    // Check duplicate serialNumber if provided
    if (payload.serialNumber && payload.serialNumber.trim()) {
      const existingSerial = await Asset.findOne({
        serialNumber: payload.serialNumber.trim(),
      });
      if (existingSerial) {
        throw new AppError(
          `Asset with serial number '${payload.serialNumber.trim()}' already exists.`,
          409
        );
      }
    }

    // Validate department
    if (payload.department) {
      const dept = await Department.findById(payload.department);
      if (!dept) throw new AppError("Referenced department not found.", 404);
    }

    // Validate vendor
    if (payload.vendor) {
      const vendor = await Vendor.findById(payload.vendor);
      if (!vendor) throw new AppError("Referenced vendor not found.", 404);
    }

    const asset = new Asset({
      assetTag,
      name: payload.name.trim(),
      description: payload.description ? payload.description.trim() : "",
      category: payload.category || "LAPTOP",
      assetType: payload.assetType ? payload.assetType.trim() : "",
      serialNumber: payload.serialNumber ? payload.serialNumber.trim() : undefined,
      manufacturer: payload.manufacturer ? payload.manufacturer.trim() : "",
      model: payload.model ? payload.model.trim() : "",
      purchaseDate: payload.purchaseDate ? new Date(payload.purchaseDate) : null,
      purchaseCost: payload.purchaseCost !== undefined ? Number(payload.purchaseCost) : 0,
      warrantyExpiry: payload.warrantyExpiry ? new Date(payload.warrantyExpiry) : null,
      status: "AVAILABLE",
      location: payload.location ? payload.location.trim() : "",
      department: payload.department || null,
      vendor: payload.vendor || null,
      notes: payload.notes ? payload.notes.trim() : "",
      createdBy: requestingUser._id,
      updatedBy: requestingUser._id,
    });

    await asset.save();

    // Record Asset History
    await AssetHistory.create({
      asset: asset._id,
      action: "CREATED",
      newStatus: "AVAILABLE",
      performedBy: requestingUser._id,
      notes: "Asset initialized in inventory",
    });

    // Record Audit Log
    await auditService.logAction({
      entityType: "Asset",
      entityId: asset._id,
      action: "ASSET_CREATED",
      performedBy: requestingUser._id,
      newState: { assetTag: asset.assetTag, status: asset.status },
      details: `Asset ${asset.assetTag} (${asset.name}) created by ${requestingUser.name}`,
    });

    return this.getAssetById(asset._id, requestingUser);
  }

  async listAssets(queryFilters = {}, requestingUser) {
    const {
      status,
      category,
      assetType,
      department,
      assignedTo,
      vendor,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryFilters;

    const query = {};

    // Scoping by role
    if (requestingUser.role === "employee") {
      // Employees only view assets assigned to them
      query.assignedTo = requestingUser._id;
    } else if (
      requestingUser.role === "asset_manager" &&
      requestingUser.department &&
      !department
    ) {
      // Optional department scoping for asset managers
      query.department = requestingUser.department;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (assetType) query.assetType = assetType;
    if (vendor) query.vendor = vendor;
    if (department && requestingUser.role !== "employee") query.department = department;
    if (assignedTo && requestingUser.role !== "employee") query.assignedTo = assignedTo;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { assetTag: regex },
        { name: regex },
        { serialNumber: regex },
        { manufacturer: regex },
        { model: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [assets, total] = await Promise.all([
      Asset.find(query)
        .populate("department", "name status")
        .populate("assignedTo", "name email role")
        .populate("vendor", "name contactPerson phone")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Asset.countDocuments(query),
    ]);

    return {
      assets,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  async getAssetById(id, requestingUser) {
    const asset = await Asset.findById(id)
      .populate("department", "name status")
      .populate("assignedTo", "name email role")
      .populate("vendor", "name contactPerson email phone")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!asset) {
      throw new AppError("Asset not found.", 404);
    }

    if (
      requestingUser.role === "employee" &&
      (!asset.assignedTo || asset.assignedTo._id.toString() !== requestingUser._id.toString())
    ) {
      throw new AppError("Access denied. You can only view assets assigned to you.", 403);
    }

    return asset;
  }

  async updateAsset(id, updates, requestingUser) {
    const asset = await Asset.findById(id);
    if (!asset) {
      throw new AppError("Asset not found.", 404);
    }

    // Role protection
    if (!["system_admin", "it_manager", "asset_manager"].includes(requestingUser.role)) {
      throw new AppError("You do not have permission to update asset records.", 403);
    }

    // Prevent direct status mutation
    if (updates.status && updates.status !== asset.status) {
      throw new AppError(
        "Direct status alteration is prohibited. Use dedicated lifecycle actions (/assign, /repair, etc.).",
        400
      );
    }

    if (updates.serialNumber && updates.serialNumber.trim() !== asset.serialNumber) {
      const duplicateSerial = await Asset.findOne({
        serialNumber: updates.serialNumber.trim(),
        _id: { $ne: id },
      });
      if (duplicateSerial) {
        throw new AppError(
          `Asset with serial number '${updates.serialNumber.trim()}' already exists.`,
          409
        );
      }
      asset.serialNumber = updates.serialNumber.trim();
    }

    if (updates.name !== undefined) asset.name = updates.name.trim();
    if (updates.description !== undefined) asset.description = updates.description.trim();
    if (updates.category !== undefined) asset.category = updates.category;
    if (updates.assetType !== undefined) asset.assetType = updates.assetType.trim();
    if (updates.manufacturer !== undefined) asset.manufacturer = updates.manufacturer.trim();
    if (updates.model !== undefined) asset.model = updates.model.trim();
    if (updates.location !== undefined) asset.location = updates.location.trim();
    if (updates.notes !== undefined) asset.notes = updates.notes.trim();
    if (updates.purchaseDate !== undefined)
      asset.purchaseDate = updates.purchaseDate ? new Date(updates.purchaseDate) : null;
    if (updates.purchaseCost !== undefined) asset.purchaseCost = Number(updates.purchaseCost);
    if (updates.warrantyExpiry !== undefined)
      asset.warrantyExpiry = updates.warrantyExpiry ? new Date(updates.warrantyExpiry) : null;
    if (updates.department !== undefined) asset.department = updates.department || null;
    if (updates.vendor !== undefined) asset.vendor = updates.vendor || null;

    asset.updatedBy = requestingUser._id;
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "UPDATED",
      previousStatus: asset.status,
      newStatus: asset.status,
      performedBy: requestingUser._id,
      notes: "Asset metadata updated",
    });

    await auditService.logAction({
      entityType: "Asset",
      entityId: asset._id,
      action: "ASSET_UPDATED",
      performedBy: requestingUser._id,
      details: `Asset ${asset.assetTag} updated by ${requestingUser.name}`,
    });

    return this.getAssetById(asset._id, requestingUser);
  }

  async deleteAsset(id, requestingUser) {
    if (requestingUser.role !== "system_admin") {
      throw new AppError("Only system administrators can delete asset records.", 403);
    }

    const asset = await Asset.findById(id);
    if (!asset) {
      throw new AppError("Asset not found.", 404);
    }

    // Check if referenced by open tickets
    const linkedTickets = await Ticket.countDocuments({
      asset: id,
      status: { $nin: ["RESOLVED", "CLOSED"] },
    });

    if (linkedTickets > 0) {
      throw new AppError(
        `Cannot delete asset ${asset.assetTag} because it is referenced by ${linkedTickets} active ticket(s).`,
        400
      );
    }

    await Asset.findByIdAndDelete(id);

    await auditService.logAction({
      entityType: "Asset",
      entityId: id,
      action: "ASSET_DELETED",
      performedBy: requestingUser._id,
      details: `Asset ${asset.assetTag} deleted by ${requestingUser.name}`,
    });

    return true;
  }

  // --- Explicit Lifecycle Actions ---

  async assignAsset(id, { assignedTo, notes = "" }, requestingUser) {
    if (!["system_admin", "it_manager", "asset_manager"].includes(requestingUser.role)) {
      throw new AppError("You do not have permission to assign assets.", 403);
    }

    const asset = await Asset.findById(id);
    if (!asset) throw new AppError("Asset not found.", 404);

    if (!isValidAssetTransition(asset.status, "ASSIGNED")) {
      throw new AppError(
        `Invalid lifecycle transition: Cannot assign an asset in '${asset.status}' state.`,
        400
      );
    }

    const targetUser = await User.findById(assignedTo);
    if (!targetUser || targetUser.status !== "active") {
      throw new AppError("Target employee user account not found or is inactive.", 404);
    }

    const previousStatus = asset.status;
    const previousAssignee = asset.assignedTo;

    asset.status = "ASSIGNED";
    asset.assignedTo = targetUser._id;
    asset.assignedDate = new Date();
    asset.assignedBy = requestingUser._id;
    asset.updatedBy = requestingUser._id;
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "ASSIGNED",
      previousStatus,
      newStatus: "ASSIGNED",
      previousAssignee,
      newAssignee: targetUser._id,
      performedBy: requestingUser._id,
      notes: notes.trim() || `Assigned to ${targetUser.name}`,
    });

    await auditService.logAction({
      entityType: "Asset",
      entityId: asset._id,
      action: "ASSET_ASSIGNED",
      performedBy: requestingUser._id,
      previousState: { status: previousStatus, assignedTo: previousAssignee },
      newState: { status: "ASSIGNED", assignedTo: targetUser._id },
      details: `Asset ${asset.assetTag} assigned to ${targetUser.name}`,
    });

    // Notify employee
    await notificationService.createNotification({
      recipient: targetUser._id,
      type: "ASSET_ASSIGNED",
      message: `You have been assigned ${asset.name} (Tag: ${asset.assetTag}).`,
    });

    return this.getAssetById(asset._id, requestingUser);
  }

  async unassignAsset(id, { notes = "" }, requestingUser) {
    if (!["system_admin", "it_manager", "asset_manager"].includes(requestingUser.role)) {
      throw new AppError("You do not have permission to unassign assets.", 403);
    }

    const asset = await Asset.findById(id);
    if (!asset) throw new AppError("Asset not found.", 404);

    if (!isValidAssetTransition(asset.status, "AVAILABLE") || asset.status !== "ASSIGNED") {
      throw new AppError(
        `Invalid lifecycle transition: Cannot unassign asset currently in '${asset.status}' state.`,
        400
      );
    }

    const previousAssignee = asset.assignedTo;

    asset.status = "AVAILABLE";
    asset.assignedTo = null;
    asset.assignedDate = null;
    asset.assignedBy = null;
    asset.updatedBy = requestingUser._id;
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "UNASSIGNED",
      previousStatus: "ASSIGNED",
      newStatus: "AVAILABLE",
      previousAssignee,
      newAssignee: null,
      performedBy: requestingUser._id,
      notes: notes.trim() || "Asset returned to available pool",
    });

    await auditService.logAction({
      entityType: "Asset",
      entityId: asset._id,
      action: "ASSET_UNASSIGNED",
      performedBy: requestingUser._id,
      details: `Asset ${asset.assetTag} unassigned`,
    });

    return this.getAssetById(asset._id, requestingUser);
  }

  async sendForRepair(id, { notes = "" }, requestingUser) {
    if (!["system_admin", "it_manager", "asset_manager", "technician"].includes(requestingUser.role)) {
      throw new AppError("You do not have permission to dispatch assets for repair.", 403);
    }

    const asset = await Asset.findById(id);
    if (!asset) throw new AppError("Asset not found.", 404);

    if (!isValidAssetTransition(asset.status, "UNDER_REPAIR")) {
      throw new AppError(
        `Invalid lifecycle transition: Cannot send asset in '${asset.status}' state for repair.`,
        400
      );
    }

    const previousStatus = asset.status;
    asset.status = "UNDER_REPAIR";
    asset.updatedBy = requestingUser._id;
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "SENT_FOR_REPAIR",
      previousStatus,
      newStatus: "UNDER_REPAIR",
      previousAssignee: asset.assignedTo,
      newAssignee: asset.assignedTo,
      performedBy: requestingUser._id,
      notes: notes.trim() || "Asset sent for maintenance/repair",
    });

    await auditService.logAction({
      entityType: "Asset",
      entityId: asset._id,
      action: "ASSET_SENT_FOR_REPAIR",
      performedBy: requestingUser._id,
      details: `Asset ${asset.assetTag} sent for repair. Reason: ${notes}`,
    });

    return this.getAssetById(asset._id, requestingUser);
  }

  async returnFromRepair(id, { notes = "" }, requestingUser) {
    if (!["system_admin", "it_manager", "asset_manager", "technician"].includes(requestingUser.role)) {
      throw new AppError("You do not have permission to return assets from repair.", 403);
    }

    const asset = await Asset.findById(id);
    if (!asset) throw new AppError("Asset not found.", 404);

    if (asset.status !== "UNDER_REPAIR") {
      throw new AppError(
        `Invalid lifecycle transition: Only assets in 'UNDER_REPAIR' can be returned (current: '${asset.status}').`,
        400
      );
    }

    asset.status = "AVAILABLE";
    asset.assignedTo = null;
    asset.assignedDate = null;
    asset.assignedBy = null;
    asset.updatedBy = requestingUser._id;
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "RETURNED_FROM_REPAIR",
      previousStatus: "UNDER_REPAIR",
      newStatus: "AVAILABLE",
      performedBy: requestingUser._id,
      notes: notes.trim() || "Repairs complete; asset returned to available inventory",
    });

    await auditService.logAction({
      entityType: "Asset",
      entityId: asset._id,
      action: "ASSET_RETURNED_FROM_REPAIR",
      performedBy: requestingUser._id,
      details: `Asset ${asset.assetTag} returned from repair`,
    });

    return this.getAssetById(asset._id, requestingUser);
  }

  async replaceAsset(id, { replacementAssetId, notes = "" }, requestingUser) {
    if (!["system_admin", "it_manager", "asset_manager"].includes(requestingUser.role)) {
      throw new AppError("You do not have permission to mark assets as replaced.", 403);
    }

    const oldAsset = await Asset.findById(id);
    if (!oldAsset) throw new AppError("Original asset not found.", 404);

    if (!isValidAssetTransition(oldAsset.status, "REPLACED")) {
      throw new AppError(
        `Invalid lifecycle transition: Cannot replace asset in '${oldAsset.status}' status.`,
        400
      );
    }

    const previousStatus = oldAsset.status;
    const previousAssignee = oldAsset.assignedTo;

    oldAsset.status = "REPLACED";
    oldAsset.assignedTo = null;
    oldAsset.assignedDate = null;
    oldAsset.updatedBy = requestingUser._id;
    await oldAsset.save();

    await AssetHistory.create({
      asset: oldAsset._id,
      action: "REPLACED",
      previousStatus,
      newStatus: "REPLACED",
      previousAssignee,
      newAssignee: null,
      performedBy: requestingUser._id,
      notes: notes.trim() || "Asset retired via replacement",
    });

    // If replacementAssetId was provided, automatically assign it to the previous owner
    if (replacementAssetId && previousAssignee) {
      const newAsset = await Asset.findById(replacementAssetId);
      if (newAsset && newAsset.status === "AVAILABLE") {
        newAsset.status = "ASSIGNED";
        newAsset.assignedTo = previousAssignee;
        newAsset.assignedDate = new Date();
        newAsset.assignedBy = requestingUser._id;
        newAsset.updatedBy = requestingUser._id;
        await newAsset.save();

        await AssetHistory.create({
          asset: newAsset._id,
          action: "ASSIGNED",
          previousStatus: "AVAILABLE",
          newStatus: "ASSIGNED",
          previousAssignee: null,
          newAssignee: previousAssignee,
          performedBy: requestingUser._id,
          notes: `Assigned as replacement for ${oldAsset.assetTag}`,
        });
      }
    }

    await auditService.logAction({
      entityType: "Asset",
      entityId: oldAsset._id,
      action: "ASSET_REPLACED",
      performedBy: requestingUser._id,
      details: `Asset ${oldAsset.assetTag} replaced. Notes: ${notes}`,
    });

    return this.getAssetById(oldAsset._id, requestingUser);
  }

  async retireAsset(id, { notes = "" }, requestingUser) {
    if (!["system_admin", "it_manager", "asset_manager"].includes(requestingUser.role)) {
      throw new AppError("You do not have permission to retire assets.", 403);
    }

    const asset = await Asset.findById(id);
    if (!asset) throw new AppError("Asset not found.", 404);

    if (!isValidAssetTransition(asset.status, "RETIRED")) {
      throw new AppError(
        `Invalid lifecycle transition: Cannot retire asset in '${asset.status}' state.`,
        400
      );
    }

    const previousStatus = asset.status;
    const previousAssignee = asset.assignedTo;

    asset.status = "RETIRED";
    asset.assignedTo = null;
    asset.assignedDate = null;
    asset.updatedBy = requestingUser._id;
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "RETIRED",
      previousStatus,
      newStatus: "RETIRED",
      previousAssignee,
      newAssignee: null,
      performedBy: requestingUser._id,
      notes: notes.trim() || "Asset reached end of life and retired",
    });

    await auditService.logAction({
      entityType: "Asset",
      entityId: asset._id,
      action: "ASSET_RETIRED",
      performedBy: requestingUser._id,
      details: `Asset ${asset.assetTag} permanently retired`,
    });

    return this.getAssetById(asset._id, requestingUser);
  }

  async reportLost(id, { notes = "" }, requestingUser) {
    const asset = await Asset.findById(id);
    if (!asset) throw new AppError("Asset not found.", 404);

    const isAssigned =
      asset.assignedTo && asset.assignedTo.toString() === requestingUser._id.toString();
    const isManager = ["system_admin", "it_manager", "asset_manager"].includes(
      requestingUser.role
    );

    if (!isAssigned && !isManager) {
      throw new AppError("You can only report an asset as lost if it is assigned to you.", 403);
    }

    if (!isValidAssetTransition(asset.status, "LOST")) {
      throw new AppError(
        `Invalid lifecycle transition: Cannot mark asset in '${asset.status}' status as lost.`,
        400
      );
    }

    const previousStatus = asset.status;
    asset.status = "LOST";
    asset.updatedBy = requestingUser._id;
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "REPORTED_LOST",
      previousStatus,
      newStatus: "LOST",
      previousAssignee: asset.assignedTo,
      newAssignee: asset.assignedTo,
      performedBy: requestingUser._id,
      notes: notes.trim() || "Asset reported lost",
    });

    await auditService.logAction({
      entityType: "Asset",
      entityId: asset._id,
      action: "ASSET_REPORTED_LOST",
      performedBy: requestingUser._id,
      details: `Asset ${asset.assetTag} reported lost. Notes: ${notes}`,
    });

    // Alert managers
    const managers = await User.find({
      role: { $in: ["system_admin", "it_manager", "asset_manager"] },
      status: "active",
    });

    for (const mgr of managers) {
      await notificationService.createNotification({
        recipient: mgr._id,
        type: "ASSET_LOST",
        message: `⚠️ Security Alert: Asset ${asset.assetTag} (${asset.name}) was reported lost!`,
      });
    }

    return this.getAssetById(asset._id, requestingUser);
  }

  async recoverAsset(id, { notes = "" }, requestingUser) {
    if (!["system_admin", "it_manager", "asset_manager"].includes(requestingUser.role)) {
      throw new AppError("You do not have permission to recover lost assets.", 403);
    }

    const asset = await Asset.findById(id);
    if (!asset) throw new AppError("Asset not found.", 404);

    if (asset.status !== "LOST") {
      throw new AppError(
        `Invalid lifecycle transition: Only assets in 'LOST' status can be recovered (current: '${asset.status}').`,
        400
      );
    }

    asset.status = "AVAILABLE";
    asset.assignedTo = null;
    asset.assignedDate = null;
    asset.assignedBy = null;
    asset.updatedBy = requestingUser._id;
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "RECOVERED",
      previousStatus: "LOST",
      newStatus: "AVAILABLE",
      performedBy: requestingUser._id,
      notes: notes.trim() || "Asset recovered and returned to available stock",
    });

    await auditService.logAction({
      entityType: "Asset",
      entityId: asset._id,
      action: "ASSET_RECOVERED",
      performedBy: requestingUser._id,
      details: `Asset ${asset.assetTag} recovered and verified`,
    });

    return this.getAssetById(asset._id, requestingUser);
  }

  // --- History & Tickets by Asset ---

  async getAssetHistory(assetId, requestingUser) {
    await this.getAssetById(assetId, requestingUser);

    return AssetHistory.find({ asset: assetId })
      .populate("performedBy", "name email role")
      .populate("previousAssignee", "name email")
      .populate("newAssignee", "name email")
      .sort({ timestamp: -1 });
  }

  async getAssetTickets(assetId, requestingUser) {
    await this.getAssetById(assetId, requestingUser);

    const query = { asset: assetId };
    if (requestingUser.role === "employee") {
      query.createdBy = requestingUser._id;
    }

    return Ticket.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("department", "name")
      .sort({ createdAt: -1 });
  }

  // --- Dashboard Summary & Warranty ---

  async getAssetSummary(requestingUser) {
    const scopeQuery = {};
    if (
      requestingUser.role === "asset_manager" &&
      requestingUser.department
    ) {
      scopeQuery.department = requestingUser.department;
    }

    const [
      totalAssets,
      available,
      assigned,
      underRepair,
      replaced,
      retired,
      lost,
      byCategory,
      byDepartment,
    ] = await Promise.all([
      Asset.countDocuments(scopeQuery),
      Asset.countDocuments({ ...scopeQuery, status: "AVAILABLE" }),
      Asset.countDocuments({ ...scopeQuery, status: "ASSIGNED" }),
      Asset.countDocuments({ ...scopeQuery, status: "UNDER_REPAIR" }),
      Asset.countDocuments({ ...scopeQuery, status: "REPLACED" }),
      Asset.countDocuments({ ...scopeQuery, status: "RETIRED" }),
      Asset.countDocuments({ ...scopeQuery, status: "LOST" }),
      Asset.aggregate([
        { $match: scopeQuery },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { category: "$_id", count: 1, _id: 0 } },
      ]),
      Asset.aggregate([
        { $match: scopeQuery },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "_id",
            as: "dept",
          },
        },
        {
          $project: {
            department: {
              $ifNull: [{ $arrayElemAt: ["$dept.name", 0] }, "Unassigned"],
            },
            count: 1,
            _id: 0,
          },
        },
      ]),
    ]);

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const warrantyExpiringSoon = await Asset.countDocuments({
      ...scopeQuery,
      status: { $nin: ["RETIRED", "REPLACED"] },
      warrantyExpiry: { $gte: now, $lte: thirtyDaysFromNow },
    });

    return {
      totalAssets,
      available,
      assigned,
      underRepair,
      replaced,
      retired,
      lost,
      assetsByCategory: byCategory,
      assetsByDepartment: byDepartment,
      warrantyExpiringSoon,
    };
  }

  async getExpiringWarranties(days = 30, requestingUser) {
    const scopeQuery = { status: { $nin: ["RETIRED", "REPLACED"] } };
    if (
      requestingUser.role === "asset_manager" &&
      requestingUser.department
    ) {
      scopeQuery.department = requestingUser.department;
    }

    const now = new Date();
    const daysNum = Math.max(1, parseInt(days, 10) || 30);
    const targetDate = new Date(now.getTime() + daysNum * 24 * 60 * 60 * 1000);

    return Asset.find({
      ...scopeQuery,
      warrantyExpiry: { $lte: targetDate },
    })
      .populate("department", "name")
      .populate("vendor", "name contactPerson phone")
      .populate("assignedTo", "name email")
      .sort({ warrantyExpiry: 1 });
  }
}

export default new AssetService();

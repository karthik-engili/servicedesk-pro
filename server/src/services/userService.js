import User from "../models/User.js";
import AppError from "../utils/appError.js";

class UserService {
  async listUsers({ role, department, status, search, page = 1, limit = 20 } = {}) {
    const query = {};

    if (role) {
      query.role = role;
    }

    if (department) {
      query.department = department;
    }

    if (status) {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { email: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate("department", "name status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  async getUserById(id) {
    const user = await User.findById(id).populate("department", "name status");
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    return user;
  }

  async updateUser(id, updates, requestingUser) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    // Role modification requires system_admin
    if (updates.role && updates.role !== user.role) {
      if (requestingUser.role !== "system_admin") {
        throw new AppError("Only system administrators can modify user roles.", 403);
      }
      user.role = updates.role;
    }

    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.status !== undefined) user.status = updates.status;
    if (updates.department !== undefined) user.department = updates.department || null;
    if (updates.isEmailVerified !== undefined && requestingUser.role === "system_admin") {
      user.isEmailVerified = updates.isEmailVerified;
    }

    await user.save();
    return User.findById(user._id).populate("department", "name status");
  }
}

export default new UserService();

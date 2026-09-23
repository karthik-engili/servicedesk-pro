import bcrypt from "bcryptjs";
import User, { USER_ROLES } from "../models/User.js";
import Department from "../models/Department.js";
import AppError from "../utils/appError.js";
import { generateTokens, verifyRefreshToken } from "../utils/token.js";

class AuthService {
  async register({ name, email, password, department, role }, requestingUser = null) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError("An account with this email address already exists.", 409);
    }

    // Role-based protection: only system_admin can assign non-employee roles
    let assignedRole = "employee";
    if (role && USER_ROLES.includes(role)) {
      if (requestingUser && requestingUser.role === "system_admin") {
        assignedRole = role;
      } else if (role !== "employee") {
        throw new AppError(
          "Public registration cannot assign privileged roles. Contact a system admin.",
          403
        );
      }
    }

    let assignedDepartment = null;
    if (department) {
      const deptExists = await Department.findById(department);
      if (!deptExists) {
        throw new AppError("Specified department does not exist.", 400);
      }
      assignedDepartment = deptExists._id;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      department: assignedDepartment,
      status: "active",
      isEmailVerified: false,
    });

    const tokens = generateTokens(newUser);
    newUser.refreshToken = tokens.refreshToken;
    await newUser.save();

    const populatedUser = await User.findById(newUser._id).populate(
      "department",
      "name status"
    );

    return {
      user: populatedUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail })
      .select("+passwordHash +refreshToken")
      .populate("department", "name status");

    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password.", 401);
    }

    if (user.status !== "active") {
      throw new AppError(`Account is ${user.status}. Access denied.`, 403);
    }

    const tokens = generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(refreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new AppError("Invalid or expired refresh token. Please log in again.", 401);
    }

    const user = await User.findById(decoded.id)
      .select("+refreshToken")
      .populate("department", "name status");

    if (!user) {
      throw new AppError("User account no longer exists.", 401);
    }

    if (user.status !== "active") {
      throw new AppError(`Account is ${user.status}.`, 403);
    }

    if (user.refreshToken !== refreshToken) {
      throw new AppError("Invalid refresh token. Token has been revoked or rotated.", 401);
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return true;
  }

  async getMe(userId) {
    const user = await User.findById(userId).populate("department", "name status");
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    return user;
  }
}

export default new AuthService();

import Department from "../models/Department.js";
import AppError from "../utils/appError.js";

class DepartmentService {
  async listDepartments({ status = "active" } = {}) {
    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    return Department.find(query).sort({ name: 1 });
  }

  async getDepartmentById(id) {
    const department = await Department.findById(id);
    if (!department) {
      throw new AppError("Department not found.", 404);
    }
    return department;
  }

  async createDepartment({ name, description = "", status = "active" }) {
    const existing = await Department.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existing) {
      throw new AppError(`Department with name '${name.trim()}' already exists.`, 409);
    }

    const department = new Department({
      name: name.trim(),
      description: description ? description.trim() : "",
      status,
    });

    return department.save();
  }

  async updateDepartment(id, updates) {
    const department = await Department.findById(id);
    if (!department) {
      throw new AppError("Department not found.", 404);
    }

    if (updates.name && updates.name.trim().toLowerCase() !== department.name.toLowerCase()) {
      const existing = await Department.findOne({
        name: { $regex: new RegExp(`^${updates.name.trim()}$`, "i") },
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError(`Department '${updates.name.trim()}' already exists.`, 409);
      }
      department.name = updates.name.trim();
    }

    if (updates.description !== undefined) {
      department.description = updates.description.trim();
    }

    if (updates.status !== undefined) {
      department.status = updates.status;
    }

    return department.save();
  }
}

export default new DepartmentService();

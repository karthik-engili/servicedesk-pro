import departmentService from "../services/departmentService.js";
import { sendSuccess } from "../utils/response.js";

export const listDepartments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const departments = await departmentService.listDepartments({ status });

    return sendSuccess(res, {
      statusCode: 200,
      message: "Departments retrieved successfully.",
      data: { departments },
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Department retrieved successfully.",
      data: { department },
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(req.body);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Department created successfully.",
      data: { department },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.updateDepartment(
      req.params.id,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Department updated successfully.",
      data: { department },
    });
  } catch (error) {
    next(error);
  }
};

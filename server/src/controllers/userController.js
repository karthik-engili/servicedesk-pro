import userService from "../services/userService.js";
import { sendSuccess } from "../utils/response.js";

export const listUsers = async (req, res, next) => {
  try {
    const { role, department, status, search, page, limit } = req.query;
    const result = await userService.listUsers({
      role,
      department,
      status,
      search,
      page,
      limit,
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: "Users retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    return sendSuccess(res, {
      statusCode: 200,
      message: "User retrieved successfully.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUser(
      req.params.id,
      req.body,
      req.user
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "User updated successfully.",
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

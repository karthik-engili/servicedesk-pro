import authService from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, department, role } = req.body;
    const requestingUser = req.user || null;

    const result = await authService.register(
      { name, email, password, department, role },
      requestingUser
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: "User registered successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    return sendSuccess(res, {
      statusCode: 200,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const result = await authService.refresh(token);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Tokens refreshed successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);

    return sendSuccess(res, {
      statusCode: 200,
      message: "User profile retrieved successfully.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

import jwt from "jsonwebtoken"
import { verifyToken, generateToken } from "../../utils/token/index.js"
import { Token } from "../../DB/model/token.model.js"

export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    fn(req, res, next).catch((error) => next(error));
  };
};

export const globalErrorHandler = async (error, req, res, next) => {
  res.status(error.cause || 500).json({
    message: error.message || "Internal Server Error",
    success: false,
    stack: error.stack,
    error
  });
};
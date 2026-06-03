import { NextFunction, Request, Response } from "express";
import { ApiError } from "../infrastructure/apiError";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    code: "ROUTE_NOT_FOUND",
    title: "Route not found",
    message: "Route not found",
    detail: `${req.method} ${req.originalUrl} does not exist`,
  });
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("API ERROR:", err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      status: err.status,
      code: err.code,
      title: err.message,
      message: err.message,
      detail: err.detail,
      errors: err.errors,
    });
  }

  return res.status(500).json({
    status: 500,
    code: "INTERNAL_ERROR",
    title: "Server error",
    message: "Server error",
    detail: "Unexpected backend error. Check backend console for details.",
  });
};

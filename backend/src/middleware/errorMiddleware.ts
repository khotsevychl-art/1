import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: any;

  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  console.log("🔥 REAL ERROR:", err);

  if (err.message === "NOT_FOUND") {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Resource not found"
      }
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Server error"
    }
  });
};
import { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError";

function mapSqliteError(error: any): AppError | undefined {
  if (!error || typeof error.message !== "string") return undefined;

  if (error.message.includes("SQLITE_CONSTRAINT_UNIQUE")) {
    return new AppError(409, "CONFLICT", "Unique constraint violation", error.message);
  }

  if (error.message.includes("SQLITE_CONSTRAINT_FOREIGNKEY")) {
    return new AppError(409, "CONFLICT", "Foreign key constraint violation", error.message);
  }

  if (error.message.includes("SQLITE_CONSTRAINT_CHECK") || error.message.includes("SQLITE_CONSTRAINT_NOTNULL")) {
    return new AppError(400, "VALIDATION_ERROR", "Invalid request", error.message);
  }

  return undefined;
}

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const sqliteError = mapSqliteError(error);
  const appError = error instanceof AppError ? error : sqliteError;

  if (appError) {
    res.status(appError.statusCode).json({
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details
      }
    });
    return;
  }

  console.error("[ERROR]", error);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error"
    }
  });
};

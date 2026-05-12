import { Request, Response, NextFunction } from "express";
import { courses } from "../store/courses.store";
import { notes } from "../store/notes.store";

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

export const validateNote = (req: Request, res: Response, next: NextFunction) => {
  const { courseId, title, note } = req.body;
  const errors = [];

  if (!courseId) errors.push({ field: "courseId", message: "required" });
  if (!courses.some(c => c.id === courseId))
    errors.push({ field: "courseId", message: "invalid" });

  if (!title || title.length < 3)
    errors.push({ field: "title", message: "min 3 chars" });

  if (!note || note.length < 5)
    errors.push({ field: "note", message: "min 5 chars" });

  const duplicate = notes.find(
  n => n.note.toLowerCase() === note.toLowerCase()
);

  if (duplicate) {
    errors.push({
      field: "note",
      message: "duplicate content"
    });
  }
  if (errors.length) {
    return next(new ApiError(400, "VALIDATION_ERROR", "Invalid data", errors));
  }

  next();
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.message === "NOT_FOUND") {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Resource not found" }
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details }
    });
  }

  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Server error" }
  });
};
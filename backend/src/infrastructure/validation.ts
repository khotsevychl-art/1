import { NextFunction, Request, Response } from "express";
import { ApiError } from "./apiError";

export const validateNote = (req: Request, res: Response, next: NextFunction) => {
  const { courseId, title, note } = req.body;
  const errors = [];

  if (!courseId) errors.push({ field: "courseId", message: "required" });

  if (!title || title.length < 3)
    errors.push({ field: "title", message: "min 3 chars" });

  if (!note || note.length < 5)
    errors.push({ field: "note", message: "min 5 chars" });

  if (errors.length) {
    return next(new ApiError(400, "VALIDATION_ERROR", "Invalid data", errors));
  }

  next();
};
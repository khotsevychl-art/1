import { NextFunction, Request, Response } from "express";
import { ApiError } from "./apiError";

const addError = (
  errors: Record<string, string[]>,
  field: string,
  message: string
) => {
  errors[field] = [...(errors[field] ?? []), message];
};

const validateText = (
  errors: Record<string, string[]>,
  field: string,
  value: unknown,
  min: number,
  max: number,
  required = true
) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    if (required) addError(errors, field, "Поле обов'язкове");
    return;
  }

  const text = String(value).trim();
  if (text.length < min) addError(errors, field, `Мінімум ${min} символи`);
  if (text.length > max) addError(errors, field, `Максимум ${max} символів`);
};

export const validateNote = (req: Request, res: Response, next: NextFunction) => {
  const errors: Record<string, string[]> = {};

  // userId is not trusted from body: owner is taken from X-Demo-UserId on backend.
  validateText(errors, "userId", req.body.userId, 1, 50, false);
  validateText(errors, "courseId", req.body.courseId, 1, 50);
  validateText(errors, "title", req.body.title, 3, 80);
  validateText(errors, "note", req.body.note, 5, 1000);

  if (Object.keys(errors).length > 0) {
    return next(
      new ApiError(
        400,
        "VALIDATION_ERROR",
        "Invalid data",
        "Some fields are incorrect",
        errors
      )
    );
  }

  req.body = {
    ...(req.body.userId !== undefined ? { userId: String(req.body.userId).trim() } : {}),
    courseId: String(req.body.courseId).trim(),
    title: String(req.body.title).trim(),
    note: String(req.body.note).trim(),
  };

  next();
};

export const validatePartialNote = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors: Record<string, string[]> = {};
  const allowedFields = ["userId", "courseId", "title", "note"]; // userId is accepted for compatibility, but backend does not trust it for ownership
  const dto: Record<string, string> = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) dto[field] = String(req.body[field]).trim();
  }

  if (Object.keys(dto).length === 0) {
    return next(
      new ApiError(
        400,
        "VALIDATION_ERROR",
        "Invalid data",
        "Provide at least one field to update",
        { body: ["Потрібно передати хоча б одне поле"] }
      )
    );
  }

  validateText(errors, "userId", dto.userId, 1, 50, false);
  validateText(errors, "courseId", dto.courseId, 1, 50, false);
  validateText(errors, "title", dto.title, 3, 80, false);
  validateText(errors, "note", dto.note, 5, 1000, false);

  if (Object.keys(errors).length > 0) {
    return next(
      new ApiError(
        400,
        "VALIDATION_ERROR",
        "Invalid data",
        "Some fields are incorrect",
        errors
      )
    );
  }

  req.body = dto;
  next();
};

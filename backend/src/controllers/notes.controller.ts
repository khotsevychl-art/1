import { Request, Response, NextFunction } from "express";
import { NotesService } from "../services/notes.service";
import { CreateNoteDto, UpdateNoteDto } from "../domain/note.dto";

const service = new NotesService();

export const getNotes = (req: Request, res: Response) => {
  const courseId = req.query.courseId as string | undefined;

  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;

  const sortBy = (req.query.sortBy as "title" | "createdAt") || "createdAt";
  const sortDir = (req.query.sortDir as "asc" | "desc") || "desc";

  res.json(service.getAll(courseId, page, pageSize, sortBy, sortDir));
};

export const getNote = (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const note = service.getById(req.params.id);
  if (!note) return next(new Error("NOT_FOUND"));
  res.json(note);
};

export const createNote = (
  req: Request<{}, {}, CreateNoteDto>,
  res: Response
) => {
  const note = service.create(req.body);
  res.status(201).json(note);
};

export const updateNote = (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const note = service.update(req.params.id, req.body);

  if (!note) return next(new Error("NOT_FOUND"));

  res.json(note);
};

export const deleteNote = (
  req: Request<{ id: string }>,
  res: Response
) => {
  service.delete(req.params.id);
  res.status(204).send();
};
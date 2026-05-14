import { Request, Response, NextFunction } from "express";
import { NotesService } from "../services/notes.service";

const service = new NotesService();

export const getNotes = async (req: Request, res: Response) => {
  const data = await service.getAll(
    req.query.courseId as string,
    req.query.sort as string
  );

  res.json({ data });
};

export const getNote = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const data = await service.getById(req.params.id);

  if (!data) return next(new Error("NOT_FOUND"));

  res.json({ data });
};
export const createNote = async (req: Request, res: Response) => {
  const data = await service.create(req.body);
  res.status(201).json({ data });
};

export const updateNote = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const data = await service.update(req.params.id, req.body);
  res.json({ data });
};

export const deleteNote = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  await service.delete(req.params.id);
  res.status(204).send();
};

export const getNotesWithRelations = async (req: Request, res: Response) => {
  const data = await service.getWithRelations();
  res.json({ data });
};

export const getNotesStats = async (req: Request, res: Response) => {
  const data = await service.getStats();
  res.json({ data });
};
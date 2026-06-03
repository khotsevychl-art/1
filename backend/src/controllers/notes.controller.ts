import { Request, Response } from "express";
import { NotesService } from "../services/notes.service";
import { NotesQueryDto } from "../domain/note.dto";

const service = new NotesService();

export const getNotes = async (req: Request, res: Response) => {
  const query: NotesQueryDto & Record<string, any> = {
    courseId: req.query.courseId as string | undefined,
    userId: req.query.userId as string | undefined,
    search: (req.query.search ?? req.query.q) as string | undefined,
    sortBy: (req.query.sortBy ?? req.query.sort) as NotesQueryDto["sortBy"],
    sortDir: (req.query.sortDir ?? req.query.order) as NotesQueryDto["sortDir"],
    page: Number(req.query.page ?? 1),
    pageSize: Number(req.query.pageSize ?? 10),
  };

  const result = await service.getAll(query);

  res.json({
    data: result.items,
    items: result.items,
    meta: {
      total: result.total,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
    },
  });
};

export const getNote = async (req: Request<{ id: string }>, res: Response) => {
  const data = await service.getById(req.params.id);
  res.json({ data, item: data });
};

export const createNote = async (req: Request, res: Response) => {
  const data = await service.create(req.body);
  res.status(201).json({ data, item: data });
};

export const updateNote = async (req: Request<{ id: string }>, res: Response) => {
  const data = await service.update(req.params.id, req.body);
  res.json({ data, item: data });
};

export const deleteNote = async (req: Request<{ id: string }>, res: Response) => {
  await service.delete(req.params.id);
  res.status(204).send();
};

export const getNotesWithRelations = async (req: Request, res: Response) => {
  const data = await service.getWithRelations(req.query);
  res.json({ data, items: data });
};

export const searchTeachingDemo = async (req: Request, res: Response) => {
  const data = await service.searchTeachingDemo(req.query);
  res.json({ data, items: data });
};

export const getNotesStats = async (req: Request, res: Response) => {
  const data = await service.getStats();
  res.json({ data, items: data });
};

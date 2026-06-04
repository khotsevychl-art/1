import { Request, Response } from "express";
import { NotesService } from "../services/notes.service";
import { NotesQueryDto } from "../domain/note.dto";
import { ApiError } from "../infrastructure/apiError";
import { RequestWithUser } from "../middleware/demoAuth";

const service = new NotesService();
const allowedSort = new Set(["title", "createdAt", "courseId"]);
const allowedDir = new Set(["asc", "desc"]);

function getCurrentUserId(req: Request) {
  return (req as RequestWithUser).currentUserId;
}

function buildQuery(req: Request): NotesQueryDto & Record<string, any> {
  const sortBy = (req.query.sortBy ?? req.query.sort) as string | undefined;
  const sortDir = (req.query.sortDir ?? req.query.order) as string | undefined;

  if (sortBy && !allowedSort.has(sortBy)) {
    throw new ApiError(400, "INVALID_SORT", "Invalid sortBy", "sortBy must be one of: title, createdAt, courseId", {
      sortBy: ["Дозволено тільки title, createdAt або courseId"],
    });
  }

  if (sortDir && !allowedDir.has(String(sortDir).toLowerCase())) {
    throw new ApiError(400, "INVALID_SORT_DIR", "Invalid sortDir", "sortDir must be asc or desc", {
      sortDir: ["Дозволено тільки asc або desc"],
    });
  }

  return {
    courseId: req.query.courseId as string | undefined,
    search: (req.query.search ?? req.query.q) as string | undefined,
    sortBy: sortBy as NotesQueryDto["sortBy"],
    sortDir: String(sortDir ?? "desc").toLowerCase() as NotesQueryDto["sortDir"],
    page: Number(req.query.page ?? 1),
    pageSize: Number(req.query.pageSize ?? 10),
  };
}

export const getNotes = async (req: Request, res: Response) => {
  const query = buildQuery(req);
  const result = await service.getAll(query, getCurrentUserId(req));

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
  const data = await service.getById(req.params.id, getCurrentUserId(req));
  res.json({ data, item: data });
};

export const createNote = async (req: Request, res: Response) => {
  const data = await service.create(req.body, getCurrentUserId(req));
  res.status(201).json({ data, item: data });
};

export const updateNote = async (req: Request<{ id: string }>, res: Response) => {
  const data = await service.update(req.params.id, req.body, getCurrentUserId(req));
  res.json({ data, item: data });
};

export const deleteNote = async (req: Request<{ id: string }>, res: Response) => {
  await service.delete(req.params.id, getCurrentUserId(req));
  res.status(204).send();
};

export const getNotesWithRelations = async (req: Request, res: Response) => {
  const data = await service.getWithRelations(getCurrentUserId(req), req.query);
  res.json({ data, items: data });
};

export const searchTeachingDemo = async (req: Request, res: Response) => {
  const data = await service.searchTeachingDemo(getCurrentUserId(req), req.query);
  res.json({ data, items: data });
};

export const getNotesStats = async (req: Request, res: Response) => {
  const data = await service.getStats(getCurrentUserId(req));
  res.json({ data, items: data });
};

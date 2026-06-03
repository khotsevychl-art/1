import { Request, Response } from "express";
import { CoursesService } from "../services/courses.service";

const service = new CoursesService();

export const getCourses = async (req: Request, res: Response) => {
  const data = await service.getAll(req.query);
  res.json({ data });
};

export const getCourse = async (req: Request<{ id: string }>, res: Response) => {
  const data = await service.getById(req.params.id);
  res.json({ data });
};

export const createCourse = async (req: Request, res: Response) => {
  const data = await service.create(req.body);
  res.status(201).json({ data });
};

export const updateCourse = async (req: Request<{ id: string }>, res: Response) => {
  const data = await service.update(req.params.id, req.body);
  res.json({ data });
};

export const patchCourse = async (req: Request<{ id: string }>, res: Response) => {
  const data = await service.patch(req.params.id, req.body);
  res.json({ data });
};

export const deleteCourse = async (req: Request<{ id: string }>, res: Response) => {
  await service.delete(req.params.id);
  res.status(204).send();
};

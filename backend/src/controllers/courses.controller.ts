import { Request, Response } from "express";
import { CoursesService } from "../services/courses.service";

const service = new CoursesService();

export const getCourses = async (req: Request, res: Response) => {
  const data = await service.getAll();
  res.json({ data });
};
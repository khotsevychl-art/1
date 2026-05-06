import { Request, Response } from "express";
import { courses } from "../store/courses.store";

export const getCourses = (req: Request, res: Response) => {
  res.json({ items: courses });
};
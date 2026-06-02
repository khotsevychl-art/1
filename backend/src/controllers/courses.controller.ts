import { NextFunction, Request, Response } from "express";
import { CoursesService } from "../services/courses.service";

const coursesService = new CoursesService();

export class CoursesController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await coursesService.getAll(req.query);
      res.json({ items });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await coursesService.getById(req.params.id);
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await coursesService.create(req.body);
      res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await coursesService.update(req.params.id, req.body);
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await coursesService.patch(req.params.id, req.body);
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await coursesService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

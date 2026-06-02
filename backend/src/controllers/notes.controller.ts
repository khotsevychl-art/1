import { NextFunction, Request, Response } from "express";
import { NotesService } from "../services/notes.service";

const notesService = new NotesService();

export class NotesController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await notesService.getAll(req.query);
      res.json({ items });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await notesService.getById(req.params.id);
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await notesService.create(req.body);
      res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await notesService.update(req.params.id, req.body);
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await notesService.patch(req.params.id, req.body);
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await notesService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getWithRelations(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await notesService.getWithRelations(req.query);
      res.json({ items });
    } catch (error) {
      next(error);
    }
  }

  async searchTeachingDemo(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await notesService.searchTeachingDemo(req.query);
      res.json({ items });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await notesService.getStats();
      res.json({ items });
    } catch (error) {
      next(error);
    }
  }
}

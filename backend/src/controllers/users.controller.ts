import { NextFunction, Request, Response } from "express";
import { UsersService } from "../services/users.service";

const usersService = new UsersService();

export class UsersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await usersService.getAll(req.query);
      res.json({ items });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await usersService.getById(req.params.id);
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await usersService.create(req.body);
      res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await usersService.update(req.params.id, req.body);
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await usersService.patch(req.params.id, req.body);
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

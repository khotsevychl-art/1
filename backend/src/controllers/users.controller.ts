import { Request, Response } from "express";
import { UsersService } from "../services/users.service";

const service = new UsersService();

export const getUsers = (req: Request, res: Response) => {
  res.json({ items: service.getAll() });
};

export const createUser = (req: Request, res: Response) => {
  const user = service.create(req.body);
  res.status(201).json(user);
};
import { Request, Response } from "express";
import { UsersService } from "../services/users.service";

const service = new UsersService();

export const getUsers = async (req: Request, res: Response) => {
  const data = await service.getAll();
  res.json({ data });
};

export const createUser = async (req: Request, res: Response) => {
  const data = await service.create(req.body);
  res.status(201).json({ data });
};
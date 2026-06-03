import { Request, Response } from "express";
import { UsersService } from "../services/users.service";

const service = new UsersService();

export const getUsers = async (req: Request, res: Response) => {
  const data = await service.getAll(req.query);
  res.json({ data });
};

export const getUser = async (req: Request<{ id: string }>, res: Response) => {
  const data = await service.getById(req.params.id);
  res.json({ data });
};

export const createUser = async (req: Request, res: Response) => {
  const data = await service.create(req.body);
  res.status(201).json({ data });
};

export const updateUser = async (req: Request<{ id: string }>, res: Response) => {
  const data = await service.update(req.params.id, req.body);
  res.json({ data });
};

export const patchUser = async (req: Request<{ id: string }>, res: Response) => {
  const data = await service.patch(req.params.id, req.body);
  res.json({ data });
};

export const deleteUser = async (req: Request<{ id: string }>, res: Response) => {
  await service.delete(req.params.id);
  res.status(204).send();
};

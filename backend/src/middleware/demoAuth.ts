import { NextFunction, Request, Response } from "express";
import { ApiError } from "../infrastructure/apiError";
import { UsersStore } from "../store/users.store";

const usersStore = new UsersStore();

export type RequestWithUser = Request & {
  currentUserId: string;
};

export const demoAuth = async (req: Request, res: Response, next: NextFunction) => {
  const headerValue = req.header("X-Demo-UserId");
  const userId = typeof headerValue === "string" ? headerValue.trim() : "";

  if (!userId) {
    throw new ApiError(401, "UNAUTHORIZED", "Unauthorized", "Header X-Demo-UserId is required");
  }

  if (userId.length > 80 || /[\s'";]/.test(userId)) {
    throw new ApiError(401, "UNAUTHORIZED", "Unauthorized", "Header X-Demo-UserId is invalid");
  }

  const user = await usersStore.getById(userId);
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Unauthorized", "User from X-Demo-UserId does not exist");
  }

  (req as RequestWithUser).currentUserId = user.id;
  next();
};

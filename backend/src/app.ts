import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import coursesRoutes from "./routes/courses.routes";
import notesRoutes from "./routes/notes.routes";
import usersRoutes from "./routes/users.routes";
import { AppError } from "./errors/AppError";
import { errorMiddleware } from "./middleware/error.middleware";
import { loggerMiddleware } from "./middleware/logger.middleware";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/notes", notesRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/users", usersRoutes);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, "NOT_FOUND", "Route not found"));
});

app.use(errorMiddleware);

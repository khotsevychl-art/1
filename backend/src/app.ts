import express from "express";

import usersRoutes from "./routes/users.routes";

import notesRoutes from "./routes/notes.routes";

import coursesRoutes from "./routes/courses.routes";

import { errorHandler } from "./middleware/errorMiddleware";

const app = express();

app.use(express.json());

app.use("/api/users", usersRoutes);

app.use("/api/notes", notesRoutes);

app.use("/api/courses", coursesRoutes);

app.use(errorHandler);

export default app;
import express from "express";

import usersRoutes from "./routes/users.routes";
import notesRoutes from "./routes/notes.routes";
import coursesRoutes from "./routes/courses.routes";
import { corsMiddleware } from "./infrastructure/cors";
import { errorHandler, notFound } from "./middleware/errorMiddleware";

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.json({ data: { status: "ok", apiVersion: "v1" } });
});

app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/courses", coursesRoutes);

// Legacy aliases залишені тільки щоб старі запити не падали під час перевірки.
app.use("/api/users", usersRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/courses", coursesRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

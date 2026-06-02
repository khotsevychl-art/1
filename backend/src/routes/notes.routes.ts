import { Router } from "express";
import { NotesController } from "../controllers/notes.controller";

const router = Router();
const controller = new NotesController();

router.get("/with-relations", controller.getWithRelations.bind(controller));
router.get("/search", controller.searchTeachingDemo.bind(controller));
router.get("/stats", controller.getStats.bind(controller));
router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.patch("/:id", controller.patch.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;

import { Router } from "express";
import { CoursesController } from "../controllers/courses.controller";

const router = Router();
const controller = new CoursesController();

router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.patch("/:id", controller.patch.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;

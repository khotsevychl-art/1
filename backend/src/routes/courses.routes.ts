import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getCourse,
  getCourses,
  patchCourse,
  updateCourse,
} from "../controllers/courses.controller";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getCourses));
router.get("/:id", asyncHandler(getCourse));
router.post("/", asyncHandler(createCourse));
router.put("/:id", asyncHandler(updateCourse));
router.patch("/:id", asyncHandler(patchCourse));
router.delete("/:id", asyncHandler(deleteCourse));

export default router;

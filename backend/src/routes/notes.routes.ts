import { Router } from "express";
import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  getNotesStats,
  getNotesWithRelations,
  searchTeachingDemo,
  updateNote,
} from "../controllers/notes.controller";
import { validateNote, validatePartialNote } from "../infrastructure/validation";
import { asyncHandler } from "../middleware/asyncHandler";
import { demoAuth } from "../middleware/demoAuth";

const router = Router();

router.use(asyncHandler(demoAuth));

router.get("/relations", asyncHandler(getNotesWithRelations));
router.get("/with-relations", asyncHandler(getNotesWithRelations));
router.get("/search", asyncHandler(searchTeachingDemo));
router.get("/stats", asyncHandler(getNotesStats));
router.get("/", asyncHandler(getNotes));
router.get("/:id", asyncHandler(getNote));
router.post("/", validateNote, asyncHandler(createNote));
router.put("/:id", validateNote, asyncHandler(updateNote));
router.patch("/:id", validatePartialNote, asyncHandler(updateNote));
router.delete("/:id", asyncHandler(deleteNote));

export default router;

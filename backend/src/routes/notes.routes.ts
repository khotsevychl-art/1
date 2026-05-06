import { Router } from "express";
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
} from "../controllers/notes.controller";
import { validateNote } from "../infrastructure/validation";

const router = Router();

router.get("/", getNotes);
router.get("/:id", getNote);
router.post("/", validateNote, createNote);
router.put("/:id", validateNote, updateNote);
router.delete("/:id", deleteNote);

export default router;
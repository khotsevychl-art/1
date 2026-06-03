import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  patchUser,
  updateUser,
} from "../controllers/users.controller";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getUsers));
router.get("/:id", asyncHandler(getUser));
router.post("/", asyncHandler(createUser));
router.put("/:id", asyncHandler(updateUser));
router.patch("/:id", asyncHandler(patchUser));
router.delete("/:id", asyncHandler(deleteUser));

export default router;

import { Router } from "express";
import * as noteController from "../controllers/note.controller";
import { validateCreateNote, validateTagName } from "../middleware/validate.middleware";

const router = Router();

router.post("/", validateCreateNote, noteController.createNote);
router.get("/", noteController.getAllNotes);
router.get("/:id", noteController.getNoteById);
router.delete("/:id", noteController.deleteNote);
router.patch("/:id/favorite", noteController.toggleFavorite);
router.post("/:id/tags", validateTagName, noteController.addTagToNote);

export default router;

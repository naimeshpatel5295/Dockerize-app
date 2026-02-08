import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as noteService from "../services/note.service";

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const { title, content } = req.body as { title: string; content: string };
  const note = await noteService.createNote(title.trim(), content.trim());
  res.status(201).json(note);
});

export const getAllNotes = asyncHandler(async (_req: Request, res: Response) => {
  const notes = await noteService.getAllNotes();
  res.status(200).json(notes);
});

export const getNoteById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const note = await noteService.getNoteById(id);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.status(200).json(note);
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const note = await noteService.getNoteById(id);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  await noteService.deleteNote(id);
  res.status(204).send();
});

export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const note = await noteService.toggleFavorite(id);
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.status(200).json(note);
});

import { Request, Response, NextFunction } from "express";

export const validateCreateNote = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, content } = req.body as Record<string, unknown>;

  const errors: string[] = [];

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("title is required");
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    errors.push("content is required");
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: "Not Found" });
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err.stack);

  const statusCode = "statusCode" in err ? (err as Error & { statusCode: number }).statusCode : 500;
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
  });
};

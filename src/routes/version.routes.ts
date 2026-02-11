import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    version: process.env.APP_ENV || "blue",
    deployedAt: new Date().toISOString()
  });
});

export default router;

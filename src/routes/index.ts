import { Router } from "express";
import healthRoutes from "./health.routes";
import noteRoutes from "./note.routes";
import versionRoutes from "./version.routes";


const router = Router();

// Health routes
router.use("/health", healthRoutes);
// Notes routes
router.use("/notes", noteRoutes);
// Blue-Green demo endpoint
router.use("/version", versionRoutes);


export default router;

import express from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "../controllers/projectController.js";
import { isAdminRoute, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protectRoute, getProjects);
router.get("/:id", protectRoute, getProject);
router.post("/create", protectRoute, isAdminRoute, createProject);
router.put("/update/:id", protectRoute, isAdminRoute, updateProject);
router.delete("/:id", protectRoute, isAdminRoute, deleteProject);

export default router;
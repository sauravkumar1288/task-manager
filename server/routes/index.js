import express from "express";
import projectRoutes from "./projectRoute.js";
import taskRoutes from "./taskRoute.js";
import userRoutes from "./userRoute.js";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/task", taskRoutes);
router.use("/project", projectRoutes);

export default router;
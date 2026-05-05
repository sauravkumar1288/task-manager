import asyncHandler from "express-async-handler";
import Project from "../models/projectModel.js";

// POST - Create a new project (Admin only)
const createProject = asyncHandler(async (req, res) => {
  const { name, description, members } = req.body;
  const { userId } = req.user;

  if (!name) {
    return res.status(400).json({ status: false, message: "Project name is required" });
  }

  const project = await Project.create({
    name,
    description,
    owner: userId,
    members: members || [],
  });

  res.status(201).json({ status: true, project, message: "Project created successfully." });
});

// GET - Get all projects
const getProjects = asyncHandler(async (req, res) => {
  const { userId, isAdmin } = req.user;

  const projects = isAdmin
    ? await Project.find({ isActive: true })
        .populate("owner", "name email")
        .populate("members", "name email")
        .sort({ _id: -1 })
    : await Project.find({ isActive: true, members: userId })
        .populate("owner", "name email")
        .populate("members", "name email")
        .sort({ _id: -1 });

  res.status(200).json({ status: true, projects });
});

// GET - Get single project
const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate("owner", "name email")
    .populate("members", "name email title role")
    .populate({
      path: "tasks",
      populate: { path: "team", select: "name email" },
    });

  if (!project) {
    return res.status(404).json({ status: false, message: "Project not found" });
  }

  res.status(200).json({ status: true, project });
});

// PUT - Update project (Admin only)
const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, members } = req.body;

  if (!name) {
    return res.status(400).json({ status: false, message: "Project name is required" });
  }

  const project = await Project.findById(id);

  if (!project) {
    return res.status(404).json({ status: false, message: "Project not found" });
  }

  project.name = name;
  project.description = description || project.description;
  project.members = members || project.members;

  await project.save();

  res.status(200).json({ status: true, message: "Project updated successfully." });
});

// DELETE - Delete project (Admin only)
const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);

  if (!project) {
    return res.status(404).json({ status: false, message: "Project not found" });
  }

  project.isActive = false;
  await project.save();

  res.status(200).json({ status: true, message: "Project deleted successfully." });
});

export { createProject, deleteProject, getProject, getProjects, updateProject };
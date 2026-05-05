import asyncHandler from "express-async-handler";
import Notice from "../models/notis.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

const createTask = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, team, stage, date, priority, assets, links, description } =
      req.body;

    // Validation
    if (!title || !team || !stage || !date || !priority) {
      return res.status(400).json({ status: false, message: "All fields are required: title, team, stage, date, priority" });
    }

    let text = "New task has been assigned to you";
    if (team?.length > 1) {
      text = text + ` and ${team?.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${priority} priority, so check and act accordingly. The task date is ${new Date(
        date
      ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };
    let newLinks = null;

    if (links) {
      newLinks = links?.split(",");
    }

    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: activity,
      links: newLinks || [],
      description,
    });

    await Notice.create({
      team,
      text,
      task: task._id,
    });

    const users = await User.find({ _id: team });

    if (users) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        await User.findByIdAndUpdate(user._id, { $push: { tasks: task._id } });
      }
    }

    res.status(200).json({ status: true, task, message: "Task created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

// BUG FIXED: was using undefined variable "team.team" instead of "task.team"
const duplicateTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    let text = "New task has been assigned to you";
    if (task.team?.length > 1) {
      text = text + ` and ${task.team?.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${task.priority} priority, so check and act accordingly. The task date is ${new Date(
        task.date
      ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const newTask = await Task.create({
      title: "Duplicate - " + task.title,
      team: task.team,
      subTasks: task.subTasks,
      assets: task.assets,
      links: task.links,
      priority: task.priority,
      stage: task.stage,
      activities: [activity],
      description: task.description,
      date: task.date,
    });

    await Notice.create({
      team: newTask.team,
      text,
      task: newTask._id,
    });

    res.status(200).json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, date, team, stage, priority, assets, links, description } =
    req.body;

  // Validation
  if (!title || !stage || !priority) {
    return res.status(400).json({ status: false, message: "Title, stage and priority are required" });
  }

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    let newLinks = [];
    if (links) {
      newLinks = links.split(",");
    }

    task.title = title;
    task.date = date;
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;
    task.links = newLinks;
    task.description = description;

    await task.save();

    // BUG FIXED: was saying "Task duplicated" instead of "Task updated"
    res.status(200).json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateTaskStage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ status: false, message: "Stage is required" });
    }

    const task = await Task.findById(id);
    task.stage = stage.toLowerCase();
    await task.save();

    res.status(200).json({ status: true, message: "Task stage changed successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateSubTaskStage = asyncHandler(async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { status } = req.body;

    await Task.findOneAndUpdate(
      { _id: taskId, "subTasks._id": subTaskId },
      { $set: { "subTasks.$.isCompleted": status } }
    );

    res.status(200).json({
      status: true,
      message: status ? "Task has been marked completed" : "Task has been marked uncompleted",
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title, tag, date } = req.body;
  const { id } = req.params;

  if (!title) {
    return res.status(400).json({ status: false, message: "Sub-task title is required" });
  }

  try {
    const newSubTask = { title, date, tag, isCompleted: false };
    const task = await Task.findById(id);
    task.subTasks.push(newSubTask);
    await task.save();

    res.status(200).json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const getTasks = asyncHandler(async (req, res) => {
  const { userId, isAdmin } = req.user;
  const { stage, isTrashed, search } = req.query;

  let query = { isTrashed: isTrashed ? true : false };

  if (!isAdmin) {
    query.team = { $all: [userId] };
  }
  if (stage) {
    query.stage = stage;
  }

  if (search) {
    const searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { stage: { $regex: search, $options: "i" } },
        { priority: { $regex: search, $options: "i" } },
      ],
    };
    query = { ...query, ...searchQuery };
  }

  const tasks = await Task.find(query)
    .populate({ path: "team", select: "name title email" })
    .sort({ _id: -1 });

  res.status(200).json({ status: true, tasks });
});

const getTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({ path: "team", select: "name title role email" })
      .populate({ path: "activities.by", select: "name" });

    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    res.status(200).json({ status: true, task });
  } catch (error) {
    throw new Error("Failed to fetch task: " + error.message);
  }
});

const postTaskActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { type, activity } = req.body;

  if (!type || !activity) {
    return res.status(400).json({ status: false, message: "Activity type and description are required" });
  }

  try {
    const task = await Task.findById(id);
    task.activities.push({ type, activity, by: userId });
    await task.save();

    res.status(200).json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const trashTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    task.isTrashed = true;
    await task.save();

    res.status(200).json({ status: true, message: "Task trashed successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const deleteRestoreTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);
      resp.isTrashed = false;
      resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany({ isTrashed: true }, { $set: { isTrashed: false } });
    }

    res.status(200).json({ status: true, message: "Operation performed successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const dashboardStatistics = asyncHandler(async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    const now = new Date();

    const allTasks = isAdmin
      ? await Task.find({ isTrashed: false })
          .populate({ path: "team", select: "name role title email" })
          .sort({ _id: -1 })
      : await Task.find({ isTrashed: false, team: { $all: [userId] } })
          .populate({ path: "team", select: "name role title email" })
          .sort({ _id: -1 });

    const users = await User.find({ isActive: true })
      .select("name title role isActive createdAt")
      .limit(10)
      .sort({ _id: -1 });

    const groupedTasks = allTasks?.reduce((result, task) => {
      const stage = task.stage;
      result[stage] = (result[stage] || 0) + 1;
      return result;
    }, {});

    const graphData = Object.entries(
      allTasks?.reduce((result, task) => {
        const { priority } = task;
        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const totalTasks = allTasks.length;
    const last10Task = allTasks?.slice(0, 10);

    // ADDED: overdue tasks — tasks not completed and date has passed
    const overdueTasks = allTasks.filter(
      (task) =>
        task.stage !== "completed" &&
        task.date &&
        new Date(task.date) < now
    );

    const summary = {
      totalTasks,
      last10Task,
      users: isAdmin ? users : [],
      tasks: groupedTasks,
      graphData,
      overdueCount: overdueTasks.length,
      overdueTasks: overdueTasks.slice(0, 5),
    };

    res.status(200).json({ status: true, ...summary, message: "Successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

export {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateSubTaskStage,
  updateTask,
  updateTaskStage,
};
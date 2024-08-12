const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
mongoose
  .connect("mongodb://localhost:27017/todoapp")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
});

const Task = mongoose.model("Task", taskSchema);
app.post("/tasks", async (req, res) => {
  console.log("Received POST /tasks request:", req.body);
  const { title, dueDate, priority, tags } = req.body;
  const newTask = new Task({
    title,
    dueDate,
    priority,
    tags: tags || [],
  });
  try {
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Error saving task:", err);
    res.status(400).json({ message: err.message });
  }
});

app.get("/tasks", async (req, res) => {
  const { sortBy, filterByPriority, filterByDate, tags } = req.query;
  try {
    let query = {};

    if (filterByPriority) {
      query.priority = filterByPriority;
    }

    if (filterByDate) {
      query.dueDate = new Date(filterByDate);
    }

    if (tags) {
      query.tags = { $all: tags.split(",") };
    }

    let tasks = await Task.find(query);

    if (sortBy === "priority") {
      tasks = tasks.sort((a, b) => a.priority - b.priority);
    } else if (sortBy === "dueDate") {
      tasks = tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      task.completed = true;
      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const { title, dueDate, priority, tags } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, dueDate, priority, tags },
      { new: true, runValidators: true }
    );
    if (updatedTask) {
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (task) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

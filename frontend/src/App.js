import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: "",
    priority: 1,
    tags: "",
  });
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3001/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    try {
      const dueDateObject = new Date(newTask.dueDate);
      if (isNaN(dueDateObject.getTime())) {
        throw new Error("Invalid due date");
      }

      const formattedDueDate = dueDateObject.toISOString();

      const response = await axios.post("http://localhost:3001/tasks", {
        title: newTask.title,
        dueDate: formattedDueDate,
        priority: newTask.priority,
        tags: newTask.tags.split(","),
      });

      setTasks([...tasks, response.data]);
      setNewTask({ title: "", dueDate: "", priority: 1, tags: "" });
    } catch (error) {
      console.error("Error adding task:", error.message);
    }
  };

  const updateTask = async () => {
    try {
      const dueDateObject = new Date(newTask.dueDate);
      if (isNaN(dueDateObject.getTime())) {
        throw new Error("Invalid due date");
      }

      const formattedDueDate = dueDateObject.toISOString();

      const response = await axios.put(
        `http://localhost:3001/tasks/${editingTask._id}`,
        {
          title: newTask.title,
          dueDate: formattedDueDate,
          priority: newTask.priority,
          tags: newTask.tags.split(","),
        }
      );

      setTasks(
        tasks.map((task) =>
          task._id === editingTask._id ? response.data : task
        )
      );
      setNewTask({ title: "", dueDate: "", priority: 1, tags: "" });
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error.message);
    }
  };

  const markTaskCompleted = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:3001/tasks/${id}`);
      setTasks(tasks.map((task) => (task._id === id ? response.data : task)));
    } catch (error) {
      console.error("Error marking task as completed:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      dueDate: new Date(task.dueDate).toISOString().split("T")[0],
      priority: task.priority,
      tags: task.tags.join(","),
    });
  };

  return (
    <div className="App">
      <h1>To-Do List</h1>
      <div>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <input
          type="date"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
        />
        <input
          type="number"
          placeholder="Priority"
          value={newTask.priority}
          onChange={(e) =>
            setNewTask({ ...newTask, priority: parseInt(e.target.value) })
          }
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={newTask.tags}
          onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
        />
        {editingTask ? (
          <button onClick={updateTask}>Update Task</button>
        ) : (
          <button onClick={addTask}>Add Task</button>
        )}
        {editingTask && (
          <button onClick={() => setEditingTask(null)}>Cancel</button>
        )}
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <span
              style={{
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.title} - {new Date(task.dueDate).toLocaleDateString()} -
              Priority: {task.priority}
            </span>
            <button onClick={() => markTaskCompleted(task._id)}>
              {task.completed ? "Completed" : "Mark as Completed"}
            </button>
            <button onClick={() => handleEditClick(task)}>Edit</button>
            <button onClick={() => deleteTask(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

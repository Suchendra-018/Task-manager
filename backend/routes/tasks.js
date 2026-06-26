const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Get tasks for user
router.get('/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.username }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task
router.post('/tasks', auth, async (req, res) => {
  try {
    const { text, dueDate } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Task text is required' });
    }

    const task = new Task({

    user:req.user.username,

    text:text.trim(),

    dueDate: dueDate || null

});

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task
router.put('/tasks/:id', auth, async (req, res) => {
  try {
      const { text, completed, dueDate } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.username },
      {
    text,
    completed,
    dueDate
}
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.username });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear completed tasks
router.post('/tasks/clear-completed', auth, async (req, res) => {
  try {
    await Task.deleteMany({ user: req.user.username, completed: true });
    res.json({ message: 'Completed tasks cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

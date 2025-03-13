
// routes/projects.js
const express = require('express');
const Project = require('../models/projects');
const router = express.Router();

// Get all projects, sorted by createdAt
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort('createdAt');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Save a new project
router.post('/', async (req, res) => {
  try {
    // Ensure createdAt is properly formatted
    const projectData = {
      ...req.body,
      createdAt: new Date(req.body.createdAt)
    };
    
    const newProject = new Project(projectData);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error saving project:', error);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    // If createdAt is provided in the update, ensure it's a proper Date
    const updateData = { ...req.body };
    if (updateData.createdAt) {
      updateData.createdAt = new Date(updateData.createdAt);
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
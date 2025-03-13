// routes/modelTemplates.js
const express = require('express');
const router = express.Router();
const ModelTemplate = require('../models/ModelTemplate');

// Get all model templates
router.get('/', async (req, res) => {
  try {
    const templates = await ModelTemplate.find({ active: true });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single model template by model number
router.get('/:modelNumber', async (req, res) => {
  try {
    const template = await ModelTemplate.findOne({ 
      modelNumber: req.params.modelNumber,
      active: true 
    });
    if (!template) {
      return res.status(404).json({ message: 'Model not found' });
    }
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new model template
router.post('/', async (req, res) => {
  const template = new ModelTemplate({
    modelNumber: req.body.modelNumber,
    operationTimes: req.body.operationTimes
  });

  try {
    const newTemplate = await template.save();
    res.status(201).json(newTemplate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update model template
router.patch('/:modelNumber', async (req, res) => {
  try {
    const template = await ModelTemplate.findOne({ modelNumber: req.params.modelNumber });
    if (!template) {
      return res.status(404).json({ message: 'Model not found' });
    }

    if (req.body.operationTimes) {
      template.operationTimes = req.body.operationTimes;
    }

    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
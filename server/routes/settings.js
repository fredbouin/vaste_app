// routes/settings.js
const express = require('express');
const router = express.Router();
const CalculatorSettings = require('../models/CalculatorSettings');

router.post('/', async (req, res) => {
  try {
    const settingsData = req.body;
    let settings = await CalculatorSettings.findOne({});
    if (settings) {
      settings = await CalculatorSettings.findOneAndUpdate({}, settingsData, { new: true });
    } else {
      settings = new CalculatorSettings(settingsData);
      await settings.save();
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
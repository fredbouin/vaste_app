// routes/priceSheet.js
const express = require('express');
const router = express.Router();
const PriceSheet = require('../models/priceSheet');
const { calculatePricing } = require('../services/calculationService'); // Import the centralized calculation function

// GET all price sheet entries
router.get('/', async (req, res) => {
  try {
    const entries = await PriceSheet.find();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price sheet entries', details: error.message });
  }
});

// POST a new price sheet entry
router.post('/', async (req, res) => {
  try {
    const { id, _id, ...entryData } = req.body;
    const newEntry = new PriceSheet(entryData);
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save price sheet entry', details: error.message });
  }
});

// PUT to update an existing price sheet entry
router.put('/:id', async (req, res) => {
  try {
    const { id, _id, ...updateData } = req.body;
    const updatedEntry = await PriceSheet.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!updatedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update price sheet entry', details: error.message });
  }
});

// DELETE a price sheet entry
router.delete('/:id', async (req, res) => {
  try {
    const deletedEntry = await PriceSheet.findByIdAndDelete(req.params.id);
    if (!deletedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete price sheet entry', details: error.message });
  }
});

// *** REFACTORED AND CORRECTED SYNC ENDPOINT ***
router.post('/:id/sync', async (req, res) => {
  try {
    const { currentSettings } = req.body;
    if (!currentSettings) {
      return res.status(400).json({ error: 'Current settings not provided' });
    }

    const entry = await PriceSheet.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Prepare data for the calculation service
    const itemData = {
      labor: {},
      materials: entry.details.materials,
      cnc: entry.details.cnc,
      details: {
        components: entry.details.components
      }
    };
    
    // Reconstruct the labor data in the format the calculation service expects
    if (entry.details.labor && entry.details.labor.breakdown) {
      for (const item of entry.details.labor.breakdown) {
        if (item.type !== 'Labor Surcharge') {
          let key = item.type.replace(/\s+/g, '');
          key = key.charAt(0).toLowerCase() + key.slice(1);
          if (key === 'stockProduction') key = 'stockProduction';
          if (key === 'cNC Operator') key = 'cncOperator';
          itemData.labor[key] = {
            hours: item.hours,
            rate: item.rate
          };
        }
      }
    }
    
    // Use the centralized calculation service
    const results = calculatePricing(itemData, currentSettings);

    // Update the entry with the new, correct calculations
    const updatedEntry = await PriceSheet.findByIdAndUpdate(
      req.params.id,
      {
        cost: results.totals.cost,
        'details.labor': results.labor,
        'details.materials': results.materials,
        'details.cnc': results.cnc,
        'details.overhead': results.overhead,
        'details.components': results.components,
        lastSyncedSettings: currentSettings
      },
      { new: true }
    );

    res.json(updatedEntry);
  } catch (error) {
    console.error('Error syncing price sheet entry:', error);
    res.status(500).json({ 
      error: 'Failed to sync price sheet entry',
      details: error.message 
    });
  }
});

module.exports = router;
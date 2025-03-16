// routes/priceSheet.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PriceSheet = require('../models/priceSheet');
const CalculatorSettings = require('../models/CalculatorSettings');

console.log('Price Sheet Routes loaded');

// GET all price sheet entries
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all price sheet entries');
    const entries = await PriceSheet.find();
    console.log(`Found ${entries.length} entries`);
    res.json(entries);
  } catch (error) {
    console.error('Error fetching price sheet entries:', error);
    res.status(500).json({ 
      error: 'Failed to fetch price sheet entries',
      details: error.message 
    });
  }
});

// GET a single price sheet entry by id
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching price sheet entry:', req.params.id);
    const entry = await PriceSheet.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (error) {
    console.error('Error fetching price sheet entry:', error);
    res.status(500).json({ 
      error: 'Failed to fetch price sheet entry',
      details: error.message 
    });
  }
});

// POST a new price sheet entry
router.post('/', async (req, res) => {
  try {
    console.log('Received new price sheet data:', JSON.stringify(req.body, null, 2));
    
    // Remove client-generated id if present
    const { id, _id, ...entryData } = req.body;
    
    // Process components data if present
    // if (entryData.details && entryData.details.components) {
    //   console.log('Components format check:');
    //   console.log('- Is array?', Array.isArray(entryData.details.components));
    //   console.log('- Length:', entryData.details.components.length);
      
    //   if (entryData.details.components.length > 0) {
    //     console.log('- First component type:', typeof entryData.details.components[0]);
        
    //     // If components are strings, try to parse them as JSON
    //     if (typeof entryData.details.components[0] === 'string') {
    //       console.log('Components are strings, attempting to parse as JSON');
    //       try {
    //         entryData.details.components = entryData.details.components.map(comp => {
    //           try {
    //             return JSON.parse(comp);
    //           } catch (e) {
    //             console.error('Failed to parse component string:', comp);
    //             return comp;
    //           }
    //         });
    //       } catch (e) {
    //         console.error('Error parsing component strings:', e);
    //       }
    //     }
        
    //     // Ensure all component objects have the right structure
    //     console.log('Normalizing component objects');
    //     entryData.details.components = entryData.details.components.map(component => {
    //       if (typeof component === 'object' && component !== null) {
    //         return {
    //           id: component.id || component._id || String(Date.now()),
    //           name: component.name || component.componentName || 'Unnamed',
    //           type: component.type || component.componentType || 'unknown',
    //           cost: Number(component.cost) || 0,
    //           quantity: Number(component.quantity) || 1
    //         };
    //       }
    //       return component;
    //     });
    //   }
    // }

    // Process components data if present
if (entryData.details && entryData.details.components) {
  console.log('Components format check:');
  console.log('- Is array?', Array.isArray(entryData.details.components));
  console.log('- Length:', entryData.details.components.length);
  
  if (!Array.isArray(entryData.details.components)) {
    console.error('Components is not an array, setting to empty array');
    entryData.details.components = [];
  } else if (entryData.details.components.length > 0) {
    console.log('- First component type:', typeof entryData.details.components[0]);
    
    // // Ensure all component objects have the right structure
    // entryData.details.components = entryData.details.components.map(component => {
    //   // Handle string case (could be stringified JSON)
    //   if (typeof component === 'string') {
    //     try {
    //       component = JSON.parse(component);
    //     } catch (e) {
    //       console.error('Failed to parse component string:', component);
    //       // Create a placeholder component instead of failing
    //       return {
    //         id: String(Date.now()),
    //         name: 'Parsing Error',
    //         type: 'unknown',
    //         cost: 0,
    //         quantity: 1
    //       };
    //     }
    //   }
      
    //   // Ensure component is an object
    //   if (typeof component !== 'object' || component === null) {
    //     console.error('Invalid component format:', component);
    //     return {
    //       id: String(Date.now()),
    //         name: 'Invalid Format',
    //         type: 'unknown',
    //         cost: 0,
    //         quantity: 1
    //     };
    //   }
      
    //   // Return properly formatted component
    //   return {
    //     id: component.id || component._id || String(Date.now()),
    //     name: component.name || component.componentName || 'Unnamed',
    //     type: component.type || component.componentType || 'unknown',
    //     cost: Number(component.cost) || 0,
    //     quantity: Number(component.quantity) || 1
    //   };
    // });
    // Ensure all component objects have the right structure
entryData.details.components = entryData.details.components.map(component => {
  // Handle string case (could be stringified JSON)
  if (typeof component === 'string') {
    try {
      component = JSON.parse(component);
    } catch (e) {
      console.error('Failed to parse component string:', component);
      return {
        id: String(Date.now()),
        name: 'Parsing Error',
        type: 'unknown',
        cost: 0,
        quantity: 1
      };
    }
  }
  
  // Ensure component is an object
  if (typeof component !== 'object' || component === null) {
    console.error('Invalid component format:', component);
    return {
      id: String(Date.now()),
      name: 'Invalid Format',
      type: 'unknown',
      cost: 0,
      quantity: 1
    };
  }
  
  // Return properly formatted component with explicit type conversions
  return {
    id: String(component.id || component._id || Date.now()),
    name: String(component.name || component.componentName || 'Unnamed'),
    type: String(component.type || component.componentType || 'unknown'),
    cost: Number(component.cost || 0),
    quantity: Number(component.quantity || 1)
  };
});
  }
}
    
    console.log('Creating new PriceSheet document with data:', JSON.stringify(entryData, null, 2));
    const newEntry = new PriceSheet(entryData);
    
    const savedEntry = await newEntry.save();
    console.log('Successfully saved entry with ID:', savedEntry._id);
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error('Failed to save price sheet entry:', error);
    
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    
    console.error('Full error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to save price sheet entry',
      details: error.message,
      validationErrors: error.errors
    });
  }
});

// PUT to update an existing price sheet entry
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating price sheet entry:', req.params.id);
    console.log('Update data:', JSON.stringify(req.body, null, 2));
    
    // Remove client-generated id and _id from update data
    const { id, _id, ...updateData } = req.body;
    
    // Process components data if present
    if (updateData.details && updateData.details.components) {
      console.log('Processing components for update');
      
      // If components are strings, try to parse them as JSON
      if (updateData.details.components.length > 0 && 
          typeof updateData.details.components[0] === 'string') {
        try {
          updateData.details.components = updateData.details.components.map(comp => {
            try {
              return JSON.parse(comp);
            } catch (e) {
              return comp;
            }
          });
        } catch (e) {
          console.error('Error parsing component strings:', e);
        }
      }
      
      // Ensure all component objects have the right structure
      updateData.details.components = updateData.details.components.map(component => {
        if (typeof component === 'object' && component !== null) {
          return {
            id: component.id || component._id || String(Date.now()),
            name: component.name || component.componentName || 'Unnamed',
            type: component.type || component.componentType || 'unknown',
            cost: Number(component.cost) || 0,
            quantity: Number(component.quantity) || 1
          };
        }
        return component;
      });
    }
    
    const updatedEntry = await PriceSheet.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    console.log('Successfully updated entry');
    res.json(updatedEntry);
  } catch (error) {
    console.error('Failed to update price sheet entry:', error);
    
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    
    res.status(500).json({ 
      error: 'Failed to update price sheet entry',
      details: error.message,
      validationErrors: error.errors
    });
  }
});

// DELETE a price sheet entry
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting price sheet entry:', req.params.id);
    const deletedEntry = await PriceSheet.findByIdAndDelete(req.params.id);
    if (!deletedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    console.log('Successfully deleted entry');
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Failed to delete price sheet entry:', error);
    res.status(500).json({ 
      error: 'Failed to delete price sheet entry',
      details: error.message 
    });
  }
});

// SYNC endpoint to update pricing based on current settings
router.post('/:id/sync', async (req, res) => {
  try {
    console.log('Syncing price sheet entry:', req.params.id);
    const { currentSettings, isComponent } = req.body;
    
    if (!currentSettings) {
      return res.status(400).json({ error: 'Current settings not provided' });
    }

    const entry = await PriceSheet.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    // ============================
    // Recalculate Labor Breakdown
    // ============================
    let newLaborBreakdown = entry.details.labor.breakdown
      .filter(item => item.type !== 'Labor Surcharge')
      .map(item => {
        let newRate;
        switch (item.type) {
          case 'Stock Production':
            newRate = Number(currentSettings.labor.stockProduction.rate);
            break;
          case 'CNC Operator':
            newRate = Number(currentSettings.labor.cncOperator.rate);
            break;
          case 'Assembly':
            newRate = Number(currentSettings.labor.assembly.rate);
            break;
          case 'Finishing':
            newRate = Number(currentSettings.labor.finishing.rate);
            break;
          case 'Upholstery':
            newRate = Number(currentSettings.labor.upholstery.rate);
            break;
          default:
            newRate = Number(item.rate);
        }
        const hours = Number(item.hours) || 0;
        return {
          type: item.type,
          hours,
          rate: newRate,
          cost: hours * newRate
        };
      });
      
    // Calculate base labor cost
    const baseLaborCost = newLaborBreakdown.reduce((sum, item) => sum + item.cost, 0);
    
    // Calculate labor surcharge
    const surchargePercent = Number(currentSettings.labor.extraFee) || 0;
    const surchargeCost = baseLaborCost * (surchargePercent / 100);
    
    // Add surcharge to breakdown if applicable
    if (surchargePercent > 0) {
      newLaborBreakdown.push({
        type: 'Labor Surcharge',
        hours: 0,
        rate: 0,
        cost: surchargeCost,
        detail: `${surchargePercent}% surcharge`
      });
    }
    
    // ==============================
    // Process Wood Materials
    // ==============================
    // Convert Mongoose documents to plain objects
    const woodEntries = [];
    if (entry.details?.materials?.wood && entry.details.materials.wood.length > 0) {
      for (let i = 0; i < entry.details.materials.wood.length; i++) {
        const woodDoc = entry.details.materials.wood[i];
        // Extract actual data - could be in _doc, toObject(), or directly in the object
        let woodData;
        if (woodDoc._doc) {
          woodData = woodDoc._doc;
        } else if (typeof woodDoc.toObject === 'function') {
          woodData = woodDoc.toObject();
        } else {
          woodData = woodDoc;
        }
        
        // Log what we're working with for debugging
        console.log(`Processing wood entry ${i}:`, JSON.stringify(woodData, null, 2));
        
        woodEntries.push({
          species: woodData.species,
          thickness: woodData.thickness,
          boardFeet: Number(woodData.boardFeet) || 0,
          cost: Number(woodData.cost) || 0,
          _id: woodData._id
        });
      }
    }
    
    console.log('Extracted wood entries:', JSON.stringify(woodEntries, null, 2));
    
    // Create updated wood entries with proper costs
    const updatedWoodEntries = woodEntries.map(wood => {
      // Skip entries without species or thickness info
      if (!wood.species || !wood.thickness) {
        console.log('Preserving wood entry without species/thickness:', wood);
        return wood;
      }
      
      const speciesSettings = currentSettings.materials?.wood?.[wood.species];
      if (!speciesSettings) {
        console.log(`Species ${wood.species} not found in settings, preserving original cost:`, wood.cost);
        return wood;
      }
      
      const thicknessSettings = speciesSettings[wood.thickness];
      if (!thicknessSettings) {
        console.log(`Thickness ${wood.thickness} not found for species ${wood.species}, preserving original cost:`, wood.cost);
        return wood;
      }
      
      // We have found matching settings, get the cost
      const newCost = Number(thicknessSettings.cost);
      if (isNaN(newCost)) {
        console.log(`Invalid cost in settings for ${wood.species}/${wood.thickness}, preserving original cost:`, wood.cost);
        return wood;
      }
      
      console.log(`Updating cost for ${wood.species}/${wood.thickness} from ${wood.cost} to ${newCost}`);
      return {
        ...wood,
        cost: newCost
      };
    });
    
    // Calculate all wood costs with proper logging
    const woodBaseCost = updatedWoodEntries.reduce((sum, wood) => {
      const boardFeet = wood.boardFeet;
      const cost = wood.cost;
      const totalCost = boardFeet * cost;
      console.log(`Wood calculation: ${wood.species}/${wood.thickness} - ${boardFeet} BF * $${cost} = $${totalCost}`);
      return sum + totalCost;
    }, 0);
    
    console.log('Wood base cost:', woodBaseCost);
    
    const woodWasteFactor = Number(currentSettings.materials?.woodWasteFactor) || 0;
    const woodWasteCost = woodBaseCost * (woodWasteFactor / 100);
    const totalWoodCost = woodBaseCost + woodWasteCost;
    
    console.log('Wood waste cost:', woodWasteCost);
    console.log('Total wood cost:', totalWoodCost);
    
    // ==============================
    // Process Upholstery Materials
    // ==============================
    let upholsteryItems = [];
    console.log('Raw upholstery data:', JSON.stringify(entry.details?.materials?.upholstery, null, 2));

    if (entry.details?.materials?.upholstery?.items) {
      // Ensure we're working with an array
      let itemsArray = entry.details.materials.upholstery.items;
      
      // If items is a string (which seems to be happening), try to parse it
      if (typeof itemsArray === 'string') {
        try {
          itemsArray = JSON.parse(itemsArray);
        } catch (e) {
          console.error('Failed to parse upholstery items string:', e);
          // Fall back to empty array if parsing fails
          itemsArray = [];
        }
      }
      
      // Now process each item in the array
      for (let i = 0; i < itemsArray.length; i++) {
        const item = itemsArray[i];
        console.log(`Processing upholstery item ${i}:`, JSON.stringify(item, null, 2));
        
        upholsteryItems.push({
          name: item.name || '',
          type: item.type || 'upholstery',
          squareFeet: Number(item.squareFeet) || 0,
          costPerSqFt: Number(item.costPerSqFt) || 0,
          cost: Number(item.cost) || (Number(item.squareFeet) * Number(item.costPerSqFt)) || 0,
          materialId: item.materialId || ''
        });
      }
    }

    console.log('Processed upholstery items:', JSON.stringify(upholsteryItems, null, 2));

    // ==============================
    // Recalculate Other Costs
    // ==============================
    const cncCost = Number(entry.details?.cnc?.runtime || 0) * Number(currentSettings.cnc?.rate || 0);
    
    const totalLaborHours = newLaborBreakdown.reduce((sum, item) => sum + (Number(item.hours) || 0), 0);
    const cncRuntime = Number(entry.details?.cnc?.runtime || 0);
    const totalHoursWithCNC = totalLaborHours + cncRuntime;
    const overheadRate = calculateOverheadRate(currentSettings.overhead);
    const overheadCost = totalHoursWithCNC * overheadRate;

    // Recalculate overall total cost
    const sheetCost = entry.details?.materials?.sheet
      ? entry.details.materials.sheet.reduce((sum, sheet) => sum + ((Number(sheet.quantity) || 1) * (Number(sheet.pricePerSheet) || 0)), 0)
      : 0;
      
    const upholsteryCost = upholsteryItems.length > 0 
      ? upholsteryItems.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
      : 0;

    console.log('Upholstery cost:', upholsteryCost);

    const hardwareCost = entry.details?.materials?.hardware
      ? entry.details.materials.hardware.reduce((sum, hw) => sum + ((Number(hw.quantity) || 0) * (Number(hw.costPerUnit || hw.pricePerUnit) || 0)), 0)
      : 0;
      
    const finishingCost = entry.details?.materials?.finishing
      ? calculateFinishingCost(entry.details.materials.finishing)
      : 0;
      
    const newTotalCost = (baseLaborCost + surchargeCost) + 
      totalWoodCost + 
      sheetCost + 
      upholsteryCost + 
      hardwareCost + 
      finishingCost + 
      cncCost + 
      overheadCost;

    console.log('New total cost calculation:');
    console.log(`Labor: ${baseLaborCost} + ${surchargeCost} = ${baseLaborCost + surchargeCost}`);
    console.log(`Wood: ${totalWoodCost}`);
    console.log(`Sheet: ${sheetCost}`);
    console.log(`Upholstery: ${upholsteryCost}`);
    console.log(`Hardware: ${hardwareCost}`);
    console.log(`Finishing: ${finishingCost}`);
    console.log(`CNC: ${cncCost}`);
    console.log(`Overhead: ${overheadCost}`);
    console.log(`Total: ${newTotalCost}`);
    
    // ==============================
    // Save the Updated Entry
    // ==============================
    const updatedEntry = await PriceSheet.findByIdAndUpdate(
      req.params.id,
      {
        cost: newTotalCost,
        'details.labor.breakdown': newLaborBreakdown,
        'details.labor.total': baseLaborCost + surchargeCost,
        'details.cnc.rate': currentSettings.cnc.rate,
        'details.cnc.cost': cncCost,
        'details.overhead.rate': overheadRate,
        'details.overhead.hours': totalHoursWithCNC,
        'details.overhead.cost': overheadCost,
        'details.materials.wood': updatedWoodEntries,
        'details.materials.upholstery': JSON.parse(JSON.stringify({
          items: upholsteryItems,
          total: upholsteryCost
        })),
        'details.materials.computedWood': {
          baseCost: woodBaseCost,
          wasteCost: woodWasteCost,
          totalCost: totalWoodCost
        },
        lastSyncedSettings: {
          margins: currentSettings.margins,
          labor: currentSettings.labor,
          cnc: currentSettings.cnc,
          overhead: currentSettings.overhead,
          materials: currentSettings.materials,
        }
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


// Helper function to calculate finishing cost
function calculateFinishingCost(finishing) {
  if (!finishing?.materialId || !finishing?.surfaceArea || !finishing?.coats || !finishing?.coverage) {
    return 0;
  }
  const areaInSqFt = Number(finishing.surfaceArea) / 144;
  const litersNeeded = (areaInSqFt * Number(finishing.coats)) / Number(finishing.coverage);
  const litersWithWaste = litersNeeded * 1.1;
  return litersWithWaste * (Number(finishing.costPerLiter) || 0);
}

// Helper function to calculate overhead rate
function calculateOverheadRate(overhead) {
  if (!overhead) return 0;
  const { monthlyOverhead, employees, monthlyProdHours, monthlyCNCHours } = overhead;
  const totalEmployeeHours = Number(employees || 0) * Number(monthlyProdHours || 0);
  const totalCapacity = totalEmployeeHours + Number(monthlyCNCHours || 0);
  return totalCapacity > 0 ? Number(monthlyOverhead || 0) / totalCapacity : 0;
}

module.exports = router;
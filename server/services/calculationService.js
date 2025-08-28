// server/services/calculationService.js

/**
 * Centralized calculation service for furniture pricing logic
 * This module handles all pricing calculations to ensure consistency
 * across the application
 */

/**
 * Calculate labor costs based on input data and settings
 * * @param {Object} laborData - The labor input data
 * @param {Object} settings - Application settings containing labor rates and surcharges
 * @returns {Object} Calculated labor costs and breakdown
 */
const calculateLabor = (laborData, settings) => {
  // Create labor breakdown entries from input data
  const breakdown = Object.entries(laborData)
    .filter(([key]) => key !== 'surcharge') // Skip surcharge entry
    .map(([key, value]) => {
      let type;
      // Convert camelCase to Title Case
      switch(key) {
        case 'stockProduction':
          type = 'Stock Production';
          break;
        case 'cncOperator':
          type = 'CNC Operator';
          break;
        default:
          type = key.charAt(0).toUpperCase() + key.slice(1);
      }

      const hours = Number(value.hours) || 0;
      const rate = Number(value.rate) || 0;
      return {
        type,
        hours,
        rate,
        cost: hours * rate
      };
    })
    .filter(entry => entry.hours > 0); // Remove entries with zero hours

  // Calculate base labor cost
  const baseCost = breakdown.reduce((sum, entry) => sum + entry.cost, 0);
  
  // Add surcharge if applicable
  const surchargePercentage = settings?.labor?.extraFee || 0;
  const surchargeCost = baseCost * (surchargePercentage / 100);
  
  if (surchargePercentage > 0) {
    breakdown.push({
      type: 'Labor Surcharge',
      hours: 0,
      rate: 0,
      cost: surchargeCost,
      detail: `${surchargePercentage}% surcharge`
    });
  }
  
  return {
    breakdown,
    baseCost,
    surchargeCost,
    totalCost: baseCost + surchargeCost,
    totalHours: breakdown.reduce((sum, entry) => sum + entry.hours, 0)
  };
};

/**
 * Calculate wood materials cost
 * * @param {Array} woodEntries - Wood material entries
 * @param {Object} settings - Application settings
 * @returns {Object} Wood cost calculation results
 */
const calculateWoodCost = (woodEntries, settings) => {
  if (!woodEntries || !Array.isArray(woodEntries) || woodEntries.length === 0) {
    return {
      baseCost: 0,
      wasteCost: 0,
      totalCost: 0,
      entries: []
    };
  }

  // Process wood entries with latest costs from settings
  const processedEntries = woodEntries.map(wood => {
    // Skip entries without species or thickness info
    if (!wood.species || !wood.thickness) {
      return wood;
    }
    
    const speciesSettings = settings?.materials?.wood?.[wood.species];
    if (!speciesSettings) {
      return wood;
    }
    
    const thicknessSettings = speciesSettings[wood.thickness];
    if (!thicknessSettings) {
      return wood;
    }
    
    // We have found matching settings, get the cost
    const newCost = Number(thicknessSettings.cost) || 0;
    
    return {
      ...wood,
      cost: newCost
    };
  });

  // Calculate wood base cost
  const baseCost = processedEntries.reduce((sum, wood) => {
    const boardFeet = Number(wood.boardFeet) || 0;
    const cost = Number(wood.cost) || 0;
    return sum + (boardFeet * cost);
  }, 0);
  
  // Calculate waste
  const woodWasteFactor = Number(settings?.materials?.woodWasteFactor) || 0;
  const wasteCost = baseCost * (woodWasteFactor / 100);
  
  return {
    entries: processedEntries,
    baseCost,
    wasteCost,
    totalCost: baseCost + wasteCost
  };
};

/**
 * Calculate finishing materials cost
 * * @param {Object} finishing - Finishing material data
 * @param {Object} settings - Application settings
 * @returns {Number} Total finishing cost
 */
const calculateFinishingCost = (finishing, settings) => {
  if (!finishing?.materialId || !finishing?.surfaceArea || !finishing?.coats) {
    return 0;
  }

  const materialSettings = settings?.materials?.finishing?.find(m => m.id === Number(finishing.materialId));
  if (!materialSettings) return 0;

  const coverage = Number(materialSettings.coverage) || 0;
  const costPerLiter = (Number(materialSettings.containerCost) || 0) / (Number(materialSettings.containerSize) || 1);

  if (coverage === 0) return 0;

  const areaInSqFt = Number(finishing.surfaceArea) / 144;
  const litersNeeded = (areaInSqFt * Number(finishing.coats)) / coverage;
  const litersWithWaste = litersNeeded * 1.1; // 10% waste factor
  return litersWithWaste * costPerLiter;
};

/**
 * Calculate overhead rate based on settings
 * * @param {Object} overhead - Overhead settings
 * @returns {Number} Calculated overhead rate
 */
const calculateOverheadRate = (overhead) => {
  if (!overhead) return 0;
  const { monthlyOverhead, employees, monthlyProdHours, monthlyCNCHours } = overhead;
  const totalEmployeeHours = Number(employees || 0) * Number(monthlyProdHours || 0);
  const totalCapacity = totalEmployeeHours + Number(monthlyCNCHours || 0);
  return totalCapacity > 0 ? Number(monthlyOverhead || 0) / totalCapacity : 0;
};

/**
 * Calculate hardware costs from hardware entries
 * * @param {Array} hardware - Hardware entries
 * @param {Object} settings - Application settings
 * @returns {Number} Total hardware cost
 */
const calculateHardwareCost = (hardware, settings) => {
  if (!hardware || !Array.isArray(hardware)) return 0;
  
  return hardware.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;

    // Find the latest price from settings
    const hardwareSettings = settings?.materials?.hardware?.find(h => h.id === Number(item.hardwareId));
    let pricePerUnit;

    if (hardwareSettings) {
      pricePerUnit = (Number(hardwareSettings.pricePerPack) / Number(hardwareSettings.unitsPerPack)) || 0;
    } else if (item.pricePerUnit != null) {
      pricePerUnit = Number(item.pricePerUnit) || 0;
    } else if (item.costPerUnit != null) {
      pricePerUnit = Number(item.costPerUnit) || 0;
    } else if (item.cost != null && quantity > 0) {
      pricePerUnit = Number(item.cost) / quantity;
    } else {
      pricePerUnit = 0;
    }

    return sum + (quantity * pricePerUnit);
  }, 0);
};

/**
 * Calculate upholstery costs
 * * @param {Object} upholstery - Upholstery data object
 * @param {Object} settings - Application settings
 * @returns {Number} Total upholstery cost
 */
const calculateUpholsteryCost = (upholstery, settings) => {
  if (!upholstery || !upholstery.items || !Array.isArray(upholstery.items)) {
    return 0;
  }
  
  return upholstery.items.reduce((sum, item) => {
    const squareFeet = Number(item.squareFeet) || 0;

    // Find the latest price from settings
    const materialSettings = settings?.materials?.upholsteryMaterials?.find(m => m.id === Number(item.materialId));
    const costPerSqFt = materialSettings 
      ? (Number(materialSettings.costPerSqFt) || 0)
      : (Number(item.costPerSqFt) || 0);

    return sum + (squareFeet * costPerSqFt);
  }, 0);
};

/**
 * Calculate sheet material costs
 * * @param {Array} sheets - Sheet material entries
 * @param {Object} settings - Application settings
 * @returns {Number} Total sheet cost
 */
const calculateSheetCost = (sheets, settings) => {
  if (!sheets || !Array.isArray(sheets)) return 0;
  
  return sheets.reduce((sum, sheet) => {
    const quantity = Number(sheet.quantity || 1);

    // Find the latest price from settings
    const sheetSettings = settings?.materials?.sheet?.find(s => s.id === Number(sheet.sheetId));
    const pricePerSheet = sheetSettings 
      ? (Number(sheetSettings.pricePerSheet) || 0)
      : (Number(sheet.pricePerSheet) || 0);

    return sum + (quantity * pricePerSheet);
  }, 0);
};

/**
 * Calculate components costs
 * * @param {Array} components - Component entries
 * @returns {Number} Total component cost
 */
const calculateComponentsCost = (components) => {
  if (!components || !Array.isArray(components)) return 0;
  
  return components.reduce((sum, component) => {
    const cost = Number(component.cost) || 0;
    const quantity = Number(component.quantity) || 1;
    return sum + (cost * quantity);
  }, 0);
};

/**
 * Calculate pricing for a furniture piece or component
 * * @param {Object} itemData - The piece or component data
 * @param {Object} settings - Application settings
 * @returns {Object} Complete cost calculation results
 */
const calculatePricing = (itemData, settings) => {
  // Calculate labor costs
  const laborResult = calculateLabor(itemData.labor || {}, settings);
  
  // Calculate wood materials
  const woodResult = calculateWoodCost(itemData.materials?.wood || [], settings);
  
  // Calculate other material costs
  const finishingCost = calculateFinishingCost(itemData.materials?.finishing || {});
  const hardwareCost = calculateHardwareCost(itemData.materials?.hardware || []);
  const upholsteryCost = calculateUpholsteryCost(itemData.materials?.upholstery || {});
  const sheetCost = calculateSheetCost(itemData.materials?.sheet || []);
  
  // Calculate CNC cost
  const cncRuntime = Number(itemData.cnc?.runtime) || 0;
  const cncRate = Number(itemData.cnc?.rate || settings?.cnc?.rate) || 0;
  const cncCost = cncRuntime * cncRate;
  
  // Calculate overhead cost
  const overheadRate = calculateOverheadRate(settings?.overhead);
  const totalLaborHours = laborResult.totalHours;
  const totalHoursWithCNC = totalLaborHours + cncRuntime;
  const overheadCost = totalHoursWithCNC * overheadRate;
  
  // Calculate components cost (if applicable)
  const componentsCost = calculateComponentsCost(itemData.details?.components || []);
  
  // Calculate total materials cost
  const totalMaterialsCost = woodResult.totalCost + finishingCost + 
    hardwareCost + upholsteryCost + sheetCost;
  
  // Calculate grand total
  const grandTotal = laborResult.totalCost + totalMaterialsCost + 
    cncCost + overheadCost + componentsCost;
  
  // Prepare wholesale and MSRP prices based on margins
  const wholesaleMargin = Number(settings?.margins?.wholesale) || 0;
  const msrpMargin = Number(settings?.margins?.msrp) || 0;
  
  const wholesalePrice = calculatePrice(grandTotal, wholesaleMargin);
  const msrpPrice = calculatePrice(wholesalePrice, msrpMargin);
  
  return {
    labor: {
      breakdown: laborResult.breakdown,
      baseCost: laborResult.baseCost,
      surchargeCost: laborResult.surchargeCost,
      totalCost: laborResult.totalCost,
      totalHours: laborResult.totalHours
    },
    materials: {
      wood: {
        entries: woodResult.entries,
        baseCost: woodResult.baseCost,
        wasteCost: woodResult.wasteCost,
        totalCost: woodResult.totalCost
      },
      finishing: {
        cost: finishingCost
      },
      hardware: {
        cost: hardwareCost
      },
      upholstery: {
        cost: upholsteryCost
      },
      sheet: {
        cost: sheetCost
      },
      // Expose a `total` property for overall material cost
      total: totalMaterialsCost
    },
    cnc: {
      runtime: cncRuntime,
      rate: cncRate,
      cost: cncCost
    },
    overhead: {
      rate: overheadRate,
      hours: totalHoursWithCNC,
      cost: overheadCost
    },
    components: {
      cost: componentsCost
    },
    totals: {
      cost: grandTotal,
      wholesale: wholesalePrice,
      msrp: msrpPrice
    }
  };
};

/**
 * Calculate price based on cost and margin
 * * @param {Number} cost - Base cost
 * @param {Number} marginPercent - Margin percentage
 * @returns {Number} Calculated price
 */
const calculatePrice = (cost, marginPercent) => {
  if (!marginPercent) return cost;
  const margin = marginPercent / 100;
  const markup = 1 / (1 - margin);
  return cost * markup;
};

module.exports = {
  calculatePricing,
  calculateLabor,
  calculateWoodCost,
  calculateFinishingCost,
  calculateOverheadRate,
  calculateHardwareCost,
  calculateUpholsteryCost,
  calculateSheetCost,
  calculateComponentsCost,
  calculatePrice
};
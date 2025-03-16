// src/utils/calculationUtils.js

/**
 * Centralized furniture pricing calculation utilities 
 * Client-side implementation of calculation logic that mirrors server-side calculationService.js
 */

/**
 * Calculate finishing cost based on input materials and parameters
 * @param {Object} finishing - Finishing materials data 
 * @returns {Number} - Total finishing cost
 */
export const calculateFinishingCost = (finishing) => {
  if (!finishing?.materialId || !finishing?.surfaceArea || !finishing?.coats || !finishing?.coverage) {
    return 0;
  }
  const areaInSqFt = Number(finishing.surfaceArea) / 144;
  const litersNeeded = (areaInSqFt * Number(finishing.coats)) / Number(finishing.coverage);
  const litersWithWaste = litersNeeded * 1.1; // 10% waste factor
  return litersWithWaste * (Number(finishing.costPerLiter) || 0);
};

/**
 * Calculate total costs for a furniture piece or component
 * @param {Object} props - Input props containing data, settings, labor hours and components
 * @returns {Object} - Calculated costs for all aspects of the piece
 */
export const calculateTotalCosts = ({ data, settings, totalLaborHours, calculateOverheadRate, components }) => {
  // Labor calculations
  const laborBreakdown = Object.entries(data.labor || {})
    .filter(([key]) => key !== 'surcharge')
    .map(([type, { hours, rate }]) => {
      if (!hours || !rate) return null;
      
      // Format the type name for display
      let displayType = type.replace(/([A-Z])/g, ' $1').trim();
      
      return {
        type: displayType,
        hours: Number(hours) || 0,
        rate: Number(rate) || 0,
        cost: (Number(hours) || 0) * (Number(rate) || 0)
      };
    }).filter(Boolean);

  const baseLaborCost = laborBreakdown.reduce((sum, { cost }) => sum + cost, 0);

  // Add labor surcharge if applicable
  const surchargePercent = settings?.labor?.extraFee || 0;
  const surchargeCost = baseLaborCost * (surchargePercent / 100);
  
  if (surchargePercent > 0) {
    laborBreakdown.push({
      type: 'Labor Surcharge',
      hours: 0,
      rate: 0,
      cost: surchargeCost,
      detail: `${surchargePercent}% surcharge`
    });
  }

  // Wood cost calculations with waste factor
  const woodWasteFactor = settings?.materials?.woodWasteFactor || 0;
  const woodEntries = data.materials?.wood || [];
  const woodBaseCost = woodEntries.reduce((sum, wood) => {
    return sum + ((Number(wood.boardFeet) || 0) * (Number(wood.cost) || 0));
  }, 0);
  const woodWasteCost = woodBaseCost * (woodWasteFactor / 100);
  const totalWoodCost = woodBaseCost + woodWasteCost;

  // Upholstery calculations
  const upholsteryEntries = data.materials?.upholstery?.items || [];
  const upholsteryCost = upholsteryEntries.reduce(
    (sum, item) => sum + (Number(item.squareFeet) * Number(item.costPerSqFt) || 0), 
    0
  );

  // Hardware calculations
  const hardwareEntries = data.materials?.hardware || [];
  const hardwareCost = hardwareEntries.reduce(
    (sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.pricePerUnit) || 0)), 
    0
  );

  // Finishing cost
  const finishingCost = calculateFinishingCost(data.materials?.finishing || {});

  // Sheet materials cost
  const sheetEntries = data.materials?.sheet || [];
  const sheetCost = sheetEntries.reduce(
    (sum, sheet) => sum + ((Number(sheet.quantity) || 1) * (Number(sheet.pricePerSheet) || 0)),
    0
  );

  // Total materials cost
  const totalMaterialsCost = totalWoodCost + upholsteryCost + hardwareCost + finishingCost + sheetCost;

  // CNC cost
  const cncRuntime = Number(data.cnc?.runtime) || 0;
  const cncRate = Number(data.cnc?.rate) || 0;
  const cncCost = cncRuntime * cncRate;

  // Overhead cost
  const pieceProductionHours = totalLaborHours + cncRuntime;
  const overheadRate = typeof calculateOverheadRate === 'function' ? calculateOverheadRate() : 0;
  const overheadCost = overheadRate * pieceProductionHours;

  // Component costs
  const componentsCost = (components || []).reduce((sum, comp) => sum + (Number(comp.cost) || 0), 0);

  // Grand total
  const grandTotal = baseLaborCost + surchargeCost + 
                     totalMaterialsCost + 
                     cncCost + 
                     overheadCost + 
                     componentsCost;

  return {
    pieceCosts: {
      labor: {
        cost: baseLaborCost + surchargeCost,
        hours: totalLaborHours,
        breakdown: laborBreakdown
      },
      materials: {
        wood: {
          baseCost: woodBaseCost,
          wasteCost: woodWasteCost,
          totalCost: totalWoodCost
        },
        upholstery: {
          cost: upholsteryCost
        },
        hardware: {
          cost: hardwareCost
        },
        finishing: {
          cost: finishingCost
        },
        sheet: {
          cost: sheetCost
        },
        total: totalMaterialsCost
      },
      cnc: {
        runtime: cncRuntime,
        rate: cncRate,
        cost: cncCost
      },
      overhead: {
        rate: overheadRate,
        hours: pieceProductionHours,
        cost: overheadCost
      }
    },
    componentsCost,
    grandTotal
  };
};

/**
 * Calculate price with markup based on margin percentage
 * @param {Number} cost - Base cost 
 * @param {Number} marginPercent - Margin percentage
 * @returns {Number} - Final price with markup
 */
export const calculatePrice = (cost, marginPercent) => {
  if (!marginPercent) return cost;
  const margin = marginPercent / 100;
  const markup = 1 / (1 - margin);
  return cost * markup;
};

/**
 * Calculate overhead rate based on settings
 * @param {Object} settings - Application settings
 * @returns {Number} - Calculated overhead rate
 */
export const calculateOverheadRate = (settings) => {
  if (!settings?.overhead) return 0;
  
  const { monthlyOverhead, employees, monthlyProdHours, monthlyCNCHours } = settings.overhead;
  const totalEmployeeHours = Number(employees) * Number(monthlyProdHours);
  const totalCapacity = totalEmployeeHours + Number(monthlyCNCHours || 0);
  
  return totalCapacity > 0 ? Number(monthlyOverhead) / totalCapacity : 0;
};
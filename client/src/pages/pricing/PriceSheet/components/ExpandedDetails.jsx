// src/pages/pricing/PriceSheet/components/ExpandedDetails.jsx
import React from 'react';
import { calculateTotalCosts } from '../../../../utils/calculationUtils';

const ExpandedDetails = ({ item, isComponent, settings, prices }) => {
  // Use the centralized calculation utility to get consistent calculations
  const { pieceCosts } = calculateTotalCosts({
    data: {
      labor: {
        ...Object.fromEntries(
          (item.details?.labor?.breakdown || [])
            .filter(entry => entry.type !== 'Labor Surcharge')
            .map(entry => {
              // Convert back from breakdown format to the data format
              let key = entry.type.replace(/\s+/g, '');
              // Handle special cases
              if (key === 'StockProduction') key = 'stockProduction';
              if (key === 'CNCOperator') key = 'cncOperator';
              key = key.charAt(0).toLowerCase() + key.slice(1);
              
              return [key, { hours: entry.hours, rate: entry.rate }];
            })
        )
      },
      materials: item.details?.materials || {},
      cnc: item.details?.cnc || {},
    },
    settings,
    totalLaborHours: (item.details?.labor?.breakdown || [])
      .filter(entry => entry.type !== 'Labor Surcharge')
      .reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0),
    calculateOverheadRate: () => Number(item.details?.overhead?.rate) || 0,
    components: item.details?.components || []
  });

  // Extract surcharge entry separately
  const surchargeEntry = item.details?.labor?.breakdown?.find(entry => entry.type === 'Labor Surcharge');
  
  // Get labor breakdown
  const regularLabor = (item.details?.labor?.breakdown || [])
    .filter(entry => entry.type !== 'Labor Surcharge');
    
  const computedLaborCost = regularLabor.reduce((total, entry) => {
    const entryCost = entry.cost !== undefined ? 
      Number(entry.cost) : 
      (Number(entry.hours) || 0) * (Number(entry.rate) || 0);
    return total + entryCost;
  }, 0) + (surchargeEntry?.cost || 0);
  
  // Calculate other costs from the item data or use the computed values
  const computedWood = item.details?.materials?.computedWood || pieceCosts.materials.wood;
  const woodBaseCost = computedWood.baseCost !== undefined ? 
    Number(computedWood.baseCost) : pieceCosts.materials.wood.baseCost;
  const woodWasteCost = computedWood.wasteCost !== undefined ?
    Number(computedWood.wasteCost) : pieceCosts.materials.wood.wasteCost;
  const woodTotalCost = computedWood.totalCost !== undefined ?
    Number(computedWood.totalCost) : pieceCosts.materials.wood.totalCost;

  // Get other material costs
  const upholsteryCost = pieceCosts.materials.upholstery.cost;
  const hardwareCost = pieceCosts.materials.hardware.cost;
  const finishingCost = pieceCosts.materials.finishing.cost;
  const sheetCost = pieceCosts.materials.sheet.cost;

  // Get machine & overhead costs
  const cncCost = pieceCosts.cnc.cost;
  const overheadCost = pieceCosts.overhead.cost;

  // Get component costs
  const componentsCost = item.details?.components?.reduce((sum, component) => {
    const cost = Number(component.cost) || 0;
    const quantity = Number(component.quantity) || 1;
    return sum + (cost * quantity);
  }, 0) || 0;

  // Calculate materials total
  const computedMaterialsCost = woodTotalCost + sheetCost + upholsteryCost + hardwareCost + finishingCost;

  // Calculate total cost
  const computedTotalCost = computedLaborCost + computedMaterialsCost + cncCost + overheadCost + componentsCost;

  const CostSection = ({ title, content }) => (
    <div>
      <h5 className="font-medium text-gray-900 pb-1 mb-2 border-b border-gray-100">{title}</h5>
      {content}
    </div>
  );

  return (
    <div className="px-4 py-3 text-sm bg-gray-50">
      <div className="grid grid-cols-3 gap-6">
        {/* Labor Section */}
        <CostSection
          title="Labor"
          content={
            <div className="space-y-1.5">
              {regularLabor.map(entry => {
                const entryCost = entry.cost !== undefined ? 
                  Number(entry.cost) : 
                  (Number(entry.hours) || 0) * (Number(entry.rate) || 0);
                
                return (
                  <div key={entry.type} className="flex justify-between items-baseline">
                    <span className="text-gray-600">{entry.type}</span>
                    <div className="text-right">
                      <div className="text-gray-700 tabular-nums">
                        ${entryCost.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Number(entry.hours || 0).toFixed(1)} hrs × ${Number(entry.rate || 0).toFixed(2)}/hr
                      </div>
                    </div>
                  </div>
                );
              })}

              {surchargeEntry && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600 text-sm italic ml-4">
                    Labor Surcharge {surchargeEntry.detail && `(${surchargeEntry.detail})`}
                  </span>
                  <div className="text-gray-700 tabular-nums">
                    ${Number(surchargeEntry.cost).toFixed(2)}
                  </div>
                </div>
              )}

              <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-100">
                <span>Total Labor</span>
                <span>${computedLaborCost.toFixed(2)}</span>
              </div>
            </div>
          }
        />

        {/* Materials Section */}
        <CostSection
          title="Materials"
          content={
            <div className="space-y-1.5">
              {(woodBaseCost > 0) && (
                <>
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-600">Wood Materials</span>
                    <span className="text-gray-700 tabular-nums">
                      ${woodBaseCost.toFixed(2)}
                    </span>
                  </div>
                  {woodWasteCost > 0 && (
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-600 text-sm italic ml-4">Wood Waste</span>
                      <span className="text-gray-700 tabular-nums">
                        ${woodWasteCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
              )}
              {sheetCost > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600">Sheet Materials</span>
                  <span className="text-gray-700 tabular-nums">${sheetCost.toFixed(2)}</span>
                </div>
              )}
              {upholsteryCost > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600">Upholstery Materials</span>
                  <span className="text-gray-700 tabular-nums">${upholsteryCost.toFixed(2)}</span>
                </div>
              )}
              {hardwareCost > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600">Hardware</span>
                  <span className="text-gray-700 tabular-nums">${hardwareCost.toFixed(2)}</span>
                </div>
              )}
              {finishingCost > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600">Finishing Materials</span>
                  <span className="text-gray-700 tabular-nums">${finishingCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-100">
                <span>Total Materials</span>
                <span>${computedMaterialsCost.toFixed(2)}</span>
              </div>
            </div>
          }
        />

        {/* Machine & Overhead Section */}
        <CostSection
          title="Machine & Overhead"
          content={
            <div className="space-y-1.5">
              {cncCost > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600">CNC Machine</span>
                  <div className="text-right">
                    <div className="text-gray-700 tabular-nums">${cncCost.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {pieceCosts.cnc.runtime} hrs × ${pieceCosts.cnc.rate}/hr
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-baseline">
                <span className="text-gray-600">Overhead</span>
                <div className="text-right">
                  <div className="text-gray-700 tabular-nums">${overheadCost.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    {pieceCosts.overhead.hours.toFixed(1)} hrs × ${pieceCosts.overhead.rate.toFixed(2)}/hr
                  </div>
                </div>
              </div>
              <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-100">
                <span>Total Machine & Overhead</span>
                <span>${(cncCost + overheadCost).toFixed(2)}</span>
              </div>
            </div>
          }
        />
      </div>

      {/* Summary Section */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-6">
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-gray-600">Total Cost</span>
            <span className="font-medium text-gray-900 tabular-nums">${computedTotalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-gray-600">Wholesale ({settings?.margins?.wholesale || 0}%)</span>
            <span className="font-medium text-gray-900 tabular-nums">
              ${prices.wholesale ? prices.wholesale.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-gray-600">MSRP ({settings?.margins?.msrp || 0}%)</span>
            <span className="font-medium text-gray-900 tabular-nums">
              ${prices.msrp ? prices.msrp.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Components Section - Only shown for non-component items */}
      {!isComponent && item.details?.components?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2">Components Used</h5>
          <div className="grid grid-cols-2 gap-4">
            {item.details.components.map((component, index) => (
              <div key={component.id || `component-${index}`} className="flex justify-between items-baseline text-sm">
                <div className="text-gray-600">
                  <span>{component.name || 'Unnamed'}</span>
                  <span className="text-gray-400 ml-2 capitalize">({component.type || 'unknown'})</span>
                </div>
                <span className="text-gray-700 tabular-nums">
                  ${Number(component.cost).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandedDetails;
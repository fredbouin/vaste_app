import React from 'react';
import { calculateTotalCosts } from '../../../../utils/calculationUtils';
import { toArray } from '../../../../utils/normalize';

const ExpandedDetails = ({ item, isComponent, settings, prices }) => {
  // Normalize potentially non-array shapes
  const breakdown = toArray(item?.details?.labor?.breakdown);
  const regularLabor = breakdown.filter(e => e?.type !== 'Labor Surcharge');
  const surchargeEntry = breakdown.find(e => e?.type === 'Labor Surcharge');

  const { pieceCosts } = calculateTotalCosts({
    data: {
      labor: {
        ...Object.fromEntries(
          regularLabor
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
    totalLaborHours: regularLabor.reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0),
    calculateOverheadRate: () => Number(item.details?.overhead?.rate) || 0,
    components: toArray(item.details?.components)
  });

  // Using normalized surchargeEntry and regularLabor above
  // Get labor breakdown
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
  const componentsArr = toArray(item.details?.components);
  const componentsCost = componentsArr.reduce((sum, component) => {
    const cost = Number(component?.cost) || 0;
    const quantity = Number(component?.quantity) || 1;
    return sum + (cost * quantity);
  }, 0);

  // Calculate total cost
  const totalCost = (computedLaborCost || 0) + 
    (woodTotalCost || 0) + 
    (sheetCost || 0) + 
    (upholsteryCost || 0) + 
    (hardwareCost || 0) + 
    (finishingCost || 0) + 
    (cncCost || 0) + 
    (overheadCost || 0) + 
    (componentsCost || 0);

  // Calculate the breakdown percentages
  const costs = [
    { label: 'Labor', cost: computedLaborCost },
    { label: 'Wood', cost: woodTotalCost },
    { label: 'Sheet Materials', cost: sheetCost },
    { label: 'Upholstery', cost: upholsteryCost },
    { label: 'Hardware', cost: hardwareCost },
    { label: 'Finishing', cost: finishingCost },
    { label: 'CNC Machine', cost: cncCost },
    { label: 'Overhead', cost: overheadCost },
    { label: 'Components', cost: componentsCost },
  ];

  const costBreakdown = costs
    .filter(item => item.cost > 0)
    .map(item => ({
      label: item.label,
      cost: item.cost,
      percentage: totalCost > 0 ? (item.cost / totalCost) * 100 : 0
    }));

  // Format price breakdown if not component
  const formatCurrency = (value) => {
    return Number(value || 0).toFixed(2);
  };

  // Render a cost section
  const CostSection = ({ title, content }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      {content}
    </div>
  );

  // Calculate margin impact if prices provided
  let marginInfo = null;
  if (!isComponent && prices?.custom) {
    const msrp = prices.msrp || 0;
    const customPrice = prices.custom || 0;
    marginInfo = {
      difference: customPrice - msrp,
      percentDiff: msrp > 0 ? ((customPrice - msrp) / msrp) * 100 : 0,
      effectiveMargin: customPrice > 0 ? ((customPrice - totalCost) / customPrice) * 100 : 0
    };
  }

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
                  <span className="text-gray-600">{surchargeEntry.type}</span>
                  <div className="text-right">
                    <div className="text-gray-700 tabular-nums">
                      ${Number(surchargeEntry.cost || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Rate Adjustment</div>
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
              {(woodBaseCost > 0 || woodWasteCost > 0) && (
                <>
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-600">Wood</span>
                    <span className="text-gray-700 tabular-nums">
                      ${woodTotalCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-600 text-sm italic ml-4">Wood Base</span>
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
                  <span className="text-gray-600">Finishing</span>
                  <span className="text-gray-700 tabular-nums">${finishingCost.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-100">
                <span>Total Materials</span>
                <span>${(woodTotalCost + sheetCost + upholsteryCost + hardwareCost + finishingCost).toFixed(2)}</span>
              </div>
            </div>
          }
        />

        {/* Machines & Overhead Section */}
        <CostSection
          title="Machines & Overhead"
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
      <div className="grid grid-cols-3 gap-6 mt-4">
        {/* Components Section */}
        {!isComponent && componentsArr.length > 0 && (
          <CostSection
            title="Components Used"
            content={
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-4">
                  {componentsArr.map((component, index) => (
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
                <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-100">
                  <span>Total Components</span>
                  <span>${componentsCost.toFixed(2)}</span>
                </div>
              </div>
            }
          />
        )}

        {/* Cost Breakdown Section */}
        <CostSection
          title="Cost Breakdown"
          content={
            <div className="space-y-1.5">
              {costBreakdown.map(item => (
                <div key={item.label} className="flex justify-between items-baseline">
                  <span className="text-gray-600">{item.label}</span>
                  <div className="text-right">
                    <div className="text-gray-700 tabular-nums">${formatCurrency(item.cost)}</div>
                    <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-100">
                <span>Total Cost</span>
                <span>${formatCurrency(totalCost)}</span>
              </div>
            </div>
          }
        />

        {/* Price Summary Section */}
        <CostSection
          title={isComponent ? "Component Price" : "Price Summary"}
          content={
            <div className="space-y-1.5">
              {!isComponent ? (
                <>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-gray-600">Base MSRP ({settings?.margins?.msrp || 0}%)</span>
                    <span className="font-medium text-gray-900 tabular-nums">
                      ${prices.msrp ? prices.msrp.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-gray-600">
                      Custom Price{prices?.custom ? '' : ' (not set)'}
                    </span>
                    <span className="font-medium text-gray-900 tabular-nums">
                      ${prices?.custom ? prices.custom.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-gray-600">Estimated Cost</span>
                    <span className="font-medium text-gray-900 tabular-nums">
                      ${formatCurrency(totalCost)}
                    </span>
                  </div>

                  <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-100">
                    <span>Estimated Profit</span>
                    <span className={prices?.custom && prices.custom < totalCost ? 'text-red-600' : 'text-green-600'}>
                      ${prices?.custom ? (prices.custom - totalCost).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  
                  {marginInfo && (
                    <div className="mt-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>vs MSRP:</span>
                        <span className={marginInfo.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {marginInfo.difference >= 0 ? '+' : ''}${marginInfo.difference.toFixed(2)} 
                          ({marginInfo.percentDiff.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Effective Margin:</span>
                        <span>{marginInfo.effectiveMargin.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-gray-600">MSRP ({settings?.margins?.msrp || 0}%)</span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    ${prices.msrp ? prices.msrp.toFixed(2) : '0.00'}
                  </span>
                </div>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ExpandedDetails;

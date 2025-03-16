// src/pages/pricing/PriceSheet/components/ExpandedDetails.jsx
import React from 'react';

const ExpandedDetails = ({ item, isComponent, settings, prices }) => {
  // Labor calculations
  const laborBreakdown = item.details?.labor?.breakdown || [];
  
  // Separate regular labor entries from surcharge
  const regularLabor = laborBreakdown.filter(entry => entry.type !== 'Labor Surcharge');
  const surchargeEntry = laborBreakdown.find(entry => entry.type === 'Labor Surcharge');
  
  // Calculate base labor cost (without surcharge)
  const baseLaborCost = regularLabor.reduce((total, entry) => {
    // First check if entry has a pre-calculated cost value
    const entryCost = entry.cost !== undefined ? 
      Number(entry.cost) : 
      (Number(entry.hours) || 0) * (Number(entry.rate) || 0);
    return total + entryCost;
  }, 0);

  // Add surcharge to get total labor cost
  const computedLaborCost = baseLaborCost + (surchargeEntry?.cost || 0);

  // Materials calculations
  const woodEntries = Array.isArray(item.details?.materials?.wood) ? item.details.materials.wood : [];
  
  // Use pre-calculated values from the server if available
  const computedWood = item.details?.materials?.computedWood || {};
  
  const woodBaseCost = computedWood.baseCost !== undefined ? 
    Number(computedWood.baseCost) : 
    woodEntries.reduce(
      (sum, wood) => sum + ((Number(wood.boardFeet) || 0) * (Number(wood.cost) || 0)),
      0
    );
    
  const woodWasteFactor = settings?.materials?.woodWasteFactor ? Number(settings.materials.woodWasteFactor) : 0;
  
  const woodWasteCost = computedWood.wasteCost !== undefined ?
    Number(computedWood.wasteCost) :
    woodBaseCost * (woodWasteFactor / 100);
    
  const woodTotalCost = computedWood.totalCost !== undefined ?
    Number(computedWood.totalCost) :
    woodBaseCost + woodWasteCost;

  const sheetEntries = Array.isArray(item.details?.materials?.sheet) ? item.details.materials.sheet : [];
  const sheetTotalCost = sheetEntries.reduce(
    (sum, sheet) => sum + (Number(sheet.pricePerSheet) || 0),
    0
  );

  const upholsteryEntries = item.details?.materials?.upholstery?.items || [];
  const upholsteryTotalCost = upholsteryEntries.reduce(
    (sum, up) => sum + ((Number(up.squareFeet) || 0) * (Number(up.costPerSqFt) || 0)),
    0
  );

  const hardwareEntries = Array.isArray(item.details?.materials?.hardware) ? item.details.materials.hardware : [];
  const hardwareTotalCost = hardwareEntries.reduce(
    (sum, hw) => sum + ((Number(hw.quantity) || 0) * (Number(hw.pricePerUnit || hw.costPerUnit) || 0)),
    0
  );

  const finishing = item.details?.materials?.finishing || {};
  const calculateFinishingCost = (finishing) => {
    if (!finishing.materialId || !finishing.surfaceArea || !finishing.coats || !finishing.coverage) {
      return 0;
    }
    
    if (finishing.cost !== undefined) {
      return Number(finishing.cost);
    }
    
    const areaInSqFt = Number(finishing.surfaceArea) / 144;
    const litersNeeded = (areaInSqFt * Number(finishing.coats)) / Number(finishing.coverage);
    const litersWithWaste = litersNeeded * 1.1;
    return litersWithWaste * (Number(finishing.costPerLiter) || 0);
  };
  const finishingTotalCost = calculateFinishingCost(finishing);

  const computedMaterialsCost = woodTotalCost + sheetTotalCost + upholsteryTotalCost + hardwareTotalCost + finishingTotalCost;

  // Machine & Overhead calculations
  const cncRuntime = item.details?.cnc?.runtime || 0;
  const cncRate = item.details?.cnc?.rate || 0;
  const cncCost = typeof item.details?.cnc?.cost === 'number' ? item.details.cnc.cost : Number(cncRuntime) * Number(cncRate);

  const overheadRate = item.details?.overhead?.rate || 0;
  const overheadHours = item.details?.overhead?.hours || 0;
  const overheadCost = typeof item.details?.overhead?.cost === 'number' ? 
    item.details.overhead.cost : 
    Number(overheadHours) * Number(overheadRate);

  const computedTotalCost = computedLaborCost + computedMaterialsCost + cncCost + overheadCost;

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
              {(woodEntries.length > 0 || woodBaseCost > 0) && (
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
              {sheetTotalCost > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600">Sheet Materials</span>
                  <span className="text-gray-700 tabular-nums">${sheetTotalCost.toFixed(2)}</span>
                </div>
              )}
              {upholsteryTotalCost > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600">Upholstery Materials</span>
                  <span className="text-gray-700 tabular-nums">${upholsteryTotalCost.toFixed(2)}</span>
                </div>
              )}
              {hardwareTotalCost > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600">Hardware</span>
                  <span className="text-gray-700 tabular-nums">${hardwareTotalCost.toFixed(2)}</span>
                </div>
              )}
              {finishingTotalCost > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600">Finishing Materials</span>
                  <span className="text-gray-700 tabular-nums">${finishingTotalCost.toFixed(2)}</span>
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
                    <div className="text-xs text-gray-500">{cncRuntime} hrs × ${cncRate}/hr</div>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-baseline">
                <span className="text-gray-600">Overhead</span>
                <div className="text-right">
                  <div className="text-gray-700 tabular-nums">${overheadCost.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    {overheadHours.toFixed(1)} hrs × ${overheadRate.toFixed(2)}/hr
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
            {item.details.components.map((component) => (
              <div key={component.id} className="flex justify-between items-baseline text-sm">
                <div className="text-gray-600">
                  <span>{component.name || 'Unnamed'}</span>
                  <span className="text-gray-400 ml-2 capitalize">({component.type || 'unknown'})</span>
                </div>
                <span className="text-gray-700 tabular-nums">
                  ${component.cost ? component.cost.toFixed(2) : '0.00'}
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

// // src/pages/pricing/PriceSheet/components/ExpandedDetails.jsx
// import React from 'react';

// const ExpandedDetails = ({ item, isComponent, settings, prices }) => {
//   // Labor calculations
//    const laborBreakdown = item.details?.labor?.breakdown || [];
  
//   // Separate regular labor entries from surcharge
//   const regularLabor = laborBreakdown.filter(entry => entry.type !== 'Labor Surcharge');
//   const surchargeEntry = laborBreakdown.find(entry => entry.type === 'Labor Surcharge');
  
//   // Calculate base labor cost (without surcharge)
//   const baseLaborCost = regularLabor.reduce((total, entry) => {
//     // First check if entry has a pre-calculated cost value
//     const entryCost = entry.cost !== undefined ? 
//       Number(entry.cost) : 
//       (Number(entry.hours) || 0) * (Number(entry.rate) || 0);
//     return total + entryCost;
//   }, 0);

//   // Prefer using the server-calculated total if available
//   const laborTotal = item.details?.labor?.total !== undefined ? 
//     Number(item.details.labor.total) : 
//     baseLaborCost + (surchargeEntry?.cost || 0);

//   // Add surcharge to get total labor cost
//   const computedLaborCost = baseLaborCost + (surchargeEntry?.cost || 0);

//   // Materials calculations
//   // const woodEntries = Array.isArray(item.details?.materials?.wood) ? item.details.materials.wood : [];
//   // const woodBaseCost = woodEntries.reduce(
//   //   (sum, wood) => sum + ((Number(wood.boardFeet) || 0) * (Number(wood.cost) || 0)),
//   //   0
//   // );
//   // const woodWasteFactor = settings?.materials?.woodWasteFactor ? Number(settings.materials.woodWasteFactor) : 0;
//   // const woodWasteCost = woodBaseCost * (woodWasteFactor / 100);
//   // const woodTotalCost = woodBaseCost + woodWasteCost;
//   const woodEntries = Array.isArray(item.details?.materials?.wood) ? item.details.materials.wood : [];
  
//   // Use pre-calculated values from the server if available
//   const computedWood = item.details?.materials?.computedWood || {};
  
//   const woodBaseCost = computedWood.baseCost !== undefined ? 
//     Number(computedWood.baseCost) : 
//     woodEntries.reduce(
//       (sum, wood) => sum + ((Number(wood.boardFeet) || 0) * (Number(wood.cost) || 0)),
//       0
//     );
    
//   const woodWasteFactor = settings?.materials?.woodWasteFactor ? Number(settings.materials.woodWasteFactor) : 0;
  
//   const woodWasteCost = computedWood.wasteCost !== undefined ?
//     Number(computedWood.wasteCost) :
//     woodBaseCost * (woodWasteFactor / 100);
    
//   const woodTotalCost = computedWood.totalCost !== undefined ?
//     Number(computedWood.totalCost) :
//     woodBaseCost + woodWasteCost;



//   const sheetEntries = Array.isArray(item.details?.materials?.sheet) ? item.details.materials.sheet : [];
//   const sheetTotalCost = sheetEntries.reduce(
//     (sum, sheet) => sum + (Number(sheet.pricePerSheet) || 0),
//     0
//   );

//   const upholsteryEntries = item.details?.materials?.upholstery?.items || [];
//   const upholsteryTotalCost = upholsteryEntries.reduce(
//     (sum, up) => sum + ((Number(up.squareFeet) || 0) * (Number(up.costPerSqFt) || 0)),
//     0
//   );

//   const hardwareEntries = Array.isArray(item.details?.materials?.hardware) ? item.details.materials.hardware : [];
//   const hardwareTotalCost = hardwareEntries.reduce(
//     (sum, hw) => sum + ((Number(hw.quantity) || 0) * (Number(hw.pricePerUnit) || 0)),
//     0
//   );

//   const finishing = item.details?.materials?.finishing || {};
//   const calculateFinishingCost = (finishing) => {
//     if (!finishing.materialId || !finishing.surfaceArea || !finishing.coats || !finishing.coverage) {
//       return 0;
//     }
//     const areaInSqFt = Number(finishing.surfaceArea) / 144;
//     const litersNeeded = (areaInSqFt * Number(finishing.coats)) / Number(finishing.coverage);
//     const litersWithWaste = litersNeeded * 1.1;
//     return litersWithWaste * (Number(finishing.costPerLiter) || 0);
//   };
//   const finishingTotalCost = calculateFinishingCost(finishing);

//   const computedMaterialsCost = woodTotalCost + sheetTotalCost + upholsteryTotalCost + hardwareTotalCost + finishingTotalCost;

//   // Machine & Overhead calculations
//   const cncRuntime = item.details?.cnc?.runtime || 0;
//   const cncRate = item.details?.cnc?.rate || 0;
//   const cncCost = typeof item.details?.cnc?.cost === 'number' ? item.details.cnc.cost : 0;

//   const overheadRate = item.details?.overhead?.rate || 0;
//   const overheadHours = item.details?.overhead?.hours || 0;
//   const overheadCost = typeof item.details?.overhead?.cost === 'number' ? item.details.overhead.cost : 0;

//   const computedTotalCost = computedLaborCost + computedMaterialsCost + cncCost + overheadCost;

//   const CostSection = ({ title, content }) => (
//     <div>
//       <h5 className="font-medium text-gray-900 pb-1 mb-2 border-b border-gray-100">{title}</h5>
//       {content}
//     </div>
//   );

//   return (
//     <div className="px-4 py-3 text-sm bg-gray-50">
//       <div className="grid grid-cols-3 gap-6">
//         {/* Labor Section */}
//         <CostSection
//           title="Labor"
//           content={
//             <div className="space-y-1.5">
//               {/* Regular Labor Entries */}
//               {regularLabor.map(entry => {
//                 const entryCost = entry.cost !== undefined ? 
//                   Number(entry.cost) : 
//                   (Number(entry.hours) || 0) * (Number(entry.rate) || 0);
                
//                 return (
//                   <div key={entry.type} className="flex justify-between items-baseline">
//                     <span className="text-gray-600">{entry.type}</span>
//                     <div className="text-right">
//                       <div className="text-gray-700 tabular-nums">
//                         ${entryCost.toFixed(2)}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {entry.hours} hrs × ${entry.rate}/hr
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}

//               {/* Labor Surcharge */}
//               {surchargeEntry && (
//                 <div className="flex justify-between items-baseline">
//                   <span className="text-gray-600 text-sm italic ml-4">
//                     Labor Surcharge {surchargeEntry.detail && `(${surchargeEntry.detail})`}
//                   </span>
//                   <div className="text-gray-700 tabular-nums">
//                     ${Number(surchargeEntry.cost).toFixed(2)}
//                   </div>
//                 </div>
//               )}

//               {/* Total Labor */}
//               <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-100">
//                 <span>Total Labor</span>
//                 <span>${computedLaborCost.toFixed(2)}</span>
//               </div>
//             </div>
//           }
//         />

//         {/* Materials Section */}
//         <CostSection
//           title="Materials"
//           content={
//             <div className="space-y-1.5">
//               {/*{woodBaseCost > 0 && (
//                 <>
//                   <div className="flex justify-between items-baseline">
//                     <span className="text-gray-600">Wood Materials</span>
//                     <span className="text-gray-700 tabular-nums">
//                       ${woodBaseCost.toFixed(2)}
//                     </span>
//                   </div>
//                   {woodWasteCost > 0 && (
//                     <div className="flex justify-between items-baseline">
//                       <span className="text-gray-600 text-sm italic ml-4">Wood Waste</span>
//                       <span className="text-gray-700 tabular-nums">
//                         ${woodWasteCost.toFixed(2)}
//                       </span>
//                     </div>
//                   )}
//                 </>
//               )}*/}
//             {(woodEntries.length > 0 || woodBaseCost > 0 || woodTotalCost > 0) && (
//   <>
//     <div className="flex justify-between items-baseline">
//       <span className="text-gray-600">Wood Materials</span>
//       <span className="text-gray-700 tabular-nums">
//         ${woodBaseCost.toFixed(2)}
//       </span>
//     </div>
//     {woodWasteCost > 0 && (
//       <div className="flex justify-between items-baseline">
//         <span className="text-gray-600 text-sm italic ml-4">Wood Waste</span>
//         <span className="text-gray-700 tabular-nums">
//           ${woodWasteCost.toFixed(2)}
//         </span>
//       </div>
//     )}
//   </>
// )}
//               {sheetTotalCost > 0 && (
//                 <div className="flex justify-between items-baseline">
//                   <span className="text-gray-600">Sheet Materials</span>
//                   <span className="text-gray-700 tabular-nums">${sheetTotalCost.toFixed(2)}</span>
//                 </div>
//               )}
//               {upholsteryTotalCost > 0 && (
//                 <div className="flex justify-between items-baseline">
//                   <span className="text-gray-600">Upholstery Materials</span>
//                   <span className="text-gray-700 tabular-nums">${upholsteryTotalCost.toFixed(2)}</span>
//                 </div>
//               )}
//               {hardwareTotalCost > 0 && (
//                 <div className="flex justify-between items-baseline">
//                   <span className="text-gray-600">Hardware</span>
//                   <span className="text-gray-700 tabular-nums">${hardwareTotalCost.toFixed(2)}</span>
//                 </div>
//               )}
//               {finishingTotalCost > 0 && (
//                 <div className="flex justify-between items-baseline">
//                   <span className="text-gray-600">Finishing Materials</span>
//                   <span className="text-gray-700 tabular-nums">${finishingTotalCost.toFixed(2)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-100">
//                 <span>Total Materials</span>
//                 <span>${computedMaterialsCost.toFixed(2)}</span>
//               </div>
//             </div>
//           }
//         />

//         {/* Machine & Overhead Section */}
//         <CostSection
//           title="Machine & Overhead"
//           content={
//             <div className="space-y-1.5">
//               {cncCost > 0 && (
//                 <div className="flex justify-between items-baseline">
//                   <span className="text-gray-600">CNC Machine</span>
//                   <div className="text-right">
//                     <div className="text-gray-700 tabular-nums">${cncCost.toFixed(2)}</div>
//                     <div className="text-xs text-gray-500">{cncRuntime} hrs × ${cncRate}/hr</div>
//                   </div>
//                 </div>
//               )}
//               <div className="flex justify-between items-baseline">
//                 <span className="text-gray-600">Overhead</span>
//                 <div className="text-right">
//                   <div className="text-gray-700 tabular-nums">${overheadCost.toFixed(2)}</div>
//                   <div className="text-xs text-gray-500">
//                     {overheadHours.toFixed(1)} hrs × ${overheadRate.toFixed(2)}/hr
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-100">
//                 <span>Total Machine & Overhead</span>
//                 <span>${(cncCost + overheadCost).toFixed(2)}</span>
//               </div>
//             </div>
//           }
//         />
//       </div>

//       {/* Summary Section */}
//       <div className="mt-4 pt-3 border-t border-gray-200">
//         <div className="grid grid-cols-3 gap-6">
//           <div className="flex justify-between items-baseline text-sm">
//             <span className="text-gray-600">Total Cost</span>
//             <span className="font-medium text-gray-900 tabular-nums">${computedTotalCost.toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between items-baseline text-sm">
//             <span className="text-gray-600">Wholesale ({settings?.margins?.wholesale || 0}%)</span>
//             <span className="font-medium text-gray-900 tabular-nums">
//               ${prices.wholesale ? prices.wholesale.toFixed(2) : '0.00'}
//             </span>
//           </div>
//           <div className="flex justify-between items-baseline text-sm">
//             <span className="text-gray-600">MSRP ({settings?.margins?.msrp || 0}%)</span>
//             <span className="font-medium text-gray-900 tabular-nums">
//               ${prices.msrp ? prices.msrp.toFixed(2) : '0.00'}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Components Section - Only shown for non-component items */}
//       {!isComponent && item.details?.components?.length > 0 && (
//         <div className="mt-4 pt-3 border-t border-gray-200">
//           <h5 className="font-medium text-gray-900 mb-2">Components Used</h5>
//           <div className="grid grid-cols-2 gap-4">
//             {item.details.components.map((component) => (
//               <div key={component.id} className="flex justify-between items-baseline text-sm">
//                 <div className="text-gray-600">
//                   <span>{component.name || 'Unnamed'}</span>
//                   <span className="text-gray-400 ml-2 capitalize">({component.type || 'unknown'})</span>
//                 </div>
//                 <span className="text-gray-700 tabular-nums">
//                   ${component.cost ? component.cost.toFixed(2) : '0.00'}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ExpandedDetails;
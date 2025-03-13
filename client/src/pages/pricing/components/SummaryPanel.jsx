// src/pages/pricing/components/SummaryPanel.jsx
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';
import { priceSheetApi } from '../../../api/priceSheet';

const SummaryPanel = ({ 
  data, 
  onSubmitToPriceSheet, 
  calculateOverheadRate,
  totalLaborHours,
  isEditing 
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [components, setComponents] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        // First try to get components from the API
        const allPriceSheetEntries = await priceSheetApi.getAll();
        const selectedIds = Array.isArray(data.selectedComponents) ? data.selectedComponents : [];
        
        // Map component IDs to actual component objects with consistent ID structure
        const selectedComponents = selectedIds.map(id => {
          const component = allPriceSheetEntries.find(entry => 
            (entry._id === id || entry.id === id) && entry.isComponent
          );
          
          if (component) {
            // Ensure consistent ID structure and property names
            return {
              ...component,
              id: component._id || component.id,
              _id: component._id || component.id,
              componentName: component.componentName || component.name || 'Unnamed',
              componentType: component.componentType || component.type || 'unknown',
              cost: Number(component.cost) || 0
            };
          }
          return null;
        }).filter(Boolean); // Remove any undefined entries
        
        setComponents(selectedComponents);
      } catch (error) {
        console.error('Error loading components:', error);
        // Fallback to localStorage if API fails
        const priceSheetData = JSON.parse(localStorage.getItem('priceSheetData') || '[]');
        const selectedComponents = priceSheetData
          .filter(item => data.selectedComponents && data.selectedComponents.includes(item.id || item._id))
          .map(component => ({
            ...component,
            id: component._id || component.id,
            _id: component._id || component.id,
            componentName: component.componentName || component.name || 'Unnamed',
            componentType: component.componentType || component.type || 'unknown',
            cost: Number(component.cost) || 0
          }));
        setComponents(selectedComponents);
      }
    };
  
    if (data.selectedComponents?.length) {
      fetchComponents();
    } else {
      setComponents([]);
    }
  }, [data.selectedComponents]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('calculatorSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const calculatePieceCosts = () => {
    // Labor calculations
    const laborTotals = Object.entries(data.labor || {}).map(([type, { hours, rate }]) => {
      if (type === 'surcharge') return null;
      return {
        type: type.replace(/([A-Z])/g, ' $1').trim(),
        hours: Number(hours) || 0,
        rate: Number(rate) || 0,
        cost: (Number(hours) || 0) * (Number(rate) || 0)
      };
    }).filter(Boolean);

    const totalLaborCost = laborTotals.reduce((sum, { cost }) => sum + cost, 0);

    // Create labor breakdown with surcharge
    const laborBreakdownWithSurcharge = [
      ...laborTotals,
      ...(data.labor.surcharge?.cost > 0 ? [{
        type: 'Labor Surcharge',
        hours: 0,
        rate: 0,
        cost: data.labor.surcharge.cost,
        detail: `${data.labor.surcharge.percentage}% surcharge`
      }] : [])
    ];

    const combinedLaborCost = totalLaborCost + (data.labor.surcharge?.cost || 0);

    // Wood cost calculations (with waste)
    const woodWasteFactor = settings?.materials?.woodWasteFactor || 0;
    const woodEntries = data.materials?.wood || [];
    const woodBaseCost = woodEntries.reduce((sum, wood) => {
      return sum + ((Number(wood.boardFeet) || 0) * (Number(wood.cost) || 0));
    }, 0);
    const woodWasteCost = woodBaseCost * (woodWasteFactor / 100);
    const totalWoodCost = woodBaseCost + woodWasteCost;

    // Other material costs
    const upholsteryCost = (data.materials?.upholstery?.items || []).reduce(
      (sum, item) => sum + (Number(item.cost) || 0), 
      0
    );

    const hardwareCost = (data.materials?.hardware || []).reduce(
      (sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.pricePerUnit) || 0)), 
      0
    );
    const finishingCost = calculateFinishingCost(data.materials?.finishing);

    const totalMaterialsCost = totalWoodCost + upholsteryCost + hardwareCost + finishingCost;

    // CNC cost
    const cncCost = (Number(data.cnc?.runtime) || 0) * (Number(data.cnc?.rate) || 0);

    // Overhead cost
    const pieceProductionHours = totalLaborHours + (Number(data.cnc?.runtime) || 0);
    const overheadRate = (typeof calculateOverheadRate === 'function' ? calculateOverheadRate() : 0);
    const overheadCost = overheadRate * pieceProductionHours;

    return {
      labor: {
        cost: combinedLaborCost,
        hours: totalLaborHours,
        breakdown: laborBreakdownWithSurcharge
      },
      materials: {
        wood: {
          baseCost: woodBaseCost,
          wasteCost: woodWasteCost,
          totalCost: totalWoodCost
        },
        upholstery: data.materials?.upholstery || {},
        hardware: data.materials?.hardware || [],
        finishing: data.materials?.finishing || {},
        total: totalMaterialsCost
      },
      cnc: {
        runtime: Number(data.cnc?.runtime) || 0,
        rate: Number(data.cnc?.rate) || 0,
        cost: cncCost
      },
      overhead: {
        rate: overheadRate,
        hours: pieceProductionHours,
        cost: overheadCost
      },
      total: combinedLaborCost + totalMaterialsCost + cncCost + overheadCost
    };
  };

  const pieceCosts = calculatePieceCosts();
  
  // Calculate components cost (if applicable)
  const componentsCost = components.reduce((sum, comp) => sum + (Number(comp.cost) || 0), 0);
  
  // Calculate the grand total with components included
  const grandTotal = pieceCosts.total + componentsCost;

  const CostSection = ({ title, items, total, className = '' }) => (
    <div className={`pb-4 mb-4 ${className}`}>
      <h3 className="font-medium mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map(({ label, value, detail, isIndented }) => (
          <div key={label} className="flex justify-between">
            <span className={`text-gray-600 ${isIndented ? 'text-sm italic ml-4' : ''}`}>
              {label}
            </span>
            <div className="text-right">
              <div>${value.toFixed(2)}</div>
              {detail && <div className="text-sm text-gray-500">{detail}</div>}
            </div>
          </div>
        ))}
      </div>
      {typeof total === 'number' && (
        <div className="flex justify-between font-medium mt-2">
          <span>Total {title}</span>
          <span>${total.toFixed(2)}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          {/* Labor Costs */}
          <CostSection
            title="Labor Costs"
            items={pieceCosts.labor.breakdown.map(item => ({
              label: item.type,
              value: item.cost,
              detail: item.type === 'Labor Surcharge'
                ? item.detail
                : `${item.hours} hrs @ $${item.rate}/hr`,
              isIndented: item.type === 'Labor Surcharge'
            }))}
            total={pieceCosts.labor.cost}
          />

          {/* Materials Costs */}
          <CostSection
            title="Materials Costs"
            items={[
              ...((data.materials?.wood && data.materials.wood.length > 0) ? [
                { label: 'Wood Materials', value: pieceCosts.materials.wood.baseCost },
                ...(pieceCosts.materials.wood.wasteCost > 0 
                  ? [{ label: 'Wood Waste', value: pieceCosts.materials.wood.wasteCost, isIndented: true }] 
                  : [])
              ] : []),
              ...((data.materials?.upholstery?.items && data.materials.upholstery.items.length > 0) ? [{
                label: 'Upholstery',
                value: data.materials.upholstery.items.reduce(
                  (sum, item) => sum + (Number(item.squareFeet) * Number(item.costPerSqFt)), 0
                )
              }] : []),
              ...((data.materials?.hardware && data.materials.hardware.length > 0) ? [{
                label: 'Hardware',
                value: data.materials.hardware.reduce(
                  (sum, item) => sum + (Number(item.quantity) * Number(item.pricePerUnit)), 0
                )
              }] : []),
              ...((data.materials?.finishing && data.materials.finishing.materialId) ? [{
                label: 'Finishing',
                value: calculateFinishingCost(data.materials.finishing)
              }] : [])
            ]}
            total={pieceCosts.materials.total}
          />

          {/* Machine & Overhead */}
          {(pieceCosts.cnc.cost > 0 || pieceCosts.overhead.cost > 0) && (
            <CostSection
              title="Machine & Overhead"
              items={[
                ...(pieceCosts.cnc.cost > 0 ? [{
                  label: 'CNC Machine',
                  value: pieceCosts.cnc.cost,
                  detail: `${pieceCosts.cnc.runtime} hrs @ $${pieceCosts.cnc.rate}/hr`
                }] : []),
                {
                  label: 'Overhead',
                  value: pieceCosts.overhead.cost,
                  detail: `${pieceCosts.overhead.hours.toFixed(1)} hrs @ $${pieceCosts.overhead.rate.toFixed(2)}/hr`
                }
              ]}
              total={pieceCosts.cnc.cost + pieceCosts.overhead.cost}
            />
          )}

          {/* Component Costs - New section */}
          {components.length > 0 && (
            <CostSection
              title="Components"
              items={components.map(component => ({
                label: component.componentName || component.name || 'Unnamed',
                value: Number(component.cost) || 0,
                detail: component.componentType || component.type || 'unknown'
              }))}
              total={componentsCost}
            />
          )}

          {/* Overall Total */}
          <div className="pt-4 mt-4 border-t">
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Total Cost</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileText className="w-4 h-4 mr-2" />
            {isEditing ? 'Update Price Sheet' : 'Submit to Price Sheet'}
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          console.log('Dialog confirmed, preparing price sheet entry');
          const priceSheetEntry = {
            id: Date.now(),
            isComponent: data.isComponent,
            componentName: data.componentName,
            componentType: data.componentType,
            collection: data.collection,
            pieceNumber: data.pieceNumber,
            variation: data.variation,
            cost: grandTotal,
            details: {
              labor: pieceCosts.labor,
              materials: {
                wood: data.materials.wood,
                computedWood: pieceCosts.materials.wood,
                upholstery: pieceCosts.materials.upholstery,
                hardware: data.materials.hardware,
                finishing: data.materials.finishing,
                total: pieceCosts.materials.total
              },
              cnc: pieceCosts.cnc,
              overhead: pieceCosts.overhead,
              componentIds: data.selectedComponents || [],
              components: components.map(c => ({
                id: c._id || c.id || `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: c.componentName || c.name || 'Unnamed',
                type: c.componentType || c.type || 'unknown',
                cost: Number(c.cost) || 0,
                quantity: 1
              }))
            }
          };
          console.log('Created price sheet entry:', priceSheetEntry);
          console.log('Calling onSubmitToPriceSheet');
          onSubmitToPriceSheet(priceSheetEntry);
          setShowConfirmDialog(false);
        }}
        data={data}
        pieceCosts={pieceCosts}
        componentsCost={componentsCost}
        grandTotal={grandTotal}
        components={components}
      />
    </div>
  );
};

const calculateFinishingCost = (finishing) => {
  if (!finishing?.materialId || !finishing?.surfaceArea || !finishing?.coats) {
    return 0;
  }
  const areaInSqFt = Number(finishing.surfaceArea) / 144;
  const litersNeeded = (areaInSqFt * Number(finishing.coats)) / Number(finishing.coverage);
  const litersWithWaste = litersNeeded * 1.1;
  return litersWithWaste * Number(finishing.costPerLiter || 0);
};

export default SummaryPanel;

// // src/pages/pricing/components/SummaryPanel.jsx
// import React, { useState, useEffect } from 'react';
// import { FileText } from 'lucide-react';
// import ConfirmationDialog from './ConfirmationDialog';
// import { priceSheetApi } from '../../../api/priceSheet';

// const SummaryPanel = ({ 
//   data, 
//   onSubmitToPriceSheet, 
//   calculateOverheadRate,
//   totalLaborHours,
//   isEditing 
// }) => {
//   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
//   const [components, setComponents] = useState([]);
//   const [settings, setSettings] = useState(null);

//   useEffect(() => {
//     const fetchComponents = async () => {
//       try {
//         // First try to get components from the API
//         const allPriceSheetEntries = await priceSheetApi.getAll();
//         const selectedIds = Array.isArray(data.selectedComponents) ? data.selectedComponents : [];
        
//         // Map component IDs to actual component objects
//         const selectedComponents = selectedIds.map(id => {
//           return allPriceSheetEntries.find(entry => 
//             (entry._id === id || entry.id === id) && entry.isComponent
//           );
//         }).filter(Boolean); // Remove any undefined entries
        
//         setComponents(selectedComponents);
//       } catch (error) {
//         console.error('Error loading components:', error);
//         // Fallback to localStorage if API fails
//         const priceSheetData = JSON.parse(localStorage.getItem('priceSheetData') || '[]');
//         const selectedComponents = priceSheetData.filter(
//           item => data.selectedComponents && data.selectedComponents.includes(item.id)
//         );
//         setComponents(selectedComponents);
//       }
//     };
  
//     if (data.selectedComponents?.length) {
//       fetchComponents();
//     } else {
//       setComponents([]);
//     }
//   }, [data.selectedComponents]);

//   useEffect(() => {
//     const savedSettings = localStorage.getItem('calculatorSettings');
//     if (savedSettings) {
//       setSettings(JSON.parse(savedSettings));
//     }
//   }, []);

//   const calculatePieceCosts = () => {
//     // Labor calculations
//     const laborTotals = Object.entries(data.labor || {}).map(([type, { hours, rate }]) => {
//       if (type === 'surcharge') return null;
//       return {
//         type: type.replace(/([A-Z])/g, ' $1').trim(),
//         hours: Number(hours) || 0,
//         rate: Number(rate) || 0,
//         cost: (Number(hours) || 0) * (Number(rate) || 0)
//       };
//     }).filter(Boolean);

//     const totalLaborCost = laborTotals.reduce((sum, { cost }) => sum + cost, 0);

//     // Create labor breakdown with surcharge
//     const laborBreakdownWithSurcharge = [
//       ...laborTotals,
//       ...(data.labor.surcharge?.cost > 0 ? [{
//         type: 'Labor Surcharge',
//         hours: 0,
//         rate: 0,
//         cost: data.labor.surcharge.cost,
//         detail: `${data.labor.surcharge.percentage}% surcharge`
//       }] : [])
//     ];

//     const combinedLaborCost = totalLaborCost + (data.labor.surcharge?.cost || 0);

//     // Wood cost calculations (with waste)
//     const woodWasteFactor = settings?.materials?.woodWasteFactor || 0;
//     const woodEntries = data.materials?.wood || [];
//     const woodBaseCost = woodEntries.reduce((sum, wood) => {
//       return sum + ((Number(wood.boardFeet) || 0) * (Number(wood.cost) || 0));
//     }, 0);
//     const woodWasteCost = woodBaseCost * (woodWasteFactor / 100);
//     const totalWoodCost = woodBaseCost + woodWasteCost;

//     // Other material costs
//     const upholsteryCost = (data.materials?.upholstery?.items || []).reduce(
//       (sum, item) => sum + (Number(item.cost) || 0), 
//       0
//     );

//     const hardwareCost = (data.materials?.hardware || []).reduce(
//       (sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.pricePerUnit) || 0)), 
//       0
//     );
//     const finishingCost = calculateFinishingCost(data.materials?.finishing);

//     const totalMaterialsCost = totalWoodCost + upholsteryCost + hardwareCost + finishingCost;

//     // CNC cost
//     const cncCost = (Number(data.cnc?.runtime) || 0) * (Number(data.cnc?.rate) || 0);

//     // Overhead cost
//     const pieceProductionHours = totalLaborHours + (Number(data.cnc?.runtime) || 0);
//     const overheadRate = (typeof calculateOverheadRate === 'function' ? calculateOverheadRate() : 0);
//     const overheadCost = overheadRate * pieceProductionHours;

//     return {
//       labor: {
//         cost: combinedLaborCost,
//         hours: totalLaborHours,
//         breakdown: laborBreakdownWithSurcharge
//       },
//       materials: {
//         wood: {
//           baseCost: woodBaseCost,
//           wasteCost: woodWasteCost,
//           totalCost: totalWoodCost
//         },
//         upholstery: data.materials?.upholstery || {},
//         hardware: data.materials?.hardware || [],
//         finishing: data.materials?.finishing || {},
//         total: totalMaterialsCost
//       },
//       cnc: {
//         runtime: Number(data.cnc?.runtime) || 0,
//         rate: Number(data.cnc?.rate) || 0,
//         cost: cncCost
//       },
//       overhead: {
//         rate: overheadRate,
//         hours: pieceProductionHours,
//         cost: overheadCost
//       },
//       total: combinedLaborCost + totalMaterialsCost + cncCost + overheadCost
//     };
//   };

//   const pieceCosts = calculatePieceCosts();
  
//   // Calculate components cost (if applicable)
//   const componentsCost = components.reduce((sum, comp) => sum + (Number(comp.cost) || 0), 0);
  
//   // Calculate the grand total with components included
//   const grandTotal = pieceCosts.total + componentsCost;

//   const CostSection = ({ title, items, total, className = '' }) => (
//     <div className={`pb-4 mb-4 ${className}`}>
//       <h3 className="font-medium mb-3">{title}</h3>
//       <div className="space-y-2">
//         {items.map(({ label, value, detail, isIndented }) => (
//           <div key={label} className="flex justify-between">
//             <span className={`text-gray-600 ${isIndented ? 'text-sm italic ml-4' : ''}`}>
//               {label}
//             </span>
//             <div className="text-right">
//               <div>${value.toFixed(2)}</div>
//               {detail && <div className="text-sm text-gray-500">{detail}</div>}
//             </div>
//           </div>
//         ))}
//       </div>
//       {typeof total === 'number' && (
//         <div className="flex justify-between font-medium mt-2">
//           <span>Total {title}</span>
//           <span>${total.toFixed(2)}</span>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="bg-white rounded-lg shadow-sm">
//         <div className="p-6">
//           {/* Labor Costs */}
//           <CostSection
//             title="Labor Costs"
//             items={pieceCosts.labor.breakdown.map(item => ({
//               label: item.type,
//               value: item.cost,
//               detail: item.type === 'Labor Surcharge'
//                 ? item.detail
//                 : `${item.hours} hrs @ $${item.rate}/hr`,
//               isIndented: item.type === 'Labor Surcharge'
//             }))}
//             total={pieceCosts.labor.cost}
//           />

//           {/* Materials Costs */}
//           <CostSection
//             title="Materials Costs"
//             items={[
//               ...((data.materials?.wood && data.materials.wood.length > 0) ? [
//                 { label: 'Wood Materials', value: pieceCosts.materials.wood.baseCost },
//                 ...(pieceCosts.materials.wood.wasteCost > 0 
//                   ? [{ label: 'Wood Waste', value: pieceCosts.materials.wood.wasteCost, isIndented: true }] 
//                   : [])
//               ] : []),
//               ...((data.materials?.upholstery?.items && data.materials.upholstery.items.length > 0) ? [{
//                 label: 'Upholstery',
//                 value: data.materials.upholstery.items.reduce(
//                   (sum, item) => sum + (Number(item.squareFeet) * Number(item.costPerSqFt)), 0
//                 )
//               }] : []),
//               ...((data.materials?.hardware && data.materials.hardware.length > 0) ? [{
//                 label: 'Hardware',
//                 value: data.materials.hardware.reduce(
//                   (sum, item) => sum + (Number(item.quantity) * Number(item.pricePerUnit)), 0
//                 )
//               }] : []),
//               ...((data.materials?.finishing && data.materials.finishing.materialId) ? [{
//                 label: 'Finishing',
//                 value: calculateFinishingCost(data.materials.finishing)
//               }] : [])
//             ]}
//             total={pieceCosts.materials.total}
//           />

//           {/* Machine & Overhead */}
//           {(pieceCosts.cnc.cost > 0 || pieceCosts.overhead.cost > 0) && (
//             <CostSection
//               title="Machine & Overhead"
//               items={[
//                 ...(pieceCosts.cnc.cost > 0 ? [{
//                   label: 'CNC Machine',
//                   value: pieceCosts.cnc.cost,
//                   detail: `${pieceCosts.cnc.runtime} hrs @ $${pieceCosts.cnc.rate}/hr`
//                 }] : []),
//                 {
//                   label: 'Overhead',
//                   value: pieceCosts.overhead.cost,
//                   detail: `${pieceCosts.overhead.hours.toFixed(1)} hrs @ $${pieceCosts.overhead.rate.toFixed(2)}/hr`
//                 }
//               ]}
//               total={pieceCosts.cnc.cost + pieceCosts.overhead.cost}
//             />
//           )}

//           {/* Component Costs - New section */}
//           {components.length > 0 && (
//             <CostSection
//               title="Components"
//               items={components.map(component => ({
//                 label: component.componentName,
//                 value: Number(component.cost) || 0,
//                 detail: component.componentType
//               }))}
//               total={componentsCost}
//             />
//           )}

//           {/* Overall Total */}
//           <div className="pt-4 mt-4 border-t">
//             <div className="flex justify-between items-center text-lg font-medium">
//               <span>Total Cost</span>
//               <span>${grandTotal.toFixed(2)}</span>
//             </div>
//           </div>
//         </div>

//         <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
//           <button
//             onClick={() => setShowConfirmDialog(true)}
//             className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//           >
//             <FileText className="w-4 h-4 mr-2" />
//             {isEditing ? 'Update Price Sheet' : 'Submit to Price Sheet'}
//           </button>
//         </div>
//       </div>

//       <ConfirmationDialog
//         isOpen={showConfirmDialog}
//         onClose={() => setShowConfirmDialog(false)}
//         onConfirm={() => {
//           console.log('Dialog confirmed, preparing price sheet entry');
//           const priceSheetEntry = {
//             id: Date.now(),
//             isComponent: data.isComponent,
//             componentName: data.componentName,
//             componentType: data.componentType,
//             collection: data.collection,
//             pieceNumber: data.pieceNumber,
//             variation: data.variation,
//             cost: grandTotal,
//             details: {
//               labor: pieceCosts.labor,
//               materials: {
//                 wood: data.materials.wood,
//                 computedWood: pieceCosts.materials.wood,
//                 upholstery: pieceCosts.materials.upholstery,
//                 hardware: pieceCosts.materials.hardware,
//                 finishing: pieceCosts.materials.finishing,
//                 total: pieceCosts.materials.total
//               },
//               cnc: pieceCosts.cnc,
//               overhead: pieceCosts.overhead,
//               componentIds: data.selectedComponents || [],
//               components: components.map(c => ({
//                 id: c._id || c.id,
//                 name: c.componentName || c.name,
//                 type: c.componentType || c.type,
//                 cost: c.cost || 0,
//                 quantity: 1
//               }))
//             }
//           };
//           console.log('Created price sheet entry:', priceSheetEntry);
//           console.log('Calling onSubmitToPriceSheet');
//           onSubmitToPriceSheet(priceSheetEntry);
//           setShowConfirmDialog(false);
//         }}
//         data={data}
//         pieceCosts={pieceCosts}
//         componentsCost={componentsCost}
//         grandTotal={grandTotal}
//         components={components}
//       />
//     </div>
//   );
// };

// const calculateFinishingCost = (finishing) => {
//   if (!finishing?.materialId || !finishing?.surfaceArea || !finishing?.coats) {
//     return 0;
//   }
//   const areaInSqFt = Number(finishing.surfaceArea) / 144;
//   const litersNeeded = (areaInSqFt * Number(finishing.coats)) / Number(finishing.coverage);
//   const litersWithWaste = litersNeeded * 1.1;
//   return litersWithWaste * Number(finishing.costPerLiter || 0);
// };

// export default SummaryPanel;

//NEWCODE082625


// src/pages/pricing/components/SummaryPanel.jsx
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';
import { priceSheetApi } from '../../../api/priceSheet';

import { calculateTotalCosts } from '../../../utils/calculationUtils';

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
        setComponents([]);
        
        const allPriceSheetEntries = await priceSheetApi.getAll();
        const selectedIds = Array.isArray(data.selectedComponents) ? data.selectedComponents : [];
        
        const selectedComponents = selectedIds.map(id => {
          const component = allPriceSheetEntries.find(entry => 
            (entry._id === id || entry.id === id) && entry.isComponent
          );
          
          if (component) {
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
        }).filter(Boolean);
        
        setComponents(selectedComponents);
      } catch (error) {
        console.error('Error loading components:', error);
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

  const { pieceCosts, componentsCost, grandTotal } = calculateTotalCosts({
    data, 
    settings,
    totalLaborHours,
    calculateOverheadRate: () => calculateOverheadRate(),
    components
  });

  useEffect(() => {
    if (data.materials?.sheet && data.materials.sheet.length > 0) {
      console.log('Sheet materials in data:', data.materials.sheet);
      console.log('Sheet cost in pieceCosts:', pieceCosts.materials.sheet.cost);
    }
  }, [data.materials?.sheet, pieceCosts]);

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

          <CostSection
            title="Materials Costs"
            items={[
              ...((data.materials?.wood && data.materials.wood.length > 0) ? [
                { label: 'Wood Materials', value: pieceCosts.materials.wood.baseCost },
                ...(pieceCosts.materials.wood.wasteCost > 0 
                  ? [{ label: 'Wood Waste', value: pieceCosts.materials.wood.wasteCost, isIndented: true }] 
                  : [])
              ] : []),
              ...((data.materials?.sheet && data.materials.sheet.length > 0) ? [{
                label: 'Sheet Materials',
                value: pieceCosts.materials.sheet.cost
              }] : []),
              ...((data.materials?.upholstery?.items && data.materials.upholstery.items.length > 0) ? [{
                label: 'Upholstery',
                value: pieceCosts.materials.upholstery.cost
              }] : []),
              ...((data.materials?.hardware && data.materials.hardware.length > 0) ? [{
                label: 'Hardware',
                value: pieceCosts.materials.hardware.cost
              }] : []),
              ...((data.materials?.finishing && data.materials.finishing.materialId) ? [{
                label: 'Finishing',
                value: pieceCosts.materials.finishing.cost
              }] : [])
            ]}
            total={pieceCosts.materials.total}
          />

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
          const priceSheetEntry = {
            id: Date.now(),
            isComponent: data.isComponent,
            isCustom: data.isCustom, // ADD THIS LINE
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
                upholstery: data.materials.upholstery,
                hardware: data.materials.hardware,
                finishing: data.materials.finishing,
                sheet: data.materials.sheet,
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

export default SummaryPanel;

// // src/pages/pricing/components/SummaryPanel.jsx
// import React, { useState, useEffect } from 'react';
// import { FileText } from 'lucide-react';
// import ConfirmationDialog from './ConfirmationDialog';
// import { priceSheetApi } from '../../../api/priceSheet';

// // Import calculation utilities
// import { calculateTotalCosts } from '../../../utils/calculationUtils';

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
//         setComponents([]);
        
//         // First try to get components from the API
//         const allPriceSheetEntries = await priceSheetApi.getAll();
//         const selectedIds = Array.isArray(data.selectedComponents) ? data.selectedComponents : [];
        
//         // Map component IDs to actual component objects with consistent ID structure
//         const selectedComponents = selectedIds.map(id => {
//           const component = allPriceSheetEntries.find(entry => 
//             (entry._id === id || entry.id === id) && entry.isComponent
//           );
          
//           if (component) {
//             // Ensure consistent ID structure and property names
//             return {
//               ...component,
//               id: component._id || component.id,
//               _id: component._id || component.id,
//               componentName: component.componentName || component.name || 'Unnamed',
//               componentType: component.componentType || component.type || 'unknown',
//               cost: Number(component.cost) || 0
//             };
//           }
//           return null;
//         }).filter(Boolean); // Remove any undefined entries
        
//         setComponents(selectedComponents);
//       } catch (error) {
//         console.error('Error loading components:', error);
//         // Fallback to localStorage if API fails
//         const priceSheetData = JSON.parse(localStorage.getItem('priceSheetData') || '[]');
//         const selectedComponents = priceSheetData
//           .filter(item => data.selectedComponents && data.selectedComponents.includes(item.id || item._id))
//           .map(component => ({
//             ...component,
//             id: component._id || component.id,
//             _id: component._id || component.id,
//             componentName: component.componentName || component.name || 'Unnamed',
//             componentType: component.componentType || component.type || 'unknown',
//             cost: Number(component.cost) || 0
//           }));
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

//   // Calculate all costs using the centralized utility
//   const { pieceCosts, componentsCost, grandTotal } = calculateTotalCosts({
//     data, 
//     settings,
//     totalLaborHours,
//     calculateOverheadRate: () => calculateOverheadRate(),
//     components
//   });

//   // Log sheet costs to help debug
//   useEffect(() => {
//     if (data.materials?.sheet && data.materials.sheet.length > 0) {
//       console.log('Sheet materials in data:', data.materials.sheet);
//       console.log('Sheet cost in pieceCosts:', pieceCosts.materials.sheet.cost);
//     }
//   }, [data.materials?.sheet, pieceCosts]);

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
//               ...((data.materials?.sheet && data.materials.sheet.length > 0) ? [{
//                 label: 'Sheet Materials',
//                 value: pieceCosts.materials.sheet.cost
//               }] : []),
//               ...((data.materials?.upholstery?.items && data.materials.upholstery.items.length > 0) ? [{
//                 label: 'Upholstery',
//                 value: pieceCosts.materials.upholstery.cost
//               }] : []),
//               ...((data.materials?.hardware && data.materials.hardware.length > 0) ? [{
//                 label: 'Hardware',
//                 value: pieceCosts.materials.hardware.cost
//               }] : []),
//               ...((data.materials?.finishing && data.materials.finishing.materialId) ? [{
//                 label: 'Finishing',
//                 value: pieceCosts.materials.finishing.cost
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
//                 label: component.componentName || component.name || 'Unnamed',
//                 value: Number(component.cost) || 0,
//                 detail: component.componentType || component.type || 'unknown'
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
//                 upholstery: data.materials.upholstery,
//                 hardware: data.materials.hardware,
//                 finishing: data.materials.finishing,
//                 sheet: data.materials.sheet,
//                 total: pieceCosts.materials.total
//               },
//               cnc: pieceCosts.cnc,
//               overhead: pieceCosts.overhead,
//               componentIds: data.selectedComponents || [],
//               components: components.map(c => ({
//                 id: c._id || c.id || `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//                 name: c.componentName || c.name || 'Unnamed',
//                 type: c.componentType || c.type || 'unknown',
//                 cost: Number(c.cost) || 0,
//                 quantity: 1
//               }))
//             }
//           };
          
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

// export default SummaryPanel;
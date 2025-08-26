//NEWCODE082625


import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import ModelInput from './ModelInput';

const PieceCalculationForm = ({ 
  modelNumber, 
  data, 
  onChange, 
  onModelChange,
  savedComponents, 
  onComponentSelect,
  onComponentEdit,
  onComponentDelete,
  setActivePanel,
  isCustom // ADD THIS LINE
}) => {
  const [availableComponents, setAvailableComponents] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  
  useEffect(() => {
    setAvailableComponents(savedComponents || []);
  }, [savedComponents]);

  useEffect(() => {
    if (Array.isArray(data.selectedComponents) && data.selectedComponents.length) {
      setSelectedComponents(data.selectedComponents);
    } else {
      setSelectedComponents([]);
    }
  }, [data.selectedComponents]);

  const handleComponentSelect = (componentId) => {
    let newSelected;
    if (selectedComponents.includes(componentId)) {
      newSelected = selectedComponents.filter(id => id !== componentId);
    } else {
      newSelected = [...selectedComponents, componentId];
    }
    setSelectedComponents(newSelected);
    onChange('selectedComponents', newSelected);
  };

  const handleSaveAndContinue = () => {
    if (!isCustom && (!data.collection || !data.pieceNumber)) {
      alert('Please enter a valid model number');
      return;
    }
    setActivePanel('labor');
  };

  const groupedComponents = (availableComponents || []).reduce((acc, component) => {
    if (!component || !component.type) {
      return acc;
    }
    
    const componentType = component.type;
    if (!acc[componentType]) {
      acc[componentType] = [];
    }
    acc[componentType].push(component);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {!isCustom && (
        <ModelInput
          modelNumber={modelNumber}
          onChange={onModelChange}
        />
      )}

      {(modelNumber.length === 3 || isCustom) && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {isCustom ? 'Project Name' : 'Variation Name'}
            </label>
            <input 
              type="text"
              value={data.variation || ''}
              onChange={(e) => onChange('variation', e.target.value)}
              placeholder={isCustom ? 'e.g., Custom Kitchen Island' : 'e.g., Leather, Fabric, etc.'}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Select Components</h3>
            
            {availableComponents.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No components available. Create components first to add them to your piece.
              </p>
            )}
            
            {Object.entries(groupedComponents).map(([type, components]) => (
              <div key={type} className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {type} Components
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {components.map(component => {
                    const isSelected = selectedComponents.includes(component.id);
                    return (
                      <div
                        key={component.id}
                        onClick={() => handleComponentSelect(component.id)}
                        className={`
                          p-3 rounded-lg border cursor-pointer
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-blue-500'
                          }
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{component.name}</h4>
                            <p className="text-sm text-gray-500">${component.cost ? component.cost.toFixed(2) : '0.00'}</p>
                          </div>
                          <div className={`
                            w-5 h-5 rounded-full flex items-center justify-center
                            ${isSelected 
                              ? 'bg-blue-500 text-white' 
                              : 'border border-gray-300'
                            }
                          `}>
                            {isSelected && <X className="w-3 h-3" />}
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          {component.labor && (
                            <div>Labor: {getComponentLaborHours(component)} hrs</div>
                          )}
                          {component.materials && (
                            <div>Materials: ${getComponentMaterialsCost(component)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modelNumber.length === 3 && (
        <div className="text-sm text-gray-600">
          Collection: {modelNumber.charAt(0)}00, Piece: {modelNumber.slice(1)}
          {data.variation && ` - ${data.variation}`}
        </div>
      )}

      <div className="flex justify-end items-center pt-4">
        <button
          onClick={handleSaveAndContinue}
          className={`px-6 py-2 rounded-md text-white flex items-center space-x-2 ${
            (modelNumber.length === 3 || isCustom)
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!isCustom && modelNumber.length !== 3}
        >
          <span>Save & Continue</span>
        </button>
      </div>
    </div>
  );
};

const getComponentLaborHours = (component) => {
  if (!component.labor) return 0;
  
  return Object.values(component.labor).reduce((sum, labor) => {
    return sum + (Number(labor.hours) || 0);
  }, 0);
};

const getComponentMaterialsCost = (component) => {
  if (!component.materials) return '0.00';
  
  let cost = 0;
  
  if (Array.isArray(component.materials.wood)) {
    cost += component.materials.wood.reduce((sum, wood) => {
      return sum + ((Number(wood.boardFeet) || 0) * (Number(wood.cost) || 0));
    }, 0);
  }
  
  return cost.toFixed(2);
};

export default PieceCalculationForm;

// import React, { useState, useEffect } from 'react';
// import { Plus, X } from 'lucide-react';
// import ModelInput from './ModelInput';

// const PieceCalculationForm = ({ 
//   modelNumber, 
//   data, 
//   onChange, 
//   onModelChange,
//   savedComponents, 
//   onComponentSelect,
//   onComponentEdit,
//   onComponentDelete,
//   setActivePanel
// }) => {
//   const [availableComponents, setAvailableComponents] = useState([]);
//   const [selectedComponents, setSelectedComponents] = useState([]);
  
//   // Update availableComponents when savedComponents prop changes
//   useEffect(() => {
//     setAvailableComponents(savedComponents || []);
//   }, [savedComponents]);

//   // Initialize selected components from data if any
//   useEffect(() => {
//     if (Array.isArray(data.selectedComponents) && data.selectedComponents.length) {
//       setSelectedComponents(data.selectedComponents);
//     } else {
//       setSelectedComponents([]);
//     }
//   }, [data.selectedComponents]);

//   const handleComponentSelect = (componentId) => {
//     let newSelected;
//     if (selectedComponents.includes(componentId)) {
//       newSelected = selectedComponents.filter(id => id !== componentId);
//     } else {
//       newSelected = [...selectedComponents, componentId];
//     }
//     setSelectedComponents(newSelected);
//     onChange('selectedComponents', newSelected);
//   };

//   const handleSaveAndContinue = () => {
//     if (!data.collection || !data.pieceNumber) {
//       alert('Please enter a valid model number');
//       return;
//     }
//     setActivePanel('labor');
//   };

//   // Group components by type with safety checks
//   const groupedComponents = (availableComponents || []).reduce((acc, component) => {
//     if (!component || !component.type) {
//       return acc;
//     }
    
//     const componentType = component.type;
//     if (!acc[componentType]) {
//       acc[componentType] = [];
//     }
//     acc[componentType].push(component);
//     return acc;
//   }, {});

//   return (
//     <div className="space-y-6">
//       <ModelInput
//         modelNumber={modelNumber}
//         onChange={onModelChange}
//       />

//       {modelNumber.length === 3 && (
//         <>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Variation Name
//             </label>
//             <input 
//               type="text"
//               value={data.variation || ''}
//               onChange={(e) => onChange('variation', e.target.value)}
//               placeholder="e.g., Leather, Fabric, etc."
//               className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//             />
//           </div>

//           {/* Component Selection */}
//           <div className="border rounded-lg p-4">
//             <h3 className="text-lg font-medium mb-4">Select Components</h3>
            
//             {/* Display when no components are available */}
//             {availableComponents.length === 0 && (
//               <p className="text-gray-500 text-center py-4">
//                 No components available. Create components first to add them to your piece.
//               </p>
//             )}
            
//             {/* Component Groups */}
//             {Object.entries(groupedComponents).map(([type, components]) => (
//               <div key={type} className="mb-6">
//                 <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
//                   {type} Components
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   {components.map(component => {
//                     const isSelected = selectedComponents.includes(component.id);
//                     return (
//                       <div
//                         key={component.id}
//                         onClick={() => handleComponentSelect(component.id)}
//                         className={`
//                           p-3 rounded-lg border cursor-pointer
//                           ${isSelected 
//                             ? 'border-blue-500 bg-blue-50' 
//                             : 'border-gray-300 hover:border-blue-500'
//                           }
//                         `}
//                       >
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <h4 className="font-medium">{component.name}</h4>
//                             <p className="text-sm text-gray-500">${component.cost ? component.cost.toFixed(2) : '0.00'}</p>
//                           </div>
//                           <div className={`
//                             w-5 h-5 rounded-full flex items-center justify-center
//                             ${isSelected 
//                               ? 'bg-blue-500 text-white' 
//                               : 'border border-gray-300'
//                             }
//                           `}>
//                             {isSelected && <X className="w-3 h-3" />}
//                           </div>
//                         </div>
                        
//                         {/* Preview of component details */}
//                         <div className="mt-2 text-xs text-gray-500">
//                           {component.labor && (
//                             <div>Labor: {getComponentLaborHours(component)} hrs</div>
//                           )}
//                           {component.materials && (
//                             <div>Materials: ${getComponentMaterialsCost(component)}</div>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       {modelNumber.length === 3 && (
//         <div className="text-sm text-gray-600">
//           Collection: {modelNumber.charAt(0)}00, Piece: {modelNumber.slice(1)}
//           {data.variation && ` - ${data.variation}`}
//         </div>
//       )}

//       <div className="flex justify-end items-center pt-4">
//         <button
//           onClick={handleSaveAndContinue}
//           className={`px-6 py-2 rounded-md text-white flex items-center space-x-2 ${
//             modelNumber.length === 3 
//               ? 'bg-blue-600 hover:bg-blue-700' 
//               : 'bg-gray-400 cursor-not-allowed'
//           }`}
//           disabled={modelNumber.length !== 3}
//         >
//           <span>Save & Continue</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// // Helper functions
// const getComponentLaborHours = (component) => {
//   if (!component.labor) return 0;
  
//   return Object.values(component.labor).reduce((sum, labor) => {
//     return sum + (Number(labor.hours) || 0);
//   }, 0);
// };

// const getComponentMaterialsCost = (component) => {
//   if (!component.materials) return '0.00';
  
//   // This is a simplified calculation - adjust based on your actual materials structure
//   let cost = 0;
  
//   // Handle wood materials
//   if (Array.isArray(component.materials.wood)) {
//     cost += component.materials.wood.reduce((sum, wood) => {
//       return sum + ((Number(wood.boardFeet) || 0) * (Number(wood.cost) || 0));
//     }, 0);
//   }
  
//   return cost.toFixed(2);
// };

// export default PieceCalculationForm;

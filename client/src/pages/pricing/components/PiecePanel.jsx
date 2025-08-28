//NEWCODE082625


import { useState, useEffect } from 'react';
import { COMPONENTS_STORAGE_KEY } from '../features/calculator/constants/calculatorConstants';
import ModeSelector from './piece/ModeSelector';
import ComponentForm from './piece/ComponentForm';
import PieceCalculationForm from './piece/PieceCalculationForm';
import { priceSheetApi } from '../../../api/priceSheet';

const PiecePanel = ({ data, onChange, setActivePanel }) => {
  const [modelNumber, setModelNumber] = useState('');
  const [skipEffect, setSkipEffect] = useState(false);
  const [savedComponents, setSavedComponents] = useState([]);
  const [loadingComponents, setLoadingComponents] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (skipEffect) {
      setSkipEffect(false);
      return;
    }

    if (data.collection && data.pieceNumber) {
      const collectionFirst = data.collection.charAt(0);
      const paddedPieceNumber = data.pieceNumber.padStart(2, '0');
      setModelNumber(`${collectionFirst}${paddedPieceNumber}`);
    } else {
      setModelNumber('');
    }
  }, [data.collection, data.pieceNumber]);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoadingComponents(true);
        
        const allPriceSheetEntries = await priceSheetApi.getAll();
        const componentEntries = allPriceSheetEntries.filter(entry => entry.isComponent);
        
        const formattedComponents = componentEntries.map(entry => ({
          id: entry._id || entry.id,
          _id: entry._id || entry.id,
          name: entry.componentName || entry.name || '',
          type: entry.componentType || entry.type || 'unknown',
          cost: Number(entry.cost) || 0,
          labor: extractLaborData(entry),
          materials: entry.details?.materials || {},
          cnc: entry.details?.cnc || {}
        }));
        
        if (formattedComponents.length > 0) {
          setSavedComponents(formattedComponents);
        } else {
          fallbackToLocalStorage();
        }
      } catch (error) {
        setLoadError(error.message);
        fallbackToLocalStorage();
      } finally {
        setLoadingComponents(false);
      }
    };
    
    const fallbackToLocalStorage = () => {
      try {
        const components = localStorage.getItem(COMPONENTS_STORAGE_KEY);
        if (components) {
          const parsedComponents = JSON.parse(components);
          const formattedComponents = parsedComponents.map(comp => ({
            ...comp,
            id: comp._id || comp.id,
            _id: comp._id || comp.id
          }));
          setSavedComponents(formattedComponents);
        } else {
          const timestamp = Date.now();
          const testComponent = {
            id: `test-${timestamp}`,
            _id: `test-${timestamp}`,
            name: 'Test Component',
            type: 'test',
            cost: 100,
            labor: {
              stockProduction: { hours: 1, rate: 50 },
              cncOperator: { hours: 0, rate: 0 },
              assembly: { hours: 0, rate: 0 },
              finishing: { hours: 0, rate: 0 },
              upholstery: { hours: 0, rate: 0 }
            },
            materials: {
              wood: []
            },
            cnc: {
              runtime: 0,
              rate: 0
            }
          };
          setSavedComponents([testComponent]);
        }
      } catch (error) {
        setLoadError(error.message);
      }
    };

    fetchComponents();
  }, []);

  const extractLaborData = (entry) => {
    const laborData = {
      stockProduction: { hours: 0, rate: 0 },
      cncOperator: { hours: 0, rate: 0 },
      assembly: { hours: 0, rate: 0 },
      finishing: { hours: 0, rate: 0 },
      upholstery: { hours: 0, rate: 0 }
    };
    
    if (entry.details?.labor?.breakdown) {
      entry.details.labor.breakdown.forEach(item => {
        const type = item.type.replace(/\s+/g, '');
        let key = type.charAt(0).toLowerCase() + type.slice(1);
        
        if (type.toLowerCase() === 'stockproduction') key = 'stockProduction';
        if (type.toLowerCase() === 'cncoperator') key = 'cncOperator';
        
        if (laborData[key]) {
          laborData[key] = { 
            hours: Number(item.hours) || 0, 
            rate: Number(item.rate) || 0 
          };
        }
      });
    }
    
    return laborData;
  };

  const handleModeChange = (mode) => {
    // Retrieve saved settings so we can use default rates
    const savedSettings = JSON.parse(localStorage.getItem('calculatorSettings') || '{}');
    const defaultLabor = savedSettings.labor || {
      stockProduction: { rate: '' },
      cncOperator: { rate: '' },
      assembly: { rate: '' },
      finishing: { rate: '' },
      upholstery: { rate: '' }
    };
    const defaultCNC = savedSettings.cnc || { rate: '' };
    
    const baseUpdates = {
      editingComponentId: null,
      componentName: '',
      componentType: '',
      collection: '',
      pieceNumber: '',
      variation: '',
      selectedComponents: [],
      labor: {
        stockProduction: { hours: '', rate: defaultLabor.stockProduction.rate },
        cncOperator: { hours: '', rate: defaultLabor.cncOperator.rate },
        assembly: { hours: '', rate: defaultLabor.assembly.rate },
        finishing: { hours: '', rate: defaultLabor.finishing.rate },
        upholstery: { hours: '', rate: defaultLabor.upholstery.rate }
      },
      materials: {
        wood: [],
        upholstery: {
          foam: { type: '', cost: '' },
          covering: { type: '', cost: '' }
        },
        hardware: [],
        finishing: {
          materialId: '',
          materialName: '',
          surfaceArea: '',
          coats: '',
          coverage: '',
          costPerLiter: ''
        }
      },
      cnc: {
        runtime: '',
        rate: defaultCNC.rate
      }
    };

    if (mode === 'component') {
      onChange('isComponent', true);
      onChange('isCustom', false); // ADD THIS LINE
      Object.entries(baseUpdates).forEach(([field, value]) => {
        onChange(field, value);
      });
    } else if (mode === 'custom') {
      onChange('isComponent', false);
      onChange('isCustom', true); // ADD THIS LINE
      Object.entries(baseUpdates).forEach(([field, value]) => {
        onChange(field, value);
      });
    } else { // 'piece' mode
      onChange('isComponent', false);
      onChange('isCustom', false); // ADD THIS LINE
      Object.entries(baseUpdates).forEach(([field, value]) => {
        onChange(field, value);
      });
    }
  };

  const handleModelChange = (value) => {
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue.length <= 3) {
      setModelNumber(numericValue);
      setSkipEffect(true);
      
      if (numericValue.length === 3) {
        const collection = numericValue.charAt(0) + '00';
        const pieceNumber = numericValue.slice(1);
        
        onChange('collection', collection);
        onChange('pieceNumber', pieceNumber);
      } else {
        onChange('collection', '');
        onChange('pieceNumber', '');
      }
    }
  };

  const handleComponentSelect = (componentId) => {
    let newSelected;
    if (data.selectedComponents.includes(componentId)) {
      newSelected = data.selectedComponents.filter(id => id !== componentId);
    } else {
      newSelected = [...data.selectedComponents, componentId];
    }
    onChange('selectedComponents', newSelected);
  };

  const handleComponentEdit = (component, e) => {
    e.stopPropagation();
    
    onChange('isComponent', true);
    setTimeout(() => {
      onChange('editingComponentId', component.id || component._id);
      onChange('componentName', component.name || component.componentName || '');
      onChange('componentType', component.type || component.componentType || '');
      onChange('labor', component.labor);
      onChange('materials', component.materials);
      onChange('cnc', component.cnc);
      setActivePanel('labor');
    }, 0);
  };
  
  const handleComponentDelete = (componentId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this component?')) {
      const updatedComponents = savedComponents.filter(c => 
        c.id !== componentId && c._id !== componentId
      );
      setSavedComponents(updatedComponents);
      
      if (data.selectedComponents?.includes(componentId)) {
        onChange('selectedComponents', 
          data.selectedComponents.filter(id => id !== componentId)
        );
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      <ModeSelector 
        isComponent={data.isComponent}
        isCustom={data.isCustom} // ADD THIS LINE
        onModeChange={handleModeChange}
      />

      {loadingComponents && (
        <div className="text-center py-4 text-blue-600">
          Loading components...
        </div>
      )}

      {loadError && (
        <div className="text-center py-4 text-red-600">
          Error loading components: {loadError}
        </div>
      )}

      {data.isComponent ? (
        <ComponentForm data={data} onChange={onChange} setActivePanel={setActivePanel} />
      ) : (
        <PieceCalculationForm
          modelNumber={modelNumber}
          data={data}
          onChange={onChange}
          onModelChange={handleModelChange}
          savedComponents={savedComponents}
          onComponentSelect={handleComponentSelect}
          onComponentEdit={handleComponentEdit}
          onComponentDelete={handleComponentDelete}
          setActivePanel={setActivePanel}
          isCustom={data.isCustom} // ADD THIS LINE
        />
      )}
    </div>
  );
};

export default PiecePanel;

// // src/pages/pricing/components/PiecePanel.jsx
// import { useState, useEffect } from 'react';
// import { COMPONENTS_STORAGE_KEY } from '../features/calculator/constants/calculatorConstants';
// import ModeSelector from './piece/ModeSelector';
// import ComponentForm from './piece/ComponentForm';
// import PieceCalculationForm from './piece/PieceCalculationForm';
// import { priceSheetApi } from '../../../api/priceSheet';

// const PiecePanel = ({ data, onChange, setActivePanel }) => {
//   const [modelNumber, setModelNumber] = useState('');
//   const [skipEffect, setSkipEffect] = useState(false);
//   const [savedComponents, setSavedComponents] = useState([]);
//   const [loadingComponents, setLoadingComponents] = useState(true);
//   const [loadError, setLoadError] = useState(null);

//   useEffect(() => {
//     if (skipEffect) {
//       setSkipEffect(false);
//       return;
//     }

//     if (data.collection && data.pieceNumber) {
//       const collectionFirst = data.collection.charAt(0);
//       const paddedPieceNumber = data.pieceNumber.padStart(2, '0');
//       setModelNumber(`${collectionFirst}${paddedPieceNumber}`);
//     } else {
//       setModelNumber('');
//     }
//   }, [data.collection, data.pieceNumber]);

//   useEffect(() => {
//     const fetchComponents = async () => {
//       try {
//         setLoadingComponents(true);
        
//         // First try loading from API
//         const allPriceSheetEntries = await priceSheetApi.getAll();
//         const componentEntries = allPriceSheetEntries.filter(entry => entry.isComponent);
        
//         // Create a consistent ID structure for all components
//         const formattedComponents = componentEntries.map(entry => ({
//           id: entry._id || entry.id,
//           _id: entry._id || entry.id,
//           name: entry.componentName || entry.name || '',
//           type: entry.componentType || entry.type || 'unknown',
//           cost: Number(entry.cost) || 0,
//           labor: extractLaborData(entry),
//           materials: entry.details?.materials || {},
//           cnc: entry.details?.cnc || {}
//         }));
        
//         if (formattedComponents.length > 0) {
//           setSavedComponents(formattedComponents);
//         } else {
//           fallbackToLocalStorage();
//         }
//       } catch (error) {
//         setLoadError(error.message);
//         fallbackToLocalStorage();
//       } finally {
//         setLoadingComponents(false);
//       }
//     };
    
//     // Fallback function to try localStorage
//     const fallbackToLocalStorage = () => {
//       try {
//         const components = localStorage.getItem(COMPONENTS_STORAGE_KEY);
//         if (components) {
//           const parsedComponents = JSON.parse(components);
//           // Ensure consistent ID properties
//           const formattedComponents = parsedComponents.map(comp => ({
//             ...comp,
//             id: comp._id || comp.id,
//             _id: comp._id || comp.id
//           }));
//           setSavedComponents(formattedComponents);
//         } else {
//           // Add test component for debugging with unique ID
//           const timestamp = Date.now();
//           const testComponent = {
//             id: `test-${timestamp}`,
//             _id: `test-${timestamp}`,
//             name: 'Test Component',
//             type: 'test',
//             cost: 100,
//             labor: {
//               stockProduction: { hours: 1, rate: 50 },
//               cncOperator: { hours: 0, rate: 0 },
//               assembly: { hours: 0, rate: 0 },
//               finishing: { hours: 0, rate: 0 },
//               upholstery: { hours: 0, rate: 0 }
//             },
//             materials: {
//               wood: []
//             },
//             cnc: {
//               runtime: 0,
//               rate: 0
//             }
//           };
//           setSavedComponents([testComponent]);
//         }
//       } catch (error) {
//         setLoadError(error.message);
//       }
//     };

//     // Start the loading process
//     fetchComponents();
//   }, []);

//   // Helper function to extract labor data
//   const extractLaborData = (entry) => {
//     const laborData = {
//       stockProduction: { hours: 0, rate: 0 },
//       cncOperator: { hours: 0, rate: 0 },
//       assembly: { hours: 0, rate: 0 },
//       finishing: { hours: 0, rate: 0 },
//       upholstery: { hours: 0, rate: 0 }
//     };
    
//     // Map from breakdown format to the format expected by the UI
//     if (entry.details?.labor?.breakdown) {
//       entry.details.labor.breakdown.forEach(item => {
//         const type = item.type.replace(/\s+/g, '');
//         let key = type.charAt(0).toLowerCase() + type.slice(1);
        
//         // Special case handling
//         if (type.toLowerCase() === 'stockproduction') key = 'stockProduction';
//         if (type.toLowerCase() === 'cncoperator') key = 'cncOperator';
        
//         if (laborData[key]) {
//           laborData[key] = { 
//             hours: Number(item.hours) || 0, 
//             rate: Number(item.rate) || 0 
//           };
//         }
//       });
//     }
    
//     return laborData;
//   };

//   const handleModeChange = (mode) => {
//     if (mode === 'component') {
//       onChange('isComponent', true); 
//       setTimeout(() => {
//         // Retrieve saved settings so we can use default rates
//         const savedSettings = JSON.parse(localStorage.getItem('calculatorSettings') || '{}');
//         const defaultLabor = savedSettings.labor || {
//           stockProduction: { rate: '' },
//           cncOperator: { rate: '' },
//           assembly: { rate: '' },
//           finishing: { rate: '' },
//           upholstery: { rate: '' }
//         };
//         const defaultCNC = savedSettings.cnc || { rate: '' };

//         const updates = {
//           editingComponentId: null,
//           componentName: '',
//           componentType: '',
//           collection: '',
//           pieceNumber: '',
//           variation: '',
//           selectedComponents: [],
//           // Set labor rates using defaults from settings rather than empty strings
//           labor: {
//             stockProduction: { hours: '', rate: defaultLabor.stockProduction.rate },
//             cncOperator: { hours: '', rate: defaultLabor.cncOperator.rate },
//             assembly: { hours: '', rate: defaultLabor.assembly.rate },
//             finishing: { hours: '', rate: defaultLabor.finishing.rate },
//             upholstery: { hours: '', rate: defaultLabor.upholstery.rate }
//           },
//           materials: {
//             wood: [],
//             upholstery: {
//               foam: { type: '', cost: '' },
//               covering: { type: '', cost: '' }
//             },
//             hardware: [],
//             finishing: {
//               materialId: '',
//               materialName: '',
//               surfaceArea: '',
//               coats: '',
//               coverage: '',
//               costPerLiter: ''
//             }
//           },
//           cnc: {
//             runtime: '',
//             rate: defaultCNC.rate
//           }
//         };

//         Object.entries(updates).forEach(([field, value]) => {
//           onChange(field, value);
//         });
//       }, 0);
//     } else {
//       onChange('isComponent', false);
      
//       setTimeout(() => {
//         onChange('editingComponentId', null);
//         onChange('componentName', '');
//         onChange('componentType', '');
//       }, 0);
//     }
//   };

//   const handleModelChange = (value) => {
//     const numericValue = value.replace(/\D/g, '');
    
//     if (numericValue.length <= 3) {
//       setModelNumber(numericValue);
//       setSkipEffect(true);
      
//       if (numericValue.length === 3) {
//         const collection = numericValue.charAt(0) + '00';
//         const pieceNumber = numericValue.slice(1);
        
//         onChange('collection', collection);
//         onChange('pieceNumber', pieceNumber);
//       } else {
//         onChange('collection', '');
//         onChange('pieceNumber', '');
//       }
//     }
//   };

//   const handleComponentSelect = (componentId, isSelected) => {
//     const newComponents = isSelected
//       ? (data.selectedComponents || []).filter(id => id !== componentId)
//       : [...(data.selectedComponents || []), componentId];
    
//     onChange('selectedComponents', newComponents);
//   };

//   const handleComponentEdit = (component, e) => {
//     e.stopPropagation();
    
//     onChange('isComponent', true);
//     setTimeout(() => {
//       onChange('editingComponentId', component.id || component._id);
//       onChange('componentName', component.name || component.componentName || '');
//       onChange('componentType', component.type || component.componentType || '');
//       onChange('labor', component.labor);
//       onChange('materials', component.materials);
//       onChange('cnc', component.cnc);
//       setActivePanel('labor');
//     }, 0);
//   };
  
//   const handleComponentDelete = (componentId, e) => {
//     e.stopPropagation();
//     if (window.confirm('Are you sure you want to delete this component?')) {
//       const updatedComponents = savedComponents.filter(c => 
//         c.id !== componentId && c._id !== componentId
//       );
//       setSavedComponents(updatedComponents);
      
//       if (data.selectedComponents?.includes(componentId)) {
//         onChange('selectedComponents', 
//           data.selectedComponents.filter(id => id !== componentId)
//         );
//       }
//     }
//   };

//   return (
//     <div className="p-4 space-y-6">
//       <ModeSelector 
//         isComponent={data.isComponent}
//         onModeChange={handleModeChange}
//       />

//       {loadingComponents && (
//         <div className="text-center py-4 text-blue-600">
//           Loading components...
//         </div>
//       )}

//       {loadError && (
//         <div className="text-center py-4 text-red-600">
//           Error loading components: {loadError}
//         </div>
//       )}

//       {data.isComponent ? (
//         <ComponentForm data={data} onChange={onChange} setActivePanel={setActivePanel} />
//       ) : (
//         <PieceCalculationForm
//           modelNumber={modelNumber}
//           data={data}
//           onChange={onChange}
//           onModelChange={handleModelChange}
//           savedComponents={savedComponents}
//           onComponentSelect={handleComponentSelect}
//           onComponentEdit={handleComponentEdit}
//           onComponentDelete={handleComponentDelete}
//           setActivePanel={setActivePanel}
//         />
//       )}
//     </div>
//   );
// };

// export default PiecePanel;

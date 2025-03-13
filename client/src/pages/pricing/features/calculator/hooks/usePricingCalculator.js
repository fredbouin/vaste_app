import { useState, useEffect } from 'react';
import { AUTOSAVE_KEY, COMPONENTS_STORAGE_KEY, PRICE_SHEET_KEY } from '../constants/calculatorConstants';

const AUTOSAVE_DELAY = 1000;

const getInitialData = () => {
  const savedData = localStorage.getItem(AUTOSAVE_KEY);
  return savedData ? JSON.parse(savedData) : {
    collection: '',
    pieceNumber: '',
    isComponent: false,
    componentName: '',
    componentType: '',
    variation: '',
    selectedComponents: [],
    labor: {
      stockProduction: { hours: '', rate: '' },
      cncOperator: { hours: '', rate: '' },
      assembly: { hours: '', rate: '' },
      finishing: { hours: '', rate: '' },
      upholstery: { hours: '', rate: '' }
    },
    materials: {
      wood: [],
      sheet: [],
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
      rate: ''
    }
  };
};

const usePricingCalculator = () => {
  const [activePanel, setActivePanel] = useState('piece');
  const [settings, setSettings] = useState(null);
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [data, setData] = useState(getInitialData);
  const [initialized, setInitialized] = useState(false);

  // Load settings and initialize data with rates
  useEffect(() => {
    const loadSettings = () => {
    const savedSettings = localStorage.getItem('calculatorSettings');
      
      console.log('Raw saved data:', savedData);

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        return parsedSettings;
      }
      return null;
    };

    const initializeRates = (currentData, currentSettings) => {
      if (!currentSettings) return currentData;

      // Initialize labor rates
      const updatedLabor = Object.entries(currentData.labor).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: {
          ...value,
          rate: value.rate || currentSettings.labor[key]?.rate || ''
        }
      }), {});

      // Initialize CNC rate
      const updatedCNC = {
        ...currentData.cnc,
        rate: currentData.cnc.rate || currentSettings.cnc?.rate || ''
      };

      return {
        ...currentData,
        labor: updatedLabor,
        cnc: updatedCNC
      };
    };

    const init = async () => {
      const currentSettings = loadSettings();
      setData(prevData => initializeRates(prevData, currentSettings));
      setInitialized(true);
    };

    if (!initialized) {
      init();
    }
  }, [initialized]);

  const autoSave = (newData) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeoutId = setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(newData));
    }, AUTOSAVE_DELAY);

    setSaveTimeout(timeoutId);
  };

  const handlePieceDataChange = (field, value) => {
    console.log('Updating field:', field, 'value:', value); // Debug log
    setData(prevData => {
      const newData = { ...prevData };
      if (field === 'selectedComponents') {
        newData.selectedComponents = value;
      } else if (typeof value === 'object' && value !== null) {
        newData[field] = { ...newData[field], ...value };
      } else {
        newData[field] = value;
      }
      
      // Debug log the new state
      console.log('Updated data:', newData);
      autoSave(newData);
      return newData;
    });
  };

  const handleLaborChange = (updatedLabor) => {
    setData(prevData => {
      const newData = {
        ...prevData,
        labor: updatedLabor
      };
      autoSave(newData);
      return newData;
    });
  };

  const handleMaterialsChange = (updatedMaterials) => {
    const processedWood = updatedMaterials.wood.map(wood => {
      if (wood.cost === '' && wood.species && wood.thickness) {
        const savedCost = settings?.materials?.wood?.[wood.species]?.[wood.thickness]?.cost || '';
        return { ...wood, cost: savedCost };
      }
      return wood;
    });

    const newMaterials = {
      ...updatedMaterials,
      wood: processedWood
    };

    setData(prevData => {
      const newData = {
        ...prevData,
        materials: newMaterials
      };
      autoSave(newData);
      return newData;
    });
  };

  const handleCNCChange = (updatedCNC) => {
    setData(prevData => {
      const newData = {
        ...prevData,
        cnc: updatedCNC
      };
      autoSave(newData);
      return newData;
    });
  };

  const calculateOverheadRate = () => {
    const overhead = settings?.overhead;
    if (!overhead?.monthlyOverhead || !overhead?.employees || !overhead?.monthlyProdHours) {
      return 0;
    }
    
    const totalEmployeeHours = Number(overhead.employees) * Number(overhead.monthlyProdHours);
    const totalCNCHours = Number(overhead.monthlyCNCHours || 0);
    const totalHours = totalEmployeeHours + totalCNCHours;
    
    return totalHours > 0 ? Number(overhead.monthlyOverhead) / totalHours : 0;
  };

  const calculateTotalLaborHours = () => {
    const laborHours = Object.values(data.labor).reduce((sum, { hours }) => 
      sum + (Number(hours) || 0), 0
    );
    const cncHours = Number(data.cnc?.runtime) || 0;
    return laborHours + cncHours;
  };

  const handleSubmitToPriceSheet = (priceSheetEntry) => {
    const existingData = JSON.parse(localStorage.getItem(PRICE_SHEET_KEY) || '[]');
    
    const entryIndex = existingData.findIndex(item => 
      item.collection === priceSheetEntry.collection && 
      item.model === priceSheetEntry.model &&
      item.variation === priceSheetEntry.variation
    );

    let updatedData;
    if (entryIndex >= 0) {
      updatedData = [
        ...existingData.slice(0, entryIndex),
        priceSheetEntry,
        ...existingData.slice(entryIndex + 1)
      ];
    } else {
      updatedData = [...existingData, priceSheetEntry];
    }
    
    localStorage.setItem(PRICE_SHEET_KEY, JSON.stringify(updatedData));
    localStorage.removeItem(AUTOSAVE_KEY);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return {
    data,
    settings,
    activePanel,
    setActivePanel,
    handlePieceDataChange,
    handleLaborChange,
    handleMaterialsChange,
    handleCNCChange,
    handleSubmitToPriceSheet,
    calculateTotalLaborHours,
    calculateOverheadRate
  };
};

export default usePricingCalculator;

// import { useState, useEffect } from 'react';
// import { AUTOSAVE_KEY, COMPONENTS_STORAGE_KEY, PRICE_SHEET_KEY } from '../constants/calculatorConstants';

// const AUTOSAVE_DELAY = 1000;

// const usePricingCalculator = () => {
//   const [activePanel, setActivePanel] = useState('piece');
//   const [settings, setSettings] = useState(null);
//   const [saveTimeout, setSaveTimeout] = useState(null);
  
//   const [data, setData] = useState(() => {
//     const savedData = localStorage.getItem(AUTOSAVE_KEY);
//     return savedData ? JSON.parse(savedData) : {
//       collection: '',
//       pieceNumber: '',
//       isComponent: false,
//       componentName: '',
//       componentType: '',
//       variation: '',
//       selectedComponents: [],
//       labor: {
//         stockProduction: { hours: '', rate: '' },
//         cncOperator: { hours: '', rate: '' },
//         assembly: { hours: '', rate: '' },
//         finishing: { hours: '', rate: '' },
//         upholstery: { hours: '', rate: '' }
//       },
//       materials: {
//         wood: [],
//         sheet: [],
//         upholstery: {
//           foam: { type: '', cost: '' },
//           covering: { type: '', cost: '' }
//         },
//         hardware: [],
//         finishing: {
//           materialId: '',
//           materialName: '',
//           surfaceArea: '',
//           coats: '',
//           coverage: '',
//           costPerLiter: ''
//         }
//       },
//       cnc: {
//         runtime: '',
//         rate: ''
//       },
//       overhead: {
//         rate: 0,
//         monthlyOverhead: '',
//         employees: '',
//         monthlyProdHours: '',
//         monthlyCNCHours: ''
//       }
//     };
//   });

//   // Load settings on mount
//   useEffect(() => {
//     const savedSettings = localStorage.getItem('calculatorSettings');
//     if (savedSettings) {
//       const parsedSettings = JSON.parse(savedSettings);
//       setSettings(parsedSettings);
      
//       // Apply settings to data
//       setData(prev => ({
//         ...prev,
//         labor: Object.entries(prev.labor).reduce((acc, [key, value]) => ({
//           ...acc,
//           [key]: {
//             ...value,
//             rate: parsedSettings.labor[key]?.rate || ''
//           }
//         }), {}),
//         cnc: {
//           ...prev.cnc,
//           rate: parsedSettings.cnc?.rate || ''
//         },
//         overhead: {
//           ...prev.overhead,
//           ...parsedSettings.overhead
//         }
//       }));
//     }
//   }, []);

//   const autoSave = (newData) => {
//     if (saveTimeout) {
//       clearTimeout(saveTimeout);
//     }

//     const timeoutId = setTimeout(() => {
//       localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(newData));
//     }, AUTOSAVE_DELAY);

//     setSaveTimeout(timeoutId);
//   };

//   const handlePieceDataChange = (field, value) => {
//     setData(prevData => {
//       const newData = { ...prevData };
      
//       if (typeof value === 'object' && value !== null) {
//         newData[field] = { ...newData[field], ...value };
//       } else {
//         newData[field] = value;
//       }
      
//       autoSave(newData);
//       return newData;
//     });
//   };

//   const handleLaborChange = (updatedLabor) => {
//     setData(prevData => {
//       const newData = {
//         ...prevData,
//         labor: updatedLabor
//       };
//       autoSave(newData);
//       return newData;
//     });
//   };

//   const handleMaterialsChange = (updatedMaterials) => {
//     const processedWood = updatedMaterials.wood.map(wood => {
//       if (wood.cost === '' && wood.species && wood.thickness) {
//         const savedCost = settings?.materials?.wood?.[wood.species]?.[wood.thickness]?.cost || '';
//         return { ...wood, cost: savedCost };
//       }
//       return wood;
//     });

//     const newMaterials = {
//       ...updatedMaterials,
//       wood: processedWood
//     };

//     setData(prevData => {
//       const newData = {
//         ...prevData,
//         materials: newMaterials
//       };
//       autoSave(newData);
//       return newData;
//     });
//   };

//   const handleCNCChange = (updatedCNC) => {
//     setData(prevData => {
//       const newData = {
//         ...prevData,
//         cnc: updatedCNC
//       };
//       autoSave(newData);
//       return newData;
//     });
//   };

//   const calculateOverheadRate = () => {
//     const overhead = settings?.overhead;
//     if (!overhead?.monthlyOverhead || !overhead?.employees || !overhead?.monthlyProdHours) {
//       return 0;
//     }
    
//     const totalEmployeeHours = Number(overhead.employees) * Number(overhead.monthlyProdHours);
//     const totalCNCHours = Number(overhead.monthlyCNCHours || 0);
//     const totalHours = totalEmployeeHours + totalCNCHours;
    
//     return totalHours > 0 ? Number(overhead.monthlyOverhead) / totalHours : 0;
//   };

//   const calculateTotalLaborHours = () => {
//     const laborHours = Object.values(data.labor).reduce((sum, { hours }) => 
//       sum + (Number(hours) || 0), 0
//     );
//     const cncHours = Number(data.cnc?.runtime) || 0;
//     return laborHours + cncHours;
//   };

//   const handleSubmitToPriceSheet = (priceSheetEntry) => {
//     const totalLaborHours = calculateTotalLaborHours();
//     const overheadRate = calculateOverheadRate();
//     const overheadCost = overheadRate * totalLaborHours;

//     const updatedEntry = {
//       ...priceSheetEntry,
//       details: {
//         ...priceSheetEntry.details,
//         overhead: {
//           rate: overheadRate,
//           cost: overheadCost,
//           totalHours: totalLaborHours
//         }
//       }
//     };

//     const existingData = JSON.parse(localStorage.getItem(PRICE_SHEET_KEY) || '[]');
    
//     const entryIndex = existingData.findIndex(item => 
//       item.collection === updatedEntry.collection && 
//       item.model === updatedEntry.model &&
//       item.variation === updatedEntry.variation
//     );

//     let updatedData;
//     if (entryIndex >= 0) {
//       updatedData = [
//         ...existingData.slice(0, entryIndex),
//         updatedEntry,
//         ...existingData.slice(entryIndex + 1)
//       ];
//     } else {
//       updatedData = [...existingData, updatedEntry];
//     }
    
//     localStorage.setItem(PRICE_SHEET_KEY, JSON.stringify(updatedData));
//     localStorage.removeItem(AUTOSAVE_KEY);
//   };

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (saveTimeout) {
//         clearTimeout(saveTimeout);
//       }
//     };
//   }, [saveTimeout]);

//   return {
//     data,
//     settings,
//     activePanel,
//     setActivePanel,
//     handlePieceDataChange,
//     handleLaborChange,
//     handleMaterialsChange,
//     handleCNCChange,
//     handleSubmitToPriceSheet,
//     calculateTotalLaborHours,
//     calculateOverheadRate
//   };
// };

// export default usePricingCalculator;
// src/pages/pricing/features/calculator/components/FurniturePricingCalculator.jsx
import React, { useState, useEffect } from 'react';
import { priceSheetApi } from '../../../../../api/priceSheet';
import PiecePanel from '../../../components/PiecePanel';
import LaborPanel from '../../../components/LaborPanel';
import MaterialsPanel from '../../../components/MaterialsPanel';
import CNCPanel from '../../../components/CNCPanel';
import SummaryPanel from '../../../components/SummaryPanel';

const initialState = {
  isComponent: false,
  editingId: null,
  componentName: '',
  componentType: '',
  collection: '',
  pieceNumber: '',
  variation: '',
  selectedComponents: [],
  labor: {
    stockProduction: { hours: '', rate: '' },
    cncOperator: { hours: '', rate: '' },
    assembly: { hours: '', rate: '' },
    finishing: { hours: '', rate: '' },
    upholstery: { hours: '', rate: '' },
    surcharge: {
      percentage: 0,
      cost: 0
    }
  },
  materials: {
    wood: [],
    sheet: [],
    upholstery: {
      items: []
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

const FurniturePricingCalculator = () => {
  const [data, setData] = useState(initialState);
  const [settings, setSettings] = useState(null);
  const [activePanel, setActivePanel] = useState('piece');

  useEffect(() => {
    // Load calculator settings
    const savedSettings = localStorage.getItem('calculatorSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      
      // Merge default rates from settings into labor
      setData(prev => ({
        ...prev,
        labor: {
          stockProduction: { 
            ...prev.labor.stockProduction,
            hours: prev.labor.stockProduction.hours || '',
            rate: parsedSettings.labor.stockProduction.rate || prev.labor.stockProduction.rate 
          },
          cncOperator: { 
            ...prev.labor.cncOperator,
            hours: prev.labor.cncOperator.hours || '',
            rate: parsedSettings.labor.cncOperator.rate || prev.labor.cncOperator.rate 
          },
          assembly: { 
            ...prev.labor.assembly, 
            rate: parsedSettings.labor.assembly.rate || prev.labor.assembly.rate 
          },
          finishing: { 
            ...prev.labor.finishing, 
            rate: parsedSettings.labor.finishing.rate || prev.labor.finishing.rate 
          },
          upholstery: { 
            ...prev.labor.upholstery, 
            rate: parsedSettings.labor.upholstery.rate || prev.labor.upholstery.rate 
          },
          surcharge: {
            percentage: parsedSettings.labor.extraFee || 0,
            cost: 0
          }
        },
        cnc: {
          ...prev.cnc,
          rate: parsedSettings.cnc.rate || prev.cnc.rate
        }
      }));
    }

    // Check for autosaved data (or editing data)
    const savedData = localStorage.getItem('calculatorAutosave');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Parsed saved data:', parsedData);
        const updatedData = {
          ...parsedData,
          labor: {
            ...initialState.labor,
            ...parsedData.labor,
            stockProduction: {
              ...initialState.labor.stockProduction,
              ...(parsedData.labor?.stockProduction || {}),
              hours: parsedData.labor?.stockProduction?.hours ?? ''
            },
            cncOperator: {
              ...initialState.labor.cncOperator,
              ...(parsedData.labor?.cncOperator || {}),
              hours: parsedData.labor?.cncOperator?.hours ?? ''
            },
            assembly: {
              ...initialState.labor.assembly,
              ...(parsedData.labor?.assembly || {}),
              hours: parsedData.labor?.assembly?.hours ?? ''
            },
            finishing: {
              ...initialState.labor.finishing,
              ...(parsedData.labor?.finishing || {}),
              hours: parsedData.labor?.finishing?.hours ?? ''
            },
            upholstery: {
              ...initialState.labor.upholstery,
              ...(parsedData.labor?.upholstery || {}),
              hours: parsedData.labor?.upholstery?.hours ?? ''
            }
          }
        };
        console.log('Updated data for editing:', updatedData);
        setData(updatedData);
        localStorage.removeItem('calculatorAutosave');
      } catch (error) {
        console.error('Error loading saved calculation:', error);
      }
    }
  }, []);

  const handleDataChange = (field, value) => {
    setData(prev => {
      if (field === 'labor') {
        // Calculate total labor cost
        const baseLabor = {
          ...prev.labor,
          ...value,
          stockProduction: { ...prev.labor.stockProduction, ...value.stockProduction },
          cncOperator: { ...prev.labor.cncOperator, ...value.cncOperator },
          assembly: { ...prev.labor.assembly, ...value.assembly },
          finishing: { ...prev.labor.finishing, ...value.finishing },
          upholstery: { ...prev.labor.upholstery, ...value.upholstery }
        };

        // Calculate total base labor cost
        const totalLaborCost = Object.entries(baseLabor).reduce((sum, [key, val]) => {
          if (key !== 'surcharge') {
            return sum + ((Number(val.hours) || 0) * (Number(val.rate) || 0));
          }
          return sum;
        }, 0);

        // Calculate surcharge
        const surchargePercentage = settings?.labor?.extraFee || 0;
        const surchargeCost = totalLaborCost * (surchargePercentage / 100);

        // Update labor with calculated surcharge
        const updatedLabor = {
          ...baseLabor,
          surcharge: {
            percentage: surchargePercentage,
            cost: surchargeCost
          }
        };

        console.log('handleDataChange updated labor:', updatedLabor);
        return {
          ...prev,
          labor: updatedLabor
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const calculateOverheadRate = () => {
    if (!settings?.overhead) return 0;
    const { monthlyOverhead, employees, monthlyProdHours, monthlyCNCHours } = settings.overhead;
    const totalEmployeeHours = employees * monthlyProdHours;
    const totalCapacity = totalEmployeeHours + Number(monthlyCNCHours || 0);
    return totalCapacity > 0 ? monthlyOverhead / totalCapacity : 0;
  };

  const getTotalLaborHours = () => {
    return Object.entries(data.labor).reduce((sum, [key, value]) => {
      if (key !== 'surcharge') {
        return sum + Number(value.hours || 0);
      }
      return sum;
    }, 0);
  };

  const handleSubmitToPriceSheet = async (priceSheetEntry) => {
  // Build a labor breakdown array from the current labor state
  const laborBreakdown = [
    { type: "Stock Production", hours: data.labor.stockProduction.hours, rate: data.labor.stockProduction.rate },
    { type: "CNC Operator", hours: data.labor.cncOperator.hours, rate: data.labor.cncOperator.rate },
    { type: "Assembly", hours: data.labor.assembly.hours, rate: data.labor.assembly.rate },
    { type: "Finishing", hours: data.labor.finishing.hours, rate: data.labor.finishing.rate },
    { type: "Upholstery", hours: data.labor.upholstery.hours, rate: data.labor.upholstery.rate }
  ];

  // Add surcharge to breakdown if it exists
  if (data.labor.surcharge && data.labor.surcharge.cost > 0) {
    laborBreakdown.push({
      type: "Labor Surcharge",
      hours: 0,
      rate: 0,
      cost: data.labor.surcharge.cost,
      detail: `${data.labor.surcharge.percentage}% surcharge`
    });
  }

  // Ensure that the price sheet entry has a details.labor.breakdown property
  priceSheetEntry.details = {
    ...priceSheetEntry.details,
    labor: {
      breakdown: laborBreakdown
    }
  };

  // Make sure components match the expected MongoDB schema format
  if (priceSheetEntry.details && priceSheetEntry.details.components && Array.isArray(priceSheetEntry.details.components)) {
    console.log('Before transformation:', JSON.stringify(priceSheetEntry.details.components));
    
    // Format components to match the schema structure
    priceSheetEntry.details.components = priceSheetEntry.details.components.map(component => ({
      id: component._id || component.id || String(Date.now()),
      name: component.name || component.componentName || 'Unnamed',
      type: component.type || component.componentType || 'unknown',
      cost: Number(component.cost) || 0,
      quantity: component.quantity || 1
    }));
    
    console.log('After transformation:', JSON.stringify(priceSheetEntry.details.components));
  }

  console.log('Price sheet entry before save:', JSON.stringify(priceSheetEntry, null, 2));
  
  try {
    console.log('About to submit price sheet entry');
    
    if (data.editingId) {
      console.log('Updating existing entry:', data.editingId);
      await priceSheetApi.update(data.editingId, priceSheetEntry);
    } else {
      console.log('Adding new entry to API');
      const response = await priceSheetApi.add(priceSheetEntry);
      console.log('API response:', response);
    }
    
    console.log('Entry saved successfully, redirecting...');
    localStorage.removeItem('calculatorAutosave');
    window.location.href = '/price-sheet';
  } catch (error) {
    console.error('Error saving to price sheet:', error);
    if (error.response && error.response.data) {
      console.error('Error details:', error.response.data);
      
      // Try to parse any nested validation errors for better debugging
      if (error.response.data.validationErrors) {
        console.error('Validation errors:', error.response.data.validationErrors);
      }
    }
    alert('Failed to save to price sheet. Please check the console for details.');
  }
};

  const panels = [
    { id: 'piece', title: 'Piece Information' },
    { id: 'labor', title: 'Labor' },
    { id: 'materials', title: 'Materials' },
    { id: 'cnc', title: 'CNC Machine' },
    { id: 'summary', title: 'Summary' }
  ];

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'piece':
        return (
          <PiecePanel
            data={data}
            onChange={handleDataChange}
            setActivePanel={setActivePanel}
          />
        );
      case 'labor':
        return (
          <LaborPanel
            labor={data.labor}
            onLaborChange={(labor) => handleDataChange('labor', labor)}
            setActivePanel={setActivePanel}
          />
        );
      case 'materials':
        return (
          <MaterialsPanel
            materials={data.materials}
            onMaterialsChange={(materials) => handleDataChange('materials', materials)}
            setActivePanel={setActivePanel}
          />
        );
      case 'cnc':
        return (
          <CNCPanel
            cnc={data.cnc}
            onCNCChange={(cnc) => handleDataChange('cnc', cnc)}
            setActivePanel={setActivePanel}
          />
        );
      case 'summary':
        return (
          <SummaryPanel
            data={data}
            onSubmitToPriceSheet={handleSubmitToPriceSheet}
            calculateOverheadRate={calculateOverheadRate}
            totalLaborHours={getTotalLaborHours()}
            isEditing={!!data.editingId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow flex">
      <div className="w-64 border-r">
        {panels.map(panel => (
          <button
            key={panel.id}
            onClick={() => setActivePanel(panel.id)}
            className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200
              ${activePanel === panel.id 
                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            {panel.title}
          </button>
        ))}
      </div>
      <div className="flex-1 p-6">
        {renderActivePanel()}
      </div>
    </div>
  );
};

export default FurniturePricingCalculator;
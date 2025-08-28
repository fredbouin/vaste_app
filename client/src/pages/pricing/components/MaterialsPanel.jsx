// src/pages/pricing/components/MaterialsPanel.jsx
import { useState, useEffect } from 'react';
import { Plus, Minus, Pencil } from 'lucide-react';
import HardwarePanel from './material/HardwarePanel';
import SheetPanel from './material/SheetPanel';
import UpholsteryPanel from './material/UpholsteryPanel';
import FinishingPanel from './material/FinishingPanel';
import { calculateWoodCost } from '../../../services/calculationService';


const MaterialsPanel = ({ materials, onMaterialsChange, setActivePanel }) => {
  // Initialize localMaterials only once from the prop
  const [localMaterials, setLocalMaterials] = useState(materials);
  const [savedSettings, setSavedSettings] = useState(null);
  const [editingCost, setEditingCost] = useState(null); // {index: number, value: string}

  useEffect(() => {
    const settings = localStorage.getItem('calculatorSettings');
    if (settings) {
      setSavedSettings(JSON.parse(settings));
    }
  }, []);

  const woodSpecies = savedSettings ? Object.keys(savedSettings.materials.wood || {}) : [];

  const updateLocalMaterials = (category, newValue) => {
    setLocalMaterials(prev => ({
      ...prev,
      [category]: newValue
    }));
  };

  const handleWoodChange = (index, field, value) => {
    const newWood = [...localMaterials.wood];
    newWood[index] = { ...newWood[index], [field]: value };

    if (field === 'species' || field === 'thickness') {
      const wood = newWood[index];
      if (wood.species && wood.thickness) {
        const savedCost = savedSettings?.materials?.wood?.[wood.species]?.[wood.thickness]?.cost || '';
        if (savedCost) {
          newWood[index] = { ...wood, cost: savedCost };
        }
      }
    }

    updateLocalMaterials('wood', newWood);
  };

  const handleCostChange = (index, value) => {
    const newWood = [...localMaterials.wood];
    newWood[index] = { ...newWood[index], cost: value };
    updateLocalMaterials('wood', newWood);
  };

  const addWoodEntry = () => {
    updateLocalMaterials('wood', [
      ...localMaterials.wood,
      { species: '', thickness: '', boardFeet: '', cost: '' }
    ]);
  };

  const removeWoodEntry = (index) => {
    const newWood = localMaterials.wood.filter((_, i) => i !== index);
    updateLocalMaterials('wood', newWood);
    if (editingCost?.index === index) {
      setEditingCost(null);
    }
  };

  const getAvailableThicknesses = (species) => {
    if (!species || !savedSettings?.materials?.wood?.[species]) return [];
    return Object.keys(savedSettings.materials.wood[species]);
  };

  // Compute wood total cost
  const woodCostResult = calculateWoodCost(localMaterials.wood, savedSettings);
  const woodBaseCost = woodCostResult.baseCost;
  const woodWasteCost = woodCostResult.wasteCost;
  const totalWoodCost = woodCostResult.totalCost;
  
  // Get the waste factor from settings
  const woodWasteFactor = savedSettings?.materials?.woodWasteFactor || 0;

  const handleSaveAndContinue = () => {
    onMaterialsChange(localMaterials);
    setActivePanel('cnc');
  };

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Wood Materials</h3>
          <button
            onClick={addWoodEntry}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Wood
          </button>
        </div>
        {localMaterials.wood.map((wood, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Species</label>
              <select
                value={wood.species || ''}
                onChange={(e) => handleWoodChange(index, 'species', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select...</option>
                {woodSpecies.map(species => (
                  <option key={species} value={species}>{species}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Thickness</label>
              <select
                value={wood.thickness || ''}
                onChange={(e) => handleWoodChange(index, 'thickness', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                disabled={!wood.species}
              >
                <option value="">Select...</option>
                {getAvailableThicknesses(wood.species).map(thickness => (
                  <option key={thickness} value={thickness}>{thickness}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Board Feet</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={wood.boardFeet || ''}
                onChange={(e) => handleWoodChange(index, 'boardFeet', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Cost per BF</label>
                {editingCost?.index !== index && wood.cost && (
                  <button
                    onClick={() => setEditingCost({ index, value: wood.cost })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
              {editingCost?.index === index ? (
                <div className="mt-1 relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingCost.value}
                    onChange={(e) => setEditingCost({ index, value: e.target.value })}
                    onBlur={() => {
                      handleCostChange(index, editingCost.value);
                      setEditingCost(null);
                    }}
                    className="block w-full border border-blue-300 rounded-md shadow-sm p-2"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="mt-1 p-2 bg-gray-50 rounded-md">
                  ${wood.cost || '0.00'}/BF
                </div>
              )}
            </div>
            <div className="flex items-end">
              <button
                onClick={() => removeWoodEntry(index)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {/* Wood Materials Summary */}
        {localMaterials.wood.length > 0 && (
          <div className="mt-4 text-right font-medium">
            <div>Total Base Cost: ${woodBaseCost.toFixed(2)}</div>
            {woodWasteFactor > 0 && (
              <div>Waste ({woodWasteFactor}%): ${woodWasteCost.toFixed(2)}</div>
            )}
            <div>Total Wood Cost: ${totalWoodCost.toFixed(2)}</div>
          </div>
        )}
      </div>

      <div className="border-b pb-6">
        <SheetPanel 
          sheetMaterials={localMaterials.sheet || []}
          onChange={(sheetMaterials) => updateLocalMaterials('sheet', sheetMaterials)}
        />
      </div>

      <div className="border-b pb-6">
        <UpholsteryPanel 
          upholstery={localMaterials.upholstery || {}}
          onChange={(upholstery) => updateLocalMaterials('upholstery', upholstery)}
        />
      </div>

      <div className="border-b pb-6">
        <HardwarePanel 
          hardwareItems={localMaterials.hardware || []} 
          onChange={(hardware) => updateLocalMaterials('hardware', hardware)} 
        />
      </div>

      <div className="border-b pb-6">
        <FinishingPanel 
          finishing={localMaterials.finishing} 
          onChange={(finishing) => updateLocalMaterials('finishing', finishing)}
        />
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => setActivePanel('labor')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleSaveAndContinue}
          className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>Save & Continue</span>
        </button>
      </div>
    </div>
  );
};

export default MaterialsPanel;
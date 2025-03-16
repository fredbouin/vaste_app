import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { calculateUpholsteryCost } from '../../../../services/calculationService';

const UpholsteryPanel = ({ upholstery = {}, onChange }) => {
  const [availableMaterials, setAvailableMaterials] = useState([]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('calculatorSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAvailableMaterials(settings.materials?.upholsteryMaterials || []);
    }
  }, []);

  const addUpholsteryItem = () => {
    const items = upholstery.items || [];
    onChange({
      ...upholstery,
      items: [
        ...items,
        {
          id: Date.now(), // keep for frontend tracking
          materialId: '', // keep for frontend reference
          name: '',
          type: 'upholstery',
          squareFeet: '',
          costPerSqFt: '',
          cost: 0
        }
      ]
    });
  };

  const removeUpholsteryItem = (index) => {
    const items = [...(upholstery.items || [])];
    items.splice(index, 1);
    onChange({ ...upholstery, items });
  };

  const updateUpholsteryItem = (index, field, value) => {
    const items = [...(upholstery.items || [])];
    if (field === 'materialId') {
      const selectedMaterial = availableMaterials.find(m => m.id === Number(value));
      if (selectedMaterial) {
        items[index] = {
          ...items[index],
          materialId: value,
          name: selectedMaterial.name,
          costPerSqFt: selectedMaterial.costPerSqFt
        };
      }
    } else {
      items[index] = {
        ...items[index],
        [field]: value
      };
    }
    items[index].type = 'upholstery';
  
    // Recalculate cost using current squareFeet and costPerSqFt
    const squareFeet = Number(items[index].squareFeet) || 0;
    const costPerSqFt = Number(items[index].costPerSqFt) || 0;
    items[index].cost = squareFeet * costPerSqFt;

    onChange({ ...upholstery, items });
  };

  // Individual item cost calculation - kept for display purposes
  const calculateItemCost = (item) => {
    if (!item.squareFeet || !item.costPerSqFt) return 0;
    return Number(item.squareFeet) * Number(item.costPerSqFt);
  };

  // Use the centralized calculation service for total upholstery cost
  const calculateTotalUpholsteryCost = () => {
    return calculateUpholsteryCost(upholstery);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium mb-4">Upholstery Materials</h3>
        <button
          onClick={addUpholsteryItem}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Material
        </button>
      </div>

      {(upholstery.items || []).map((item, index) => (
        <div key={item.id} className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Material
            </label>
            <select
              value={item.materialId || ''}
              onChange={(e) => updateUpholsteryItem(index, 'materialId', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Material...</option>
              {availableMaterials.map(material => (
                <option key={material.id} value={material.id}>
                  {material.name} - ${material.costPerSqFt}/sq ft
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Square Feet
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={item.squareFeet || ''}
              onChange={(e) => updateUpholsteryItem(index, 'squareFeet', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost
            </label>
            <div className="mt-1 p-2 bg-gray-100 rounded-md text-sm">
              ${calculateItemCost(item).toFixed(2)}
            </div>
          </div>

          <div className="flex items-end justify-center">
            <button
              onClick={() => removeUpholsteryItem(index)}
              className="text-red-600 hover:text-red-700 p-2"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Total Upholstery Cost */}
      {(upholstery.items || []).length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <div className="flex justify-between">
            <span className="font-medium">Total Upholstery Cost:</span>
            <span>
              ${calculateTotalUpholsteryCost().toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpholsteryPanel;
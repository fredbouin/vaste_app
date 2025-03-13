// src/pages/pricing/components/HardwarePanel.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

const HardwarePanel = ({ hardwareItems = [], onChange }) => {  // Add default empty array
  const [availableHardware, setAvailableHardware] = useState([]);

  // Load available hardware from settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('calculatorSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAvailableHardware(settings.materials?.hardware || []);
    }
  }, []);

  const addHardwareItem = () => {
    onChange([
      ...(hardwareItems || []),  // Ensure we're working with an array
      {
        hardwareId: '',
        quantity: '',
        id: Date.now()
      }
    ]);
  };

  const removeHardwareItem = (index) => {
    const items = [...(hardwareItems || [])];
    onChange(items.filter((_, i) => i !== index));
  };

  const updateHardwareItem = (index, field, value) => {
    const items = [...(hardwareItems || [])];
    const newItems = items.map((item, i) => {
      if (i === index) {
        if (field === 'hardwareId') {
          // Convert the value to a number before matching
          const selectedHardware = availableHardware.find(h => h.id === Number(value));
          return {
            ...item,
            hardwareId: value,
            name: selectedHardware?.name,
            specification: selectedHardware?.specification,
            pricePerUnit: selectedHardware
              ? (selectedHardware.pricePerPack / selectedHardware.unitsPerPack)
              : 0
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(newItems);
  };

  const calculateItemCost = (item) => {
    return (item.quantity * (item.pricePerUnit || 0)).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Hardware</h3>
        <button
          onClick={addHardwareItem}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Hardware
        </button>
      </div>

      {(hardwareItems || []).map((item, index) => (
        <div key={item.id || index} className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Hardware Item
            </label>
            <select
              value={item.hardwareId || ''}
              onChange={(e) => updateHardwareItem(index, 'hardwareId', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Hardware...</option>
              {availableHardware.map(hardware => (
                <option key={hardware.id} value={hardware.id}>
                  {hardware.name} - {hardware.specification}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={item.quantity || ''}
              onChange={(e) => updateHardwareItem(index, 'quantity', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost
            </label>
            <div className="mt-1 block w-full p-2 bg-gray-100 rounded-md">
              ${calculateItemCost(item)}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => removeHardwareItem(index)}
              className="text-red-600 hover:text-red-700 p-2"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Total Hardware Cost */}
      <div className="mt-4 p-4 bg-gray-100 rounded-md">
        <div className="flex justify-between">
          <span className="font-medium">Total Hardware Cost:</span>
          <span>
            ${(hardwareItems || []).reduce((sum, item) => sum + Number(calculateItemCost(item)), 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HardwarePanel;

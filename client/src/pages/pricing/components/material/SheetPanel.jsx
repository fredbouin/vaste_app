import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { calculateSheetCost } from '../../../../services/calculationService';

const SheetPanel = ({ sheetMaterials = [], onChange }) => {
  const [availableSheets, setAvailableSheets] = useState([]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('calculatorSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAvailableSheets(settings.materials?.sheet || []);
    }
  }, []);

  const addSheetMaterial = () => {
    onChange([
      ...sheetMaterials,
      {
        id: Date.now(),
        sheetId: '',
        quantity: '1',
        pricePerSheet: '',
        name: ''
      }
    ]);
  };

  const removeSheetMaterial = (index) => {
    const newMaterials = [...sheetMaterials];
    newMaterials.splice(index, 1);
    onChange(newMaterials);
  };

  const updateSheetMaterial = (index, field, value) => {
    const newMaterials = [...sheetMaterials];
    newMaterials[index] = {
      ...newMaterials[index],
      [field]: value
    };

    if (field === 'sheetId') {
      const selectedSheet = availableSheets.find(s => s.id === Number(value));
      if (selectedSheet) {
        newMaterials[index] = {
          ...newMaterials[index],
          sheetId: value,
          name: selectedSheet.name,
          thickness: selectedSheet.thickness,
          size: selectedSheet.size,
          material: selectedSheet.material,
          grade: selectedSheet.grade,
          pricePerSheet: selectedSheet.pricePerSheet
        };
      }
    }

    onChange(newMaterials);
  };

  // Calculate total cost for a sheet entry
  const calculateItemCost = (material) => {
    if (!material.pricePerSheet || !material.quantity) {
      return 0;
    }
    return Number(material.pricePerSheet) * Number(material.quantity);
  };

  // Use the centralized calculation service for total cost
  const calculateTotalMaterialsCost = () => {
    return calculateSheetCost(sheetMaterials);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Sheet Materials</h3>
        <button
          onClick={addSheetMaterial}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Sheet Material
        </button>
      </div>

      {sheetMaterials.map((material, index) => (
        <div key={material.id || index} className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Material
            </label>
            <select
              value={material.sheetId || ''}
              onChange={(e) => updateSheetMaterial(index, 'sheetId', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Sheet Material...</option>
              {availableSheets.map(sheet => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name} ({sheet.size}) - ${sheet.pricePerSheet}/sheet
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Sheets
            </label>
            <input
              type="number"
              min="1"
              value={material.quantity || ''}
              onChange={(e) => updateSheetMaterial(index, 'quantity', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price per Sheet
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={material.pricePerSheet || ''}
              onChange={(e) => updateSheetMaterial(index, 'pricePerSheet', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              disabled={!!material.sheetId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost
            </label>
            <div className="mt-1 p-2 bg-gray-100 rounded-md text-sm">
              <div>${calculateItemCost(material).toFixed(2)}</div>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => removeSheetMaterial(index)}
              className="text-red-600 hover:text-red-700 p-2"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {sheetMaterials.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <div className="flex justify-between">
            <span className="font-medium">Total Sheet Materials Cost:</span>
            <span>
              ${calculateTotalMaterialsCost().toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SheetPanel;
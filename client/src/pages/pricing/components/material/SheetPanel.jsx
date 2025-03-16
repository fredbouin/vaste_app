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
        piecesPerSheet: '',
        numSheets: '1'
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
          pricePerSheet: selectedSheet.pricePerSheet
        };
      }
    }

    onChange(newMaterials);
  };

  // Individual sheet cost calculations
  const calculateCostPerPiece = (material) => {
    if (!material.piecesPerSheet || !material.pricePerSheet) {
      return 0;
    }
    return Number(material.pricePerSheet) / Number(material.piecesPerSheet);
  };

  const calculateTotalCost = (material) => {
    if (!material.pricePerSheet || !material.numSheets || !material.piecesPerSheet) {
      return 0;
    }
    const costPerPiece = calculateCostPerPiece(material);
    const totalPieces = Number(material.piecesPerSheet);
    return costPerPiece * totalPieces;
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
        <div key={material.id} className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
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
              Pieces per Sheet
            </label>
            <input
              type="number"
              min="1"
              value={material.piecesPerSheet || ''}
              onChange={(e) => updateSheetMaterial(index, 'piecesPerSheet', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g., 4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Sheets
            </label>
            <input
              type="number"
              min="1"
              value={material.numSheets || ''}
              onChange={(e) => updateSheetMaterial(index, 'numSheets', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost
            </label>
            <div className="mt-1 p-2 bg-gray-100 rounded-md text-sm">
              <div className="text-gray-500">
                ${calculateCostPerPiece(material).toFixed(2)}/piece
              </div>
              <div>
                ${calculateTotalCost(material).toFixed(2)} total
              </div>
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
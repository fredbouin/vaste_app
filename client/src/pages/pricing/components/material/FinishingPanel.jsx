import React, { useState, useEffect } from 'react';
import { calculateFinishingCost } from '../../../../services/calculationService';

const FinishingPanel = ({ finishing = {}, onChange }) => {
  const [availableFinishes, setAvailableFinishes] = useState([]);
  const [wasteFactor, setWasteFactor] = useState(10); // Default 10% waste

  useEffect(() => {
    const savedSettings = localStorage.getItem('calculatorSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAvailableFinishes(settings.materials?.finishing || []);
    }
  }, []);

  // Calculate finishing total cost, correctly using all required parameters
  const calculateFinishingTotalCost = () => {
    if (!finishing.materialId || !finishing.surfaceArea || !finishing.coats || !finishing.coverage) {
      return 0;
    }
    
    const selectedMaterial = availableFinishes.find(m => m.id === Number(finishing.materialId));
    if (!selectedMaterial) return 0;

    const costPerLiter = selectedMaterial.containerCost / selectedMaterial.containerSize;
    
    // Create a complete finishing object for the calculation
    const finishingParams = {
      materialId: finishing.materialId,
      surfaceArea: Number(finishing.surfaceArea),
      coats: Number(finishing.coats),
      coverage: Number(finishing.coverage),
      costPerLiter: costPerLiter
    };
    
    return calculateFinishingCost(finishingParams);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Finishing Materials</h3>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Material
          </label>
          <select
            value={finishing.materialId || ''}
            onChange={(e) => {
              const selectedMaterial = availableFinishes.find(
                m => m.id === Number(e.target.value)
              );
              if (selectedMaterial) {
                onChange({
                  ...finishing,
                  materialId: e.target.value,
                  materialName: selectedMaterial.name,
                  coverage: selectedMaterial.coverage,
                  costPerLiter: selectedMaterial.containerCost / selectedMaterial.containerSize
                });
              } else {
                onChange({
                  ...finishing,
                  materialId: '',
                  materialName: '',
                  coverage: '',
                  costPerLiter: ''
                });
              }
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select Finishing Material...</option>
            {availableFinishes.map(material => (
              <option key={material.id} value={material.id}>
                {material.name} - {material.coverage} ft²/L
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Surface Area (sq inches)
          </label>
          <input
            type="number"
            min="0"
            value={finishing.surfaceArea || ''}
            onChange={(e) => onChange({ ...finishing, surfaceArea: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="e.g., 288 for 2 sq ft"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of Coats
          </label>
          <input
            type="number"
            min="1"
            value={finishing.coats || ''}
            onChange={(e) => onChange({ ...finishing, coats: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Waste Factor %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={wasteFactor}
            onChange={(e) => setWasteFactor(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          <p className="mt-1 text-sm text-gray-500">
            Accounts for material lost in application
          </p>
        </div>
      </div>

      {/* Calculations Summary */}
      {finishing.materialId && finishing.surfaceArea && finishing.coats && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Surface Area:</span>
            <span>{(Number(finishing.surfaceArea) / 144).toFixed(2)} sq ft</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Material Coverage:</span>
            <span>{finishing.coverage} sq ft/L</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Number of Coats:</span>
            <span>{finishing.coats}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Waste Factor:</span>
            <span>{wasteFactor}%</span>
          </div>
          <div className="pt-2 mt-2 border-t flex justify-between font-medium">
            <span>Total Finishing Cost:</span>
            <span>${calculateFinishingTotalCost().toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinishingPanel;
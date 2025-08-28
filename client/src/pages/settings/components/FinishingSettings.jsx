// src/pages/settings/components/FinishingSettings.jsx
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const FinishingSettings = ({ settings, onSettingsChange }) => {
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    coverage: '',
    containerSize: '',
    containerCost: ''
  });

  const handleAddMaterial = () => {
    // Validate inputs
    if (!newMaterial.name || !newMaterial.coverage || 
        !newMaterial.containerSize || !newMaterial.containerCost) {
      alert('Please fill in all fields');
      return;
    }

    const newMaterials = [
      ...settings.materials.finishing,
      {
        id: Date.now(),
        ...newMaterial
      }
    ];
    
    onSettingsChange('materials', {
      ...settings.materials,
      finishing: newMaterials
    });

    // Reset form
    setNewMaterial({
      name: '',
      coverage: '',
      containerSize: '',
      containerCost: ''
    });
  };

  const handleRemoveMaterial = (id) => {
    const newMaterials = settings.materials.finishing.filter(
      item => item.id !== id
    );
    onSettingsChange('materials', {
      ...settings.materials,
      finishing: newMaterials
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Finishing Materials</h2>
      
      {/* Add New Material Form */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-md font-medium mb-3">Add New Material</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Material Name
            </label>
            <input
              type="text"
              value={newMaterial.name}
              onChange={(e) => setNewMaterial(prev => ({
                ...prev,
                name: e.target.value
              }))}
              placeholder="e.g., Rubio Monocoat"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Coverage (ft²/L)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={newMaterial.coverage}
              onChange={(e) => setNewMaterial(prev => ({
                ...prev,
                coverage: e.target.value
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Container Size (L)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={newMaterial.containerSize}
              onChange={(e) => setNewMaterial(prev => ({
                ...prev,
                containerSize: e.target.value
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Container Cost ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newMaterial.containerCost}
              onChange={(e) => setNewMaterial(prev => ({
                ...prev,
                containerCost: e.target.value
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <button
          onClick={handleAddMaterial}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Material
        </button>
      </div>

      {/* List of Saved Materials */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Saved Materials</h3>
        {settings.materials.finishing.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No materials added yet</p>
        ) : (
          settings.materials.finishing.map((material) => (
            <div 
              key={material.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="col-span-2">
                  <span className="font-medium">{material.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Coverage: {material.coverage} ft²/L
                </div>
                <div className="text-sm text-gray-600">
                  Cost: ${material.containerCost}/{material.containerSize}L
                </div>
                <div className="text-sm text-gray-600">
                  Price per liter: ${(material.containerCost / material.containerSize).toFixed(2)}/L
                </div>
              </div>
              <button
                onClick={() => handleRemoveMaterial(material.id)}
                className="ml-4 text-red-600 hover:text-red-900"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FinishingSettings;
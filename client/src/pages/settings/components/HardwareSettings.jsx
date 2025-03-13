// src/pages/settings/components/HardwareSettings.jsx
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const HardwareSettings = ({ settings, onSettingsChange }) => {
  const [newHardware, setNewHardware] = useState({
    name: '',
    specification: '',
    unitsPerPack: '',
    pricePerPack: ''
  });

  const handleAddHardware = () => {
    // Validate inputs
    if (!newHardware.name || !newHardware.specification || 
        !newHardware.unitsPerPack || !newHardware.pricePerPack) {
      alert('Please fill in all fields');
      return;
    }

    const newItems = [
      ...settings.materials.hardware,
      {
        id: Date.now(),
        ...newHardware
      }
    ];
    
    onSettingsChange('materials', {
      ...settings.materials,
      hardware: newItems
    });

    // Reset form
    setNewHardware({
      name: '',
      specification: '',
      unitsPerPack: '',
      pricePerPack: ''
    });
  };

  const handleRemoveHardware = (id) => {
    const newItems = settings.materials.hardware.filter(
      item => item.id !== id
    );
    onSettingsChange('materials', {
      ...settings.materials,
      hardware: newItems
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Hardware Items</h2>
      
      {/* Add New Hardware Form */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-md font-medium mb-3">Add New Hardware</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hardware Name
            </label>
            <input
              type="text"
              value={newHardware.name}
              onChange={(e) => setNewHardware(prev => ({
                ...prev,
                name: e.target.value
              }))}
              placeholder="e.g., Corner Bracket"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Specification
            </label>
            <input
              type="text"
              value={newHardware.specification}
              onChange={(e) => setNewHardware(prev => ({
                ...prev,
                specification: e.target.value
              }))}
              placeholder="e.g., 2-inch Steel"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Units Per Pack
            </label>
            <input
              type="number"
              min="1"
              value={newHardware.unitsPerPack}
              onChange={(e) => setNewHardware(prev => ({
                ...prev,
                unitsPerPack: e.target.value
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price Per Pack ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newHardware.pricePerPack}
              onChange={(e) => setNewHardware(prev => ({
                ...prev,
                pricePerPack: e.target.value
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <button
          onClick={handleAddHardware}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Hardware Item
        </button>
      </div>

      {/* List of Saved Hardware */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Saved Hardware Items</h3>
        {settings.materials.hardware.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No hardware items added yet</p>
        ) : (
          settings.materials.hardware.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="col-span-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 ml-2">({item.specification})</span>
                </div>
                <div className="text-sm text-gray-600">
                  Pack: {item.unitsPerPack} units for ${item.pricePerPack}
                </div>
                <div className="text-sm text-gray-600">
                  Price per unit: ${(item.pricePerPack / item.unitsPerPack).toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => handleRemoveHardware(item.id)}
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

export default HardwareSettings;
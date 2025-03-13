// src/pages/settings/components/SheetSettings.jsx
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const SheetSettings = ({ settings, onSettingsChange }) => {
  const [newSheet, setNewSheet] = useState({
    name: '',
    thickness: '',
    size: '4x8', // Default standard size
    material: '',  // e.g., 'plywood', 'mdf'
    grade: '',     // e.g., 'baltic birch', 'cabinet grade'
    pricePerSheet: ''
  });

  // Initialize sheet array if it doesn't exist
  const handleAddSheet = () => {
    // Validate inputs
    if (!newSheet.name || !newSheet.pricePerSheet) {
      alert('Please fill in at least name and price');
      return;
    }

    // Ensure materials.sheet exists
    const currentSheets = settings.materials.sheet || [];
    
    const newItems = [
      ...currentSheets,
      {
        id: Date.now(),
        ...newSheet
      }
    ];
    
    onSettingsChange('materials', {
      ...settings.materials,
      sheet: newItems
    });

    // Reset form
    setNewSheet({
      name: '',
      thickness: '',
      size: '4x8',
      material: '',
      grade: '',
      pricePerSheet: ''
    });
  };

  const handleRemoveSheet = (id) => {
    const currentSheets = settings.materials.sheet || [];
    const newItems = currentSheets.filter(
      item => item.id !== id
    );
    onSettingsChange('materials', {
      ...settings.materials,
      sheet: newItems
    });
  };

  // Get current sheets safely
  const currentSheets = settings.materials.sheet || [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Sheet Materials</h2>
      
      {/* Add New Sheet Form */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-md font-medium mb-3">Add New Sheet Material</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Material Name
            </label>
            <input
              type="text"
              value={newSheet.name}
              onChange={(e) => setNewSheet(prev => ({
                ...prev,
                name: e.target.value
              }))}
              placeholder="e.g., 3/4&quot; Baltic Birch Plywood"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Thickness
            </label>
            <input
              type="text"
              value={newSheet.thickness}
              onChange={(e) => setNewSheet(prev => ({
                ...prev,
                thickness: e.target.value
              }))}
              placeholder="e.g., 3/4&quot;"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sheet Size
            </label>
            <select
              value={newSheet.size}
              onChange={(e) => setNewSheet(prev => ({
                ...prev,
                size: e.target.value
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="4x8">4' x 8'</option>
              <option value="5x5">5' x 5'</option>
              <option value="5x10">5' x 10'</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Material Type
            </label>
            <select
              value={newSheet.material}
              onChange={(e) => setNewSheet(prev => ({
                ...prev,
                material: e.target.value
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Type...</option>
              <option value="plywood">Plywood</option>
              <option value="mdf">MDF</option>
              <option value="particle">Particle Board</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grade/Quality
            </label>
            <input
              type="text"
              value={newSheet.grade}
              onChange={(e) => setNewSheet(prev => ({
                ...prev,
                grade: e.target.value
              }))}
              placeholder="e.g., Cabinet Grade"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price Per Sheet ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newSheet.pricePerSheet}
              onChange={(e) => setNewSheet(prev => ({
                ...prev,
                pricePerSheet: e.target.value
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <button
          onClick={handleAddSheet}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sheet Material
        </button>
      </div>

      {/* List of Saved Sheet Materials */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Saved Sheet Materials</h3>
        {currentSheets.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No sheet materials added yet</p>
        ) : (
          currentSheets.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="col-span-2">
                  <span className="font-medium">{item.name}</span>
                  {item.grade && (
                    <span className="text-gray-600 ml-2">({item.grade})</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Size: {item.size}
                </div>
                <div className="text-sm text-gray-600">
                  Price: ${item.pricePerSheet}/sheet
                </div>
                {item.material && (
                  <div className="text-sm text-gray-600">
                    Type: {item.material}
                  </div>
                )}
                {item.thickness && (
                  <div className="text-sm text-gray-600">
                    Thickness: {item.thickness}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemoveSheet(item.id)}
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

export default SheetSettings;
// src/pages/settings/components/UpholsterySettings.jsx
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const UpholsterySettings = ({ settings, onSettingsChange }) => {
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    type: '', // e.g., 'fabric', 'leather'
    supplier: '',
    costPerSqFt: '',
    notes: ''
  });

  const handleAddMaterial = () => {
    // Validate inputs
    if (!newMaterial.name || !newMaterial.costPerSqFt) {
      alert('Please fill in at least name and cost per square foot');
      return;
    }

    // Ensure materials.upholsteryMaterials exists
    const currentMaterials = settings.materials.upholsteryMaterials || [];
    
    const newItems = [
      ...currentMaterials,
      {
        id: Date.now(),
        ...newMaterial
      }
    ];
    
    onSettingsChange('materials', {
      ...settings.materials,
      upholsteryMaterials: newItems
    });

    // Reset form
    setNewMaterial({
      name: '',
      type: '',
      supplier: '',
      costPerSqFt: '',
      notes: ''
    });
  };

  const handleRemoveMaterial = (id) => {
    const currentMaterials = settings.materials.upholsteryMaterials || [];
    const newItems = currentMaterials.filter(item => item.id !== id);
    onSettingsChange('materials', {
      ...settings.materials,
      upholsteryMaterials: newItems
    });
  };

  // Get current materials safely
  const currentMaterials = settings.materials.upholsteryMaterials || [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Upholstery Materials</h2>
      
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
              placeholder="e.g., Grey Wool Fabric"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              value={newMaterial.type}
              onChange={(e) => setNewMaterial(prev => ({
                ...prev,
                type: e.target.value
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Type...</option>
              <option value="fabric">Fabric</option>
              <option value="leather">Leather</option>
              <option value="vinyl">Foam</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <input
              type="text"
              value={newMaterial.supplier}
              onChange={(e) => setNewMaterial(prev => ({
                ...prev,
                supplier: e.target.value
              }))}
              placeholder="e.g., Supplier Name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost per Sq Ft ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newMaterial.costPerSqFt}
              onChange={(e) => setNewMaterial(prev => ({
                ...prev,
                costPerSqFt: e.target.value
              }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <input
              type="text"
              value={newMaterial.notes}
              onChange={(e) => setNewMaterial(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              placeholder="Additional details (optional)"
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
        {currentMaterials.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No materials added yet</p>
        ) : (
          currentMaterials.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="col-span-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 ml-2">({item.type})</span>
                </div>
                <div className="text-sm text-gray-600">
                  Cost: ${item.costPerSqFt}/sq ft
                </div>
                {item.supplier && (
                  <div className="text-sm text-gray-600">
                    Supplier: {item.supplier}
                  </div>
                )}
                {item.notes && (
                  <div className="col-span-2 text-sm text-gray-600">
                    Notes: {item.notes}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemoveMaterial(item.id)}
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

export default UpholsterySettings;
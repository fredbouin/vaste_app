// src/pages/pricing/components/ComponentLibraryPanel.jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { priceSheetApi } from '../../../api/priceSheet';

const ComponentLibraryPanel = ({ onAddComponent }) => {
  const [components, setComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newComponent, setNewComponent] = useState({
    name: '',
    type: '', // e.g., 'seat', 'arm', 'back'
    description: '',
    labor: {
      stockProduction: { hours: 0, rate: 0 },
      assembly: { hours: 0, rate: 0 },
      finishing: { hours: 0, rate: 0 },
      upholstery: { hours: 0, rate: 0 }
    },
    materials: {
      wood: [],
      upholstery: {
        foam: { type: '', cost: 0 },
        covering: { type: '', cost: 0 }
      },
      hardware: []
    },
    cnc: {
      runtime: 0,
      rate: 0
    }
  });

  // Load saved components on mount
  useEffect(() => {
  const fetchComponents = async () => {
    try {
      const allPriceSheetEntries = await priceSheetApi.getAll();
      const componentEntries = allPriceSheetEntries.filter(entry => entry.isComponent);
      setComponents(componentEntries);
    } catch (error) {
      console.error('Error loading components:', error);
    }
  };

  fetchComponents();
}, []);
  // const handleSaveComponent = () => {
  //   if (!newComponent.name || !newComponent.type) {
  //     alert('Please enter a name and type for the component');
  //     return;
  //   }

  //   const updatedComponents = [...components, { 
  //     id: Date.now(),
  //     ...newComponent 
  //   }];
    
  //   setComponents(updatedComponents);
  //   localStorage.setItem('furnitureComponents', JSON.stringify(updatedComponents));
  //   setIsAddingNew(false);
  //   setNewComponent({
  //     name: '',
  //     type: '',
  //     description: '',
  //     labor: { /* ... */ },
  //     materials: { /* ... */ },
  //     cnc: { /* ... */ }
  //   });
  // };

  const calculateComponentCost = (component) => {
    const laborHours = Number(component?.labor?.stockProduction?.hours || 0);
    const laborRate = Number(component?.labor?.stockProduction?.rate || 0);
    return laborHours * laborRate;
  };

  const filteredComponents = components.filter(component =>
    (component.componentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (component.componentType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (component.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveComponent = async () => {
    if (!newComponent.name || !newComponent.type) {
      alert('Please enter a name and type for the component');
      return;
    }

    try {
      // Format component for saving to server
      const componentEntry = {
        isComponent: true,
        componentName: newComponent.name,
        componentType: newComponent.type,
        cost: calculateComponentCost(newComponent),
        details: {
          labor: {
            breakdown: formatLaborBreakdown(newComponent.labor)
          },
          materials: newComponent.materials,
          cnc: newComponent.cnc
        }
      };

      // Save to server
      const savedComponent = await priceSheetApi.add(componentEntry);
      
      // Update local state
      setComponents([...components, savedComponent]);
      setIsAddingNew(false);
      setNewComponent({
        name: '',
        type: '',
        description: '',
        labor: { /* reset to defaults */ },
        materials: { /* reset to defaults */ },
        cnc: { /* reset to defaults */ }
      });
    } catch (error) {
      console.error('Failed to save component:', error);
      alert('Failed to save component. Please try again.');
    }
  };

  // Helper function to format labor breakdown
  const formatLaborBreakdown = (labor) => {
    return Object.entries(labor).map(([type, data]) => ({
      type: type.replace(/([A-Z])/g, ' $1').trim(), // Convert camelCase to Title Case
      hours: Number(data.hours) || 0,
      rate: Number(data.rate) || 0,
      cost: (Number(data.hours) || 0) * (Number(data.rate) || 0)
    }));
  };

  // end of new code attempt
   ////////////////\\\\\\\//////
  ////////////////\\\\\\\\//////

  return (
    <div className="space-y-6">
      {/* Search and Add New */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md"
          />
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Component
        </button>
      </div>

      {/* Component List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredComponents.map(component => (
          <div 
            key={component.id}
            className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer"
            onClick={() => onAddComponent(component)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{component.name}</h3>
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full">
                  {component.type}
                </span>
              </div>
              <button className="text-red-600 hover:text-red-800">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">{component.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">
                Labor: {Object.values(component.labor).reduce((sum, { hours }) => sum + hours, 0)} hrs
              </div>
              <div className="text-gray-600">
                Materials: ${calculateMaterialsCost(component.materials)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Component Dialog */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Add New Component</h2>
            {/* Component form fields would go here */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newComponent.name}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newComponent.type}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Select Type...</option>
                  <option value="seat">Seat</option>
                  <option value="arm">Arm</option>
                  <option value="back">Back</option>
                  <option value="base">Base</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newComponent.description}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                />
              </div>

              {/* Additional form fields for labor, materials, etc. would go here */}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComponent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Component
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentLibraryPanel;

// Helper function to calculate materials cost
const calculateMaterialsCost = (materials) => {
  const woodCost = materials.wood.reduce((sum, wood) => 
    sum + (wood.boardFeet * wood.cost), 0);
  
  const upholsteryCost = 
    (materials.upholstery?.foam?.cost || 0) +
    (materials.upholstery?.covering?.cost || 0);
  
  const hardwareCost = materials.hardware.reduce((sum, item) =>
    sum + (item.quantity * item.pricePerUnit), 0);
  
  return (woodCost + upholsteryCost + hardwareCost).toFixed(2);
};
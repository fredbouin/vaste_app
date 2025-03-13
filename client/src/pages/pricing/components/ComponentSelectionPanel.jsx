// src/pages/pricing/components/ComponentSelectionPanel.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Plus } from 'lucide-react';

const ComponentSelectionPanel = ({ selectedComponents, onAddComponent, onRemoveComponent, onUpdateQuantity }) => {
  const [expandedComponent, setExpandedComponent] = useState(null);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);

  const calculateComponentCost = (component, quantity = 1) => {
    const laborCost = Object.values(component.labor)
      .reduce((sum, { hours, rate }) => sum + (hours * rate), 0);
    
    const materialsCost = parseFloat(calculateMaterialsCost(component.materials));
    const cncCost = component.cnc.runtime * component.cnc.rate;
    
    return (laborCost + materialsCost + cncCost) * quantity;
  };

  const totalCost = selectedComponents.reduce((sum, item) => 
    sum + calculateComponentCost(item.component, item.quantity), 0
  );

  return (
    <div className="space-y-4">
      {/* Add Component Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Selected Components</h2>
        <button
          onClick={() => setShowComponentLibrary(true)}
          className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Component
        </button>
      </div>

      {/* Selected Components List */}
      {selectedComponents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No components added yet</p>
          <p className="text-sm mt-1">Click 'Add Component' to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedComponents.map((item, index) => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              {/* Component Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium">{item.component.name}</h3>
                    <span className="px-2 py-1 text-xs bg-gray-200 rounded-full">
                      {item.component.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Quantity Input */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(index, parseInt(e.target.value) || 1)}
                      className="w-16 border rounded-md p-1 text-center"
                    />
                  </div>

                  {/* Cost Display */}
                  <div className="text-right">
                    <div className="font-medium">
                      ${calculateComponentCost(item.component, item.quantity).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${calculateComponentCost(item.component).toFixed(2)} each
                    </div>
                  </div>

                  {/* Expand/Remove Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setExpandedComponent(
                        expandedComponent === index ? null : index
                      )}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedComponent === index ? 
                        <ChevronUp className="w-5 h-5" /> : 
                        <ChevronDown className="w-5 h-5" />
                      }
                    </button>
                    <button
                      onClick={() => onRemoveComponent(index)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedComponent === index && (
                <div className="p-4 border-t">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Labor Details */}
                    <div>
                      <h4 className="font-medium mb-2">Labor</h4>
                      <div className="space-y-1">
                        {Object.entries(item.component.labor).map(([type, { hours, rate }]) => (
                          hours > 0 && (
                            <div key={type} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {type.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span>{hours} hrs @ ${rate}/hr</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>

                    {/* Materials Details */}
                    <div>
                      <h4 className="font-medium mb-2">Materials</h4>
                      <div className="space-y-1 text-sm">
                        {item.component.materials.wood.map((wood, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-gray-600">
                              {wood.species} {wood.thickness}:
                            </span>
                            <span>{wood.boardFeet} BF @ ${wood.cost}/BF</span>
                          </div>
                        ))}
                        {item.component.materials.upholstery.foam.cost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Foam:</span>
                            <span>${item.component.materials.upholstery.foam.cost}</span>
                          </div>
                        )}
                        {item.component.materials.upholstery.covering.cost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Covering:</span>
                            <span>${item.component.materials.upholstery.covering.cost}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Total Cost Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Components Cost:</span>
              <span className="text-xl font-bold">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Component Library Modal */}
      {showComponentLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Component Library</h2>
                <button
                  onClick={() => setShowComponentLibrary(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* ComponentLibraryPanel would be rendered here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

export default ComponentSelectionPanel;
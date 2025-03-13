// src/pages/settings/components/MarginSettings.jsx
import React, { useState } from 'react';
import { Save, Check, Pencil, Info } from 'lucide-react';

const MarginSettings = ({ settings, onSettingsChange }) => {
  const [editingMargin, setEditingMargin] = useState({
    type: null, // 'wholesale' or 'msrp'
    value: ''
  });

  const marginTypes = {
    wholesale: 'Wholesale',
    msrp: 'MSRP'
  };

  // Convert margin percentage to markup multiplier
  const calculateMarkup = (marginPercentage) => {
    if (!marginPercentage) return 1;
    const margin = parseFloat(marginPercentage) / 100;
    return 1 / (1 - margin);
  };

  const handleSaveMargin = (type) => {
    if (!editingMargin.value) {
      alert('Please enter a margin percentage');
      return;
    }

    // Ensure margin is between 0 and 99.9%
    const value = Math.min(Math.max(0, parseFloat(editingMargin.value)), 99.9);

    const updatedMargins = {
      ...settings.margins,
      [type]: value.toString()
    };

    onSettingsChange('margins', updatedMargins);
    setEditingMargin({ type: null, value: '' });
  };

  const startEditing = (type, currentValue) => {
    setEditingMargin({
      type,
      value: currentValue || ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Margin Settings</h2>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Understanding Margins vs Markup</p>
            <p className="mt-1">Margin is the percentage of the selling price that is profit. 
            For example, a 40% margin means 40% of the sale price is profit.</p>
          </div>
        </div>
      </div>

      {/* Margin Input Section */}
      <div className="space-y-4">
        {Object.entries(marginTypes).map(([type, displayName]) => (
          <div key={type} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-md font-medium">{displayName} Margin</h3>
                {editingMargin.type === type ? (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="relative rounded-md flex-1">
                      <input
                        type="number"
                        min="0"
                        max="99.9"
                        step="0.1"
                        value={editingMargin.value}
                        onChange={(e) => setEditingMargin(prev => ({ ...prev, value: e.target.value }))}
                        className="block w-full pr-12 border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="0.0"
                        autoFocus
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveMargin(type)}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center space-x-4">
                    {settings.margins[type] ? (
                      <div className="flex items-center space-x-4">
                        <span className="text-lg">{Number(settings.margins[type]).toFixed(1)}%</span>
                        <span className="text-sm text-gray-500">
                          (×{calculateMarkup(settings.margins[type]).toFixed(2)} markup)
                        </span>
                        <button
                          onClick={() => startEditing(type, settings.margins[type])}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(type, '')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Margin
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Example Calculation */}
      {(settings.margins.wholesale || settings.margins.msrp) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Example:</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>For a $100 cost item:</p>
            {settings.margins.wholesale && (
              <p>• Wholesale price: ${(100 * calculateMarkup(settings.margins.wholesale)).toFixed(2)}</p>
            )}
            {settings.margins.msrp && (
              <p>• MSRP: ${(100 * calculateMarkup(settings.margins.msrp)).toFixed(2)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarginSettings;
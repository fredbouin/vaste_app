import React, { useState, useEffect } from 'react';
import { Pencil, X, AlertCircle } from 'lucide-react';

const CNCPanel = ({ cnc, onCNCChange, setActivePanel }) => {
  const [localCNC, setLocalCNC] = useState(cnc);
  const [editingRate, setEditingRate] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync with parent props
  useEffect(() => {
    setLocalCNC(cnc);
  }, [cnc]);

  const handleRuntimeChange = (value) => {
    const updatedCNC = {
      ...localCNC,
      runtime: value
    };
    setLocalCNC(updatedCNC);
    setIsDirty(true);
    onCNCChange(updatedCNC);
  };

  const handleRateChange = (value) => {
    const updatedCNC = {
      ...localCNC,
      rate: value
    };
    setLocalCNC(updatedCNC);
    setIsDirty(true);
    onCNCChange(updatedCNC);
  };

  const handleSaveAndContinue = () => {
    setIsDirty(false);
    setActivePanel('summary');
  };

  // Use centralized calculation for CNC cost
  const calculateCNCCost = () => {
    return Number(localCNC.runtime || 0) * Number(localCNC.rate || 0);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            CNC Runtime (hrs)
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={localCNC.runtime || ''}
            onChange={(e) => handleRuntimeChange(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Machine Rate ($/hr)
            </label>
            {!editingRate && (
              <button
                onClick={() => setEditingRate(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
          {editingRate ? (
            <div className="mt-1 relative">
              <input 
                type="number"
                min="0"
                value={localCNC.rate || ''}
                onChange={(e) => handleRateChange(e.target.value)}
                className="block w-full border border-blue-300 rounded-md shadow-sm p-2"
              />
              <button
                onClick={() => setEditingRate(false)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="mt-1 p-2 bg-gray-50 rounded-md text-right">
              ${localCNC.rate || '0'}/hr
            </div>
          )}
        </div>
      </div>

      {editingRate && (
        <div className="flex items-start space-x-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            You're overriding the default rate for this job. This won't affect the default rate in settings.
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <div className="flex justify-between">
          <span className="font-medium">Total CNC Cost:</span>
          <span>${calculateCNCCost().toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => setActivePanel('materials')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        
        <button
          onClick={handleSaveAndContinue}
          disabled={!isDirty}
          className={`px-6 py-2 rounded-md text-white flex items-center space-x-2
            ${isDirty ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          <span>Save & Continue</span>
        </button>
      </div>
    </div>
  );
};

export default CNCPanel;
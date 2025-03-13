// src/pages/settings/components/LaborSettings.jsx
import React, { useState } from 'react';
import { Save, Check, Pencil } from 'lucide-react';

const LaborSettings = ({ settings, onSettingsChange }) => {
  const [editingRate, setEditingRate] = useState({
    type: null,
    value: ''
  });

  const [editingExtraFee, setEditingExtraFee] = useState(false);
  const [extraFeeValue, setExtraFeeValue] = useState(settings.labor.extraFee || '');

  const laborTypeNames = {
    stockProduction: 'Stock Production',
    cncOperator: 'CNC Operator',
    assembly: 'Assembly',
    finishing: 'Finishing',
    upholstery: 'Upholstery'
  };

  const handleSaveRate = (type) => {
    if (!editingRate.value) {
      alert('Please enter a rate');
      return;
    }

    const updatedLabor = {
      ...settings.labor,
      [type]: { rate: editingRate.value }
    };

    onSettingsChange('labor', updatedLabor);
    setEditingRate({ type: null, value: '' });
  };

  const startEditing = (type, currentRate) => {
    setEditingRate({
      type,
      value: currentRate || ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Labor Rates</h2>


      <div className="p-4 bg-gray-50 rounded-lg my-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h3 className="text-md font-medium">Labor Surcharge (%)</h3>
            {editingExtraFee ? (
              <div className="mt-2 flex items-center space-x-2">
                <div className="relative rounded-md flex-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={extraFeeValue}
                    onChange={(e) => setExtraFeeValue(e.target.value)}
                    placeholder="e.g., 8"
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => {
                    if (extraFeeValue === '' || Number(extraFeeValue) < 0) {
                      alert('Please enter a valid extra fee rate');
                      return;
                    }
                    onSettingsChange('labor', {
                      ...settings.labor,
                      extraFee: Number(extraFeeValue)
                    });
                    setEditingExtraFee(false);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mt-1 flex items-center space-x-4">
                {(settings.labor.extraFee !== undefined && settings.labor.extraFee !== '') ? (
                  <>
                    <span className="text-lg">
                      {Number(settings.labor.extraFee).toFixed(2)}%
                    </span>
                    <button
                      onClick={() => {
                        setEditingExtraFee(true);
                        setExtraFeeValue(settings.labor.extraFee);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditingExtraFee(true);
                      setExtraFeeValue('');
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Extra Fee
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rate Input Section */}
      <div className="space-y-4">
        {Object.entries(laborTypeNames).map(([type, displayName]) => (
          <div key={type} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-md font-medium">{displayName}</h3>
                {editingRate.type === type ? (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="relative rounded-md flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingRate.value}
                        onChange={(e) => setEditingRate(prev => ({ ...prev, value: e.target.value }))}
                        className="block w-full pl-7 pr-16 border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="0.00"
                        autoFocus
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">/hr</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveRate(type)}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center space-x-4">
                    {settings.labor[type].rate ? (
                      <>
                        <span className="text-lg">${Number(settings.labor[type].rate).toFixed(2)}/hr</span>
                        <button
                          onClick={() => startEditing(type, settings.labor[type].rate)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditing(type, '')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Rate
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LaborSettings;
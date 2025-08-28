// src/pages/settings/components/CNCSettings.jsx
import { useState } from 'react';
import { Pencil } from 'lucide-react';

const CNCSettings = ({ settings, onSettingsChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValues, setEditingValues] = useState({
    baseHourlyRate: '', // Base hourly rate
    yearlyToolExpense: '', // Annual cost for tools/bits/cutters
    yearlyEquipmentExpense: '', // Annual cost for parts/maintenance
    monthlyOperatingHours: '' // Hours machine runs per month
  });

  const calculateHourlyRate = (values) => {
    const baseRate = Number(values.baseHourlyRate) || 0;
    const monthlyOperatingHours = Number(values.monthlyOperatingHours) || 0;
    
    if (!monthlyOperatingHours) return baseRate;

    // Calculate additional hourly cost from yearly expenses
    const yearlyExpenses = (Number(values.yearlyToolExpense) || 0) + 
                          (Number(values.yearlyEquipmentExpense) || 0);
    const additionalHourlyCost = yearlyExpenses / (monthlyOperatingHours * 12);

    return baseRate + additionalHourlyCost;
  };

  const handleSave = () => {
    if (!editingValues.baseHourlyRate) {
      alert('Please enter a base hourly rate');
      return;
    }
    if (!editingValues.monthlyOperatingHours) {
      alert('Please enter monthly operating hours');
      return;
    }

    const hourlyRate = calculateHourlyRate(editingValues);
    
    const updatedCNC = {
      rate: hourlyRate.toFixed(2),
      details: editingValues
    };

    onSettingsChange('cnc', updatedCNC);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditingValues(settings.cnc.details || {
      baseHourlyRate: '',
      yearlyToolExpense: '',
      yearlyEquipmentExpense: '',
      monthlyOperatingHours: ''
    });
    setIsEditing(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">CNC Machine Rate</h2>

      {isEditing ? (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Base Hourly Rate ($/hr)
                <span className="block text-xs text-gray-500 font-normal mt-1">
                  Basic machine operating cost per hour
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editingValues.baseHourlyRate}
                onChange={(e) => setEditingValues(prev => ({
                  ...prev,
                  baseHourlyRate: e.target.value
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Yearly Tool Expense ($)
                <span className="block text-xs text-gray-500 font-normal mt-1">
                  Annual cost for bits, cutters, and other consumable tools
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editingValues.yearlyToolExpense}
                onChange={(e) => setEditingValues(prev => ({
                  ...prev,
                  yearlyToolExpense: e.target.value
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Yearly Equipment Expense ($)
                <span className="block text-xs text-gray-500 font-normal mt-1">
                  Annual cost for replacement parts and maintenance items
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editingValues.yearlyEquipmentExpense}
                onChange={(e) => setEditingValues(prev => ({
                  ...prev,
                  yearlyEquipmentExpense: e.target.value
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Operating Hours
                <span className="block text-xs text-gray-500 font-normal mt-1">
                  Average hours the machine runs per month
                </span>
              </label>
              <input
                type="number"
                min="0"
                value={editingValues.monthlyOperatingHours}
                onChange={(e) => setEditingValues(prev => ({
                  ...prev,
                  monthlyOperatingHours: e.target.value
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Rate
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg">
          {settings.cnc.rate ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Total Machine Rate</h3>
                  <p className="text-2xl font-bold mt-1">${Number(settings.cnc.rate).toFixed(2)}/hr</p>
                </div>
                <button
                  onClick={startEditing}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {settings.cnc.details && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base Rate:</span>
                      <span className="font-medium">${Number(settings.cnc.details.baseHourlyRate).toFixed(2)}/hr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Added Tool Cost:</span>
                      <span className="font-medium">
                        ${(Number(settings.cnc.details.yearlyToolExpense) / 
                           (Number(settings.cnc.details.monthlyOperatingHours) * 12)).toFixed(2)}/hr
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Added Equipment Cost:</span>
                      <span className="font-medium">
                        ${(Number(settings.cnc.details.yearlyEquipmentExpense) / 
                           (Number(settings.cnc.details.monthlyOperatingHours) * 12)).toFixed(2)}/hr
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monthly Operating Hours:</span>
                      <span className="font-medium">{settings.cnc.details.monthlyOperatingHours}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Set Machine Rate</h3>
              <p className="text-gray-500 mb-4">
                Configure your CNC machine&apos;s base rate and operating costs
              </p>
              <button
                onClick={startEditing}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Configure Rate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CNCSettings;
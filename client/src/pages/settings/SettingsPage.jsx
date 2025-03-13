// src/pages/settings/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import WoodSettings from './components/WoodSettings';
import HardwareSettings from './components/HardwareSettings';
import FinishingSettings from './components/FinishingSettings';
import LaborSettings from './components/LaborSettings';
import CNCSettings from './components/CNCSettings';
import OverheadSettings from './components/OverheadSettings';
import MarginSettings from './components/MarginSettings';
import SheetSettings from './components/SheetSettings';
import UpholsterySettings from './components/UpholsterySettings';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    labor: {
      stockProduction: { rate: '' },
      cncOperator: { rate: '' },
      assembly: { rate: '' },
      finishing: { rate: '' },
      upholstery: { rate: '' }
    },
    materials: {
      wood: {},
      hardware: [],
      finishing: [],
      sheet: [],
      upholsteryMaterials: []
    },
    cnc: {
      rate: '',
      details: {}
    },
    overhead: {
      monthlyOverhead: '',
      employees: '',
      monthlyProdHours: '',
      monthlyCNCHours: ''
    },
    margins: {
      wholesale: '',
      msrp: ''
    }
  });

  // Load saved settings on mount (from localStorage, if needed)
  useEffect(() => {
    const savedSettings = localStorage.getItem('calculatorSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // This function is called when a settings component changes its values
  const handleSettingsChange = (category, value) => {
    const updatedSettings = {
      ...settings,
      [category]: value
    };

    setSettings(updatedSettings);
    // Save to localStorage immediately
    localStorage.setItem('calculatorSettings', JSON.stringify(updatedSettings));
  };

  // Function to save settings to MongoDB via the API
  const saveSettingsToDB = async () => {
    console.log("Attempting to save settings:", settings);
    try {
      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const rawResponse = await response.text();
      console.log("Raw response:", rawResponse);
      
      // Only parse JSON if there is a response body
      const data = rawResponse ? JSON.parse(rawResponse) : {};
      
      console.log('Settings saved:', data);
      alert('Settings successfully saved to the database!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings to the database.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calculator Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure default values for the furniture pricing calculator
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LaborSettings settings={settings} onSettingsChange={handleSettingsChange} />
        <CNCSettings settings={settings} onSettingsChange={handleSettingsChange} />
        <WoodSettings settings={settings} onSettingsChange={handleSettingsChange} />
        <SheetSettings settings={settings} onSettingsChange={handleSettingsChange} />
        <UpholsterySettings settings={settings} onSettingsChange={handleSettingsChange} />
        <HardwareSettings settings={settings} onSettingsChange={handleSettingsChange} />
        <FinishingSettings settings={settings} onSettingsChange={handleSettingsChange} />
        <OverheadSettings settings={settings} onSettingsChange={handleSettingsChange} />
        <MarginSettings settings={settings} onSettingsChange={handleSettingsChange} />
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={saveSettingsToDB}
          className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Settings to Database
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
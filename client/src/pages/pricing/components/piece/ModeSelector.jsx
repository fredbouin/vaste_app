// src/pages/pricing/components/piece/ModeSelector.jsx
import React from 'react';

const ModeSelector = ({ isComponent, onModeChange }) => (
  <div className="space-y-2">
    <div className="flex space-x-4">
      <button
        onClick={() => onModeChange('piece')}
        className={`px-4 py-2 rounded-md ${!isComponent 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700'}`}
      >
        Calculate Piece
      </button>
      <button
        onClick={() => onModeChange('component')}
        className={`px-4 py-2 rounded-md ${isComponent 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700'}`}
      >
        Create Component
      </button>
    </div>
    <div className="text-sm text-gray-500">
      Current Mode: {isComponent ? 'Component' : 'Piece'}
    </div>
  </div>
);

export default ModeSelector;
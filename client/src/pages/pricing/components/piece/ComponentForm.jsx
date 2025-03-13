// src/pages/pricing/components/piece/ComponentForm.jsx
import React from 'react';

const ComponentForm = ({ data, onChange, setActivePanel }) => {
  const handleSaveAndContinue = () => {
    if (!data.componentName) {
      alert('Please enter a component name');
      return;
    }
    if (!data.componentType) {
      alert('Please select a component type');
      return;
    }
    setActivePanel('labor');
  };

  const isValid = data.componentName && data.componentType;

  return (
    <div className="space-y-4">
      <div className="border p-4 rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Component Name
            </label>
            <input 
              type="text"
              value={data.componentName || ''}
              onChange={(e) => onChange('componentName', e.target.value)}
              placeholder="e.g., Standard Club Chair Seat"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Component Type
            </label>
            <select
              value={data.componentType || ''}
              onChange={(e) => onChange('componentType', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Type...</option>
              <option value="seat">Seat</option>
              <option value="back">Back</option>
              <option value="arm">Arm</option>
              <option value="base">Base</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center pt-4">
        <button
          onClick={handleSaveAndContinue}
          className={`px-6 py-2 rounded-md text-white flex items-center space-x-2 ${
            isValid 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!isValid}
        >
          <span>Save & Continue</span>
        </button>
      </div>
    </div>
  );
};

export default ComponentForm;

// // src/pages/pricing/components/piece/ComponentForm.jsx
// import React from 'react';

// const ComponentForm = ({ data, onChange }) => (
//   <div className="space-y-4 border p-4 rounded-lg">
//     <div>
//       <label className="block text-sm font-medium text-gray-700">
//         Component Name
//       </label>
//       <input 
//         type="text"
//         value={data.componentName || ''}
//         onChange={(e) => onChange('componentName', e.target.value)}
//         placeholder="e.g., Standard Club Chair Seat"
//         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//       />
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700">
//         Component Type
//       </label>
//       <select
//         value={data.componentType || ''}
//         onChange={(e) => onChange('componentType', e.target.value)}
//         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//       >
//         <option value="">Select Type...</option>
//         <option value="seat">Seat</option>
//         <option value="back">Back</option>
//         <option value="arm">Arm</option>
//         <option value="base">Base</option>
//         <option value="other">Other</option>
//       </select>
//     </div>
//   </div>
// );

// export default ComponentForm;

// src/pages/pricing/components/LaborPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Pencil, X, AlertCircle } from 'lucide-react';

const LaborPanel = ({ labor = {}, onLaborChange, setActivePanel }) => {
  const [editingRate, setEditingRate] = useState(null);
  const [localLabor, setLocalLabor] = useState(labor);
  const [isDirty, setIsDirty] = useState(false);
  const [settings, setSettings] = useState(null);

  // Define your labor types and the desired order
  const laborTypes = {
    'Stock Production': 'stockProduction',
    'CNC Operator': 'cncOperator',
    'Assembly': 'assembly',
    'Finishing': 'finishing',
    'Upholstery': 'upholstery'
  };
  const laborOrder = Object.values(laborTypes);

  // Create a ref object to hold references for each hours input
  const hoursRefs = useRef({});

  // Load settings for labor surcharge
  useEffect(() => {
    const savedSettings = localStorage.getItem('calculatorSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Sync localLabor with prop changes
  useEffect(() => {
    console.log('LaborPanel received labor prop:', labor);
    setLocalLabor(labor);
  }, [labor]);

  const calculateTotalCost = (laborData) => {
    const baseCost = Object.entries(laborTypes).reduce((sum, [_, key]) => {
      const entry = laborData[key];
      return sum + (Number(entry?.hours || 0) * Number(entry?.rate || 0));
    }, 0);

    // Calculate surcharge if settings are available
    const surchargePercentage = settings?.labor?.extraFee || 0;
    const surchargeCost = baseCost * (surchargePercentage / 100);

    return {
      baseCost,
      surchargeCost,
      surchargePercentage,
      totalCost: baseCost + surchargeCost
    };
  };

  const handleHoursChange = (key, value) => {
    console.log(`Changing ${key} hours to:`, value);
    const updatedLabor = {
      ...localLabor,
      [key]: {
        ...localLabor[key],
        hours: value
      }
    };
    setLocalLabor(updatedLabor);
    setIsDirty(true);
    onLaborChange(updatedLabor);
  };

  const handleRateChange = (key, value) => {
    console.log(`Changing ${key} rate to:`, value);
    const updatedLabor = {
      ...localLabor,
      [key]: {
        ...localLabor[key],
        rate: value
      }
    };
    setLocalLabor(updatedLabor);
    setIsDirty(true);
    onLaborChange(updatedLabor);
  };

  const handleSaveAndContinue = () => {
    console.log('LaborPanel: saving and continuing with labor:', localLabor);
    setIsDirty(false);
    setActivePanel('materials');
  };

  const totalHours = Object.values(localLabor).reduce(
    (sum, { hours }) => sum + Number(hours || 0),
    0
  );

  const { baseCost, surchargeCost, surchargePercentage, totalCost } = calculateTotalCost(localLabor);

  return (
    <div className="p-4 space-y-6">
      {Object.entries(laborTypes).map(([label, key]) => (
        <div key={key} className="grid grid-cols-2 gap-4 border-b pb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {label} Hours
            </label>
            <input 
              type="number"
              min="0"
              step="0.5"
              value={localLabor[key]?.hours ?? ''}
              ref={el => hoursRefs.current[key] = el}
              onChange={(e) => handleHoursChange(key, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab" && !e.shiftKey) {
                  e.preventDefault();
                  const currentIndex = laborOrder.indexOf(key);
                  if (currentIndex !== -1 && currentIndex < laborOrder.length - 1) {
                    const nextKey = laborOrder[currentIndex + 1];
                    hoursRefs.current[nextKey]?.focus();
                  }
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Rate ($/hr)
              </label>
              {editingRate !== key && (
                <button
                  onClick={() => setEditingRate(key)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            {editingRate === key ? (
              <div className="mt-1 relative">
                <input 
                  type="number"
                  min="0"
                  value={localLabor[key]?.rate || ''}
                  onChange={(e) => handleRateChange(key, e.target.value)}
                  className="block w-full border border-blue-300 rounded-md shadow-sm p-2"
                />
                <button
                  onClick={() => setEditingRate(null)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                ${localLabor[key]?.rate || '0'}/hr
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Total Labor Hours:</span>
            <span>{totalHours.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Base Labor Cost:</span>
            <span>${baseCost.toFixed(2)}</span>
          </div>
          {surchargePercentage > 0 && (
            <div className="flex justify-between text-gray-600 italic">
              <span className="font-medium">Labor Surcharge ({surchargePercentage}%):</span>
              <span>${surchargeCost.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between mt-2 pt-2 border-t">
            <span className="font-medium">Total Labor Cost:</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
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

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => setActivePanel('piece')}
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

export default LaborPanel;

// // src/pages/pricing/components/LaborPanel.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import { Pencil, X, AlertCircle } from 'lucide-react';

// const LaborPanel = ({ labor = {}, onLaborChange, setActivePanel }) => {
//   const [editingRate, setEditingRate] = useState(null);
//   const [localLabor, setLocalLabor] = useState(labor);
//   const [isDirty, setIsDirty] = useState(false);

//   // Define your labor types and the desired order
//   const laborTypes = {
//     'Stock Production': 'stockProduction',
//     'CNC Operator': 'cncOperator',
//     'Assembly': 'assembly',
//     'Finishing': 'finishing',
//     'Upholstery': 'upholstery'
//   };
//   const laborOrder = Object.values(laborTypes);

//   // Create a ref object to hold references for each hours input
//   const hoursRefs = useRef({});

//   // Sync localLabor with prop changes
//   useEffect(() => {
//     console.log('LaborPanel received labor prop:', labor);
//     setLocalLabor(labor);
//   }, [labor]);

//   const handleHoursChange = (key, value) => {
//     console.log(`Changing ${key} hours to:`, value);
//     const updatedLabor = {
//       ...localLabor,
//       [key]: {
//         ...localLabor[key],
//         hours: value
//       }
//     };
//     setLocalLabor(updatedLabor);
//     setIsDirty(true);
//     onLaborChange(updatedLabor);
//   };

//   const handleRateChange = (key, value) => {
//     console.log(`Changing ${key} rate to:`, value);
//     const updatedLabor = {
//       ...localLabor,
//       [key]: {
//         ...localLabor[key],
//         rate: value
//       }
//     };
//     setLocalLabor(updatedLabor);
//     setIsDirty(true);
//     onLaborChange(updatedLabor);
//   };

//   const handleSaveAndContinue = () => {
//     console.log('LaborPanel: saving and continuing with labor:', localLabor);
//     setIsDirty(false);
//     setActivePanel('materials');
//   };

//   const totalHours = Object.values(localLabor).reduce(
//     (sum, { hours }) => sum + Number(hours || 0),
//     0
//   );

//   const totalCost = Object.values(localLabor).reduce(
//     (sum, { hours, rate }) => sum + (Number(hours || 0) * Number(rate || 0)),
//     0
//   );

//   // Retrieve labor surcharge extra fee from saved settings (if available)
//   const savedSettings = localStorage.getItem('calculatorSettings');
//   const settings = savedSettings ? JSON.parse(savedSettings) : {};
//   const extraFee = settings.labor && settings.labor.extraFee ? Number(settings.labor.extraFee) : 0;
//   const laborSurchargeCost = totalCost * (extraFee / 100);
//   const combinedLaborCost = totalCost + laborSurchargeCost;

//   return (
//     <div className="p-4 space-y-6">
//       {Object.entries(laborTypes).map(([label, key]) => (
//         <div key={key} className="grid grid-cols-2 gap-4 border-b pb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               {label} Hours
//             </label>
//             <input 
//               type="number"
//               min="0"
//               step="0.5"
//               value={localLabor[key]?.hours ?? ''}
//               ref={el => hoursRefs.current[key] = el}
//               onChange={(e) => handleHoursChange(key, e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Tab" && !e.shiftKey) {
//                   e.preventDefault();
//                   const currentIndex = laborOrder.indexOf(key);
//                   if (currentIndex !== -1 && currentIndex < laborOrder.length - 1) {
//                     const nextKey = laborOrder[currentIndex + 1];
//                     hoursRefs.current[nextKey]?.focus();
//                   }
//                 }
//               }}
//               className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//             />
//           </div>
//           <div>
//             <div className="flex justify-between items-center">
//               <label className="block text-sm font-medium text-gray-700">
//                 Rate ($/hr)
//               </label>
//               {editingRate !== key && (
//                 <button
//                   onClick={() => setEditingRate(key)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <Pencil className="w-4 h-4" />
//                 </button>
//               )}
//             </div>
//             {editingRate === key ? (
//               <div className="mt-1 relative">
//                 <input 
//                   type="number"
//                   min="0"
//                   value={localLabor[key]?.rate || ''}
//                   onChange={(e) => handleRateChange(key, e.target.value)}
//                   className="block w-full border border-blue-300 rounded-md shadow-sm p-2"
//                 />
//                 <button
//                   onClick={() => setEditingRate(null)}
//                   className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//             ) : (
//               <div className="mt-1 p-2 bg-gray-50 rounded-md">
//                 ${localLabor[key]?.rate || '0'}/hr
//               </div>
//             )}
//           </div>
//         </div>
//       ))}

//       <div className="mt-4 p-4 bg-gray-50 rounded-md">
//         <div className="flex justify-between">
//           <span className="font-medium">Total Labor Hours:</span>
//           <span>{totalHours.toFixed(1)}</span>
//         </div>
//         <div className="flex justify-between mt-2">
//           <span className="font-medium">Total Labor Cost:</span>
//           <span>${totalCost.toFixed(2)}</span>
//         </div>
//         {extraFee > 0 && (
//           <>
//             <div className="flex justify-between mt-2">
//               <span className="font-medium">Labor Surcharge ({extraFee}%):</span>
//               <span>${laborSurchargeCost.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between mt-2">
//               <span className="font-medium">Combined Labor Cost:</span>
//               <span>${combinedLaborCost.toFixed(2)}</span>
//             </div>
//           </>
//         )}
//       </div>

//       {editingRate && (
//         <div className="flex items-start space-x-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md">
//           <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
//           <p>
//             You're overriding the default rate for this job. This won't affect the default rate in settings.
//           </p>
//         </div>
//       )}

//       <div className="flex justify-between items-center pt-4">
//         <button
//           onClick={() => setActivePanel('piece')}
//           className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//         >
//           Back
//         </button>
//         <button
//           onClick={handleSaveAndContinue}
//           disabled={!isDirty}
//           className={`px-6 py-2 rounded-md text-white flex items-center space-x-2
//             ${isDirty ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
//         >
//           <span>Save & Continue</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default LaborPanel;
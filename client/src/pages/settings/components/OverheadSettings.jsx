
// src/pages/settings/components/OverheadSettings.jsx
import { useState } from 'react';
import { Save, Pencil, AlertCircle } from 'lucide-react';

const OverheadSettings = ({ settings, onSettingsChange }) => {
  const [editingOverhead, setEditingOverhead] = useState({
    isEditing: false,
    values: {
      monthlyOverhead: '',
      employees: '',
      monthlyProdHours: '',
      monthlyCNCHours: ''  // Added CNC Hours
    }
  });

  const calculateRate = (values) => {
    const { monthlyOverhead, employees, monthlyProdHours, monthlyCNCHours } = values;
    if (!monthlyOverhead || !employees || !monthlyProdHours) return 0;
    
    // Calculate total available hours (employee hours + CNC hours)
    const totalEmployeeHours = employees * monthlyProdHours;
    const totalHours = totalEmployeeHours + Number(monthlyCNCHours || 0);
    
    return monthlyOverhead / totalHours;
  };

  const handleSaveOverhead = () => {
    const { monthlyOverhead, employees, monthlyProdHours } = editingOverhead.values;
    
    // Validate all required fields are filled
    if (!monthlyOverhead || !employees || !monthlyProdHours) {
      alert('Please fill in all required overhead fields');
      return;
    }

    // Validate employees is at least 1
    if (employees < 1) {
      alert('Number of employees must be at least 1');
      return;
    }

    onSettingsChange('overhead', editingOverhead.values);
    setEditingOverhead({ 
      isEditing: false, 
      values: { 
        monthlyOverhead: '', 
        employees: '', 
        monthlyProdHours: '',
        monthlyCNCHours: ''
      } 
    });
  };

  const startEditing = () => {
    setEditingOverhead({
      isEditing: true,
      values: {
        monthlyOverhead: settings.overhead.monthlyOverhead || '',
        employees: settings.overhead.employees || '',
        monthlyProdHours: settings.overhead.monthlyProdHours || '',
        monthlyCNCHours: settings.overhead.monthlyCNCHours || ''
      }
    });
  };

  const hasCurrentValues = settings.overhead.monthlyOverhead && 
                          settings.overhead.employees && 
                          settings.overhead.monthlyProdHours;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Overhead Settings</h2>

      <div className="p-4 bg-gray-50 rounded-lg">
        {editingOverhead.isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Overhead
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingOverhead.values.monthlyOverhead}
                  onChange={(e) => setEditingOverhead(prev => ({
                    ...prev,
                    values: { ...prev.values, monthlyOverhead: e.target.value }
                  }))}
                  className="block w-full pl-7 border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Employees
              </label>
              <input
                type="number"
                min="1"
                value={editingOverhead.values.employees}
                onChange={(e) => setEditingOverhead(prev => ({
                  ...prev,
                  values: { ...prev.values, employees: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Production Hours per Employee
              </label>
              <input
                type="number"
                min="0"
                value={editingOverhead.values.monthlyProdHours}
                onChange={(e) => setEditingOverhead(prev => ({
                  ...prev,
                  values: { ...prev.values, monthlyProdHours: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly CNC Production Hours
                <span className="text-sm text-gray-500 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <input
                type="number"
                min="0"
                value={editingOverhead.values.monthlyCNCHours}
                onChange={(e) => setEditingOverhead(prev => ({
                  ...prev,
                  values: { ...prev.values, monthlyCNCHours: e.target.value }
                }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div className="pt-3">
              <button
                onClick={handleSaveOverhead}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Overhead Settings
              </button>
            </div>
          </div>
        ) : (
          <div>
            {hasCurrentValues ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Overhead:</span>
                  <span className="font-medium">${Number(settings.overhead.monthlyOverhead).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of Employees:</span>
                  <span className="font-medium">{settings.overhead.employees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Hours per Employee:</span>
                  <span className="font-medium">{settings.overhead.monthlyProdHours}</span>
                </div>
                {settings.overhead.monthlyCNCHours > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly CNC Hours:</span>
                    <span className="font-medium">{settings.overhead.monthlyCNCHours}</span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Calculated Recovery Rate:</span>
                    <span className="text-lg font-medium">
                      ${calculateRate(settings.overhead).toFixed(2)}/hr
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Based on {settings.overhead.employees * settings.overhead.monthlyProdHours + Number(settings.overhead.monthlyCNCHours || 0)} total available hours
                  </p>
                </div>
                <div className="pt-3">
                  <button
                    onClick={startEditing}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Settings
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center text-gray-500 mb-4">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>No overhead settings configured</span>
                </div>
                <button
                  onClick={startEditing}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Configure Overhead Settings
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverheadSettings;

// // src/pages/settings/components/OverheadSettings.jsx
// import { useState } from 'react';
// import { Save, Check, Pencil, AlertCircle } from 'lucide-react';

// const OverheadSettings = ({ settings, onSettingsChange }) => {
//   const [editingOverhead, setEditingOverhead] = useState({
//     isEditing: false,
//     values: {
//       monthlyOverhead: '',
//       employees: '',
//       monthlyProdHours: ''
//     }
//   });

//   const calculateRate = (values) => {
//     const { monthlyOverhead, employees, monthlyProdHours } = values;
//     if (!monthlyOverhead || !employees || !monthlyProdHours) return 0;
//     return monthlyOverhead / (employees * monthlyProdHours);
//   };

//   const handleSaveOverhead = () => {
//     const { monthlyOverhead, employees, monthlyProdHours } = editingOverhead.values;
    
//     // Validate all fields are filled
//     if (!monthlyOverhead || !employees || !monthlyProdHours) {
//       alert('Please fill in all overhead fields');
//       return;
//     }

//     // Validate employees is at least 1
//     if (employees < 1) {
//       alert('Number of employees must be at least 1');
//       return;
//     }

//     onSettingsChange('overhead', editingOverhead.values);
//     setEditingOverhead({ isEditing: false, values: { monthlyOverhead: '', employees: '', monthlyProdHours: '' } });
//   };

//   const startEditing = () => {
//     setEditingOverhead({
//       isEditing: true,
//       values: {
//         monthlyOverhead: settings.overhead.monthlyOverhead || '',
//         employees: settings.overhead.employees || '',
//         monthlyProdHours: settings.overhead.monthlyProdHours || ''
//       }
//     });
//   };

//   const hasCurrentValues = settings.overhead.monthlyOverhead && 
//                           settings.overhead.employees && 
//                           settings.overhead.monthlyProdHours;

//   return (
//     <div className="bg-white rounded-lg shadow p-6">
//       <h2 className="text-lg font-semibold mb-4">Overhead Settings</h2>

//       <div className="p-4 bg-gray-50 rounded-lg">
//         {editingOverhead.isEditing ? (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Monthly Overhead
//               </label>
//               <div className="mt-1 relative rounded-md shadow-sm">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <span className="text-gray-500 sm:text-sm">$</span>
//                 </div>
//                 <input
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={editingOverhead.values.monthlyOverhead}
//                   onChange={(e) => setEditingOverhead(prev => ({
//                     ...prev,
//                     values: { ...prev.values, monthlyOverhead: e.target.value }
//                   }))}
//                   className="block w-full pl-7 border border-gray-300 rounded-md shadow-sm p-2"
//                   placeholder="0.00"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Number of Employees
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 value={editingOverhead.values.employees}
//                 onChange={(e) => setEditingOverhead(prev => ({
//                   ...prev,
//                   values: { ...prev.values, employees: e.target.value }
//                 }))}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Monthly Production Hours per Employee
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 value={editingOverhead.values.monthlyProdHours}
//                 onChange={(e) => setEditingOverhead(prev => ({
//                   ...prev,
//                   values: { ...prev.values, monthlyProdHours: e.target.value }
//                 }))}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//               />
//             </div>

//             <div className="pt-3">
//               <button
//                 onClick={handleSaveOverhead}
//                 className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 <Save className="w-4 h-4 mr-2" />
//                 Save Overhead Settings
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div>
//             {hasCurrentValues ? (
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Monthly Overhead:</span>
//                   <span className="font-medium">${Number(settings.overhead.monthlyOverhead).toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Number of Employees:</span>
//                   <span className="font-medium">{settings.overhead.employees}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Monthly Hours per Employee:</span>
//                   <span className="font-medium">{settings.overhead.monthlyProdHours}</span>
//                 </div>
//                 <div className="pt-2 mt-2 border-t">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Calculated Recovery Rate:</span>
//                     <span className="text-lg font-medium">
//                       ${calculateRate(settings.overhead).toFixed(2)}/hr
//                     </span>
//                   </div>
//                 </div>
//                 <div className="pt-3">
//                   <button
//                     onClick={startEditing}
//                     className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                   >
//                     <Pencil className="w-4 h-4 mr-2" />
//                     Edit Settings
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <div className="flex items-center text-gray-500 mb-4">
//                   <AlertCircle className="w-5 h-5 mr-2" />
//                   <span>No overhead settings configured</span>
//                 </div>
//                 <button
//                   onClick={startEditing}
//                   className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Configure Overhead Settings
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OverheadSettings;
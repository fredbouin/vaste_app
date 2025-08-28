// src/pages/settings/components/WoodSettings.jsx
import { useState } from 'react';
import { Plus, Trash2, Save, Pencil } from 'lucide-react';

const WoodSettings = ({ settings, onSettingsChange }) => {
  const thicknesses = ['4/4', '5/4', '6/4', '8/4'];
  
  // State for editing the waste factor
  const [editingWasteFactor, setEditingWasteFactor] = useState(false);
  const [wasteFactorValue, setWasteFactorValue] = useState(
    settings.materials.woodWasteFactor || ''
  );

  // State for adding a new species
  const [newSpecies, setNewSpecies] = useState({
    name: '',
    costs: {
      '4/4': '',
      '5/4': '',
      '6/4': '',
      '8/4': ''
    }
  });

  // State for inline editing of an existing species
  const [editingSpecies, setEditingSpecies] = useState(null);
  const [editingSpeciesData, setEditingSpeciesData] = useState({});

  const handleAddSpecies = () => {
    if (!newSpecies.name) {
      alert('Please enter a species name');
      return;
    }
    if (!Object.values(newSpecies.costs).some(cost => cost !== '')) {
      alert('Please enter at least one thickness cost');
      return;
    }

    const updatedWood = {
      ...settings.materials.wood,
      [newSpecies.name]: thicknesses.reduce((acc, thickness) => ({
        ...acc,
        [thickness]: { cost: newSpecies.costs[thickness] || '' }
      }), {})
    };

    onSettingsChange('materials', {
      ...settings.materials,
      wood: updatedWood
    });

    setNewSpecies({
      name: '',
      costs: {
        '4/4': '',
        '5/4': '',
        '6/4': '',
        '8/4': ''
      }
    });
  };

  const handleRemoveSpecies = (speciesName) => {
    const { [speciesName]: _removed, ...remainingWood } = settings.materials.wood;
    onSettingsChange('materials', {
      ...settings.materials,
      wood: remainingWood
    });
  };

  const handleEditClick = (species, currentData) => {
    setEditingSpecies(species);
    // Prepopulate editing state with current cost values
    const initialData = {};
    thicknesses.forEach(thickness => {
      initialData[thickness] = currentData[thickness].cost;
    });
    setEditingSpeciesData(initialData);
  };

  const handleEditChange = (thickness, value) => {
    setEditingSpeciesData(prev => ({
      ...prev,
      [thickness]: value
    }));
  };

  const handleSaveEdit = (species) => {
    const updatedSpeciesData = {};
    thicknesses.forEach(thickness => {
      updatedSpeciesData[thickness] = { cost: editingSpeciesData[thickness] || '' };
    });
    const updatedWood = {
      ...settings.materials.wood,
      [species]: updatedSpeciesData
    };
    onSettingsChange('materials', {
      ...settings.materials,
      wood: updatedWood
    });
    setEditingSpecies(null);
    setEditingSpeciesData({});
  };

  const handleCancelEdit = () => {
    setEditingSpecies(null);
    setEditingSpeciesData({});
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Wood Species & Costs</h2>
      
      {/* Waste Factor Section */}
      <div className="p-4 bg-gray-50 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h3 className="text-md font-medium">Waste Factor (%)</h3>
            {editingWasteFactor ? (
              <div className="mt-2 flex items-center space-x-2">
                <div className="relative rounded-md flex-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={wasteFactorValue}
                    onChange={(e) => setWasteFactorValue(e.target.value)}
                    placeholder="e.g., 30"
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => {
                    if (wasteFactorValue === '' || Number(wasteFactorValue) < 0) {
                      alert('Please enter a valid waste factor');
                      return;
                    }
                    onSettingsChange('materials', {
                      ...settings.materials,
                      woodWasteFactor: Number(wasteFactorValue)
                    });
                    setEditingWasteFactor(false);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mt-1 flex items-center space-x-4">
                {(settings.materials.woodWasteFactor !== undefined &&
                  settings.materials.woodWasteFactor !== '') ? (
                  <>
                    <span className="text-lg">
                      {Number(settings.materials.woodWasteFactor).toFixed(2)}%
                    </span>
                    <button
                      onClick={() => {
                        setEditingWasteFactor(true);
                        setWasteFactorValue(settings.materials.woodWasteFactor);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditingWasteFactor(true);
                      setWasteFactorValue('');
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Waste Factor
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Species Form */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-md font-medium mb-3">Add New Species</h3>
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Species Name
            </label>
            <input
              type="text"
              value={newSpecies.name}
              onChange={(e) => setNewSpecies(prev => ({
                ...prev,
                name: e.target.value
              }))}
              placeholder="e.g., Walnut"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costs by Thickness
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {thicknesses.map(thickness => (
                <div key={thickness}>
                  <label className="block text-sm text-gray-600">
                    {thickness}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newSpecies.costs[thickness]}
                      onChange={(e) => setNewSpecies(prev => ({
                        ...prev,
                        costs: {
                          ...prev.costs,
                          [thickness]: e.target.value
                        }
                      }))}
                      placeholder="0.00"
                      className="block w-full pl-7 border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleAddSpecies}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Species
        </button>
      </div>

      {/* List of Saved Species with Inline Edit Option */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">Saved Species</h3>
        {Object.keys(settings.materials.wood).length === 0 ? (
          <p className="text-gray-500 text-sm italic">No species added yet</p>
        ) : (
          Object.entries(settings.materials.wood).map(([species, thicknessData]) => (
            <div 
              key={species} 
              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-lg mb-2">
                  {species}
                  {editingSpecies !== species && (
                    <button
                      onClick={() => handleEditClick(species, thicknessData)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingSpecies === species ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {thicknesses.map(thickness => (
                      <div key={thickness} className="text-sm flex items-center">
                        <label className="text-gray-600">{thickness}:</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingSpeciesData[thickness]}
                          onChange={(e) => handleEditChange(thickness, e.target.value)}
                          className="ml-2 w-20 border border-gray-300 rounded-md shadow-sm p-1"
                        />
                      </div>
                    ))}
                    <div className="flex space-x-2 mt-2 col-span-2">
                      <button
                        onClick={() => handleSaveEdit(species)}
                        className="px-3 py-1 text-white bg-green-600 rounded-md text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-white bg-red-600 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(thicknessData).map(([thickness, { cost }]) => (
                      <div key={thickness} className="text-sm">
                        <span className="text-gray-600">{thickness}:</span>
                        <span className="ml-2">${Number(cost || 0).toFixed(2)}/BF</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemoveSpecies(species)}
                className="ml-4 text-red-600 hover:text-red-900"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WoodSettings;


// // src/pages/settings/components/WoodSettings.jsx
// import { useState } from 'react';
// import { Plus, Trash2, Save, Pencil } from 'lucide-react';

// const WoodSettings = ({ settings, onSettingsChange }) => {
//   const thicknesses = ['4/4', '5/4', '6/4', '8/4'];
  
//   // Local state for waste factor editing
//   const [editingWasteFactor, setEditingWasteFactor] = useState(false);
//   const [wasteFactorValue, setWasteFactorValue] = useState(
//     settings.materials.woodWasteFactor || ''
//   );

//   const [newSpecies, setNewSpecies] = useState({
//     name: '',
//     costs: {
//       '4/4': '',
//       '5/4': '',
//       '6/4': '',
//       '8/4': ''
//     }
//   });

//   const handleAddSpecies = () => {
//     if (!newSpecies.name) {
//       alert('Please enter a species name');
//       return;
//     }
//     if (!Object.values(newSpecies.costs).some(cost => cost !== '')) {
//       alert('Please enter at least one thickness cost');
//       return;
//     }

//     const updatedWood = {
//       ...settings.materials.wood,
//       [newSpecies.name]: thicknesses.reduce((acc, thickness) => ({
//         ...acc,
//         [thickness]: { cost: newSpecies.costs[thickness] || '' }
//       }), {})
//     };

//     onSettingsChange('materials', {
//       ...settings.materials,
//       wood: updatedWood
//     });

//     setNewSpecies({
//       name: '',
//       costs: {
//         '4/4': '',
//         '5/4': '',
//         '6/4': '',
//         '8/4': ''
//       }
//     });
//   };

//   const handleRemoveSpecies = (speciesName) => {
//     const { [speciesName]: removed, ...remainingWood } = settings.materials.wood;
//     onSettingsChange('materials', {
//       ...settings.materials,
//       wood: remainingWood
//     });
//   };

//   return (
//     <div className="bg-white rounded-lg shadow p-6">
//       <h2 className="text-lg font-semibold mb-4">Wood Species & Costs</h2>
      
//       {/* Waste Factor Input with Save Button in a Grey Box */}
//       <div className="p-4 bg-gray-50 rounded-lg mb-4">
//         <div className="flex justify-between items-center">
//           <div className="flex-1">
//             <h3 className="text-md font-medium">Waste Factor (%)</h3>
//             {editingWasteFactor ? (
//               <div className="mt-2 flex items-center space-x-2">
//                 <div className="relative rounded-md flex-1">
//                   <input
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={wasteFactorValue}
//                     onChange={(e) => setWasteFactorValue(e.target.value)}
//                     placeholder="e.g., 30"
//                     className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
//                     autoFocus
//                   />
//                 </div>
//                 <button
//                   onClick={() => {
//                     if (wasteFactorValue === '' || Number(wasteFactorValue) < 0) {
//                       alert('Please enter a valid waste factor');
//                       return;
//                     }
//                     onSettingsChange('materials', {
//                       ...settings.materials,
//                       woodWasteFactor: Number(wasteFactorValue)
//                     });
//                     setEditingWasteFactor(false);
//                   }}
//                   className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   <Save className="w-4 h-4" />
//                 </button>
//               </div>
//             ) : (
//               <div className="mt-1 flex items-center space-x-4">
//                 {(settings.materials.woodWasteFactor !== undefined &&
//                   settings.materials.woodWasteFactor !== '') ? (
//                   <>
//                     <span className="text-lg">
//                       {Number(settings.materials.woodWasteFactor).toFixed(2)}%
//                     </span>
//                     <button
//                       onClick={() => {
//                         setEditingWasteFactor(true);
//                         setWasteFactorValue(settings.materials.woodWasteFactor);
//                       }}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <Pencil className="w-4 h-4" />
//                     </button>
//                   </>
//                 ) : (
//                   <button
//                     onClick={() => {
//                       setEditingWasteFactor(true);
//                       setWasteFactorValue('');
//                     }}
//                     className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//                   >
//                     + Add Waste Factor
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Add New Species Form */}
//       <div className="bg-gray-50 rounded-lg p-4 mb-6">
//         <h3 className="text-md font-medium mb-3">Add New Species</h3>
//         <div className="space-y-4 mb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Species Name
//             </label>
//             <input
//               type="text"
//               value={newSpecies.name}
//               onChange={(e) => setNewSpecies(prev => ({
//                 ...prev,
//                 name: e.target.value
//               }))}
//               placeholder="e.g., Walnut"
//               className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Costs by Thickness
//             </label>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {thicknesses.map(thickness => (
//                 <div key={thickness}>
//                   <label className="block text-sm text-gray-600">
//                     {thickness}
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <span className="text-gray-500 sm:text-sm">$</span>
//                     </div>
//                     <input
//                       type="number"
//                       min="0"
//                       step="0.01"
//                       value={newSpecies.costs[thickness]}
//                       onChange={(e) => setNewSpecies(prev => ({
//                         ...prev,
//                         costs: {
//                           ...prev.costs,
//                           [thickness]: e.target.value
//                         }
//                       }))}
//                       placeholder="0.00"
//                       className="block w-full pl-7 border border-gray-300 rounded-md shadow-sm p-2"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={handleAddSpecies}
//           className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Add Species
//         </button>
//       </div>

//       {/* List of Saved Species */}
//       <div className="space-y-4">
//         <h3 className="text-md font-medium">Saved Species</h3>
//         {Object.keys(settings.materials.wood).length === 0 ? (
//           <p className="text-gray-500 text-sm italic">No species added yet</p>
//         ) : (
//           Object.entries(settings.materials.wood).map(([species, thicknessData]) => (
//             <div 
//               key={species} 
//               className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
//             >
//               <div className="flex-1">
//                 <div className="font-medium text-lg mb-2">{species}</div>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   {Object.entries(thicknessData).map(([thickness, { cost }]) => (
//                     <div key={thickness} className="text-sm">
//                       <span className="text-gray-600">{thickness}:</span>
//                       <span className="ml-2">${Number(cost || 0).toFixed(2)}/BF</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <button
//                 onClick={() => handleRemoveSpecies(species)}
//                 className="ml-4 text-red-600 hover:text-red-900"
//               >
//                 <Trash2 className="w-5 h-5" />
//               </button>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default WoodSettings;

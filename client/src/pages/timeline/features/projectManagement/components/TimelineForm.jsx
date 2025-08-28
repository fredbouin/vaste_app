import { useState } from 'react';

const TimelineForm = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    model: '',
    quantity: '',
    devisNumbers: ['']  // Array to store multiple devis numbers
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const quantity = parseInt(formData.quantity, 10);
    
    if (isNaN(quantity) || quantity <= 0) {
      return;
    }

    // Filter out empty devis numbers before submitting
    const cleanedDevisNumbers = formData.devisNumbers.filter(num => num.trim() !== '');
    
    onSubmit({
      ...formData,
      devisNumbers: cleanedDevisNumbers
    });
    
    // Reset form after submission
    setFormData({ 
      model: '', 
      quantity: '', 
      devisNumbers: ['']
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDevisChange = (index, value) => {
    setFormData(prev => {
      const newDevisNumbers = [...prev.devisNumbers];
      newDevisNumbers[index] = value;
      return {
        ...prev,
        devisNumbers: newDevisNumbers
      };
    });
  };

  const addDevisField = () => {
    setFormData(prev => ({
      ...prev,
      devisNumbers: [...prev.devisNumbers, '']
    }));
  };

  const removeDevisField = (index) => {
    setFormData(prev => ({
      ...prev,
      devisNumbers: prev.devisNumbers.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Production Timeline</h2>

      {isLoading ? (
        <div className="text-center py-4">Loading model times...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Model Number
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter model number"
                required
              />
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Devis Numbers
            </label>
            {formData.devisNumbers.map((devis, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={devis}
                  onChange={(e) => handleDevisChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter devis number (e.g., d1234)"
                />
                {formData.devisNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDevisField(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addDevisField}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add another devis number
            </button>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Add Project
          </button>
        </form>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default TimelineForm;

// 
// const TimelineForm = ({ onSubmit, isLoading, error }) => {
//   const [formData, setFormData] = React.useState({
//     model: '',
//     quantity: ''
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const quantity = parseInt(formData.quantity, 10);
    
//     if (isNaN(quantity) || quantity <= 0) {
//       return; // Let parent handle validation error
//     }

//     onSubmit(formData);
//     setFormData({ model: '', quantity: '' }); // Reset form after submission
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">Production Timeline</h2>

//       {isLoading ? (
//         <div className="text-center py-4">Loading model times...</div>
//       ) : (
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
//                 Model Number
//               </label>
//               <input
//                 type="text"
//                 id="model"
//                 name="model"
//                 value={formData.model}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter model number"
//                 required
//               />
//             </div>
            
//             <div>
//               <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
//                 Quantity
//               </label>
//               <input
//                 type="number"
//                 id="quantity"
//                 name="quantity"
//                 value={formData.quantity}
//                 onChange={handleChange}
//                 min="1"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter quantity"
//                 required
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200"
//           >
//             Add Project
//           </button>
//         </form>
//       )}

//       {error && (
//         <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
//           {error}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TimelineForm;
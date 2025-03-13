import React, { useState } from 'react';

const QuantityUpdateForm = ({ 
  currentQuantity, 
  onUpdate, 
  onCancel 
}) => {
  const [quantity, setQuantity] = useState(currentQuantity);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newQuantity = parseInt(quantity, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      onUpdate(newQuantity);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        min="1"
        className="w-20 px-2 py-1 border rounded text-sm"
      />
      <button 
        type="submit"
        className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Save
      </button>
      <button 
        type="button"
        onClick={onCancel}
        className="px-2 py-1 text-gray-600 text-sm hover:text-gray-800"
      >
        Cancel
      </button>
    </form>
  );
};

export default QuantityUpdateForm;
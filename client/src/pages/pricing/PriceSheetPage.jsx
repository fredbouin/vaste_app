// src/pages/pricing/PriceSheetPage.jsx
import React from 'react';
import PriceSheet from './PriceSheet/PriceSheet';

const PriceSheetPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Price Sheet</h1>
        <p className="mt-2 text-gray-600">
          Complete pricing overview for all furniture pieces
        </p>
      </div>
      <PriceSheet />
    </div>
  );
};

export default PriceSheetPage;
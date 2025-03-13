import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  data,
  pieceCosts,
  componentsCost,
  grandTotal,
  components
}) => {
  const [existingVariations, setExistingVariations] = useState([]);

  useEffect(() => {
    if (isOpen && data.collection && data.pieceNumber) {
      const priceSheetData = JSON.parse(localStorage.getItem('priceSheetData') || '[]');
      const variations = priceSheetData
        .filter(item => 
          item.collection === data.collection && 
          item.pieceNumber === data.pieceNumber
        )
        .map(item => item.variation);
      setExistingVariations(variations);
    }
  }, [isOpen, data.collection, data.pieceNumber]);

  const variationExists = data.variation && 
    existingVariations.includes(data.variation);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full mx-4 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Save to Price Sheet</h2>
          
          <div className="space-y-4">
            {/* Model Information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">
                {data.isComponent ? 'Component Details' : 'Model Details'}
              </h3>
              {data.isComponent ? (
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Name:</span>
                  <span className="text-right">{data.componentName}</span>
                  <span className="text-gray-600">Type:</span>
                  <span className="text-right capitalize">{data.componentType}</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Collection:</span>
                  <span className="text-right">{data.collection}</span>
                  <span className="text-gray-600">Piece Number:</span>
                  <span className="text-right">{data.pieceNumber}</span>
                  {data.variation && (
                    <>
                      <span className="text-gray-600">Variation:</span>
                      <span className="text-right">{data.variation}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Piece Cost Breakdown */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Cost Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Labor:</span>
                  <span>${pieceCosts.labor.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Materials:</span>
                  <span>${pieceCosts.materials.total.toFixed(2)}</span>
                </div>
                {pieceCosts.cnc.cost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">CNC:</span>
                    <span>${pieceCosts.cnc.cost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Overhead:</span>
                  <span>${pieceCosts.overhead.cost.toFixed(2)}</span>
                </div>
                {componentsCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Components:</span>
                    <span>${componentsCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t flex justify-between font-medium">
                  <span>Total Cost:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Components List */}
            {!data.isComponent && components.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Components Used</h3>
                <div className="space-y-1">
                  {components.map(component => (
                    <div key={component.id} className="flex justify-between text-sm">
                      <div>
                        <span>{component.componentName}</span>
                        <span className="text-gray-500 ml-2 capitalize">
                          ({component.componentType})
                        </span>
                      </div>
                      <span>${component.cost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Variation Warning */}
            {variationExists && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Variation Already Exists
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    This variation will be updated with the new costs and details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            {variationExists ? 'Update Price Sheet' : 'Save to Price Sheet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
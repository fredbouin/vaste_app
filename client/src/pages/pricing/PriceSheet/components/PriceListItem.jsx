import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Trash2, Pencil, Copy, RefreshCw, DollarSign } from 'lucide-react';
import ExpandedDetails from './ExpandedDetails';
import { priceSheetApi } from '../../../../api/priceSheet';
import { calculatePrice } from '../../../../utils/calculationUtils';

const PriceListItem = ({ 
  item: initialItem, 
  isComponent, 
  expanded, 
  settings, 
  onToggleExpand, 
  onEdit, 
  onRemove, 
  onDuplicate, 
  calculatePrice: calculatePriceFromProps, 
  onSync 
}) => {
  const [itemState, setItemState] = useState(initialItem);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [editingManualPrice, setEditingManualPrice] = useState(false);
  const [manualPrice, setManualPrice] = useState(initialItem.manualPrice || '');

  useEffect(() => {
    setItemState(initialItem);
    setManualPrice(initialItem.manualPrice || '');
  }, [initialItem]);

  const wholesalePrice = calculatePrice(itemState.cost, settings?.margins?.wholesale);
  const msrpPrice = calculatePrice(wholesalePrice, settings?.margins?.msrp);
  const prices = { wholesale: wholesalePrice, msrp: msrpPrice };

  const relevantSettings = settings
    ? {
        margins: settings.margins,
        labor: settings.labor,
        cnc: settings.cnc,
        overhead: settings.overhead,
        materials: settings.materials,
      }
    : {};

  const relevantLastSynced = itemState.lastSyncedSettings
    ? {
        margins: itemState.lastSyncedSettings.margins,
        labor: itemState.lastSyncedSettings.labor,
        cnc: itemState.lastSyncedSettings.cnc,
        overhead: itemState.lastSyncedSettings.overhead,
        materials: itemState.lastSyncedSettings.materials,
      }
    : {};

  const settingsString = JSON.stringify(relevantSettings);
  const lastSyncedString = JSON.stringify(relevantLastSynced);
  const needsSync = settingsString !== lastSyncedString;

  const handleSync = async (e) => {
    e.stopPropagation();
    if (!itemState._id) {
      console.error('Cannot sync item without an ID');
      setSyncError('Item has no ID');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    
    try {
      const updatedItem = await priceSheetApi.sync(itemState._id, relevantSettings);
      
      // Preserve manual price during sync
      if (manualPrice) {
        updatedItem.manualPrice = manualPrice;
      }
      
      setItemState(updatedItem);
      
      if (onSync) onSync(updatedItem);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError(error.message || 'Failed to sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveManualPrice = async (e) => {
    e.stopPropagation();
    
    // Validate price
    const newPrice = manualPrice === '' ? null : Number(manualPrice);
    if (newPrice !== null && (isNaN(newPrice) || newPrice <= 0)) {
      alert('Please enter a valid price');
      return;
    }
    
    try {
      // Simple update to the item state
      const updatedItem = {
        ...itemState,
        manualPrice: newPrice
      };
      
      // If we have an API ID, update in the database
      if (itemState._id) {
        await priceSheetApi.update(itemState._id, updatedItem);
      }
      
      setItemState(updatedItem);
      setEditingManualPrice(false);
      
      if (onSync) onSync(updatedItem);
    } catch (error) {
      console.error('Failed to save manual price:', error);
      alert('Failed to save manual price');
    }
  };

  return (
    <div className="mb-1">
      <div 
        className="p-2 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center">
          {expanded ? 
            <ChevronDown className="w-4 h-4 mr-2" /> : 
            <ChevronRight className="w-4 h-4 mr-2" />
          }
          <div>
            <h4 className="font-medium">
              {needsSync && <span className="text-xs text-red-600 mr-2" title="Out of sync">⚠️</span>}
              {isComponent 
                ? itemState.componentName 
                : `${itemState.collection}-${itemState.pieceNumber}${itemState.variation ? ` (${itemState.variation})` : ''}`
              }
            </h4>
            {isComponent && <p className="text-sm text-gray-500 capitalize">{itemState.componentType}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div>Cost: ${itemState.cost?.toFixed(2) || '0.00'}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <span>MSRP: ${prices.msrp?.toFixed(2) || '0.00'}</span>
              {itemState.manualPrice && (
                <span className="ml-2 font-medium text-blue-600">
                  → Manual: ${Number(itemState.manualPrice).toFixed(2)}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingManualPrice(!editingManualPrice);
                }}
                className="ml-1 p-1 text-gray-400 hover:text-gray-600"
                title="Set manual price"
              >
                <DollarSign className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={handleSync}
              disabled={isSyncing || !itemState._id}
              className={`p-1 ${syncError ? 'text-red-400 hover:text-red-600' : 'text-blue-400 hover:text-blue-600'} ${isSyncing ? 'opacity-50' : ''}`}
              title={syncError || 'Sync with current settings'}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(itemState);
              }}
              className="p-1 text-green-400 hover:text-green-600"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(itemState);
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(itemState._id || itemState.id, isComponent);
              }}
              className="p-1 text-red-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Manual price editing form - simple version */}
      {editingManualPrice && (
        <div onClick={(e) => e.stopPropagation()} className="px-2 py-3 bg-blue-50 flex items-center">
          <label className="mr-2 text-sm font-medium">Manual Price:</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
              placeholder="Enter price"
              className="block w-36 pl-7 pr-2 py-1 border-gray-300 rounded-md"
            />
          </div>
          <div className="ml-3 space-x-2">
            <button
              onClick={handleSaveManualPrice}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
            >
              Save
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setManualPrice('');
                handleSaveManualPrice(e);
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded"
            >
              Clear
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingManualPrice(false);
                setManualPrice(itemState.manualPrice || '');
              }}
              className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {expanded && (
        <ExpandedDetails 
          item={itemState} 
          isComponent={isComponent}
          settings={settings}
          prices={prices}
        />
      )}
    </div>
  );
};

export default PriceListItem;

// import { ChevronDown, ChevronRight, Trash2, Pencil, Copy, RefreshCw } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import ExpandedDetails from './ExpandedDetails';
// import { priceSheetApi } from '../../../../api/priceSheet';
// import { calculatePrice } from '../../../../utils/calculationUtils';

// const PriceListItem = ({ 
//   item: initialItem, 
//   isComponent, 
//   expanded, 
//   settings, 
//   onToggleExpand, 
//   onEdit, 
//   onRemove, 
//   onDuplicate, 
//   calculatePrice: calculatePriceFromProps, 
//   onSync 
// }) => {
//   // Local state holds the current version of the item
//   const [itemState, setItemState] = useState(initialItem);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [syncError, setSyncError] = useState(null);

//   // Update local state if the parent passes a new item
//   useEffect(() => {
//     setItemState(initialItem);
//   }, [initialItem]);

//   // Use the centralized calculation utility for consistent pricing
//   const wholesalePrice = calculatePrice(itemState.cost, settings?.margins?.wholesale);
//   const msrpPrice = calculatePrice(wholesalePrice, settings?.margins?.msrp);
//   const prices = { wholesale: wholesalePrice, msrp: msrpPrice };

//   // Extract only the relevant settings for comparison
//   const relevantSettings = settings
//     ? {
//         margins: settings.margins,
//         labor: settings.labor,
//         cnc: settings.cnc,
//         overhead: settings.overhead,
//         materials: settings.materials,
//       }
//     : {};

//   const relevantLastSynced = itemState.lastSyncedSettings
//     ? {
//         margins: itemState.lastSyncedSettings.margins,
//         labor: itemState.lastSyncedSettings.labor,
//         cnc: itemState.lastSyncedSettings.cnc,
//         overhead: itemState.lastSyncedSettings.overhead,
//         materials: itemState.lastSyncedSettings.materials,
//       }
//     : {};

//   // Check if settings have changed since last sync using JSON stringification
//   const settingsString = JSON.stringify(relevantSettings);
//   const lastSyncedString = JSON.stringify(relevantLastSynced);
//   const needsSync = settingsString !== lastSyncedString;

//   const handleSync = async (e) => {
//     e.stopPropagation();
//     if (!itemState._id) {
//       console.error('Cannot sync item without an ID');
//       setSyncError('Item has no ID');
//       return;
//     }

//     setIsSyncing(true);
//     setSyncError(null);
    
//     try {
//       console.log('Syncing item:', itemState._id);
      
//       const updatedItem = await priceSheetApi.sync(itemState._id, relevantSettings);
//       console.log("Sync successful, updated item:", updatedItem);
      
//       // Update local state first
//       setItemState(updatedItem);
      
//       // Then notify parent component
//       if (onSync) onSync(updatedItem);
//     } catch (error) {
//       console.error('Sync failed:', error);
//       setSyncError(error.message || 'Failed to sync');
//     } finally {
//       setIsSyncing(false);
//     }
//   };

//   return (
//     <div className="mb-1">
//       <div 
//         className="p-2 flex items-center justify-between cursor-pointer hover:bg-gray-50"
//         onClick={onToggleExpand}
//       >
//         <div className="flex items-center">
//           {expanded ? 
//             <ChevronDown className="w-4 h-4 mr-2" /> : 
//             <ChevronRight className="w-4 h-4 mr-2" />
//           }
//           <div>
//             <h4 className="font-medium">
//               {needsSync && (
//                 <span className="text-xs text-red-600 mr-2" title="Out of sync">⚠️</span>
//               )}
//               {isComponent 
//                 ? itemState.componentName 
//                 : `${itemState.collection}-${itemState.pieceNumber}${itemState.variation ? ` (${itemState.variation})` : ''}`
//               }
//             </h4>
//             {isComponent && (
//               <p className="text-sm text-gray-500 capitalize">{itemState.componentType}</p>
//             )}
//           </div>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="text-right">
//             <div>Cost: ${itemState.cost?.toFixed(2) || '0.00'}</div>
//             <div className="text-sm text-gray-500">
//               MSRP: ${prices.msrp?.toFixed(2) || '0.00'}
//             </div>
//           </div>
//           <div className="flex space-x-1">
//             <button
//               onClick={handleSync}
//               disabled={isSyncing || !itemState._id}
//               className={`p-1 ${syncError ? 'text-red-400 hover:text-red-600' : 'text-blue-400 hover:text-blue-600'} ${isSyncing ? 'opacity-50' : ''}`}
//               title={syncError || 'Sync with current settings'}
//             >
//               <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
//             </button>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onDuplicate(itemState);
//               }}
//               className="p-1 text-green-400 hover:text-green-600"
//               title="Duplicate"
//             >
//               <Copy className="w-4 h-4" />
//             </button>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onEdit(itemState);
//               }}
//               className="p-1 text-gray-400 hover:text-gray-600"
//               title="Edit"
//             >
//               <Pencil className="w-4 h-4" />
//             </button>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onRemove(itemState._id || itemState.id, isComponent);
//               }}
//               className="p-1 text-red-400 hover:text-red-600"
//               title="Delete"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </div>
//       {expanded && (
//         <ExpandedDetails 
//           item={itemState} 
//           isComponent={isComponent}
//           settings={settings}
//           prices={prices}
//         />
//       )}
//     </div>
//   );
// };

// export default PriceListItem;
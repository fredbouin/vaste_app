import { ChevronDown, ChevronRight, Trash2, Pencil, Copy, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import ExpandedDetails from './ExpandedDetails';
import { priceSheetApi } from '../../../../api/priceSheet';
import isEqual from 'lodash/isEqual';

const PriceListItem = ({ 
  item: initialItem, 
  isComponent, 
  expanded, 
  settings, 
  onToggleExpand, 
  onEdit, 
  onRemove, 
  onDuplicate, 
  calculatePrice, 
  onSync 
}) => {
  // Local state holds the current version of the item
  const [itemState, setItemState] = useState(initialItem);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Update local state if the parent passes a new item
  useEffect(() => {
    setItemState(initialItem);
  }, [initialItem]);

  const wholesalePrice = calculatePrice(itemState.cost, settings?.margins?.wholesale);
  const msrpPrice = calculatePrice(wholesalePrice, settings?.margins?.msrp);
  const prices = { wholesale: wholesalePrice, msrp: msrpPrice };

  // Extract only the relevant settings for comparison
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

  // Check if settings have changed since last sync
  // Using safe stringification or can use a deep comparison library 
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
      console.log('Syncing item:', itemState._id);
      console.log('Using settings:', relevantSettings);
      
      const updatedItem = await priceSheetApi.sync(itemState._id, relevantSettings);
      console.log("Sync successful, updated item:", updatedItem);
      
      // Update local state first
      setItemState(updatedItem);
      
      // Then notify parent component
      if (onSync) onSync(updatedItem);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError(error.message || 'Failed to sync');
    } finally {
      setIsSyncing(false);
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
              {needsSync && (
                <span className="text-xs text-red-600 mr-2" title="Out of sync">⚠️</span>
              )}
              {isComponent 
                ? itemState.componentName 
                : `${itemState.collection}-${itemState.pieceNumber}${itemState.variation ? ` (${itemState.variation})` : ''}`
              }
            </h4>
            {isComponent && (
              <p className="text-sm text-gray-500 capitalize">{itemState.componentType}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div>Cost: ${itemState.cost?.toFixed(2) || '0.00'}</div>
            <div className="text-sm text-gray-500">
              MSRP: ${prices.msrp?.toFixed(2) || '0.00'}
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

// const PriceListItem = ({ 
//   item: initialItem, 
//   isComponent, 
//   expanded, 
//   settings, 
//   onToggleExpand, 
//   onEdit, 
//   onRemove, 
//   onDuplicate, 
//   calculatePrice, 
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

//   const wholesalePrice = calculatePrice(itemState.cost, settings?.margins?.wholesale);
//   const msrpPrice = calculatePrice(wholesalePrice, settings?.margins?.msrp);
//   const prices = { wholesale: wholesalePrice, msrp: msrpPrice };

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

//   // Convert to JSON and back to ensure consistent formatting for comparison
//   const settingsString = JSON.stringify(relevantSettings);
//   const lastSyncedString = JSON.stringify(relevantLastSynced);
//   const needsSync = settingsString !== lastSyncedString;

//   const handleSync = async (e) => {
//     e.stopPropagation();
//     setIsSyncing(true);
//     setSyncError(null);
//     try {
//       const updatedItem = await priceSheetApi.sync(itemState._id, relevantSettings);
//       console.log("Sync response received:", updatedItem);
      
//       // Update local state with the response
//       setItemState(updatedItem);
      
//       // Also notify parent to update its state
//       if (onSync) onSync(updatedItem);
//     } catch (error) {
//       console.error('Sync failed:', error);
//       setSyncError('Failed to sync');
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
//             <div>Cost: ${itemState.cost.toFixed(2)}</div>
//             <div className="text-sm text-gray-500">
//               MSRP: ${prices.msrp.toFixed(2)}
//             </div>
//           </div>
//           <div className="flex space-x-1">
//             <button
//               onClick={handleSync}
//               disabled={isSyncing || !needsSync}
//               className={`p-1 ${syncError ? 'text-red-400 hover:text-red-600' : 'text-blue-400 hover:text-blue-600'} ${isSyncing ? 'opacity-50' : ''} ${!needsSync ? 'opacity-30 cursor-not-allowed' : ''}`}
//               title={syncError || (needsSync ? 'Sync with current settings' : 'Already in sync')}
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


//NEWCODE082625
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Trash2, Pencil, Copy, RefreshCw, DollarSign } from 'lucide-react';
import ExpandedDetails from './ExpandedDetails';
import { priceSheetApi } from '../../../../api/priceSheet';
import { calculatePrice } from '../../../../utils/calculationUtils';

// --- helpers to preserve local nested data when server returns partials ---
const hasKeys = (obj) => obj && typeof obj === 'object' && Object.keys(obj).length > 0;

const deepMergePriceItem = (prev, next) => {
  const merged = { ...prev, ...next };

  const prevDetails = prev?.details || {};
  const nextDetails = next?.details || {};

  const pickObj = (p, n) => (hasKeys(n) ? n : p);

  merged.details = {
    ...prevDetails,
    ...nextDetails,
    materials: pickObj(prevDetails.materials, nextDetails.materials),
    labor: pickObj(prevDetails.labor, nextDetails.labor),
    cnc: pickObj(prevDetails.cnc, nextDetails.cnc),
    overhead: pickObj(prevDetails.overhead, nextDetails.overhead),
    components: Array.isArray(nextDetails.components)
      ? nextDetails.components
      : prevDetails.components,
  };

  return merged;
};

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
      const updatedFromServer = await priceSheetApi.sync(itemState._id, relevantSettings);

      // Preserve manual price, if user had set one
      const withManualPreserved = manualPrice
        ? { ...updatedFromServer, manualPrice }
        : updatedFromServer;

      // 🔧 Deep-merge so we keep local nested details (materials, labor, cnc, overhead, components)
      const mergedUpdated = deepMergePriceItem(itemState, withManualPreserved);

      setItemState(mergedUpdated);
      if (onSync) onSync(mergedUpdated);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError(error.message || 'Failed to sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveManualPrice = async (e) => {
    e.stopPropagation();

    const newPrice = manualPrice === '' ? null : Number(manualPrice);
    if (newPrice !== null && (isNaN(newPrice) || newPrice <= 0)) {
      alert('Please enter a valid price');
      return;
    }

    try {
      const updatedItem = {
        ...itemState,
        manualPrice: newPrice
      };

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
        className={`p-3 flex items-center justify-between cursor-pointer ${expanded ? 'bg-gray-50' : 'hover:bg-gray-50'} transition-colors duration-150`}
        onClick={onToggleExpand}
      >
        {/* Left side - Item details */}
        <div className="flex items-center">
          <div className="mr-2 text-gray-500">
            {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>

          <div>
            <h4 className="font-medium flex items-center">
              {needsSync && (
                <span className="text-red-600 mr-2 flex" title="Out of sync with current settings">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M3 2v6h6"/>
                      <path d="M21 12A9 9 0 0 0 6 5.3L3 8"/>
                      <path d="M21 22v-6h-6"/>
                      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/>
                      <path d="M12 7v5"/>
                      <path d="M12 16h.01"/>
                  </svg>
                </span>
              )}
              {isComponent
                ? itemState.componentName
                : `${itemState.collection}-${itemState.pieceNumber}${itemState.variation ? ` (${itemState.variation})` : ''}`
              }
            </h4>
            {isComponent && (
              <p className="text-xs text-gray-500 capitalize mt-0.5">{itemState.componentType}</p>
            )}
          </div>
        </div>

        {/* Right side - Pricing information and actions */}
        <div className="flex items-center space-x-6">
          {/* Price information */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right">
            <div className="text-gray-500 text-sm">Cost:</div>
            <div className="font-medium">${itemState.cost?.toFixed(2) || '0.00'}</div>

            <div className="text-gray-500 text-sm">MSRP:</div>
            <div className="font-medium">${msrpPrice?.toFixed(2) || '0.00'}</div>

            {itemState.manualPrice && (
              <>
                <div className="text-gray-500 text-sm">Manual:</div>
                <div className="font-medium text-blue-600">
                  ${Number(itemState.manualPrice).toFixed(2)}
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingManualPrice(!editingManualPrice);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
              title={itemState.manualPrice ? "Edit manual price" : "Set manual price"}
            >
              <DollarSign className="w-4 h-4" />
            </button>

            <button
              onClick={handleSync}
              disabled={isSyncing || !itemState._id}
              className={`p-1.5 rounded-full ${
                syncError
                  ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
                  : 'text-blue-400 hover:text-blue-600 hover:bg-blue-50'
              } ${isSyncing ? 'opacity-50' : ''}`}
              title={syncError || 'Sync with current settings'}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(itemState);
              }}
              className="p-1.5 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(itemState);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(itemState._id || itemState.id, isComponent, itemState.isCustom);
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Manual price editing form */}
      {editingManualPrice && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="px-4 py-3 bg-blue-50 flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="text-sm font-medium text-blue-700 mr-3">Set Manual Price</span>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder="0.00"
                className="block w-32 pl-7 pr-2 py-1.5 border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm"
              />
            </div>
          </div>

          <div className="space-x-2">
            <button
              onClick={handleSaveManualPrice}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Save
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setManualPrice('');
                handleSaveManualPrice(e);
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
            >
              Clear
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingManualPrice(false);
                setManualPrice(itemState.manualPrice || '');
              }}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expanded details */}
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

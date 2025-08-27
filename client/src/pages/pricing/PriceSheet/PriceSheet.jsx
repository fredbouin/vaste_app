//NEWCODE082625
//NEWCODE082625

// src/pages/pricing/PriceSheet/PriceSheet.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PriceListTabs from './components/PriceListTabs';
import PiecesList from './components/PiecesList';
import ComponentsList from './components/ComponentsList';

const PriceSheet = () => {
  const [activeTab, setActiveTab] = useState('pieces');
  const [priceData, setPriceData] = useState({ 
    pieces: [],
    components: [],
    custom: []
  });
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const savedSettings = localStorage.getItem('calculatorSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          console.log('Settings loaded from localStorage');
        }

        console.log('Fetching price sheet data');
        const response = await axios.get(`${API_BASE_URL}/api/price-sheet`);
        console.log(`Received ${response.data.length} items from server`);
        
        setPriceData({
          pieces: response.data.filter(item => !item.isComponent && !item.isCustom),
          components: response.data.filter(item => item.isComponent),
          custom: response.data.filter(item => item.isCustom)
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load price sheet data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  const handleRemoveItem = async (id, isComponent, isCustom) => {
    if (!window.confirm('Are you sure you want to remove this item?')) {
      return;
    }

    try {
      console.log(`Deleting item ${id}`);
      await axios.delete(`${API_BASE_URL}/api/price-sheet/${id}`);
      
      const key = isComponent ? 'components' : (isCustom ? 'custom' : 'pieces');
      setPriceData(prev => ({
        ...prev,
        [key]: prev[key].filter(item => item._id !== id)
      }));
      console.log(`Item ${id} deleted successfully`);
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleSync = (updatedItem) => {
    console.log('Sync complete, updating item in state:', updatedItem._id);
    const key = updatedItem.isComponent ? 'components' : (updatedItem.isCustom ? 'custom' : 'pieces');
    
    setPriceData(prev => {
      const existingItem = prev[key].find(item => item._id === updatedItem._id);
      if (!existingItem) {
        console.warn(`Item with ID ${updatedItem._id} not found in state`);
        return prev;
      }
      
      const updatedItems = prev[key].map(item => 
        item._id === updatedItem._id ? updatedItem : item
      );
      
      console.log(`Updated ${key} array, now has ${updatedItems.length} items`);
      
      return {
        ...prev,
        [key]: updatedItems
      };
    });
  };

  const handleEdit = (item) => {
    console.log('Editing item:', item._id);
    const laborData = {
      stockProduction: { hours: 0, rate: 0 },
      cncOperator: { hours: 0, rate: 0 },
      assembly: { hours: 0, rate: 0 },
      finishing: { hours: 0, rate: 0 },
      upholstery: { hours: 0, rate: 0 }
    };

    if (item.details?.labor?.breakdown && Array.isArray(item.details.labor.breakdown)) {
      item.details.labor.breakdown.forEach(entry => {
        const hours = Number(entry.hours) || 0;
        const rate = Number(entry.rate) || 0;
        
        switch(entry.type) {
          case "Stock Production":
            laborData.stockProduction = { hours, rate };
            break;
          case "CNC Operator":
            laborData.cncOperator = { hours, rate };
            break;
          case "Assembly":
            laborData.assembly = { hours, rate };
            break;
          case "Finishing":
            laborData.finishing = { hours, rate };
            break;
          case "Upholstery":
            laborData.upholstery = { hours, rate };
            break;
          default:
            console.warn(`Unknown labor type: ${entry.type}`);
        }
      });
    }

    const materialsData = {
      wood: Array.isArray(item.details?.materials?.wood) ? item.details.materials.wood : [],
      sheet: Array.isArray(item.details?.materials?.sheet) ? item.details.materials.sheet : [],
      upholstery: {
        items: Array.isArray(item.details?.materials?.upholstery?.items) 
          ? item.details.materials.upholstery.items 
          : []
      },
      hardware: Array.isArray(item.details?.materials?.hardware) ? item.details.materials.hardware : [],
      finishing: {
        materialId: item.details?.materials?.finishing?.materialId || '',
        materialName: item.details?.materials?.finishing?.materialName || '',
        surfaceArea: item.details?.materials?.finishing?.surfaceArea || '',
        coats: item.details?.materials?.finishing?.coats || '',
        coverage: item.details?.materials?.finishing?.coverage || '',
        costPerLiter: item.details?.materials?.finishing?.costPerLiter || ''
      }
    };

    const calculatorData = {
      isComponent: Boolean(item.isComponent),
      isCustom: Boolean(item.isCustom),
      editingId: item._id,
      componentName: item.componentName || '',
      componentType: item.componentType || '',
      collection: item.collection || '',
      pieceNumber: item.pieceNumber || '',
      variation: item.variation || '',
      selectedComponents: Array.isArray(item.details?.components) 
        ? item.details.components.map(comp => comp.id || comp._id)
        : [],
      labor: laborData,
      materials: materialsData,
      cnc: {
        runtime: Number(item.details?.cnc?.runtime) || 0,
        rate: Number(item.details?.cnc?.rate) || 0
      }
    };

    localStorage.setItem('calculatorAutosave', JSON.stringify(calculatorData));
    window.location.href = '/pricing';
  };

  const handleDuplicate = (item) => {
    const duplicatedItem = {
      ...item,
      details: JSON.parse(JSON.stringify(item.details || {})),
      _id: undefined,
      id: Date.now(),
      componentName: item.componentName ? `Copy of ${item.componentName}` : item.componentName,
    };

    handleEdit(duplicatedItem);
  };

  const calculatePrice = (cost, marginPercent) => {
    if (!marginPercent) return cost;
    const margin = marginPercent / 100;
    const markup = 1 / (1 - margin);
    return cost * markup;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading price sheet data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PriceListTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          {activeTab === 'pieces' ? (
            <PiecesList
              pieces={priceData.pieces}
              settings={settings}
              onEdit={handleEdit}
              onRemove={handleRemoveItem}
              onDuplicate={handleDuplicate}
              onSync={handleSync}
              calculatePrice={calculatePrice}
            />
          ) : activeTab === 'components' ? (
            <ComponentsList
              components={priceData.components}
              settings={settings}
              onEdit={handleEdit}
              onRemove={handleRemoveItem}
              onDuplicate={handleDuplicate}
              onSync={handleSync}
              calculatePrice={calculatePrice}
            />
          ) : (
            <PiecesList
              pieces={priceData.custom}
              settings={settings}
              onEdit={handleEdit}
              onRemove={(id, isComponent, isCustom) => handleRemoveItem(id, isComponent, true)}
              onDuplicate={handleDuplicate}
              onSync={handleSync}
              calculatePrice={calculatePrice}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceSheet;

// // src/pages/pricing/PriceSheet/PriceSheet.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import PriceListTabs from './components/PriceListTabs';
// import PiecesList from './components/PiecesList';
// import ComponentsList from './components/ComponentsList';

// const PriceSheet = () => {
//   const [activeTab, setActiveTab] = useState('pieces');
//   const [priceData, setPriceData] = useState({ 
//     pieces: [],
//     components: [] 
//   });
//   const [settings, setSettings] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Load settings first
//         const savedSettings = localStorage.getItem('calculatorSettings');
//         if (savedSettings) {
//           const parsedSettings = JSON.parse(savedSettings);
//           setSettings(parsedSettings);
//           console.log('Settings loaded from localStorage');
//         }

//         // Then fetch price sheet data
//         console.log('Fetching price sheet data');
//         const response = await axios.get('http://localhost:3001/api/price-sheet');
//         console.log(`Received ${response.data.length} items from server`);
        
//         setPriceData({
//           pieces: response.data.filter(item => !item.isComponent),
//           components: response.data.filter(item => item.isComponent)
//         });
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         setError('Failed to load price sheet data: ' + (err.message || 'Unknown error'));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleRemoveItem = async (id, isComponent) => {
//     if (!window.confirm('Are you sure you want to remove this item?')) {
//       return;
//     }

//     try {
//       console.log(`Deleting item ${id}`);
//       await axios.delete(`http://localhost:3001/api/price-sheet/${id}`);
      
//       const key = isComponent ? 'components' : 'pieces';
//       setPriceData(prev => ({
//         ...prev,
//         [key]: prev[key].filter(item => item._id !== id)
//       }));
//       console.log(`Item ${id} deleted successfully`);
//     } catch (err) {
//       console.error('Error removing item:', err);
//       alert('Failed to remove item. Please try again.');
//     }
//   };

//   const handleSync = (updatedItem) => {
//     console.log('Sync complete, updating item in state:', updatedItem._id);
//     const key = updatedItem.isComponent ? 'components' : 'pieces';
    
//     setPriceData(prev => {
//       // Find the item being updated
//       const existingItem = prev[key].find(item => item._id === updatedItem._id);
//       if (!existingItem) {
//         console.warn(`Item with ID ${updatedItem._id} not found in state`);
//         return prev;
//       }
      
//       // Create the updated array
//       const updatedItems = prev[key].map(item => 
//         item._id === updatedItem._id ? updatedItem : item
//       );
      
//       console.log(`Updated ${key} array, now has ${updatedItems.length} items`);
      
//       // Return the new state
//       return {
//         ...prev,
//         [key]: updatedItems
//       };
//     });
//   };

//   const handleEdit = (item) => {
//     console.log('Editing item:', item._id);
//     // Prepare labor data
//     const laborData = {
//       stockProduction: { hours: 0, rate: 0 },
//       cncOperator: { hours: 0, rate: 0 },
//       assembly: { hours: 0, rate: 0 },
//       finishing: { hours: 0, rate: 0 },
//       upholstery: { hours: 0, rate: 0 }
//     };

//     if (item.details?.labor?.breakdown && Array.isArray(item.details.labor.breakdown)) {
//       item.details.labor.breakdown.forEach(entry => {
//         const hours = Number(entry.hours) || 0;
//         const rate = Number(entry.rate) || 0;
        
//         switch(entry.type) {
//           case "Stock Production":
//             laborData.stockProduction = { hours, rate };
//             break;
//           case "CNC Operator":
//             laborData.cncOperator = { hours, rate };
//             break;
//           case "Assembly":
//             laborData.assembly = { hours, rate };
//             break;
//           case "Finishing":
//             laborData.finishing = { hours, rate };
//             break;
//           case "Upholstery":
//             laborData.upholstery = { hours, rate };
//             break;
//           default:
//             console.warn(`Unknown labor type: ${entry.type}`);
//         }
//       });
//     }

//     const materialsData = {
//       wood: Array.isArray(item.details?.materials?.wood) ? item.details.materials.wood : [],
//       sheet: Array.isArray(item.details?.materials?.sheet) ? item.details.materials.sheet : [],
//       upholstery: {
//         items: Array.isArray(item.details?.materials?.upholstery?.items) 
//           ? item.details.materials.upholstery.items 
//           : []
//       },
//       hardware: Array.isArray(item.details?.materials?.hardware) ? item.details.materials.hardware : [],
//       finishing: {
//         materialId: item.details?.materials?.finishing?.materialId || '',
//         materialName: item.details?.materials?.finishing?.materialName || '',
//         surfaceArea: item.details?.materials?.finishing?.surfaceArea || '',
//         coats: item.details?.materials?.finishing?.coats || '',
//         coverage: item.details?.materials?.finishing?.coverage || '',
//         costPerLiter: item.details?.materials?.finishing?.costPerLiter || ''
//       }
//     };

//     const calculatorData = {
//       isComponent: Boolean(item.isComponent),
//       editingId: item._id,
//       componentName: item.componentName || '',
//       componentType: item.componentType || '',
//       collection: item.collection || '',
//       pieceNumber: item.pieceNumber || '',
//       variation: item.variation || '',
//       selectedComponents: Array.isArray(item.details?.components) 
//         ? item.details.components.map(comp => comp.id || comp._id)
//         : [],
//       labor: laborData,
//       materials: materialsData,
//       cnc: {
//         runtime: Number(item.details?.cnc?.runtime) || 0,
//         rate: Number(item.details?.cnc?.rate) || 0
//       }
//     };

//     localStorage.setItem('calculatorAutosave', JSON.stringify(calculatorData));
//     window.location.href = '/pricing';
//   };

//   const handleDuplicate = (item) => {
//     const duplicatedItem = {
//       ...item,
//       details: JSON.parse(JSON.stringify(item.details || {})),
//       _id: undefined,
//       id: Date.now(),
//       componentName: item.componentName ? `Copy of ${item.componentName}` : item.componentName,
//     };

//     handleEdit(duplicatedItem);
//   };

//   const calculatePrice = (cost, marginPercent) => {
//     if (!marginPercent) return cost;
//     const margin = marginPercent / 100;
//     const markup = 1 / (1 - margin);
//     return cost * markup;
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-xl text-gray-600">Loading price sheet data...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <PriceListTabs 
//         activeTab={activeTab} 
//         onTabChange={setActiveTab} 
//       />

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="p-6">
//           {activeTab === 'pieces' ? (
//             <PiecesList
//               pieces={priceData.pieces}
//               settings={settings}
//               onEdit={handleEdit}
//               onRemove={handleRemoveItem}
//               onDuplicate={handleDuplicate}
//               onSync={handleSync}
//               calculatePrice={calculatePrice}
//             />
//           ) : (
//             <ComponentsList
//               components={priceData.components}
//               settings={settings}
//               onEdit={handleEdit}
//               onRemove={handleRemoveItem}
//               onDuplicate={handleDuplicate}
//               onSync={handleSync}
//               calculatePrice={calculatePrice}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PriceSheet;
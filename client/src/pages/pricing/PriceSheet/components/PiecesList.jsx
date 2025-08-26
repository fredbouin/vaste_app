//NEWCODE082625


// src/pages/pricing/PriceSheet/components/PiecesList.jsx
import React, { useState } from 'react';
import PriceListItem from './PriceListItem';

const PiecesList = ({ pieces, settings, onEdit, onRemove, onDuplicate, calculatePrice, onSync }) => {
  const [expandedItem, setExpandedItem] = useState(null);

  // Filter out any custom projects from the main pieces list
  const filteredPieces = pieces.filter(piece => !piece.isCustom);

  if (filteredPieces.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No pieces have been added to the price sheet yet.</p>
        <p className="text-sm mt-2">Use the calculator to add pieces.</p>
      </div>
    );
  }

  const groupedByCollection = filteredPieces.reduce((acc, item) => {
    const collectionNumber = item.collection;
    if (!acc[collectionNumber]) {
      acc[collectionNumber] = [];
    }
    acc[collectionNumber].push(item);
    return acc;
  }, {});

  const organizedCollections = Object.entries(groupedByCollection).reduce((acc, [collection, collectionPieces]) => {
    const groupedModels = collectionPieces.reduce((modelAcc, item) => {
      const modelKey = `${item.pieceNumber}`;
      if (!modelAcc[modelKey]) {
        modelAcc[modelKey] = {
          pieceNumber: item.pieceNumber,
          variations: []
        };
      }
      modelAcc[modelKey].variations.push(item);
      return modelAcc;
    }, {});

    acc[collection] = {
      models: groupedModels,
      sortedModelNumbers: Object.keys(groupedModels).sort((a, b) => Number(a) - Number(b))
    };
    return acc;
  }, {});

  const sortedCollections = Object.keys(organizedCollections).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-8">
      {sortedCollections.map(collection => (
        <div key={collection} className="border-b pb-6 last:border-b-0">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Collection {collection}
          </h2>
          <div className="space-y-6">
            {organizedCollections[collection].sortedModelNumbers.map(modelNumber => {
              const modelGroup = organizedCollections[collection].models[modelNumber];
              return (
                <div key={`${collection}-${modelNumber}`} className="mb-6">
                  <h3 className="font-medium text-lg mb-2 text-gray-700">
                    Model {collection}-{modelNumber}
                  </h3>
                  <div className="space-y-2">
                    {modelGroup.variations.map(item => (
                      <PriceListItem
                        key={item._id || item.id}
                        item={item}
                        isComponent={false}
                        expanded={expandedItem === (item._id || item.id)}
                        settings={settings}
                        onToggleExpand={() => setExpandedItem(
                          expandedItem === (item._id || item.id) ? null : (item._id || item.id)
                        )}
                        onEdit={onEdit}
                        onRemove={onRemove}
                        onDuplicate={onDuplicate}
                        calculatePrice={calculatePrice}
                       onSync={onSync}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PiecesList;


// src/pages/pricing/PriceSheet/components/PiecesList.jsx
// import React, { useState } from 'react';
// import PriceListItem from './PriceListItem';

// const PiecesList = ({ pieces, settings, onEdit, onRemove, onDuplicate, calculatePrice, onSync }) => {
//   const [expandedItem, setExpandedItem] = useState(null);

//   if (pieces.length === 0) {
//     return (
//       <div className="text-center py-8 text-gray-500">
//         <p>No pieces have been added to the price sheet yet.</p>
//         <p className="text-sm mt-2">Use the calculator to add pieces.</p>
//       </div>
//     );
//   }

//   // First, group by collection
//   const groupedByCollection = pieces.reduce((acc, item) => {
//     const collectionNumber = item.collection;
//     if (!acc[collectionNumber]) {
//       acc[collectionNumber] = [];
//     }
//     acc[collectionNumber].push(item);
//     return acc;
//   }, {});

//   // Then, within each collection, group by model
//   const organizedCollections = Object.entries(groupedByCollection).reduce((acc, [collection, collectionPieces]) => {
//     // Group pieces by model number within the collection
//     const groupedModels = collectionPieces.reduce((modelAcc, item) => {
//       const modelKey = `${item.pieceNumber}`;
//       if (!modelAcc[modelKey]) {
//         modelAcc[modelKey] = {
//           pieceNumber: item.pieceNumber,
//           variations: []
//         };
//       }
//       modelAcc[modelKey].variations.push(item);
//       return modelAcc;
//     }, {});

//     acc[collection] = {
//       models: groupedModels,
//       // Sort models by piece number
//       sortedModelNumbers: Object.keys(groupedModels).sort((a, b) => Number(a) - Number(b))
//     };
//     return acc;
//   }, {});

//   // Sort collections numerically
//   const sortedCollections = Object.keys(organizedCollections).sort((a, b) => Number(a) - Number(b));

//   return (
//     <div className="space-y-8">
//       {sortedCollections.map(collection => (
//         <div key={collection} className="border-b pb-6 last:border-b-0">
//           <h2 className="text-xl font-bold mb-4 text-gray-800">
//             Collection {collection}
//           </h2>
//           <div className="space-y-6">
//             {organizedCollections[collection].sortedModelNumbers.map(modelNumber => {
//               const modelGroup = organizedCollections[collection].models[modelNumber];
//               return (
//                 <div key={`${collection}-${modelNumber}`} className="mb-6">
//                   <h3 className="font-medium text-lg mb-2 text-gray-700">
//                     Model {collection}-{modelNumber}
//                   </h3>
//                   <div className="space-y-2">
//                     {modelGroup.variations.map(item => (
//                       <PriceListItem
//                         key={item._id || item.id}
//                         item={item}
//                         isComponent={false}
//                         expanded={expandedItem === (item._id || item.id)}
//                         settings={settings}
//                         onToggleExpand={() => setExpandedItem(
//                           expandedItem === (item._id || item.id) ? null : (item._id || item.id)
//                         )}
//                         onEdit={onEdit}
//                         onRemove={onRemove}
//                         onDuplicate={onDuplicate}
//                         calculatePrice={calculatePrice}
//                        onSync={onSync}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default PiecesList;

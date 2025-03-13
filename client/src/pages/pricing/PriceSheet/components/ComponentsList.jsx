// src/pages/pricing/PriceSheet/components/ComponentsList.jsx
import React, { useState } from 'react';
import PriceListItem from './PriceListItem';

const ComponentsList = ({ components, settings, onEdit, onRemove, onDuplicate, calculatePrice, onSync }) => {
  const [expandedItem, setExpandedItem] = useState(null);

  if (components.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No components have been added to the price sheet yet.</p>
        <p className="text-sm mt-2">Use the calculator to add components.</p>
      </div>
    );
  }

  const groupedComponents = components.reduce((acc, item) => {
    if (!acc[item.componentType]) {
      acc[item.componentType] = [];
    }
    acc[item.componentType].push(item);
    return acc;
  }, {});

  return Object.entries(groupedComponents).map(([type, typeComponents]) => (
    <div key={type} className="mb-6">
      <h3 className="font-medium text-lg mb-2 capitalize">{type} Components</h3>
        {typeComponents.map(item => (
          <PriceListItem
            key={item._id || item.id}
            item={item}
            isComponent={true}
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
  ));
};

export default ComponentsList;


// // src/pages/pricing/PriceSheet/components/ComponentsList.jsx
// import React, { useState } from 'react';
// import PriceListItem from './PriceListItem';

// const ComponentsList = ({ components, settings, onEdit, onRemove, calculatePrice }) => {
//   const [expandedItem, setExpandedItem] = useState(null);

//   if (components.length === 0) {
//     return (
//       <div className="text-center py-8 text-gray-500">
//         <p>No components have been added to the price sheet yet.</p>
//         <p className="text-sm mt-2">Use the calculator to add components.</p>
//       </div>
//     );
//   }

//   const groupedComponents = components.reduce((acc, item) => {
//     if (!acc[item.componentType]) {
//       acc[item.componentType] = [];
//     }
//     acc[item.componentType].push(item);
//     return acc;
//   }, {});

//   return Object.entries(groupedComponents).map(([type, typeComponents]) => (
//     <div key={type} className="mb-6">
//       <h3 className="font-medium text-lg mb-2 capitalize">{type} Components</h3>
//       {typeComponents.map(item => (
//         <PriceListItem
//           key={item._id || item.id}
//           item={item}
//           isComponent={true}
//           expanded={expandedItem === (item._id || item.id)}
//           settings={settings}
//           onToggleExpand={() => setExpandedItem(
//             expandedItem === (item._id || item.id) ? null : (item._id || item.id)
//           )}
//           onEdit={onEdit}
//           onRemove={onRemove}
//           calculatePrice={calculatePrice}
//         />
//       ))}
//     </div>
//   ));
// };

// export default ComponentsList;
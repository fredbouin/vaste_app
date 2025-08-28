//NEWCODE082625


// src/pages/pricing/components/piece/ModeSelector.jsx

const ModeSelector = ({ isComponent, onModeChange, isCustom }) => (
  <div className="space-y-2">
    <div className="flex space-x-4">
      <button
        onClick={() => onModeChange('piece')}
        className={`px-4 py-2 rounded-md ${!isComponent && !isCustom
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700'}`}
      >
        Calculate Piece
      </button>
      <button
        onClick={() => onModeChange('component')}
        className={`px-4 py-2 rounded-md ${isComponent 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700'}`}
      >
        Create Component
      </button>
      <button
        onClick={() => onModeChange('custom')}
        className={`px-4 py-2 rounded-md ${isCustom
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700'}`}
      >
        Custom Project
      </button>
    </div>
    <div className="text-sm text-gray-500">
      Current Mode: {isCustom ? 'Custom Project' : (isComponent ? 'Component' : 'Piece')}
    </div>
  </div>
);

export default ModeSelector;

// // src/pages/pricing/components/piece/ModeSelector.jsx
// 
// const ModeSelector = ({ isComponent, onModeChange }) => (
//   <div className="space-y-2">
//     <div className="flex space-x-4">
//       <button
//         onClick={() => onModeChange('piece')}
//         className={`px-4 py-2 rounded-md ${!isComponent 
//           ? 'bg-blue-600 text-white' 
//           : 'bg-gray-100 text-gray-700'}`}
//       >
//         Calculate Piece
//       </button>
//       <button
//         onClick={() => onModeChange('component')}
//         className={`px-4 py-2 rounded-md ${isComponent 
//           ? 'bg-blue-600 text-white' 
//           : 'bg-gray-100 text-gray-700'}`}
//       >
//         Create Component
//       </button>
//     </div>
//     <div className="text-sm text-gray-500">
//       Current Mode: {isComponent ? 'Component' : 'Piece'}
//     </div>
//   </div>
// );

// export default ModeSelector;
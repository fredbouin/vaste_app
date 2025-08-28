import { useState } from 'react';
import { getAvailableEmployees } from '../../../data/employeesData';

const SidePanel = ({ 
  isOpen, 
  onClose, 
  operation, 
  projectModel,
  quantity,
  totalHours,
  assignedEmployees = [],
  onAssign,
  timelineItem = {},
  onAddNote,
  days,
  devisNumbers = [], // Add this prop
  className
}) => {
  const [notes, setNotes] = useState('');
  const availableEmployees = operation ? getAvailableEmployees(operation) : [];
  const existingNotes = timelineItem?.notes || [];

  const handleEmployeeAssignment = (empId, isChecked) => {
    const newAssigned = isChecked
      ? [...assignedEmployees, empId]
      : assignedEmployees.filter(id => id !== empId);
    onAssign(newAssigned);
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen ? 'w-80' : 'w-0'} ${className}`}
    >
      <div className="h-full w-80 bg-white shadow-lg">
        {/* Header */}
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold capitalize">{operation}</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Project Info */}
          <div>
            <h4 className="font-medium mb-2">Project Details</h4>
            <div className="space-y-1 text-sm">
              <p>Model: {projectModel}</p>
              <p>Quantity: {quantity}</p>
              <p>Total Hours: {totalHours}</p>
              <p>Days Required: {days}</p>
            </div>
          </div>

          {/* Devis Numbers Section */}
          {devisNumbers && devisNumbers.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Devis Numbers</h4>
              <div className="bg-gray-50 rounded-md p-2">
                <ul className="space-y-1">
                  {devisNumbers.map((devis, index) => (
                    <li key={index} className="text-sm px-2 py-1 bg-white rounded border border-gray-200">
                      {devis}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Employee Assignment */}
          <div>
            <h4 className="font-medium mb-2">Assign Employees</h4>
            <div className="space-y-2">
              {availableEmployees.map(emp => (
                <label 
                  key={emp.id} 
                  className="flex items-center p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={assignedEmployees.includes(emp.id)}
                    onChange={(e) => handleEmployeeAssignment(emp.id, e.target.checked)}
                    className="mr-3"
                  />
                  <span>{emp.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Savings Info */}
          {assignedEmployees.length > 1 && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                Time reduced by {((assignedEmployees.length - 1) / assignedEmployees.length * 100).toFixed(0)}% 
                with {assignedEmployees.length} employees assigned
              </p>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <h4 className="font-medium mb-2">Notes</h4>
            
            {/* Existing notes */}
            <div className="mb-4 max-h-40 overflow-y-auto">
              {existingNotes.map((note, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded-md">
                  <div className="text-sm">{note.content}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(note.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Add new note */}
            <div className="mt-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note about this operation..."
                className="w-full px-3 py-2 border rounded-md resize-none h-20"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => {
                    if (notes.trim() && onAddNote) {
                      onAddNote({
                        content: notes.trim(),
                        timestamp: new Date().toISOString()
                      });
                      setNotes('');
                    }
                  }}
                  disabled={!notes.trim()}
                  className={`px-3 py-1 rounded-md text-sm 
                    ${notes.trim() 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 text-gray-400'}`}
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;

// import { useState, useEffect } from 'react';
// import { getAvailableEmployees } from '../../../data/employeesData';

// const SidePanel = ({ 
//   isOpen, 
//   onClose, 
//   operation, 
//   projectModel,
//   quantity,
//   totalHours,
//   assignedEmployees = [],
//   onAssign,
//   timelineItem = {},
//   onAddNote,
//   days,
//   className
// }) => {
//   const [notes, setNotes] = useState('');
//   const availableEmployees = operation ? getAvailableEmployees(operation) : [];
//   const existingNotes = timelineItem?.notes || [];

//   const handleEmployeeAssignment = (empId, isChecked) => {
//     console.log('handleEmployeeAssignment called with:', { empId, isChecked });
//     const newAssigned = isChecked
//       ? [...assignedEmployees, empId]
//       : assignedEmployees.filter(id => id !== empId);
    
//     console.log('Updating assignments:', {
//       previous: assignedEmployees,
//       new: newAssigned,
//       operation
//     });
    
//     onAssign(newAssigned);
//   };

//   return (
//     <div 
//       className={`fixed inset-y-0 right-0 overflow-hidden transition-all duration-300 ease-in-out
//         ${isOpen ? 'w-80' : 'w-0'} ${className}`}
//     >
//       <div className="h-full w-80 bg-white shadow-lg">
//         {/* Header */}
//         <div className="p-4 border-b sticky top-0 bg-white z-10">
//           <div className="flex justify-between items-center">
//             <h3 className="text-lg font-semibold capitalize">{operation}</h3>
//             <button 
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-700 text-xl"
//             >
//               ×
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-4 space-y-6">
//           {/* Project Info */}
//           <div>
//             <h4 className="font-medium mb-2">Project Details</h4>
//             <div className="space-y-1 text-sm">
//               <p>Model: {projectModel}</p>
//               <p>Quantity: {quantity}</p>
//               <p>Total Hours: {totalHours}</p>
//               <p>Days Required: {days}</p>
//             </div>
//           </div>

//           {/* Employee Assignment */}
//           <div>
//             <h4 className="font-medium mb-2">Assign Employees</h4>
//             <div className="space-y-2">
//               {availableEmployees.map(emp => (
//                 <label 
//                   key={emp.id} 
//                   className="flex items-center p-2 rounded hover:bg-gray-50"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={assignedEmployees.includes(emp.id)}
//                     onChange={(e) => {
//                       e.stopPropagation();
//                       handleEmployeeAssignment(emp.id, e.target.checked);
//                     }}
//                     className="mr-3"
//                   />
//                   <span>{emp.name}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Time Savings Info */}
//           {assignedEmployees.length > 1 && (
//             <div className="p-3 bg-blue-50 rounded-md">
//               <p className="text-sm text-blue-800">
//                 Time reduced by {((assignedEmployees.length - 1) / assignedEmployees.length * 100).toFixed(0)}% 
//                 with {assignedEmployees.length} employees assigned
//               </p>
//             </div>
//           )}

//           {/* Notes Section */}
//           <div>
//             <h4 className="font-medium mb-2">Notes</h4>
            
//             {/* Existing notes */}
//             <div className="mb-4 max-h-40 overflow-y-auto">
//               {existingNotes.map((note, index) => (
//                 <div key={index} className="mb-2 p-2 bg-gray-50 rounded-md">
//                   <div className="text-sm">{note.content}</div>
//                   <div className="text-xs text-gray-500 mt-1">
//                     {new Date(note.timestamp).toLocaleString()}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Add new note */}
//             <div className="mt-3">
//               <textarea
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Add a note about this operation..."
//                 className="w-full px-3 py-2 border rounded-md resize-none h-20"
//               />
//               <div className="mt-2 flex justify-end">
//                 <button
//                   onClick={() => {
//                     if (notes.trim() && onAddNote) {
//                       const newNote = {
//                         content: notes.trim(),
//                         timestamp: new Date().toISOString()
//                       };
//                       onAddNote(newNote);
//                       setNotes('');
//                     }
//                   }}
//                   disabled={!notes.trim()}
//                   className={`px-3 py-1 rounded-md text-sm 
//                     ${notes.trim() 
//                       ? 'bg-blue-600 hover:bg-blue-700 text-white' 
//                       : 'bg-gray-100 text-gray-400'}`}
//                 >
//                   Add Note
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SidePanel;
import React, { useState, useRef, useEffect } from 'react';
import SidePanel from './SidePanel';
import TimelineRow from './TimelineRow';
import ChartHeader from './ChartHeader';
import ChartLegend from './ChartLegend';
import QuantityUpdateForm from './QuantityUpdateForm';
import useTimelineDrag from '../hooks/useTimelineDrag';
import { updateTimelinePosition } from '../utils/timelineUtils';
import { OPERATION_COLORS, TIMELINE_MODES } from '../../../constants/timelineConstants';

const GanttChart = ({ projects, onUpdateProject, onDeleteProject }) => {
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [timelineMode, setTimelineMode] = useState(TIMELINE_MODES.SEQUENTIAL);
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [headerState, setHeaderState] = useState({
    isSticky: false,
    height: 0
  });
  
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const headerContainerRef = useRef(null);

  // Track only vertical scroll position for header stickiness
  useEffect(() => {
    const handleScroll = (e) => {
      // Only handle window scroll events (vertical)
      if (e.currentTarget === window) {
        if (headerContainerRef.current && containerRef.current) {
          const containerRect = headerContainerRef.current.getBoundingClientRect();
          const headerRect = headerRef.current?.getBoundingClientRect();

          setHeaderState({
            isSticky: containerRect.top <= 0,
            height: headerRect?.height || 0
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    // Initial measurement
    handleScroll({ currentTarget: window });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Keep selectedOperation in sync with project updates
  useEffect(() => {
    if (selectedOperation) {
      const currentProject = projects[selectedOperation.projectIndex];
      const currentTimelineItem = currentProject?.timeline.find(
        item => item.operation === selectedOperation.operation
      );
      
      if (currentTimelineItem) {
        setSelectedOperation(prev => ({
          ...prev,
          timelineItem: currentTimelineItem
        }));
      }
    }
  }, [projects, selectedOperation?.projectIndex, selectedOperation?.operation]);

  const handleDeleteProject = (projectIndex) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDeleteProject(projectIndex);
      if (selectedOperation?.projectIndex === projectIndex) {
        setSelectedOperation(null);
      }
    }
  };

  const handleQuantityUpdate = (projectIndex, newQuantity) => {
    const project = projects[projectIndex];
    const updatedProject = {
      ...project,
      quantity: newQuantity
    };
    onUpdateProject(projectIndex, updatedProject, 'quantity');
    setEditingQuantity(null);
  };

  const handleAssignEmployees = (projectIndex, operation, employeeIds) => {
    const project = projects[projectIndex];
    const updatedProject = {
      ...project,
      assignments: {
        ...project.assignments,
        [operation]: employeeIds
      },
      timeline: project.timeline.map(item => {
        if (item.operation === operation) {
          return {
            ...item,
            assignedEmployees: employeeIds
          };
        }
        return item;
      })
    };
    
    onUpdateProject(projectIndex, updatedProject, 'assignment');
  };

  const handleUpdatePosition = (projectIndex, operation, newStartDay, duration) => {
    const result = updateTimelinePosition(
      projects,
      projectIndex,
      operation,
      newStartDay,
      duration,
      timelineMode
    );

    if (result.allProjects) {
      result.allProjects.forEach((project, index) => {
        onUpdateProject(index, project, 'position');
      });
    } else {
      onUpdateProject(projectIndex, result.updatedProject, 'position');
    }
  };

  const { isDragging, dragState, handleDragStart } = useTimelineDrag({
    onUpdatePosition: handleUpdatePosition,
    timelineMode
  });

  const getTimelineStartDate = () => {
    if (!projects.length) return new Date();
    
    const earliestDate = projects.reduce((earliest, project) => {
      const projectDate = new Date(project.createdAt);
      return projectDate < earliest ? projectDate : earliest;
    }, new Date());
    
    return earliestDate;
  };

  if (!projects?.length) return null;

  const startDate = getTimelineStartDate();
  const totalDays = Math.max(
    ...projects.flatMap(project => 
      project.timeline.map(item => item.endDay)
    )
  ) + 1;
  
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getDateForDay = (dayNumber) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return date;
  };

  const renderHeader = () => (
    <>
      <div className="px-4 pt-4">
        <ChartHeader 
          timelineMode={timelineMode}
          onModeChange={setTimelineMode}
        />
      </div>
      
      <div className="flex px-4 pb-2 border-b">
        <div className="w-48 flex-shrink-0"></div>
        <div className="flex">
          {days.map(day => (
            <div key={day} className="w-12 flex-shrink-0 text-center text-sm font-medium">
              {formatDate(getDateForDay(day))}
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="mt-8">
      {/* Main container */}
      <div 
        ref={containerRef}
        className="relative bg-white rounded-lg shadow-md overflow-x-auto"
      >
        {/* Header container */}
        <div ref={headerContainerRef}>
          {/* Original header - serves as a spacer when sticky */}
          <div 
            ref={headerRef} 
            className="bg-white"
            style={{ 
              height: headerState.isSticky ? headerState.height : 'auto',
              visibility: headerState.isSticky ? 'hidden' : 'visible'
            }}
          >
            {renderHeader()}
          </div>

          {/* Fixed header - shown when sticky */}
          {headerState.isSticky && (
            <div 
              className="fixed top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
              style={{ 
                width: containerRef.current?.clientWidth,
                transform: `translateX(${containerRef.current?.getBoundingClientRect().left}px)`
              }}
            >
              {renderHeader()}
            </div>
          )}
        </div>

        {/* Timeline content */}
        <div className="px-4 pb-4">
          {projects.map((project, projectIndex) => (
            <React.Fragment key={projectIndex}>
              <div className="mt-6 mb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-700 flex items-center gap-2">
                      <span>Model {project.modelNumber}</span>
                      {editingQuantity === projectIndex ? (
                        <QuantityUpdateForm
                          currentQuantity={project.quantity}
                          onUpdate={(newQuantity) => handleQuantityUpdate(projectIndex, newQuantity)}
                          onCancel={() => setEditingQuantity(null)}
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          <span>(Qty: {project.quantity})</span>
                          <button
                            onClick={() => setEditingQuantity(projectIndex)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edit quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    {project.devisNumbers && project.devisNumbers.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.devisNumbers.map((devis, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {devis}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteProject(projectIndex)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
              
              {project.timeline.map((timelineItem) => {
                const { operation, startDay, endDay, assignedEmployees = [] } = timelineItem;
                const duration = endDay - startDay + 1;
                
                return (
                  <TimelineRow
                    key={`${projectIndex}-${operation}`}
                    operation={operation}
                    startDay={startDay}
                    duration={duration}
                    operationColor={OPERATION_COLORS[operation]}
                    assignedEmployees={assignedEmployees}
                    onDragStart={(e) => handleDragStart(e, projectIndex, operation, startDay, duration)}
                    onSelect={() => setSelectedOperation({
                      projectIndex,
                      operation,
                      timelineItem,
                      projectModel: project.modelNumber,
                      quantity: project.quantity
                    })}
                    isDragging={isDragging}
                    dragState={dragState}
                  />
                );
              })}
            </React.Fragment>
          ))}
          <ChartLegend operationColors={OPERATION_COLORS} />
        </div>
      </div>

      <SidePanel
        className="side-panel"
        isOpen={!!selectedOperation}
        onClose={() => setSelectedOperation(null)}
        operation={selectedOperation?.operation}
        projectModel={selectedOperation?.projectModel}
        quantity={selectedOperation?.quantity}
        totalHours={selectedOperation?.timelineItem?.totalHours}
        days={selectedOperation?.timelineItem ? 
          selectedOperation.timelineItem.endDay - selectedOperation.timelineItem.startDay + 1 : 0}
        assignedEmployees={selectedOperation?.timelineItem?.assignedEmployees || []}
        timelineItem={selectedOperation?.timelineItem}
        onAssign={employeeIds => {
          if (selectedOperation) {
            handleAssignEmployees(
              selectedOperation.projectIndex,
              selectedOperation.operation,
              employeeIds
            );
          }
        }}
        onAddNote={newNote => {
          if (selectedOperation) {
            const project = projects[selectedOperation.projectIndex];
            const updatedTimelineItem = {
              ...selectedOperation.timelineItem,
              notes: [...(selectedOperation.timelineItem.notes || []), newNote]
            };
            
            const updatedProject = {
              ...project,
              timeline: project.timeline.map(item =>
                item.operation === selectedOperation.operation
                  ? updatedTimelineItem
                  : item
              )
            };
            
            onUpdateProject(selectedOperation.projectIndex, updatedProject, 'note');
          }
        }}
      />
    </div>
  );
};

export default GanttChart;


// // src/pages/timeline/features/gantt/components/GanttChart.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import SidePanel from './SidePanel';
// import TimelineRow from './TimelineRow';
// import ChartHeader from './ChartHeader';
// import ChartLegend from './ChartLegend';
// import QuantityUpdateForm from './QuantityUpdateForm';
// import useTimelineDrag from '../hooks/useTimelineDrag';
// import { updateTimelinePosition } from '../utils/timelineUtils';
// import { OPERATION_COLORS, TIMELINE_MODES } from '../../../constants/timelineConstants';

// const GanttChart = ({ projects, onUpdateProject, onDeleteProject }) => {
//   const [selectedOperation, setSelectedOperation] = useState(null);
//   const [timelineMode, setTimelineMode] = useState(TIMELINE_MODES.SEQUENTIAL);
//   const [editingQuantity, setEditingQuantity] = useState(null);
//   const chartRef = useRef(null);
//   const getTimelineStartDate = () => {
//     if (!projects.length) return new Date();
    
//     const earliestDate = projects.reduce((earliest, project) => {
//       const projectDate = new Date(project.createdAt);
//       return projectDate < earliest ? projectDate : earliest;
//     }, new Date());
    
//     return earliestDate;
//   };

//   const startDate = getTimelineStartDate(); 
  
//   // Keep selectedOperation in sync with project updates
//   useEffect(() => {
//     if (selectedOperation) {
//       const currentProject = projects[selectedOperation.projectIndex];
//       const currentTimelineItem = currentProject.timeline.find(
//         item => item.operation === selectedOperation.operation
//       );
      
//       setSelectedOperation(prev => ({
//         ...prev,
//         timelineItem: currentTimelineItem
//       }));
//     }
//   }, [projects, selectedOperation?.projectIndex, selectedOperation?.operation]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const isClickInsidePanel = event.target.closest('.side-panel');
//       if (!isClickInsidePanel && selectedOperation) {
//         setSelectedOperation(null);
//       }
//     };

//     if (selectedOperation) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [selectedOperation]);

//   const handleDeleteProject = (projectIndex) => {
//     if (window.confirm('Are you sure you want to delete this project?')) {
//       onDeleteProject(projectIndex);
//       if (selectedOperation?.projectIndex === projectIndex) {
//         setSelectedOperation(null);
//       }
//     }
//   };

//   const handleAssignEmployees = (projectIndex, operation, employeeIds) => {
//     const project = projects[projectIndex];
//     const updatedProject = {
//       ...project,
//       assignments: {
//         ...project.assignments,
//         [operation]: employeeIds
//       },
//       timeline: project.timeline.map(item => {
//         if (item.operation === operation) {
//           return {
//             ...item,
//             assignedEmployees: employeeIds
//           };
//         }
//         return item;
//       })
//     };
    
//     onUpdateProject(projectIndex, updatedProject, 'assignment');
//   };

//   const handleUpdatePosition = (projectIndex, operation, newStartDay, duration) => {
//     const result = updateTimelinePosition(
//       projects,
//       projectIndex,
//       operation,
//       newStartDay,
//       duration,
//       timelineMode
//     );

//     if (result.allProjects) {
//       result.allProjects.forEach((project, index) => {
//         onUpdateProject(index, project, 'position');
//       });
//     } else {
//       onUpdateProject(projectIndex, result.updatedProject, 'position');
//     }
//   };

//   const handleQuantityUpdate = (projectIndex, newQuantity) => {
//     const project = projects[projectIndex];
//     const updatedProject = {
//       ...project,
//       quantity: newQuantity
//     };
//     onUpdateProject(projectIndex, updatedProject, 'quantity');
//     setEditingQuantity(null);
//   };

//   const { isDragging, dragState, handleDragStart } = useTimelineDrag({
//     onUpdatePosition: handleUpdatePosition,
//     timelineMode
//   });

//   // Function to format date as MM/DD
//   const formatDate = (date) => {
//     return `${date.getMonth() + 1}/${date.getDate()}`;
//   };

//   // Function to get date for a specific day number
//   const getDateForDay = (dayNumber) => {
//     const date = new Date(startDate);
//     date.setDate(date.getDate() + dayNumber - 1);
//     return date;
//   };

//   if (!projects?.length) return null;

//   const totalDays = Math.max(
//     ...projects.flatMap(project => 
//       project.timeline.map(item => item.endDay)
//     )
//   ) + 1;
  
//   const days = Array.from({ length: totalDays }, (_, i) => i + 1);

//   return (
//     <>
//       <div className="mt-8 p-4 bg-white rounded-lg shadow-md overflow-x-auto">
//         <ChartHeader 
//           timelineMode={timelineMode}
//           onModeChange={setTimelineMode}
//         />
        
//         <div className="flex" ref={chartRef}>
//           <div className="w-48 flex-shrink-0"></div>
//           {days.map(day => (
//             <div key={day} className="w-12 flex-shrink-0 text-center text-sm font-medium">
//               {formatDate(getDateForDay(day))}
//             </div>
//           ))}
//         </div>

//         {projects.map((project, projectIndex) => (
//           <React.Fragment key={projectIndex}>
//             <div className="mt-6 mb-2">
//               <div className="flex justify-between items-start">
//                 <div className="space-y-1">
//                   <div className="font-semibold text-gray-700 flex items-center gap-2">
//                     <span>Model {project.modelNumber}</span>
//                     {editingQuantity === projectIndex ? (
//                       <QuantityUpdateForm
//                         currentQuantity={project.quantity}
//                         onUpdate={(newQuantity) => handleQuantityUpdate(projectIndex, newQuantity)}
//                         onCancel={() => setEditingQuantity(null)}
//                       />
//                     ) : (
//                       <div className="flex items-center gap-1">
//                         <span>(Qty: {project.quantity})</span>
//                         <button
//                           onClick={() => setEditingQuantity(projectIndex)}
//                           className="p-1 text-blue-600 hover:text-blue-800"
//                           title="Edit quantity"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                               d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//                           </svg>
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                   {project.devisNumbers && project.devisNumbers.length > 0 && (
//                     <div className="flex flex-wrap gap-2">
//                       {project.devisNumbers.map((devis, idx) => (
//                         <span 
//                           key={idx}
//                           className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//                         >
//                           {devis}
//                         </span>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => handleDeleteProject(projectIndex)}
//                   className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
//                 >
//                   Delete Project
//                 </button>
//               </div>
//             </div>
            
//             {project.timeline.map((timelineItem) => {
//               const { operation, startDay, endDay, assignedEmployees = [] } = timelineItem;
//               const duration = endDay - startDay + 1;
              
//               return (
//                 <TimelineRow
//                   key={`${projectIndex}-${operation}`}
//                   operation={operation}
//                   startDay={startDay}
//                   duration={duration}
//                   operationColor={OPERATION_COLORS[operation]}
//                   assignedEmployees={assignedEmployees}
//                   onDragStart={(e) => handleDragStart(e, projectIndex, operation, startDay, duration)}
//                   onSelect={() => setSelectedOperation({
//                     projectIndex,
//                     operation,
//                     timelineItem,
//                     projectModel: project.modelNumber,
//                     quantity: project.quantity
//                   })}
//                   isDragging={isDragging}
//                   dragState={dragState}
//                 />
//               );
//             })}
//           </React.Fragment>
//         ))}
//         <ChartLegend operationColors={OPERATION_COLORS} />
//       </div>

//       <SidePanel
//         className="side-panel"
//         isOpen={!!selectedOperation}
//         onClose={() => setSelectedOperation(null)}
//         operation={selectedOperation?.operation}
//         projectModel={selectedOperation?.projectModel}
//         quantity={selectedOperation?.quantity}
//         totalHours={selectedOperation?.timelineItem?.totalHours}
//         days={selectedOperation?.timelineItem ? 
//           selectedOperation.timelineItem.endDay - selectedOperation.timelineItem.startDay + 1 : 0}
//         assignedEmployees={selectedOperation?.timelineItem?.assignedEmployees || []}
//         timelineItem={selectedOperation?.timelineItem}
//         onAssign={(employeeIds) => {
//           if (selectedOperation) {
//             handleAssignEmployees(
//               selectedOperation.projectIndex,
//               selectedOperation.operation,
//               employeeIds
//             );
//           }
//         }}
//         onAddNote={(newNote) => {
//           if (selectedOperation) {
//             const project = projects[selectedOperation.projectIndex];
//             const updatedTimelineItem = {
//               ...selectedOperation.timelineItem,
//               notes: [...(selectedOperation.timelineItem.notes || []), newNote]
//             };
            
//             const updatedProject = {
//               ...project,
//               timeline: project.timeline.map(item =>
//                 item.operation === selectedOperation.operation
//                   ? updatedTimelineItem
//                   : item
//               )
//             };
            
//             onUpdateProject(selectedOperation.projectIndex, updatedProject, 'note');
//           }
//         }}
//       />
//     </>
//   );
// };

// export default GanttChart;

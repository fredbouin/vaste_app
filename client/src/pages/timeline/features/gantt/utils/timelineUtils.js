import { TIMELINE_MODES } from '../../../constants/timelineConstants';

export const updateTimelinePosition = (projects, projectIndex, operation, newStartDay, duration, timelineMode) => {
  if (timelineMode === TIMELINE_MODES.SEQUENTIAL) {
    const updatedProjects = [...projects];
    const currentProject = updatedProjects[projectIndex];
    const opIndex = currentProject.timeline.findIndex(item => item.operation === operation);
    
    // Calculate the change in position
    const oldStartDay = currentProject.timeline[opIndex].startDay;
    const daysDelta = newStartDay - oldStartDay;

    // First update the moved operation
    currentProject.timeline[opIndex] = {
      ...currentProject.timeline[opIndex],
      startDay: newStartDay,
      endDay: newStartDay + duration - 1
    };

    // Helper function to update an operation's days
    const shiftDays = (timelineItem) => ({
      ...timelineItem,
      startDay: timelineItem.startDay + daysDelta,
      endDay: timelineItem.endDay + daysDelta
    });

    // Update remaining operations in current project
    for (let i = opIndex + 1; i < currentProject.timeline.length; i++) {
      if (currentProject.timeline[i].operation === 'rembourrage') continue;
      currentProject.timeline[i] = shiftDays(currentProject.timeline[i]);
    }

    // Update all subsequent projects
    for (let i = projectIndex + 1; i < updatedProjects.length; i++) {
      updatedProjects[i].timeline = updatedProjects[i].timeline.map(item => 
        item.operation === 'rembourrage' ? item : shiftDays(item)
      );
    }

    return {
      updatedProject: updatedProjects[projectIndex],
      allProjects: updatedProjects
    };
  } else {
    // Flexible mode - just update the single operation in the current project
    const updatedProject = {
      ...projects[projectIndex],
      timeline: projects[projectIndex].timeline.map(item => {
        if (item.operation === operation) {
          return {
            ...item,
            startDay: newStartDay,
            endDay: newStartDay + duration - 1
          };
        }
        return item;
      })
    };

    return {
      updatedProject,
      allProjects: null // null indicates no need to update other projects
    };
  }
};

// import { TIMELINE_MODES } from '../constants/timelineConstants';

// export const updateTimelinePosition = (project, operation, newStartDay, duration, timelineMode) => {
//   let updatedTimeline = [...project.timeline];

//   if (timelineMode === TIMELINE_MODES.SEQUENTIAL) {
//     const opIndex = updatedTimeline.findIndex(item => item.operation === operation);
    
//     // Get the change in position
//     const oldStartDay = updatedTimeline[opIndex].startDay;
//     const daysDelta = newStartDay - oldStartDay;
    
//     // Update the dragged operation
//     updatedTimeline[opIndex] = {
//       ...updatedTimeline[opIndex],
//       startDay: newStartDay,
//       endDay: newStartDay + duration - 1
//     };

//     // Update subsequent operations (except rembourrage) maintaining relative positions
//     for (let i = opIndex + 1; i < updatedTimeline.length; i++) {
//       if (updatedTimeline[i].operation === 'rembourrage') continue;
      
//       // Instead of making items back-to-back, shift by the same amount
//       const item = updatedTimeline[i];
//       updatedTimeline[i] = {
//         ...item,
//         startDay: item.startDay + daysDelta,
//         endDay: item.endDay + daysDelta
//       };
//     }
//   } else {
//     // Flexible mode - just update the dragged operation
//     updatedTimeline = updatedTimeline.map(item => {
//       if (item.operation === operation) {
//         return {
//           ...item,
//           startDay: newStartDay,
//           endDay: newStartDay + duration - 1
//         };
//       }
//       return item;
//     });
//   }

//   return {
//     ...project,
//     timeline: updatedTimeline
//   };
// };


// import { TIMELINE_MODES } from './timelineConstants';

// export const updateTimelinePosition = (project, operation, newStartDay, duration, timelineMode) => {
//   let updatedTimeline = [...project.timeline];

//   if (timelineMode === TIMELINE_MODES.SEQUENTIAL) {
//     const opIndex = updatedTimeline.findIndex(item => item.operation === operation);
    
//     // Update the dragged operation
//     updatedTimeline[opIndex] = {
//       ...updatedTimeline[opIndex],
//       startDay: newStartDay,
//       endDay: newStartDay + duration - 1
//     };

//     // Update subsequent operations (except rembourrage)
//     for (let i = opIndex + 1; i < updatedTimeline.length; i++) {
//       if (updatedTimeline[i].operation === 'rembourrage') continue;
      
//       const prevEnd = updatedTimeline[i-1].endDay;
//       const curDuration = updatedTimeline[i].endDay - updatedTimeline[i].startDay + 1;
      
//       updatedTimeline[i] = {
//         ...updatedTimeline[i],
//         startDay: prevEnd + 1,
//         endDay: prevEnd + curDuration
//       };
//     }
//   } else {
//     // Flexible mode - just update the dragged operation
//     updatedTimeline = updatedTimeline.map(item => {
//       if (item.operation === operation) {
//         return {
//           ...item,
//           startDay: newStartDay,
//           endDay: newStartDay + duration - 1
//         };
//       }
//       return item;
//     });
//   }

//   return {
//     ...project,
//     timeline: updatedTimeline
//   };
// };
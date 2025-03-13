// src/pages/timeline/TimelinePage.jsx
import React from 'react';
import ProjectList from './features/projectManagement/components/ProjectList';
import TimelineForm from './features/projectManagement/components/TimelineForm';
import useModelData from './features/projectManagement/hooks/useModelData';
import useProjectManagement from './features/projectManagement/hooks/useProjectManagement';

const TimelinePage = () => {
  const { modelTimes, isLoading, error: modelError } = useModelData();
  const {
    projects,
    error: projectError,
    handleSubmit,
    handleUpdateProject,
    handleDeleteProject,
    handleClearProjects
  } = useProjectManagement(modelTimes);

  return (
    <div className="p-6">
      <TimelineForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={modelError || projectError}
      />
      
      <ProjectList
        projects={projects}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onClearProjects={handleClearProjects}
      />
    </div>
  );
};

export default TimelinePage;

// // src/pages/timeline/TimelinePage.jsx
// import TimelineForm from './features/projectManagement/components/TimelineForm';
// import ProjectList from './features/projectManagement/components/ProjectList';
// import useModelData from './features/projectManagement/hooks/useModelData';
// import useProjectManagement from './features/projectManagement/hooks/useProjectManagement';

// const TimelineInput = () => {
//   const { modelTimes, isLoading, error: modelError } = useModelData();
//   const {
//     projects,
//     error: projectError,
//     handleSubmit,
//     handleUpdateProject,
//     handleDeleteProject,
//     handleClearProjects
//   } = useProjectManagement(modelTimes);

//   return (
//     <div className="max-w-6xl mx-auto pt-10 px-4">
//       <TimelineForm 
//         onSubmit={handleSubmit}
//         isLoading={isLoading}
//         error={modelError || projectError}
//       />

//       <div className="mt-8">
//         <ProjectList
//           projects={projects}
//           onClearProjects={handleClearProjects}
//           onUpdateProject={handleUpdateProject}
//           onDeleteProject={handleDeleteProject}
//         />
//       </div>
//     </div>
//   );
// };

// export default TimelineInput;

// // src/pages/timeline/TimelinePage.jsx
// import TimelineForm from './features/projectManagement/components/TimelineForm';
// import ProjectList from './features/projectManagement/components/ProjectList';
// import TestModelTimes from './features/projectManagement/components/TestModelTimes';  // Add this import
// import useModelData from './features/projectManagement/hooks/useModelData';
// import useProjectManagement from './features/projectManagement/hooks/useProjectManagement';

// const TimelineInput = () => {
//   const { modelTimes, isLoading, error: modelError } = useModelData();
//   const {
//     projects,
//     error: projectError,
//     handleSubmit,
//     handleUpdateProject,
//     handleDeleteProject,
//     handleClearProjects
//   } = useProjectManagement(modelTimes);

//   return (
//     <div className="max-w-6xl mx-auto pt-10 px-4">
//       <TimelineForm 
//         onSubmit={handleSubmit}
//         isLoading={isLoading}
//         error={modelError || projectError}
//       />

//       <div className="mt-8">
//         <ProjectList
//           projects={projects}
//           onClearProjects={handleClearProjects}
//           onUpdateProject={handleUpdateProject}
//           onDeleteProject={handleDeleteProject}
//         />
//       </div>
//     </div>
//   );
// };

// <TestModelTimes />



// export default TimelineInput;
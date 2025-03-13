// src/pages/timeline/features/projectManagement/components/ProjectList.jsx
import GanttChart from '../../../features/gantt/components/GanttChart';

const ProjectList = ({ 
  projects, 
  onClearProjects, 
  onUpdateProject, 
  onDeleteProject 
}) => {
  if (!projects?.length) return null;

  return (
    <div className="relative">
      <div className="flex justify-end mb-4">
        <button
          onClick={onClearProjects}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
        >
          Clear All Projects
        </button>
      </div>

      <GanttChart 
        projects={projects}
        onUpdateProject={onUpdateProject}
        onDeleteProject={onDeleteProject}
      />
    </div>
  );
};

export default ProjectList;
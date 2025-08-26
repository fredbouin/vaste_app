// src/pages/timeline/features/projectManagement/hooks/useProjectManagement.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { calculateTimeline } from '../../../data/timelineCalculations';

export const useProjectManagement = (modelTimes) => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  // Add this effect to recalculate all projects when modelTimes changes
  useEffect(() => {
    const recalculateProjects = async () => {
      if (!modelTimes || !projects.length) return;

      console.log('Recalculating projects with new model times:', modelTimes);

      try {
        const updatedProjects = projects.map((project, index) => {
          const recalculated = calculateTimeline(
            project.modelNumber,
            project.quantity,
            projects.slice(0, index), // Previous projects
            project.assignments || {},
            modelTimes
          );

          return {
            ...recalculated,
            _id: project._id,
            assignments: project.assignments,
            devisNumbers: project.devisNumbers
          };
        });

        // Update all projects in the database
        await Promise.all(updatedProjects.map(project =>
          axios.put(`${API_BASE_URL}/api/projects/${project._id}`, project)
        ));

        console.log('Projects recalculated with new times:', updatedProjects);
        setProjects(updatedProjects);
      } catch (err) {
        setError('Failed to update projects with new model times.');
        console.error('Error updating projects:', err);
      }
    };

    recalculateProjects();
  }, [modelTimes]); // Recalculate whenever modelTimes changes

  // Initial fetch of projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/projects`);
        setProjects(response.data);
      } catch (err) {
        setError('Failed to fetch projects.');
        console.error('Error fetching projects:', err);
      }
    };

    fetchProjects();
  }, []);

  // Rest of your existing code...
  const handleSubmit = async (formData) => {
    setError('');
    const quantity = parseInt(formData.quantity, 10);
    
    if (isNaN(quantity) || quantity <= 0) {
      setError('Invalid quantity.');
      return;
    }

    const newProject = calculateTimeline(formData.model, quantity, projects, {}, modelTimes);
    
    if (newProject) {
      try {
        const projectWithDevis = {
          ...newProject,
          devisNumbers: formData.devisNumbers
        };

        const response = await axios.post(`${API_BASE_URL}/api/projects`, projectWithDevis);
        setProjects(prev => [...prev, response.data]);
      } catch (err) {
        setError('Failed to save project to database.');
        console.error('Error saving project:', err);
      }
    }
  };

const handleUpdateProject = async (projectIndex, updatedProject, updateType = 'position') => {
  try {
    let recalculatedProject;
    
    if (updateType === 'quantity' || updateType === 'assignment') {
      recalculatedProject = calculateTimeline(
        updatedProject.modelNumber,
        updatedProject.quantity,
        projects.slice(0, projectIndex),
        updatedProject.assignments,
        modelTimes
      );
      
      recalculatedProject = {
        ...recalculatedProject,
        _id: updatedProject._id,
        assignments: updatedProject.assignments,
        devisNumbers: updatedProject.devisNumbers
      };
    } else {
      recalculatedProject = updatedProject;
    }

    await axios.put(`${API_BASE_URL}/api/projects/${recalculatedProject._id}`, recalculatedProject);
    
    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = recalculatedProject;
    
    if (updateType === 'quantity' || updateType === 'assignment') {
      for (let i = projectIndex + 1; i < updatedProjects.length; i++) {
        const subsequentProject = calculateTimeline(
          updatedProjects[i].modelNumber,
          updatedProjects[i].quantity,
          updatedProjects.slice(0, i),
          updatedProjects[i].assignments,
          modelTimes
        );
        
        if (subsequentProject) {
          const updated = {
            ...subsequentProject,
            _id: updatedProjects[i]._id,
            assignments: updatedProjects[i].assignments,
            devisNumbers: updatedProjects[i].devisNumbers
          };
          await axios.put(`${API_BASE_URL}/api/projects/${updated._id}`, updated);
          updatedProjects[i] = updated;
        }
      }
    }
    
    setProjects(updatedProjects);
  } catch (err) {
    setError('Failed to update project.');
    console.error('Error updating project:', err);
  }
};

  const handleDeleteProject = async (projectIndex) => {
    try {
      const projectToDelete = projects[projectIndex];
      await axios.delete(`${API_BASE_URL}/api/projects/${projectToDelete._id}`);
      
      const updatedProjects = projects.filter((_, index) => index !== projectIndex);
      
      const recalculatedProjects = await Promise.all(updatedProjects.map(async (project, index) => {
        if (index <= projectIndex) return project;
        
        const recalculated = calculateTimeline(
          project.modelNumber,
          project.quantity,
          updatedProjects.slice(0, index),
          project.assignments,
          modelTimes
        );
        
        if (recalculated) {
          const updated = {
            ...recalculated,
            _id: project._id,
            assignments: project.assignments,
            devisNumbers: project.devisNumbers
          };
          await axios.put(`${API_BASE_URL}/api/projects/${updated._id}`, updated);
          return updated;
        }
        return project;
      }));
      
      setProjects(recalculatedProjects);
    } catch (err) {
      setError('Failed to delete project.');
      console.error('Error deleting project:', err);
    }
  };

  const handleClearProjects = async () => {
    try {
      await Promise.all(projects.map(project => 
        axios.delete(`${API_BASE_URL}/api/projects/${project._id}`)
      ));
      setProjects([]);
    } catch (err) {
      setError('Failed to clear projects.');
      console.error('Error clearing projects:', err);
    }
  };

  return {
    projects,
    error,
    handleSubmit,
    handleUpdateProject,
    handleDeleteProject,
    handleClearProjects
  };
};

export default useProjectManagement;
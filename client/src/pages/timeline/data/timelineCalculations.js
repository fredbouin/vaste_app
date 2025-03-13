// src/pages/timeline/data/mockModelTimes.js

// Operation dependencies and buffer requirements
const OPERATION_RULES = {
  stock: { dependsOn: null, buffer: 0 },
  cnc: { dependsOn: 'stock', buffer: 2 },
  assemblage: { dependsOn: 'cnc', buffer: 2 },
  finition: { dependsOn: 'assemblage', buffer: 0 },
  rembourrage: { dependsOn: null, buffer: 0 }
};

export const operationOrder = ['stock', 'cnc', 'assemblage', 'finition'];
export const WORK_DAY_HOURS = 7;

const calculateDuration = (hours, assignedEmployees) => {
  const numEmployees = assignedEmployees?.length || 1;
  return Math.ceil(hours / (WORK_DAY_HOURS * numEmployees));
};

const findNextAvailableStart = (operation, existingProjects) => {
  if (!existingProjects.length) return 1;
  
  const latestEnd = Math.max(
    ...existingProjects.map(project => {
      const operationData = project.timeline.find(t => t.operation === operation);
      return operationData ? operationData.endDay : -1;
    })
  );
  
  return latestEnd + 1;
};

const findEarliestStart = (operation, dependentTimeline, existingProjects) => {
  const rules = OPERATION_RULES[operation];
  
  if (!rules.dependsOn) {
    return findNextAvailableStart(operation, existingProjects);
  }

  const dependentOp = dependentTimeline.find(item => item.operation === rules.dependsOn);
  if (!dependentOp) return 1;

  if (operation === 'finition') {
    return dependentOp.endDay + 1;
  }

  return dependentOp.startDay + rules.buffer;
};

export const calculateTimeline = (modelNumber, quantity, existingProjects = [], assignments = {}, modelTimes = []) => {
  
  const createdAt = new Date().toISOString();

  // Find the model template from MongoDB data
  const modelTemplate = modelTimes.find(template => template.modelNumber === modelNumber);
  if (!modelTemplate) {
    console.error('Model template not found:', modelNumber);
    return null;
  }

  console.log('Using model template:', modelTemplate);
  const modelData = modelTemplate.operationTimes;
  
  const timeline = [];
  let currentTimeline = [];

  operationOrder.forEach((operation) => {
    const totalHours = modelData[operation] * quantity;
    const assignedEmployees = assignments[operation] || [];
    const days = calculateDuration(totalHours, assignedEmployees);
    
    const earliestStart = findEarliestStart(operation, currentTimeline, existingProjects);
    const resourceAvailableDay = findNextAvailableStart(operation, existingProjects);
    const startDay = Math.max(earliestStart, resourceAvailableDay);
    
    const timelineItem = {
      operation,
      startDay,
      endDay: startDay + days - 1,
      totalHours,
      assignedEmployees,
      notes: []
    };

    currentTimeline.push(timelineItem);
    timeline.push(timelineItem);
  });

  const rembourrageTotalHours = modelData.rembourrage * quantity;
  const rembourrageEmployees = assignments['rembourrage'] || [];
  const rembourrageDays = calculateDuration(rembourrageTotalHours, rembourrageEmployees);
  const rembourrageStart = findNextAvailableStart('rembourrage', existingProjects);
  
  timeline.push({
    operation: 'rembourrage',
    startDay: rembourrageStart,
    endDay: rembourrageStart + rembourrageDays - 1,
    totalHours: rembourrageTotalHours,
    assignedEmployees: rembourrageEmployees,
    notes: []
  });

  return {
    modelNumber,
    quantity,
    timeline,
    assignments,
    createdAt // Add this to the returned object
  };
};

export const recalculateAllProjects = (projects, modelTimes = []) => {
  let recalculatedProjects = [];
  
  projects.forEach((project) => {
    const existingNotes = {};
    project.timeline.forEach(item => {
      existingNotes[item.operation] = item.notes || [];
    });
    
    const result = calculateTimeline(
      project.modelNumber, 
      project.quantity, 
      recalculatedProjects,
      project.assignments,
      modelTimes
    );
    
    if (result) {
      result.timeline = result.timeline.map(item => ({
        ...item,
        notes: existingNotes[item.operation] || []
      }));
    }
    
    recalculatedProjects.push(result);
  });
  
  return recalculatedProjects;
};

export const recalculateAllProjectsPreservingPositions = (projects, modelTimes = []) => {
  let recalculatedProjects = [];
  
  projects.forEach((project) => {
    const result = calculateTimelinePreservingPositions(
      project.modelNumber, 
      project.quantity, 
      recalculatedProjects,
      project.assignments,
      project.timeline,
      modelTimes
    );
    
    if (result) {
      recalculatedProjects.push(result);
    }
  });
  
  return recalculatedProjects;
};
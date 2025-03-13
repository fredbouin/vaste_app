// src/data/employeesData.js

export const employees = [
  { id: 1, name: 'Frédéric', skills: ['stock', 'cnc', 'assemblage'] },
  { id: 2, name: 'Vincent-Olivier', skills: ['stock', 'assemblage'] },
  { id: 3, name: 'Thomas', skills: ['stock', 'assemblage', 'finition'] },
  { id: 4, name: 'Frédérique', skills: ['finition'] },
  { id: 5, name: 'Agathe', skills: ['rembourrage'] },
  { id: 6, name: 'Guillaume', skills: ['stock', 'assemblage'] },
];

// Helper function to get available employees for an operation
export const getAvailableEmployees = (operation) => {
  return employees.filter(emp => emp.skills.includes(operation));
};
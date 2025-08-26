// src/api/modelTemplates.js

//const API_BASE_URL = 'http://localhost:3001/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const modelTemplatesApi = {
  // Fetch all model templates
  async fetchModelTimes() {
    try {
      const response = await fetch(`${API_BASE_URL}/model-templates`);
      if (!response.ok) {
        throw new Error('Failed to fetch model times');
      }
      
      const templates = await response.json();
      
      // Convert API response to the format expected by existing code
      // From: [{ modelNumber: "310", operationTimes: {...} }]
      // To: { "310": { stock: 7, cnc: 6, ... } }
      return templates.reduce((acc, template) => {
        acc[template.modelNumber] = template.operationTimes;
        return acc;
      }, {});
      
    } catch (error) {
      console.error('Error fetching model times:', error);
      throw error;
    }
  },

  // Fetch a single model template by model number
  async fetchModelTime(modelNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/model-templates/${modelNumber}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch model ${modelNumber}`);
      }
      
      const template = await response.json();
      return template.operationTimes;
      
    } catch (error) {
      console.error(`Error fetching model ${modelNumber}:`, error);
      throw error;
    }
  }
};
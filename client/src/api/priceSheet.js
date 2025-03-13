// src/api/priceSheet.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/price-sheet';

export const priceSheetApi = {
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  add: async (entry) => {
    const response = await axios.post(API_URL, entry);
    return response.data;
  },

  update: async (id, entry) => {
    const response = await axios.put(`${API_URL}/${id}`, entry);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  sync: async (id, currentSettings) => {
    try {
      console.log('Attempting to sync with ID:', id);
      console.log('Sync URL:', `${API_URL}/${id}/sync`);
      console.log('Settings payload:', JSON.stringify(currentSettings, null, 2));
      
      const response = await axios.post(`${API_URL}/${id}/sync`, { currentSettings });
      console.log('Sync response received:', response.status);
      return response.data;
    } catch (error) {
      console.error('Sync error:', error.message);
      if (error.response) {
        console.error('Server responded with:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received from server. Request:', error.request);
      }
      throw error; // Re-throw to let the component handle it
    }
  }
};

// // src/api/priceSheet.js
// import axios from 'axios';

// const API_URL = 'http://localhost:3001/api/price-sheet';

// export const priceSheetApi = {
//   getAll: async () => {
//     const response = await axios.get(API_URL);
//     return response.data;
//   },

//   add: async (entry) => {
//     const response = await axios.post(API_URL, entry);
//     return response.data;
//   },

//   update: async (id, entry) => {
//     const response = await axios.put(`${API_URL}/${id}`, entry);
//     return response.data;
//   },

//   delete: async (id) => {
//     const response = await axios.delete(`${API_URL}/${id}`);
//     return response.data;
//   },

//   sync: async (id, currentSettings) => {
//     console.log('Attempting to sync with ID:', id);
//     console.log('Sync URL:', `${API_URL}/${id}/sync`);
//     const response = await axios.post(`${API_URL}/${id}/sync`, { currentSettings });
//     return response.data;
//   }
// };

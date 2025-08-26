// src/pages/timeline/features/projectManagement/hooks/useModelData.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useModelData = () => {
  const [modelTimes, setModelTimes] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadModelTimes = async () => {
      console.log('Starting to fetch model times...');
      try {
        setIsLoading(true);
        
        // Log the request being made
        console.log('Making request to /api/model-templates with cache-busting headers');
        
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/model-templates`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        // Log the response data
        console.log('Received model times data:', response.data);
        
        // Log state update
        console.log('Previous modelTimes:', modelTimes);
        console.log('New modelTimes:', response.data);
        
        setModelTimes(response.data);
        setError('');
      } catch (err) {
        console.error('Detailed error:', {
          message: err.message,
          response: err.response,
          request: err.request
        });
        setError('Failed to load model times from database.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModelTimes();
  }, []); // Only runs on mount

  // Log whenever modelTimes changes
  useEffect(() => {
    console.log('modelTimes state updated to:', modelTimes);
  }, [modelTimes]);

  return {
    modelTimes,
    isLoading,
    error
  };
};

export default useModelData;

// // src/pages/timeline/features/projectManagement/hooks/useModelData.js
// import { useState, useEffect } from 'react';
// import axios from 'axios';

// export const useModelData = () => {
//   const [modelTimes, setModelTimes] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const loadModelTimes = async () => {
//       try {
//         setIsLoading(true);
//         const response = await axios.get('http://localhost:3001/api/model-templates', {
//           headers: {
//             'Cache-Control': 'no-cache',
//             'Pragma': 'no-cache',
//             'Expires': '0'
//           }
//         });
//         console.log('Model times fetched:', response.data);
//         setModelTimes(response.data);
//         setError('');
//       } catch (err) {
//         setError('Failed to load model times from database.');
//         console.error('Error loading model times:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadModelTimes();
//   }, []); // Only runs on mount

//   return {
//     modelTimes,
//     isLoading,
//     error
//   };
// };

// export default useModelData;

// //useModelData.js

// import { useState, useEffect } from 'react';
// import axios from 'axios';

// export const useModelData = () => {
//   const [modelTimes, setModelTimes] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     loadModelTimes();
//   }, []);

//   const loadModelTimes = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get('http://localhost:3001/api/model-templates');
//       console.log('Model times fetched from MongoDB:', response.data);
//       setModelTimes(response.data);
//       setIsLoading(false);
//     } catch (err) {
//       setError('Failed to load model times from database.');
//       console.error('Error loading model times:', err);
//       setIsLoading(false);
//     }
//   };

//   return {
//     modelTimes,
//     isLoading,
//     error
//   };
// };

// export default useModelData;
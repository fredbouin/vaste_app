// client/src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ADD THIS LINE FOR DEBUGGING
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
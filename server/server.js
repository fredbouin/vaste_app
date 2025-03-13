// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Google Sheets API setup
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'credentials/google-sheets.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Function to fetch and process data from Google Sheets
async function fetchAndTransformData() {
   try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID environment variable is not set");
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'MasterTable!A2:H',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error("No data found in Google Sheets.");
    }

    const processedData = rows.map(row => ({
      modelNumber: row[0] || "UNKNOWN",
      collection: row[1] || "UNKNOWN",
      element: row[2] || "UNKNOWN",
      operationTimes: {
        stock: parseFloat(row[3]) || 0,
        cnc: parseFloat(row[4]) || 0,
        assemblage: parseFloat(row[5]) || 0,
        finition: parseFloat(row[6]) || 0,
        rembourrage: parseFloat(row[7]) || 0,
      }
    }));

    return processedData;
  } catch (error) {
    console.error("🚨 ERROR FETCHING GOOGLE SHEETS DATA 🚨");
    console.error(error);
    throw error;
  }
}

// Import routes
const projectRoutes = require('./routes/projects');
const modelTemplateRoutes = require('./routes/modelTemplates');
const priceSheetRoutes = require('./routes/priceSheet');
const settingsRoutes = require('./routes/settings');


// API route to fetch model data
app.get('/api/fetch-model-data', async (req, res) => {
  try {
    const data = await fetchAndTransformData();
    res.json(data);
  } catch (error) {
    console.error("🚨 ERROR SENDING DATA TO FRONTEND 🚨");
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to fetch model data' });
  }
});

// Model templates endpoint
app.get('/api/model-templates', async (req, res) => {
  try {
    const data = await fetchAndTransformData();
    res.json(data);
  } catch (error) {
    console.error("🚨 ERROR SENDING DATA TO FRONTEND 🚨");
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to fetch model data' });
  }
});

// Mount routes
app.use('/api/projects', projectRoutes);
app.use('/api/model-templates', modelTemplateRoutes);
app.use('/api/price-sheet', priceSheetRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`MongoDB connection status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
});
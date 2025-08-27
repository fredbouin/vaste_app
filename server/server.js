// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// --- EXPANDED CORS CONFIGURATION ---
const corsOptions = {
  origin: 'https://vaste-app-client.onrender.com', // Your frontend URL
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection with improved logging
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// --- SERVE STATIC CLIENT FILES ---
// UPDATED: Serve files from the 'public' directory within the server folder
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const projectRoutes = require('./routes/projects');
const modelTemplateRoutes = require('./routes/modelTemplates');
const priceSheetRoutes = require('./routes/priceSheet');
const settingsRoutes = require('./routes/settings');

// Mount API routes
app.use('/api/projects', projectRoutes);
app.use('/api/model-templates', modelTemplateRoutes);
app.use('/api/price-sheet', priceSheetRoutes);
app.use('/api/settings', settingsRoutes);

// --- CATCH-ALL ROUTE FOR CLIENT-SIDE ROUTING ---
// UPDATED: This should come after all API routes and point to the new location
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


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
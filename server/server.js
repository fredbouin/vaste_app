// server/server.js //
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// --- EXPANDED CORS CONFIGURATION ---
// IMPORTANT: Update this with your CLIENT's Render URL
const corsOptions = {
  origin: 'https://vaste-app-client.onrender.com', // Replace if your client has a different URL
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

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
});
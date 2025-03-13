// scripts/importModelTimes.js
require('dotenv').config();
const mongoose = require('mongoose');
const ModelTemplate = require('../models/ModelTemplate');

// Your existing mock data
const modelTimes = {
  '310': {
    stock: 7,
    cnc: 6,
    assemblage: 8,
    finition: 1,
    rembourrage: 4
  },
  '320': {
    stock: 8,
    cnc: 7,
    assemblage: 9,
    finition: 2,
    rembourrage: 5
  }
};

async function importModelTimes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Convert mock data to array of documents
    const modelTemplates = Object.entries(modelTimes).map(([modelNumber, times]) => ({
      modelNumber,
      operationTimes: times
    }));

    // Insert all models
    const result = await ModelTemplate.insertMany(modelTemplates);
    console.log(`Successfully imported ${result.length} model templates`);

  } catch (error) {
    console.error('Error importing model times:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the import
importModelTimes();
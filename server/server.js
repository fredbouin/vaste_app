// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

const clientURL = process.env.CLIENT_URL; // MUST be like: https://your-frontend.onrender.com
const whitelist = [clientURL, 'http://localhost:3000', 'http://localhost:5173']; // add your dev ports as needed

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);             // allow curl/postman/SSR
    if (whitelist.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',      // include OPTIONS
  //allowedHeaders: 'Content-Type,Authorization',
  credentials: false,                                 // set true only if you use cookies
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));                  // handle preflight globally
app.use(express.json());

// (optional) simple healthcheck to test wiring from the browser:
app.get('/health', (_, res) => res.send('ok'));

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
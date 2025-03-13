// models/projects.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  modelNumber: String,
  quantity: Number,
  timeline: Array,
  assignments: Object,
  notes: Array,
  devisNumbers: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now  // This will be overridden by the frontend's date
  }
});

module.exports = mongoose.model('Project', projectSchema);
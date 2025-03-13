const mongoose = require('mongoose');

const modelTemplateSchema = new mongoose.Schema({
  modelNumber: {
    type: String,
    required: true,
    unique: true
  },
  operationTimes: {
    stock: { type: Number, required: true },
    cnc: { type: Number, required: true },
    assemblage: { type: Number, required: true },
    finition: { type: Number, required: true },
    rembourrage: { type: Number, required: true }
  },
  active: {
    type: Boolean,
    default: true
  }
});

const ModelTemplate = mongoose.model('ModelTemplate', modelTemplateSchema);

module.exports = ModelTemplate;
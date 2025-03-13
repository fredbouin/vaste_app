// models/CalculatorSettings.js
const mongoose = require('mongoose');

const calculatorSettingsSchema = new mongoose.Schema({
  labor: {
    stockProduction: { rate: { type: Number, default: 0 } },
    cncOperator: { rate: { type: Number, default: 0 } },
    assembly: { rate: { type: Number, default: 0 } },
    finishing: { rate: { type: Number, default: 0 } },
    upholstery: { rate: { type: Number, default: 0 } },
    extraFee: { type: Number, default: 0 }  // <-- new field for extra labor fees (e.g., 8%)
  },
  materials: {
    wood: { type: Object, default: {} },
    hardware: { type: Array, default: [] },
    finishing: { type: Array, default: [] },
    sheet: { type: Array, default: [] },
    upholsteryMaterials: { type: Array, default: [] }
  },
  cnc: {
    rate: { type: Number, default: 0 },
    details: { type: Object, default: {} }
  },
  overhead: {
    monthlyOverhead: { type: Number, default: 0 },
    employees: { type: Number, default: 0 },
    monthlyProdHours: { type: Number, default: 0 },
    monthlyCNCHours: { type: Number, default: 0 }
  },
  margins: {
    wholesale: { type: Number, default: 0 },
    msrp: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('CalculatorSettings', calculatorSettingsSchema);

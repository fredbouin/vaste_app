// models/priceSheet.js
const mongoose = require('mongoose');

const priceSheetSchema = new mongoose.Schema({
  isComponent: Boolean,
  componentName: String,
  componentType: String,
  collection: String,
  pieceNumber: String,
  variation: String,
  cost: Number,
  manualPrice: { type: Number, default: null }, // New field for manual price
  details: {
    labor: {
      breakdown: [{
        type: { type: String },
        hours: Number,
        rate: Number,
        cost: Number,
        detail: String
      }],
      total: Number
    },
    materials: {
      wood: [{
        species: String,
        thickness: String,
        boardFeet: Number,
        cost: Number
      }],
      computedWood: {
        baseCost: Number,
        wasteCost: Number,
        totalCost: Number
      },
      upholstery: mongoose.Schema.Types.Mixed,
      hardware: [{
        name: String,
        specification: String,
        quantity: Number,
        costPerUnit: Number,
        cost: Number
      }],
      finishing: {
        materialId: String,
        materialName: String,
        surfaceArea: Number,
        coats: Number,
        coverage: Number,
        costPerLiter: Number,
        cost: Number
      },
      sheet: [{
        name: String,
        thickness: String,
        size: String,
        material: String,
        grade: String,
        quantity: Number,
        pricePerSheet: Number,
        cost: Number
      }],
      total: Number
    },
    cnc: {
      runtime: Number,
      rate: Number,
      cost: Number
    },
    overhead: {
      rate: Number,
      hours: Number,
      cost: Number
    },
    // components: [{
    //     id: {
    //       type: mongoose.Schema.Types.Mixed, // Accept both ObjectId and String
    //       required: true
    //     },
    //     name: String,
    //     type: String,
    //     cost: Number,
    //     quantity: { type: Number, default: 1 }
    //   }]
    components: {
      type: mongoose.Schema.Types.Mixed, // Accept any format temporarily
      default: []
    }
  }
}, {
  timestamps: true,
  strict: false // Allows for flexibility in document structure
});

// Add indexes if needed
priceSheetSchema.index({ isComponent: 1 });
priceSheetSchema.index({ componentName: 1 });
priceSheetSchema.index({ collection: 1, pieceNumber: 1 });

module.exports = mongoose.model('PriceSheet', priceSheetSchema);

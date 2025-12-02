const mongoose = require('mongoose');

const CalculationSchema = new mongoose.Schema({
  expression: { type: String, required: true },
  result: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Calculation', CalculationSchema);

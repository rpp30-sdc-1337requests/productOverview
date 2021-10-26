const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const featureSchema = new mongoose.Schema ({
  product_id: Number,
  features: [{feature: String, value: String}]
})

const Feature = mongoose.model('Feature', featureSchema);

module.exports = { Feature };
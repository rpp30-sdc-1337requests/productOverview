const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const relatedSchema = new mongoose.Schema ({
  productId: Number,
  relatedProducts: [Number]
})

const Related = mongoose.model('Related', relatedSchema);

module.exports = { Related }
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const relatedSchema = new mongoose.Schema ({
  product_id: { type: Number, index: true },
  relatedProducts: [Number]
})

const Related = mongoose.model('Related', relatedSchema);

module.exports = { Related }
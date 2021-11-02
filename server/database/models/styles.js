const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const styleSchema = new mongoose.Schema ({
  product_id: Number,
  style_id: { type: Number, index: true },
  name: String,
  sale_price: String,
  original_price: String,
  default_style: Boolean
})

const Style = mongoose.model('style', styleSchema);

module.exports = { Style };
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema ({
  product_id: { type: Number, index: true },
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: String
});
const Product = mongoose.model('Product', productSchema);

module.exports = { Product };
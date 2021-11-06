const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productDetail = new mongoose.Schema ({
  product_id: { type: Number, index: true },
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: String,
  features: [{feature: String, value: String}]
});
const ProductDetail = mongoose.model('ProductDetail', productDetail);

module.exports = { ProductDetail };
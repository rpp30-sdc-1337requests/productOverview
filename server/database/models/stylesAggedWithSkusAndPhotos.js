const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const styleAggSchema = new mongoose.Schema ({
  product_id: { type: Number, index: true },
  results: [{
    style_id: Number,
    sale_price: String,
    original_price: String,
    name: String,
    'default?': Boolean,
    skus: [{sku_id: Number, size: String, quantity: Number, _id: Schema.ObjectId}],
    photos: [{thumbnail_url: String, url: String, _id: Schema.ObjectId}]
  }]
})

const StyleAgg = mongoose.model('StyleAggregate', styleAggSchema);

module.exports = { StyleAgg }
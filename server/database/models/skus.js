const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const skuSchema = new mongoose.Schema ({
  styleId: { type: Number, index: true },
  skus: [{
    sku_id: Number,
    quantity: Number,
    size: String
  }]
})


const Skus = mongoose.model('Sku', skuSchema);

module.exports = { Skus }
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new mongoose.Schema ({
  styleId: { type: Number, index: true },
  photos: [{photoId: Number, url: String, thumbnail_url: String}]
})

const Photo = mongoose.model('photo', photoSchema);

module.exports = { Photo };
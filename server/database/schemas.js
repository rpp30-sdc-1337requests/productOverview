import mongoose from 'mongoose';

const { Schema } = mongoose;

const productSchema = new Schema ({
  product_id: Number,
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: String
})

const productDetails = new Schema ({
  //can i copy the product info from the productsScehma?
  productDetails: [{ type: Schema.Types.ObjectId, ref: 'Product'}]
  features: [{feature: String, value: String}]
})

const productStyles = new Schema ({
  product_id: Number,
  styles: [{
    style_id: Number,
    name: String,
    original_price: String,
    sale_price: String,
    //idk if a '?' is accepable. may need to modify.
    'default?': Boolean,
    photos: [{
      thumbnail_url: String,
      url: String
    }]
    skus: {
      //i'm nervous here about the ID. i need to understand better where that comes form.
      id: {
        quantity: Number,
        size: String
      }
    }
  }]
})

//cart schema
const cartSchema = new Schema ({
  sku_id: Number,
  count: Number
})


//related products Schema
const relatedProductsSchema = new Schema ({
  product_id: Number,
  related_ids: [Number]
})

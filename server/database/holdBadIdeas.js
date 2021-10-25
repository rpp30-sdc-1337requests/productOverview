/*
this file holds everything that was a near good idea - or was a good idea if i had a super computer/infinite time
I am saving this code here so i can come back and reflect on it after i finish SDC and determine if it actually was a bad idea, or if it wouldn't have worked knowing all i will know at the end of the project.

const importProductDetailsToMongo = async () => {


  // const ProductDetail = mongoose.model('ProductDetail', getSchema('productDetail'));
  let productCount = await db.collections.products.count();

 for (let i = 1; i < productCount; i++) {
  let dbProductDetails = await Product.find({product_id: i}).lean().exec();
  let dbFeatures = await Feature.find({product_id: i}).lean().exec();

  if (dbFeatures.length !== 0) {
    let newProductDetailEntry = new ProductDetail ({
      productDetails: {
        product_id: dbProductDetails[0].product_id,
        name: dbProductDetails[0].name,
        slogan: dbProductDetails[0].slogan,
        description: dbProductDetails[0].description,
        category: dbProductDetails[0].category,
        default_price: dbProductDetails[0].default_price
      },
      features: dbFeatures[0].features,
    });
    await newProductDetailEntry.save()
    console.log(`[product details]  entry # ${i} complete.`)
  } else {
    let newProductDetailEntry = new ProductDetail ({
      productDetails: {
        product_id: dbProductDetails[0].product_id,
        name: dbProductDetails[0].name,
        slogan: dbProductDetails[0].slogan,
        description: dbProductDetails[0].description,
        category: dbProductDetails[0].category,
        default_price: dbProductDetails[0].default_price
      }
    });
    await newProductDetailEntry.save()
    console.log(`[product details]  entry # ${i} complete.`)
  }

 }
 console.log('data import for product details completed. All lines imported.')
}

module.exports = { connectToDB };


the Schema for productDetails
else if (name ==='productDetail') {

  const productDetailsSchema = new mongoose.Schema ({
//can i copy the product info from the productsScehma?
  productDetails: {
    product_id: Number,
    name: String,
    slogan: String,
    description: String,
    category: String,
    default_price: String
  },
  features: [{feature: String, value: String}]
  })
  return (productDetailsSchema)
}

*/
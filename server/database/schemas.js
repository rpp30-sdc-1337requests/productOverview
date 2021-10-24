const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var db;

//One to One data
const productDataPath = '/Users/ashleyreischman/Desktop/SDC Data Exports/product.csv'
// const productDataPath = '/Users/ashleyreischman/Desktop/SDC Data Exports/productShort.csv'


//flexible data is data that could have many, one, or no entries per product.
//flexible data categories include:
//features, styles, skus, photos.
//i am using the same function for each of them. The result is a collection that has the entries grouped togetehr by product id or by style id.


//short test files
// const flexibleFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/featuresShort.csv'


//full files
// const flexibleFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/features.csv'
// const flexibleFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/skus.csv'
// const flexibleFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/photos.csv'
// const flexibleFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/styles.csv'
const csvtojson = require('csvtojson');
let Product;
let ProductDetail;
let Feature;


const connectToDB = async () => {
  console.log('attempting to connect to db');
  await mongoose.connect('mongodb://localhost:27017/products');

  db = mongoose.connection
  db.on('error', (error) => { console.error(error)});
  if (db.readyState === 1) {
    console.log('connected to DB');
  }

  Product = mongoose.model('Product', getSchema('product'));
  Feature = mongoose.model('Feature', getSchema('feature'));
  ProductDetail = mongoose.model('ProductDetail', getSchema('productDetail'));

  setTimeout(importSkusToMongo, 2000)
}

connectToDB().catch( err => console.log(err));


const getSchema = (name) => {
  if (name === 'product') {
    const productSchema = new mongoose.Schema ({
      product_id: Number,
      name: String,
      slogan: String,
      description: String,
      category: String,
      default_price: String
    });
    return (productSchema);
  } else if (name === 'feature') {
    const featureSchema = new mongoose.Schema ({
      product_id: Number,
      features: [{feature: String, value: String}]
    })
    return (featureSchema)
  } else if (name ==='productDetail') {

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
  } else if (name === 'sku') {
    const skuSchema = new mongoose.Schema ({
      styleId: Number,
      skus: [{
        sku_id: Number,
        quantity: Number,
        size: String
      }]
    })
    return (skuSchema)
  } else {
    return null;
  }
}

const importProductCSVToMongo =  () => {
  console.log('hello from parser');

  // const Product = mongoose.model('Product', getSchema('product'));
  // const Product = mongoose.model('Product', getSchema('product'));

  csvtojson().fromFile(productDataPath).then( async (data) => {
    for (let i = 0; i < data.length; i++) {
      let newEntry = new Product ({
        product_id: parseInt(data[i].id),
        name: data[i].name,
        slogan: data[i].slogan,
        description: data[i].description,
        category: data[i].category,
        default_price: data[i].default_price
      })
      await newEntry.save();
      console.log(`[products] entry # ${i} complete.`)
      if (i === data.length - 1) {
        console.log(`data import for products completed. ${i} lines imported.`)
        importFeaturesCSVToMongo();
      }
    }
  })
}


const importSkusToMongo = () => {
  const skuFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/skus.csv';
  // const skuFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/skus.csv';

  const Sku = mongoose.model('Sku', getSchema('sku'));
  console.log('[sku] loading csv data into parser .....');
    csvtojson().fromFile(skuFilePath).then( async (data) => {

      let skuArray = [];
      let currentStyleId = 1;
      let skuStyleId = 1;

      for (let i = 0; i < data.length; i++) {

        if (skuArray.length > 0) {
          if (currentStyleId !== skuStyleId) {
            currentStyleId = skuStyleId;
          }
        }
        if (parseInt(data[i].styleId) === currentStyleId) {
          let skuObj = {
            sku_id: parseInt(data[i].id),
            quantity: parseInt(data[i].quantity),
            size: data[i].size
          }
          skuArray.push(skuObj);
          if (i === data.length - 1) {
            let newSku = new Sku ({
              styleId: currentStyleId,
              skus: skuArray,
            })

            await newSku.save();
            console.log(`[sku] entry # ${i} complete.`)
          }
        } else {
          //account for the scenario where there may be a product without any features. So we could skip from product_id 4 to 6, but we would still need to hang on to the features we're
          let newSku = new Sku ({
            styleId: currentStyleId,
            skus: skuArray,
          })
          await newSku.save();
          console.log(`[sku] entry # ${i} complete.`)
          skuArray = [];
          let skuObj = {
            sku_id: parseInt(data[i].id),
            quantity: parseInt(data[i].quantity),
            size: data[i].size
          }
          skuStyleId = parseInt(data[i].styleId);
          skuArray.push(skuObj);
          currentStyleId++;
        }
      }
      console.log('data import for skus completed. All lines imported.')

    })
  }


// const importProductDetailsToMongo = async () => {


//   // const ProductDetail = mongoose.model('ProductDetail', getSchema('productDetail'));
//   let productCount = await db.collections.products.count();

//  for (let i = 1; i < productCount; i++) {
//   let dbProductDetails = await Product.find({product_id: i}).lean().exec();
//   let dbFeatures = await Feature.find({product_id: i}).lean().exec();

//   if (dbFeatures.length !== 0) {
//     let newProductDetailEntry = new ProductDetail ({
//       productDetails: {
//         product_id: dbProductDetails[0].product_id,
//         name: dbProductDetails[0].name,
//         slogan: dbProductDetails[0].slogan,
//         description: dbProductDetails[0].description,
//         category: dbProductDetails[0].category,
//         default_price: dbProductDetails[0].default_price
//       },
//       features: dbFeatures[0].features,
//     });
//     await newProductDetailEntry.save()
//     console.log(`[product details]  entry # ${i} complete.`)
//   } else {
//     let newProductDetailEntry = new ProductDetail ({
//       productDetails: {
//         product_id: dbProductDetails[0].product_id,
//         name: dbProductDetails[0].name,
//         slogan: dbProductDetails[0].slogan,
//         description: dbProductDetails[0].description,
//         category: dbProductDetails[0].category,
//         default_price: dbProductDetails[0].default_price
//       }
//     });
//     await newProductDetailEntry.save()
//     console.log(`[product details]  entry # ${i} complete.`)
//   }

//  }
//  console.log('data import for product details completed. All lines imported.')
// }

// module.exports = { connectToDB };








  //Keeping this safe - this one works.
  // const importFeaturesToMongo = () => {
  //   // const Feature = mongoose.model('Feature', getSchema('feature'));


  //   csvtojson().fromFile(featuresFilePath).then( async (data) => {

  //     let featureArray = [];
  //     let currentProductId = 1;
  //     let featureProductId = 1;

  //     for (let i = 0; i < data.length; i++) {

  //       if (featureArray.length > 0) {
  //         if (currentProductId !== featureProductId) {
  //           currentProductId = featureProductId;
  //         }
  //       }
  //       if (parseInt(data[i].product_id) === currentProductId) {
  //         let featureObj = {feature: data[i].feature, value: data[i].value};
  //         featureArray.push(featureObj);
  //         if (i === data.length - 1) {
  //           let newFeature = new Feature ({
  //             product_id: currentProductId,
  //             features: featureArray,
  //           })
  //           await newFeature.save();
  //           console.log(`entry # ${i} complete.`)
  //         }
  //       } else {
  //         //account for the scenario where there may be a product without any features. So we could skip from product_id 4 to 6, but we would still need to hang on to the features we're
  //         let newFeature = new Feature ({
  //           product_id: currentProductId,
  //           features: featureArray,
  //         })
  //         await newFeature.save();
  //         console.log(`[features] entry # ${i} complete.`)
  //         featureArray = [];
  //         let featureObj = {feature: data[i].feature, value: data[i].value};
  //         featureProductId = parseInt(data[i].product_id);
  //         featureArray.push(featureObj);
  //         currentProductId++;

  //       }
  //     }
  //     console.log('data import for features completed. All lines imported.')
  //     importProductDetailsToMongo()
  //   })
  // }









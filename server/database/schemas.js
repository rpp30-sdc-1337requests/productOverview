const mongoose = require('mongoose');
let DB;
// const productDataPath = '/Users/ashleyreischman/Desktop/SDC Data Exports/productShort.csv'
// const productDataPath = __dirname + '/product.csv';
const featureDataPath = '/Users/ashleyreischman/Desktop/SDC Data Exports/featuresShort.csv'
const csvtojson = require('csvtojson');



const connectToDB = async () => {
  console.log('attempting to connect to db');
  await mongoose.connect('mongodb://localhost:27017/products');

  DB = mongoose.connection;
  DB.on('error', (error) => { console.error(error)});
  if (DB.readyState === 1) {
    console.log('connected to DB');
  }
  // importProductCSVToMongo();
  // importFeaturesCSVToMongo();
  setTimeout(importFeaturesCSVToMongo, 2000)
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
  } else {
    return null;
  }
}

const importProductCSVToMongo =  () => {
  console.log('hello from parser');
  const Product = mongoose.model('Product', getSchema('product'));

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
      console.log(`entry # ${i} complete.`)
      if (i === data.length - 1) {
        console.log(`data import for products completed. ${i} lines imported.`)
      }
    }
  })
}

const importFeaturesCSVToMongo = () => {
  const Feature = mongoose.model('Feature', getSchema('feature'));
  csvtojson().fromFile(featureDataPath).then( async (data) => {

    let featureArray = [];
    let currentProductId = 1;
    let featureProductId = 1;

    for (let i = 0; i < data.length; i++) {

      if (featureArray.length > 0) {
        if (currentProductId !== featureProductId) {
          currentProductId = featureProductId;
        }
      }
      if (parseInt(data[i].product_id) === currentProductId) {
        let featureObj = {feature: data[i].feature, value: data[i].value};
        featureArray.push(featureObj);
        if (i === data.length - 1) {
          let newFeature = new Feature ({
            product_id: currentProductId,
            features: featureArray,
          })
          await newFeature.save();
          console.log(`entry # ${i} complete.`)
        }
      } else {
        //account for the scenario where there may be a product without any features. So we could skip from product_id 4 to 6, but we would still need to hang on to the features we're
        let newFeature = new Feature ({
          product_id: currentProductId,
          features: featureArray,
        })
        await newFeature.save();
        console.log(`entry # ${i} complete.`)
        featureArray = [];
        let featureObj = {feature: data[i].feature, value: data[i].value};
        featureProductId = parseInt(data[i].product_id);
        featureArray.push(featureObj);
        currentProductId++;

      }
    }
    console.log('data import for products completed. All lines imported.')
  })
}

module.exports = { connectToDB };







  // let count = 0;

  // let readStream = fs.createReadStream(productDataPath)
  //   .on('error', (error) => {
  //     throw (error);
  //   })
  //   .pipe(csvtojson())
  //   .on('data', async (data) => {
  //     let parsedData = JSON.parse(data.toString());
  //     let newEntry = new Product ({
  //       product_id: parseInt(parsedData.id),
  //       name: parsedData.name,
  //       slogan: parsedData.slogan,
  //       description: parsedData.description,
  //       category: parsedData.category,
  //       default_price: parsedData.default_price
  //     })
  //     await newEntry.save();
  //     console.log(`entry # ${count} complete.`)
  //     count = count + 1;
  //   })
  //   .on('end', () => {
  //     console.log('data entry complete');
  //   })
  //   .on('close', () => {
  //     console.log('data entry complete');
  //   })












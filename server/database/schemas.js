const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var db;
const csvtojson = require('csvtojson');
const connectToDB = async () => {
  console.log('attempting to connect to db');
  await mongoose.connect('mongodb://localhost:27017/products');

  db = mongoose.connection

  db.on('error', (error) => { console.error(error)});
    //not sure what to tell you, db.once('connected') was not working, so i'm checking for connection this way.
  if (db.readyState === 1) {
    console.log('connected to DB');
  }

  //i do this to give the inspect tab time to load before the database starts getting written to. Otherwise i don't get any interruptions for breakpoints so debugging is harder.
  // setTimeout(groupStylesByProdId, 2000)
}

connectToDB().catch( err => console.log(err));

const getSchema = (name) => {
  if (name === 'product') {
    const productSchema = new mongoose.Schema ({
      product_id: { type: Number, index: true },
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
  } else if (name === 'sku') {
    const skuSchema = new mongoose.Schema ({
      styleId: { type: Number, index: true },
      skus: [{
        sku_id: Number,
        quantity: Number,
        size: String
      }]
    })
    return (skuSchema)
  } else if (name === 'style') {
    // const styleSchema = new mongoose.Schema ({
    //   productId: Number,
    //   styles: [{style_id: Number, name: String, original_price: String, sale_price: String, 'default?': Boolean}]
    // })
    const styleSchema = new mongoose.Schema ({
      product_id: Number,
      style_id: { type: Number, index: true },
      name: String,
      sale_price: String,
      original_price: String,
      default_style: Boolean
    })
    return (styleSchema)
  } else if (name === 'related') {
    const relatedSchema = new mongoose.Schema ({
      productId: Number,
      relatedProducts: [Number]
    })
    return (relatedSchema)
  }  else if (name === 'photo') {
    const photoSchema = new mongoose.Schema ({
      styleId: { type: Number, index: true },
      photos: [{photoId: Number, url: String, thumbnail_url: String}]
    })
    return (photoSchema)
  } else if ('styleAgg') {
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
    return (styleAggSchema);
  } else if ('styleProdAgg') {
    const styleProdAggSchema = new mongoose.Schema ({
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
    return (styleProdAggSchema);
  } else {
    return null;
  }
}


const importProductCSVToMongo =  () => {
  const Product = mongoose.model('NoIndexProduct', getSchema('product'));
  // const productDataPath = '/Users/ashleyreischman/Desktop/SDC Data Exports/productShort.csv'
  const productDataPath = '/Users/ashleyreischman/Desktop/SDC Data Exports/product.csv'

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
    }
    console.log(`data import for products completed. Starting Features import...`)
    // importFeaturesToMongo();
  })
}

const importFeaturesToMongo = () => {
  const Feature = mongoose.model('Feature', getSchema('feature'));
  // const featuresFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/featuresShort.csv';
  const featuresFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/features.csv'

  csvtojson().fromFile(featuresFilePath).then( async (data) => {

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
        console.log(`[features] entry # ${i} complete.`)
        featureArray = [];
        let featureObj = {feature: data[i].feature, value: data[i].value};
        featureProductId = parseInt(data[i].product_id);
        featureArray.push(featureObj);
        currentProductId++;

        if (i === data.length - 1) {
          let newFeature = new Feature ({
            product_id: currentProductId,
            features: featureArray,
          })
          await newFeature.save();
          console.log(`[features] entry # ${i} complete.`)
        }
      }
    }
    console.log('data import for features completed. All lines imported. Starting sku import... ')
  })
}

const importSkusToMongo = () => {
  // const skuFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/skusShort.csv';
  const skuFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/skus.csv';

  const Sku = mongoose.model('sku', getSchema('sku'));
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

          if (i === data.length - 1) {
            let newSku = new Sku ({
              styleId: currentStyleId,
              skus: skuArray,
            })
            await newSku.save();
            console.log(`[skus] entry # ${i} complete.`)
          }
        }
      }
      console.log('data import for skus completed. All lines imported. Starting Styles Import....')
      importPhotosToMongo();
    })
  }



const importStylesForAggregationToMongo =  () => {
  const Style = mongoose.model('style', getSchema('style'));
  // const styleFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/stylesShort.csv';
  const styleFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/styles.csv'


  csvtojson().fromFile(styleFilePath).then( async (data) => {
    for (let i = 0; i < data.length; i++) {
      let defaultStyle = false;
      if (data[i].default_style) {
        defaultStyle = true;
      }
      let newEntry = new Style ({
        product_id: parseInt(data[i].productId),
        style_id: parseInt(data[i].id),
        name: data[i].name,
        sale_price: data[i].sale_price,
        original_price: data[i].original_price,
        default_style: defaultStyle
      })
      await newEntry.save();
      console.log(`[stylestest] entry # ${i} complete.`)
    }
    console.log(`data import for styles completed. Starting skus import...`)
    importSkusToMongo()
  })
}

const importPhotosToMongo = () => {
  // const photoFilePath  = '/Users/ashleyreischman/Desktop/SDC Data Exports/photosShort.csv';
  const photoFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/photos.csv';

  const Photo = mongoose.model('photo', getSchema('photo'));
  console.log('[photos] loading csv data into parser .....');
  csvtojson().fromFile(photoFilePath).then( async (data) => {

    let photoArray = [];
    let currentStyleId = 1;
    let photoStyleId = 1;

    for (let i = 0; i < data.length; i++) {

      if (photoArray.length > 0) {
        if (currentStyleId !== photoStyleId) {
          currentStyleId = photoStyleId;
        }
      }
      if (parseInt(data[i].styleId) === currentStyleId) {
        let photoObj = {
          photoId: parseInt(data[i].id),
          url: data[i].url,
          thumbnail_url: data[i].thumbnail_url
        }

        photoArray.push(photoObj);
        if (i === data.length - 1) {
          let newPhoto = new Photo ({
            styleId: currentStyleId,
            photos: photoArray,
          })

          await newPhoto.save();
          console.log(`[photos] entry # ${i} complete.`)
        }
      } else {
        //account for the scenario where there may be a product without any features. So we could skip from product_id 4 to 6, but we would still need to hang on to the features we're
        let newPhoto = new Photo ({
          styleId: currentStyleId,
          photos: photoArray,
        })
        await newPhoto.save();
        console.log(`[photos] entry # ${i} complete.`)
        photoArray = [];
        let photoObj = {
          photoId: parseInt(data[i].id),
          url: data[i].url,
          thumbnail_url: data[i].thumbnail_url
        }
        photoStyleId = parseInt(data[i].styleId);
        photoArray.push(photoObj);
        currentStyleId++;

        if (i === data.length - 1) {
          let newPhoto = new Photo ({
            styleId: currentStyleId,
            photos: photoArray,
          })
          await newPhoto.save();
          console.log(`[photos] entry # ${i} complete.`)
        }
      }
    }
    console.log('data import for photos completed. All lines imported. All data imports complete')

  })
}

const importRelatedProductsToMongo = () => {
  const Related = mongoose.model('Related', getSchema('related'));
  // const relatedFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/relatedShort.csv';
  const relatedFilePath = '/Users/ashleyreischman/Desktop/SDC Data Exports/related.csv'

  csvtojson().fromFile(relatedFilePath).then( async (data) => {

    let relatedArray = [];
    let currentProductId = 1;
    let relatedProductId = 1;

    for (let i = 0; i < data.length; i++) {

      if (relatedArray.length > 0) {
        if (currentProductId !== relatedProductId) {
          currentProductId = relatedProductId;
        }
      }
      if (parseInt(data[i].current_product_id) === currentProductId) {
        relatedArray.push(data[i].related_product_id);
        //In the case that this is the final iteration of the for loop, we need to make sure that we write this entry to the DB. Typically this logic depends on having an extra iteration for the case where currentProductId !== the relatedProductId.
        //however, if we're in the last loop and the currentProductId does equal the styleId, then we'll save the entry to the relatedArray but never write it to the DB. This if statement below takes care of writing the entry to the DB
        //in the case when this is the last iteration.
        if (i === data.length - 1) {
          let newRelated = new Related ({
            productId: currentProductId,
            relatedProducts: relatedArray,
          })
          await newRelated.save();
          console.log(`['related] entry # ${i} complete.`)
        }
      } else {
        //account for the scenario where there may be a product without any features. So we could skip from product_id 4 to 6, but we would still need to hang on to the features we're
        let newRelated = new Related ({
          productId: currentProductId,
          relatedProducts: relatedArray,
        })
        await newRelated.save();
        console.log(`[related] entry # ${i} complete.`)
        relatedArray = [];
        relatedProductId = parseInt(data[i].current_product_id);
        relatedArray.push(data[i].related_product_id);
        currentProductId++;

        ///if the dataset is on it's last entry, that means that it just finished writing the data for the PREVIOUS productId, so we need to still write the current dataset to the database.
        //that means we need to have the currentProductId incremented (see line 238) and then write this individual entry to the DB.
        if (i === data.length - 1) {
          let newRelated = new Related ({
            productId: currentProductId,
            relatedProducts: relatedArray,
          })
          await newRelated.save();
          console.log(`[related] entry # ${i} complete.`)
        }
      }
    }
    console.log('data import for related completed. All lines imported. Starting photos import.....')

  })
}


///Data Aggregation functions
const aggregateStyles = async () => {

  const Style = mongoose.model('style', getSchema('style'));
  const StyleAgg = mongoose.model('StyleAggregate', getSchema('styleAgg'));


  const styleCount = await Style.count();

  for (let i = 1; i <= styleCount; i++) {
    let result = await Style.aggregate([
      { $match: { style_id: i } },
      {
        $lookup: {
          from: 'skus',
          localField: 'style_id',
          foreignField: 'styleId',
          as: 'Skus'
        }
      },
      {
        $lookup: {
          from: 'photos',
          localField: 'style_id',
          foreignField: 'styleId',
          as: 'Photos'
        }
      }

    ]);

    if (result[0].Skus.length !== 0 && result[0].Photos.length !== 0) {
      let newStyleAgg = new StyleAgg ({
        product_id: result[0].product_id,
        results: [{
          style_id: result[0].style_id,
          sale_price: result[0].sale_price,
          original_price: result[0].original_price,
          name: result[0].name,
          'default?': result[0].default_style,
          skus: result[0].Skus[0].skus,
          photos: result[0].Photos[0].photos
        }]
      })
      await newStyleAgg.save();
      console.log(`[styleAgg] entry # ${i} complete.`)
    } else if (result[0].Skus.length !== 0 && result[0].Photos.length === 0) {
      let newStyleAgg = new StyleAgg ({
        product_id: result[0].product_id,
        results: [{
          style_id: result[0].style_id,
          sale_price: result[0].sale_price,
          original_price: result[0].original_price,
          name: result[0].name,
          'default?': result[0].default_style,
          skus: result[0].Skus[0].skus,
          photos: []
        }]
      })
      await newStyleAgg.save();
      console.log(`[styleAgg] entry # ${i} complete.`)
    } else if (result[0].Photos.length !== 0 && result[0].Skus.length === 0) {
      let newStyleAgg = new StyleAgg ({
        product_id: result[0].product_id,
        results: [{
          style_id: result[0].style_id,
          sale_price: result[0].sale_price,
          original_price: result[0].original_price,
          name: result[0].name,
          'default?': result[0].default_style,
          skus: [],
          photos: result[0].Photos[0].photos
        }]
      })
      await newStyleAgg.save();
      console.log(`[styleAgg] entry # ${i} complete.`)
    } else {
      let newStyleAgg = new StyleAgg ({
        product_id: result[0].product_id,
        results: [{
          style_id: result[0].style_id,
          sale_price: result[0].sale_price,
          original_price: result[0].original_price,
          name: result[0].name,
          'default?': result[0].default_style,
          skus: [],
          photos: []
        }]
      })
      await newStyleAgg.save();
      console.log(`[styleAgg] entry # ${i} complete.`)
    }
  }
}

const groupStylesByProdId = async () => {
  const StyleAgg = mongoose.model('StyleAggregate', getSchema('styleAgg'));
  const StylesAggedByProd = mongoose.model('StylesAggedByProd', getSchema('styleProdAgg'));

  let lastStyleAggEntry = await StyleAgg.find({}).sort({_id: -1}).limit(1).lean();
  let styleAggCount = lastStyleAggEntry[0].product_id;
  let result = [];

  for (let i = 1; i <= styleAggCount; i++) {
    let allStyles = [];
    let result = await StyleAgg.aggregate([
      { $match: { product_id: i } }
    ]);

    if (result.length === 0) {
      continue;
    }
    for (let j = 0; j < result.length; j++) {
      allStyles.push(result[j].results[0]);
    }
    let newEntry = new StylesAggedByProd ({
      product_id: result[0].product_id,
      results: allStyles
    })

    await newEntry.save();
    console.log(`[styleToProdAgg] entry # ${i} complete.`)
  }
}




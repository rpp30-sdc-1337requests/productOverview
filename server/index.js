const express = require ('express');
const app = express();
const port = 80;
//require('newrelic');
var server;
const mongoose = require ('mongoose');
const DB_USER = require('./config.js').DB_USER;
const DB_PASS = require('./config.js').DB_PASS;
// const dbURL = 'mongodb://localhost:27017/products';
// const dbURL = 'mongodb://SDC_user:SDC_DB@localhost:27017/products'
const dbURL = `mongodb://${DB_USER}:${DB_PASS}@ec2-3-94-64-234.compute-1.amazonaws.com:27017/products`
const productModel = require('./database/models/products.js').Product
const featureModel = require('./database/models/features.js').Feature
const relatedModel = require('./database/models/related.js').Related
const stylesAggedByProdModel = require('./database/models/stylesAggedByProd.js').StylesAggedByProd
const productDetailsModel = require('./database/models/productDetails.js').ProductDetail

//for reimport only
// const databaseHelpers = require('./database/schemas.js');

// app.listen(port, () => {
//   console.log(`Server is up on port ${port}`);
// })

const connectToDB = () => {
  mongoose.connect(dbURL)
  .then ((result) => {
    server = app.listen(port, () => {
      console.log(`DB is connect & server is listening on port ${port}`);
    })
  })
  .catch((err) => {
    console.error(err)
  })
}

connectToDB();

const closeServer = () => {
  server.close();
  mongoose.connection.close();
  console.log('closed the server and db!');
}


//style
//
app.get('*/styles', async (req, res) => {
  // console.log('inside styles route');
  try {
    let result = await stylesAggedByProdModel.find({product_id: parseInt(req.params[0].slice(10,req.params[0].length))}).lean();
    if (result.length === 0) {
      let result = {
        product_id: parseInt(req.params[0].slice(10,req.params[0].length)),
        results: []
      }
      res.status(200).send(result);
    } else {
      let skusObj = {};
      for (let i = 0; i < result[0].results.length; i++) {
        for (let j = 0; j < result[0].results[i].skus.length; j++) {
          skusObj[result[0].results[i].skus[j].sku_id.toString()] = result[0].results[i].skus[j]
        }
        result[0].results[i].skus = skusObj;
        skusObj = {}
      }
      res.status(200).send(result[0]);
    }
  } catch (err) {
    res.status(500).send(err)
  }

})

//products/product_id
//TO-DO - figure out how to separate these.
//also figure out how to use index instead of find
app.get('/products/*', async (req, res) => {
  // console.log(req.params);
  let productId = parseInt(req.params[0]);
  if (productId === undefined || isNaN(productId)) {
    // console.log('inside products route');
    //stand in for the framework i will eventually get to that includes listening to parameters.
    let result = await productModel.find({}).limit(5).lean();
    res.status(200).send(result);
  } else {
    // console.log('inside product detail route');
    let result = await productDetailsModel.find({product_id: productId}).lean();
    res.status(200).send(result[0]);
  }
})

//related
app.get('*/related', async (req, res) => {
  // console.log('related request recieved');
  try {
    let result = await relatedModel.find({product_id: parseInt(req.query.product_id)}).lean();
    res.status(200).send(result[0].relatedProducts);
  } catch (err) {
    res.status(500).send(err);
  }
})

module.exports = { connectToDB, closeServer};











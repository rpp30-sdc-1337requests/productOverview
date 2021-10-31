const express = require ('express');
const app = express();
const port = 3009;
const mongoose = require ('mongoose');
const dbURL = 'mongodb://localhost:27017/products';
const productModel = require('./database/models/products.js').Product
const featureModel = require('./database/models/features.js').Feature
const relatedModel = require('./database/models/related.js').Related
const stylesAggedByProdModel = require('./database/models/styles.js').StylesAggedByProd

//for reimport only
// const databaseHelpers = require('./database/schemas.js');

// app.listen(port, () => {
//   console.log(`Server is up on port ${port}`);
// })

mongoose.connect(dbURL)
.then ((result) => {
  app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  })
})
.catch((err) => {
  console.error(error)
})


//universal get
// app.get('/*', (req, res) => {
//   console.log('Received something from someone!!!');
// })
//style
//
app.get('*/styles', async (req, res) => {
  console.log('check for params');
  try {
    let result = await stylesAggedByProdModel.find({product_id: parseInt(req.params[0].slice(10,req.params[0].length))}).lean();
    if (result.length === 0) {
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
      console.log(result);
    }
  } catch (err) {
    res.status(500).send(err)
  }

})

//products/product_id
//TO-DO - figure out how to separate these.
//also figure out how to use index instead of find
app.get('/products/*', async (req, res) => {
  console.log(req.params);
  let productId = parseInt(req.params[0]);
  if (productId === undefined) {
    console.log('inside products route');
    //stand in for the framework i will eventually get to that includes listening to parameters.
    let result = await productModel.find({product_id: 1}).lean();
    res.status(200).send(result[0]);
  } else {
    Promise.all([
      productModel.find({product_id: productId}).lean(),
      featureModel.find({product_id: productId}).lean()
    ])
    .then ((data) => {
      let result = {};
      result['product_id'] = data[0][0].product_id;
      result['name'] = data[0][0].name;
      result['slogan'] = data[0][0].slogan;
      result['description'] = data[0][0].description;
      result['category'] = data[0][0].category;
      result['default_price'] = data[0][0].default_price;
      result['features'] = data[1][0].features;

      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    })
  }
})

//products
///need to make this its own route.
// app.get('/products', async (req, res) => {
//   console.log('inside products route');
//   //stand in for the framework i will eventually get to that includes listening to parameters.
//   let result = await productModel.find({product_id: 1}).lean();
//   res.status(200).send(result[0]);
// });

//related
//also needs indexing.
app.get('*/related', async (req, res) => {
  console.log('related request recieved');
  try {
    let result = await relatedModel.find({productId: req.query.product_id}).lean();
    res.status(200).send(result[0].relatedProducts);
  } catch (err) {
    res.status(500).send(err);
  }
})










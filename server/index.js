const express = require ('express');
const app = express();
const port = 3000;
const mongoose = require ('mongoose');
const dbURL = 'mongodb://localhost:27017/products';
const productModel = require('./database/models/products.js').Product
const featureModel = require('./database/models/features.js').Feature
const relatedModel = require('./database/models/related.js').Related
//for reimport only
// const databaseHelpers = require('./database/schemas.js');
//for reimport only
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


//products/product_id
//TO-DO - figure out how to separate these.
//also figure out how to use index instead of find
app.get('/products', async (req, res) => {
  console.log(req.params);
  if (req.query.product_id === undefined) {
    console.log('inside products route');
    //stand in for the framework i will eventually get to that includes listening to parameters.
    let result = await productModel.find({product_id: 1}).lean();
    res.status(200).send(result[0]);
  } else {
    Promise.all([
      productModel.find({product_id: req.query.product_id}).lean(),
      featureModel.find({product_id: req.query.product_id}).lean()
    ])
    .then ((data) => {
      let result = {
      };
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

//style
//
app.get('*/styles', (req, res) => {
///i need to aggregate the data together for this route, otherwise i'm gonna need like 19 different queries per request.....
})

//related
//also needs indexing.
app.get('*/related', async (req, res) => {
  let result = await relatedModel.find({productId: req.query.product_id}).lean();
  res.status(200).send(result[0].relatedProducts);
})










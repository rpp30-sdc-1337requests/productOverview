const express = require ('express');
const app = express();
const port = 3000;
const mongoose = require ('mongoose');


const databaseHelpers = require('./database/schemas.js');


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
})





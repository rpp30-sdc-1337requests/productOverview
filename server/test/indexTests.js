const expect = require('chai').expect;
const chai = require('chai');
const chaiHttp = require ('chai-http');
const serverURL = 'localhost:3009';
const connectToServer = require('../index.js');



//write a test for each of the routes in index that sends a request to the server, gets a response back
//and evaluates the response against the raw data. We'll start with related because it's easiest.
chai.use(chaiHttp);

before(function(done){
  // console.log(connectToServer);
  // connectToServer(done);
  // done();
  const waitForServer = () => {
    done();
  }
  setTimeout(waitForServer, 1500);
});
after( (done) => {
  console.log('finished testing!');
  connectToServer.closeServer();
  done();
})

describe('Related products', function () {

  describe('get related products', function () {
    it('should return the correct list of related products for a given product id', function(done) {
      chai.request(serverURL)
      .get('/related')
      .query({product_id: 1})
      .then((res) => {
        expect(res).to.have.status(200);
        console.log(res.body);
        expect(res.body).to.deep.equal([2,3,8,7])
        done();
      })
      .catch((err) => {
        throw err;
        done();
      })
    })
  })
})

describe('Products', function () {
  describe('General products route', function () {
    it ('should send back 5 products by default', function(done) {
      chai.request(serverURL)
      .get('/products/')
      .then((res) => {
        expect(res.body.length).to.equal(5);
        expect(res).to.have.status(200);
        done();
      })
      .catch((err) => {
        throw err;
        done()
      })
    })
  });

  describe('Product details route', function () {
    it ('should send back the correct details for the requested product', function (done) {
      chai.request(serverURL)
      .get('/products/1')
      .then((res) => {
        console.log(res.body.slogan);
        expect(res.body.slogan).to.equal('Blend in to your crowd');
        done();
      })
      .catch ((err) => {
        throw err;
        done();
      })
    })
    it ('should send back the correct features for the requested product', function (done) {
      chai.request(serverURL)
      .get('/products/1')
      .then ((res) => {
        expect(res.body.features.length).to.equal(2);
        expect(res.body.features[0].feature).to.equal('Fabric');
        expect(res.body.features[1].feature).to.equal('Buttons');
        done();
      })
      .catch ((err) => {
        throw err;
        done();
      })
    })
  })

  describe('Product styles route', function () {
    it ('should send back the correct styles for the requested product', function (done) {
      chai.request(serverURL)
      .get('/products/1/styles')
      .then ((res) => {
        expect(res.body.results.length).to.equal(6);
        done();
      })
      .catch ((err) => {
        throw err;
        done();
      })
    })
  })
})
const assert = require('chai').assert;
const indexTest = require('../server/index.js')

describe('Test dummy function in index', function () {
  it('should return hello', function () {
    assert.equal(indexTest.testDummyFunction(),'hello');
  })
})
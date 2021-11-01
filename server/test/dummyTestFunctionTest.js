const assert = require('chai').assert;
const indexTest = require('../dummyTest.js')

describe('Test dummy function in dummyTest file', function () {
  it('should return hello', function () {
    assert.equal(indexTest.testDummyFunction(),'hello');
  })
})
const { assert } = require('chai');

const { checkForEmail } = require('../helperFunctions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('checkForEmail', function() {
  it('should return a user with a valid email', function() {
    const user = checkForEmail("user@example.com", testUsers)
    const expectedOutput = "user@example.com";
    assert.equal(user.email, "user@example.com");
  });
});

describe('checkForEmail', function() {
  it('should return undefined when a non-valid email in inputted', function() {
    const user = checkForEmail("user@badexample.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, undefined);
  });
});
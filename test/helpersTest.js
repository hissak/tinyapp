const { assert } = require('chai');

const { getUserIDByEmail } = require('../helpers.js');

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

describe('getUserIDByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserIDByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });
  it('should return undefined if email cannot be found', function() {
    const user = getUserIDByEmail("user3@example.com", testUsers)
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });
});

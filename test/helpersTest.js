const { getUserObjByEmail } = require('../helpers');

const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserObjByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserObjByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });
  it('should return false if passed an email that does not belong to a user in the user database', () => {
    const user = getUserObjByEmail("example@user.com",testUsers);
    const expectedOutput = undefined;
    assert.equal(user,expectedOutput);
  });
  
});

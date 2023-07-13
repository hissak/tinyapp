const bcrypt = require("bcryptjs");

const getUserIDByEmail = function(email, database) {
  for (let user in database) {
    if (database[user]['email'] === email) {
      return user;
    }
  }
  return undefined;
};

const emailMatch = function(email, database) {
  for (let id in database) {
    if (database[id]['email'] === email) {
      return true;
    }
  }
  return null;
};

const passwordMatch = function(password, database) {
  for (let id in database) {
    if (bcrypt.compareSync(password, database[id]['password'])) {
      return true;
    }
  }
  return null;
};

module.exports = { getUserIDByEmail, emailMatch, passwordMatch }
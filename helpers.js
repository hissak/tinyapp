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

module.exports = { getUserIDByEmail, emailMatch }
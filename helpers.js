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

const urlsForUser = function(id, database) {
  let userURLs = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userURLs[shortURL] = database[shortURL].longURL;
    }
  }
  return userURLs;
};

const idMatch = function(id, database) {
  for (let key in database) {
    if (key === id) {
      return true;
    }
  }
  return null;
};

const generateRandomString = function(len) {
  const alphabetString = 'abcdefghijklmnopqrstuvwxyz';
  let randomArray = [];
  for (let i = 0; i < len; i++) {
    let randomIndex = Math.floor(Math.random() * (alphabetString.length - 1));
    randomArray.push(alphabetString[randomIndex]);
  }
  let randomURL = randomArray.join('');
  return randomURL;
};

module.exports = { getUserIDByEmail, emailMatch, passwordMatch, urlsForUser, idMatch, generateRandomString }
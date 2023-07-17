const bcrypt = require("bcryptjs");


//Returns user ID from user database, using email address as query
const getUserIDByEmail = function(email, database) {
  for (let user in database) {
    if (database[user]['email'] === email) {
      return database[user];
    }
  }
  return undefined;
};



//Returns a list of URLs that belong to the current user
const urlsForUser = function(id, database) {
  let userURLs = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userURLs[shortURL] = database[shortURL].longURL;
    }
  }
  return userURLs;
};


//Checks if short URL from client matches one in URLs database.
const idMatch = function(id, database) {
  for (let key in database) {
    if (key === id) {
      return true;
    }
  }
  return null;
};


//Generates a random string of specified length. For use in generating new short URLs and new User IDs.
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

module.exports = { getUserIDByEmail, urlsForUser, idMatch, generateRandomString };
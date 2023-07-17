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

//Boolean that returns true if current user owns a url (ie: userID and url.id match)
const userOwnsURL = function(id, userID) {
  const userID = req.session.userID;
  if (!userID || !urlDatabase[id] || urlDatabase[id]['userID'] !== userID) {
    return null;
  }
  return true
};

module.exports = { getUserIDByEmail, urlsForUser, generateRandomString, userOwnsURL };
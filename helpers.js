// Checks user cookie to confirm that user is logged in with a valid account.
const isValidUserLogin = function(user, database) {
  return !!database[user];
};

// Returns user from user database, using email address as query
const getUserByEmail = function(email, database) {
  for (const userID in database) {
    if (database[userID]['email'] === email) {
      return database[userID];
    }
  }
};

// Returns a list of URLs that belong to the current user
const urlsForUser = function(id, database) {
  let userURLs = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userURLs[shortURL] = database[shortURL].longURL;
    }
  }
  return userURLs;
};

// Generates a random string of specified length. For use in generating new short URLs and new User IDs.
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

// Checks if i) user is logged in ii) URL exists in database and iii) user owns URL. Returns appropriate message and status code as an object
// if any error case is run, otherwise remains undefined.
const getError = function(userID, urlDatabase, shortURL) {
  if (!userID) {
    return { message: "You must be logged in to view URLs!", status: 403 };
  }

  if (!urlDatabase.hasOwnProperty(shortURL)) {
    return { message: "URL not found!", status: 404 };
  }

  if (urlDatabase[shortURL].userID !== userID) {
    return { message: "Not authorized to view or modify URL!", status: 403 };
  }
};

module.exports = { isValidUserLogin, getUserByEmail, urlsForUser, generateRandomString, getError };

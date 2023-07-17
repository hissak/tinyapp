const bcrypt = require("bcryptjs");

//Database used to store information on shortened URLs
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};
  
//Database used to store information on all registered users.
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("hola", 10),
  }
};

module.exports = { urlDatabase, users };
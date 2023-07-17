// Dependencies
const express = require("express");

const app = express();

const PORT = 8080;

const bcrypt = require("bcryptjs");

const cookieSession = require('cookie-session');

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['secretcookie'],
}));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Functions from helpers.js
const { validUserLogin, getUserIDByEmail, urlsForUser, generateRandomString, userOwnsURL } = require('./helpers');

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



// HOMEPAGE

// GET request to access homepage. Will redrect to /urls if logged in, otherwise will redirect to login page.
app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (!validUserLogin(userID, users)) {
    return res.redirect('/login');
  } else {
    return res.redirect('/urls');
  }
});



// USER REGISTRATION

// GET request to access registration page. If already logged in, redirects to /urls
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userID: req.session.userID
  };
  const userID = templateVars.userID;
  if (validUserLogin(userID, users)) {
    return res.redirect('/urls');
  } else {
    return res.render('register', templateVars);
  }
});

//POST request generate new account, after verifying that all fields have been field, and email is not already in use.
app.post("/register", (req, res) => {
  const newID = generateRandomString(6);
  const email = req.body['email'];
  const password = req.body['password'];
  if (!email || !password) {
    return res.status(400).send('Email/Password field cannot be blank!');
  }
  if (!getUserIDByEmail(email, users)) {
    users[newID] = {
      id: newID,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
    req.session.userID = newID;
    return res.redirect('/urls');
  } else {
    return res.status(400).send('Email already in use!');
  }
});



//USER LOGIN & LOGOUT

//GET request to access login page. If already logged in, redirects to /urls
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userID: req.session.userID
  };
  const userID = templateVars.userID;
  if (validUserLogin(userID, users)) {
    return res.redirect('/urls');
  } else {
    return res.render('login', templateVars);
  }
});

//POST request to login and create new session. Verifies that login info is correct.
app.post("/login", (req, res) => {
  const formEmail = req.body['email'];
  const formPassword = req.body['password'];
  const user = getUserIDByEmail(formEmail, users);
  if (user && bcrypt.compareSync(formPassword, user.password)) {
    req.session.userID = user.id;
    return res.redirect('/urls');
  } else {
    return res.status(403).send('Email or Password incorrect!');
  }
});

//POST request for logout. Clears session.
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect('/login');
});



// URL GENERATOR

// GET request to access short URL generator only when logged in
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, users: users, userID: req.session.userID };
  const userID = templateVars.userID;
  if (!validUserLogin(userID, users)) {
    return res.redirect('/login');
  }
  return res.render("urls_new", templateVars);
});

// POST request to generate new short URL. Verifies that user is logged in before generating anything.
app.post("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userID: req.session.userID
  };
  const userID = templateVars.userID;
  if (!validUserLogin(userID, users)) {
    return res.status(403).send('Must be logged in to shorten URLs');
  }
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    'longURL': longURL,
    'userID': userID
  };
  return res.redirect(`/urls/${shortURL}`);
});



//URLS INDEX

// GET request to access /URLs only if logged in.
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userID: req.session.userID
  };
  const userID = templateVars.userID;
  if (!validUserLogin(userID, users)) {
    return res.status(403).send('Must be logged in to view URLs');
  }
  const userURLs = urlsForUser(userID, urlDatabase);
  templateVars.urls = userURLs;
  return res.render("urls_index", templateVars);
});

// GET request to view details of short URLs. Verifies that the URL exists and belongs to user before displaying.
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userID: req.session.userID,
    users: users
  };
  if (!urlDatabase.hasOwnProperty(`${templateVars.id}`)) {
    return res.status(404).send('URL not found!');
  }
  const id = templateVars.id;
  const userID = templateVars.userID;
  if (userOwnsURL(id, userID, urlDatabase)) {
    return res.render("urls_show", templateVars);
  } else {
    return res.status(403).send('Not authorized view URL!');
  }
});

//GET request to access long URL via the short URL. Does not require user to be logged in. Verifies that short URL exists.
app.get("/u/:id", (req, res) => {
  if (!urlDatabase.hasOwnProperty(`${req.params.id}`)) {
    return res.status(404).send('URL not found!');
  }
  const longURL = urlDatabase[req.params.id].longURL;
  return res.redirect(longURL);
});



// DELETING URLS

// POST request to delete URL from database. Verifies that logged in user owns the URL before deleting.
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.session.userID;
  if (userOwnsURL(id, userID, urlDatabase)) {
    delete urlDatabase[id];
    res.redirect('/urls');
  } else {
    return res.status(403).send('Not authorized to delete URLs!');
  }
});



//EDITING URLS

// POST request to update long URL for a specific short URL. Verifies that logged in user owns the URL before making changes.
app.post("/urls/:id", (req, res) => {
  const id = req.params['id'];
  const newURL = req.body.longURL;
  const userID = req.session.userID;
  if (userOwnsURL(id, userID, urlDatabase)) {
    urlDatabase[id].longURL = newURL;
    return res.redirect('/urls');
  } else {
    return res.status(403).send('Not authorized to view or edit this URL!');
  }
});








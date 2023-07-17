const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const {
  isValidUserLogin,
  getUserByEmail,
  urlsForUser,
  generateRandomString,
  getError
} = require('./helpers');
const { urlDatabase, users } = require('./database');

const app = express();

const PORT = 8080;

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['secretcookie'],
}));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// HOMEPAGE

// GET request to access homepage. Will redrect to /urls if logged in, otherwise will redirect to login page.
app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (isValidUserLogin(userID, users)) {
    return res.redirect('/urls');
  }

  return res.redirect('/login');
});

// USER REGISTRATION

// GET request to access registration page. If already logged in, redirects to /urls
app.get("/register", (req, res) => {
  const userID = req.session.userID;
  if (isValidUserLogin(userID, users)) {
    return res.redirect('/urls');
  }

  const templateVars = {
    urls: urlDatabase,
    users,
    userID
  };

  return res.render('register', templateVars);

});

//POST request generate new account, after verifying that all fields have been field, and email is not already in use.
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Email/Password field cannot be blank!');
  }

  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send('Email already in use!');
  }

  const newID = generateRandomString(6);

  users[newID] = {
    id: newID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.userID = newID;
  return res.redirect('/urls');
});



//USER LOGIN & LOGOUT

//GET request to access login page. If already logged in, redirects to /urls
app.get("/login", (req, res) => {
  const userID = req.session.userID;
  if (isValidUserLogin(userID, users)) {
    return res.redirect('/urls');
  }
  const templateVars = {
    urls: urlDatabase,
    users,
    userID
  };
  return res.render('login', templateVars);
});

//POST request to login and create new session. Verifies that login info is correct.
app.post("/login", (req, res) => {
  const formEmail = req.body.email;
  const formPassword = req.body.password;

  if (!formEmail || !formPassword) {
    return res.status(400).send('Email/Password field cannot be blank!');
  }

  const user = getUserByEmail(formEmail, users);
  if (user && bcrypt.compareSync(formPassword, user.password)) {
    req.session.userID = user.id;
    return res.redirect('/urls');
  }

  return res.status(403).send('Email or Password incorrect!');
});

//POST request for logout. Clears session.
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect('/login');
});

// URL GENERATOR

// GET request to access short URL generator only when logged in
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!isValidUserLogin(userID, users)) {
    return res.redirect('/login');
  }
  const templateVars = {
    urls: urlDatabase,
    users,
    userID
  };
  return res.render("urls_new", templateVars);
});

// POST request to generate new short URL. Verifies that user is logged in before generating anything.
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!isValidUserLogin(userID, users)) {
    return res.status(403).send('Must be logged in to shorten URLs');
  }
  
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  return res.redirect(`/urls/${shortURL}`);
});

//URLS INDEX

// GET request to access /URLs only if logged in.
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!isValidUserLogin(userID, users)) {
    return res.status(403).send('Must be logged in to view URLs');
  }

  const templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    users,
    userID,
  };
  
  return res.render("urls_index", templateVars);
});

// GET request to view details of short URLs. Verifies that the URL exists and belongs to user before displaying.
app.get("/urls/:id", (req, res) => {
  const error = getError(req.session.userID, urlDatabase, req.params.id);

  if (error) {
    return res.status(error.status).send(error.message);
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userID: req.session.userID,
    users
  };
  
  return res.render("urls_show", templateVars);
});

//GET request to access long URL via the short URL. Does not require user to be logged in. Verifies that short URL exists.
app.get("/u/:id", (req, res) => {
  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    return res.status(404).send('URL not found!');
  }
  const longURL = urlDatabase[req.params.id].longURL;
  return res.redirect(longURL);
});


// DELETING URLS

// POST request to delete URL from database. Verifies that logged in user owns the URL before deleting.
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const error = getError(req.session.userID, urlDatabase, id);

  if (error) {
    return res.status(error.status).send(error.message);
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});

//EDITING URLS

// POST request to update long URL for a specific short URL. Verifies that logged in user owns the URL before making changes.
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const error = getError(req.session.userID, urlDatabase, id);

  if (error) {
    return res.status(error.status).send(error.message);
  }

  urlDatabase[id].longURL = req.body.longURL;
  return res.redirect('/urls');
});

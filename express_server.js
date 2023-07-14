const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session')
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secretcookie'],
}));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
// password1 added to test password hashing and login.
const password1 = bcrypt.hashSync("purple-monkey-dinosaur", 10);
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: password1,
  }
};

const { getUserIDByEmail, emailMatch, passwordMatch, urlsForUser, idMatch, generateRandomString } = require('./helpers');

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.session.user_id
  };
  if (!templateVars.user_id) {
    res.status(403);
    return res.send('Must be logged in to view URLs');
  }
  console.log('cookies ===> ', req.session);
  console.log('users ===> ', users);
  console.log('URLs ===> ', urlDatabase);
  const userURLs = urlsForUser(templateVars.user_id, urlDatabase);
  templateVars.urls = userURLs;
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  const userID = req.session.user_ID;
  if(!userID) {
    return res.redirect('/login');
  } else {
    return res.redirect ('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, users: users, user_id: req.session.user_id };
  if (!templateVars.user_id) {
    return res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

app.post("/login", (req, res) => {
  console.log(req.body);
  const formEmail = req.body['email'];
  const formPassword = req.body['password'];
  if (emailMatch(formEmail, users) && passwordMatch(formPassword, users)) {
    const user_id = getUserIDByEmail(formEmail, users);
    req.session.user_id = user_id;
    res.redirect('/urls');
  } else {
    res.status(403);
    res.send('Email or Password incorrect!');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;
  if (!urlDatabase[id]) {
    res.status(404);
    return res.send('Shortened URL does not exist!');
  }
  if (!user_id) {
    res.status(403);
    return res.send('Must be logged in to delete URLs!');
  }
  if (urlDatabase[id]['userID'] !== user_id) {
    res.status(403);
    return res.send('Not authorized to delete this URL!');
  } else {
    delete urlDatabase[id];
    console.log(urlDatabase);
    res.redirect('/urls');
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params['id'];
  const newURL = req.body.longURL;
  const user_id = req.session.user_id;
  console.log('User ID cookie ====> ', user_id);
  console.log('User ID database ==> ', id);
  if (!urlDatabase[id]) {
    res.status(404);
    return res.send('Shortened URL does not exist!');
  }
  if (!user_id) {
    res.status(403);
    return res.send('Must be logged in to update URLs!');
  }
  if (urlDatabase[id]['userID'] !== user_id) {
    res.status(403);
    return res.send('Not authorized to update this URL!');
  } else {
    console.log('database before:', urlDatabase);
    urlDatabase[id].longURL = newURL;
    console.log('database after: ', urlDatabase);
    res.redirect('/urls');
  }
});

app.get("/urls/:id", (req, res) => {
  if(!idMatch(req.params.id, urlDatabase)) {
    res.status(404);
    return res.send('URL not found!');
  };
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user_id: req.session.user_id,
    users: users
  };
  console.log('User ID cookie ====> ', templateVars.user_id);
  console.log('User ID database ==> ', templateVars.id);
  if (!templateVars.user_id) {
    res.status(403);
    return res.send('Must be logged in to view URL.');
  }
  const id = req.params.id;
  if (urlDatabase[id].userID !== templateVars.user_id) {
    console.log('test', urlDatabase[id].userID, templateVars.user_id, urlDatabase)
    res.status(403);
    return res.send('Not authorized to view this URL!');
  }
  console.log('url database ==> ', urlDatabase);
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.session.user_id
  };
  if (!templateVars.user_id) {
    console.log('URLs if logged out ===> ', urlDatabase);
    res.status(403);
    return res.send('Must be logged in to shorten URLs');
  }
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    'longURL': longURL,
    'userID': templateVars['user_id']
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  if (!idMatch(req.params.id, urlDatabase)) {
    res.status(404);
    return res.send('URL not found!');
  }
  const longURL = urlDatabase[req.params.id].longURL;
  return res.redirect(longURL);
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const newID = generateRandomString(6);
  const email = req.body['email'];
  const password = req.body['password'];
  if (!email || !password) {
    res.status(400);
    console.log('Users after failure ====> ', users);
    return res.send('Email/Password field cannot be blank!');
  }
  if (!emailMatch(email, users)) {
    users[newID] = {
      id: newID,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
    req.session.user_id = newID;
    res.redirect('/urls');
  } else {
    res.status(400);
    console.log('Users after failure ====> ', users);
    return res.send('Email already in use!');
  }
});

// Stops registration if user is already logged in.
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.session.user_id
  };
  if (templateVars.user_id) {
    return res.redirect('/urls');
  }
  if (!templateVars.user_id) {
    res.render('register', templateVars);
  } else {
    res.send(`You are already logged in as ${templateVars.user_id}!`);
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.session.user_id
  };
  if (templateVars.user_id) {
    return res.redirect('/urls');
  }
  if (!templateVars.user_id) {
    res.render('login', templateVars);
  } else {
    res.send(`You are already logged in as ${templateVars.user_id}!`);
  }
});




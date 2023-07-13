const express = require("express");
const app = express();
const PORT = 8080;

const cookieParser = require('cookie-parser')

app.use(express.urlencoded({ extended: true }));

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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const emailMatch = function(email) {
  for (let id in users) {
    if (users[id]['email'] === email) {
      return true;
    }
  }
  return null;
}
const passwordMatch = function(password) {
  for (let id in users) {
    if (users[id]['password'] === password) {
      return true;
    }
  }
  return null;
}

const getUserID = function(email) {
  for (id in users) {
    if (users[id]['email'] === email) {
      return id;
    }
  }
  return null;
}

const idMatch = function(id) {
  for (let key in urlDatabase) {
    if (key === id) {
      return true;
    }
  }
  return null;
}

app.use(cookieParser());

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, users: users, user_id: req.cookies['user_id'] };
  console.log('cookies ===> ', req.cookies);
  console.log('users ===> ', users)

  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
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
  const templateVars = { urls: urlDatabase, users: users, user_id: req.cookies['user_id'] };
  if (!templateVars.user_id) {
    return res.redirect('/login')
  };
  res.render("urls_new", templateVars);
});

app.post("/login", (req, res) => {
  console.log(req.body);
  const formEmail = req.body['email'];
  const formPassword = req.body['password'];
  if (emailMatch(formEmail) && passwordMatch(formPassword)) {
    const user_id = getUserID(formEmail);
    res.cookie('user_id', user_id);
    res.redirect('/urls');
  } else {
    res.status(403);
    res.send('Email or Password incorrect!');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login')
});


app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  console.log('id: ', id)
  delete urlDatabase[id];
  console.log(urlDatabase);
  res.redirect('/urls')
});

app.post("/urls/:id/update", (req, res) => {
  const { id } = req.params;
  console.log('id: ', id)
  console.log('req.body: ',req.body);
  const newURL = req.body.longURL
  console.log('database before:', urlDatabase)
  urlDatabase[id] = newURL
  console.log('database after: ', urlDatabase);
  res.redirect('/urls')
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL, 
    user_id: req.cookies['user_id'],
    users: users
  };

  res.render("urls_show", templateVars);
});

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

app.post("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.cookies['user_id']
  };
  if (!templateVars.user_id) {
    console.log('URLs if logged out ===> ', urlDatabase);
    res.status(403);
    return res.send('Must be logged in to shorten URLs')
  };
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!idMatch(req.params.id)) {
    res.status(404);
    return res.send('URL not found!');
  };
  res.redirect(longURL);
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const newID = generateRandomString(6)
  const email = req.body['email'];
  const password = req.body['password'];
  if (!email || !password) {
    res.status(400);
    console.log('Users after failure ====> ', users);
    return res.send('Email/Password field cannot be blank!');
  };
  if(!emailMatch(email)) {
  users[newID] = {};
  users[newID]['id'] = newID;
  users[newID]['email'] = email;
  users[newID]['password'] = password;
  console.log('users ===>  ', users);
  res.clearCookie('user_id');
  res.cookie('user_id', users[newID].id);
  res.redirect('/urls');
  } else {
    res.status(400);
    console.log('Users after failure ====> ', users)
    return res.send('Email already in use!');
  };
});

// Stops registration if user is already logged in.
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.cookies['user_id']
  };
  if (templateVars.user_id) {
    return res.redirect('/urls');
  };
  if (!templateVars.user_id) {
    res.render('register', templateVars);
  } else {
    res.send(`You are already logged in as ${templateVars.user_id}!`)
  };
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.cookies['user_id']
  };
  if (templateVars.user_id) {
    return res.redirect('/urls');
  };
  if (!templateVars.user_id) {
    res.render('login', templateVars);
  } else {
    res.send(`You are already logged in as ${templateVars.user_id}!`)
  };
});




const express = require("express");
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]/* What goes here? */ };
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
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});



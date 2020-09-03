const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

function generateRandomString() {
  const char= [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
               'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
               'G', 'H', 'I', 'J','K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

  let output = '';
  for (let i = 0; i < 6; i++) {
    output += char[Math.round(Math.random()*61)];
  };
  return output;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// USERS DATABASE
const users = {
  zPOKQU: { id: 'zPOKQU',
    email: 'a@a.com',
    password: '1241245' },
}

//Check for E-mail Function Based on User Input
const checkForEmail = (input) => {
  for (const userID in users) {
    if (users[userID].email === input) {
      return input;
    }
  }
  return false;
}

console.log(checkForEmail('a@a.com'))

//URL DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//HOMEPAGE
app.get('/', (req, res) => {
  res.send('Hello!');
});

//URLS TABLE
app.get('/urls', (req, res) => {
  const templateVars = {
    username: users[req.cookies['User_ID']],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
})

//JSON OBJECT
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//NEW URL CREATION PAGE
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: users[req.cookies['User_ID']],
  };
  res.render("urls_new", templateVars);
});

//REGISTRATION PAGE
app.get("/urls/register", (req, res) => {
  let templateVars = {
    username: users[req.cookies['User_ID']], 
  };
  res.render("urls_register", templateVars);
});

//LOGIN PAGE
app.get("/urls/login", (req, res) => {
  let templateVars = {
    username: users[req.cookies['User_ID']], 
  };
  res.render("urls_login", templateVars);
});

//REGISTRATION HANDLER
app.post('/urls/register', (req, res) => {
  const userID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('No Blanks Please!');
  } else if (checkForEmail(req.body.email) === false){
    users[userID] = {
      id: userID, 
      email: req.body.email, 
      password: req.body.password
    }
    res.cookie('User_ID', userID);
    res.redirect('/urls/login');
  } else {
    return res.status(400).send('e-mail already in use!');
  }
});

//GENERATE NEW SHORTURL / REDIRECT TO SHORT URL PAGE
app.post("/urls", (req, res) => {
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = req.body.longURL;
  res.redirect(`/urls/${randomShortURL}`);
});

// DELETE
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]; 
  res.redirect('/urls');
});

//Edit form Submission/Redirect
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls');
});

//Setting Cookie & Login Functionality
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

//Logout Functionality
app.post('/logout', (req, res) => {
  res.clearCookie('User_ID');
  res.redirect('/urls');
});

//SHORT URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    username: users[req.cookies['User_ID']],
  };
  res.render("urls_show", templateVars);
});

//REDIRECT PATH
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


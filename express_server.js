const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const generateRandomString = require('./stringGenerator')

//MIDDLEWARE
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// USERS DATABASE
const users = {
  aJ48lW: { id: "aJ48lW",
    email: 'a@a',
    password: '123' },
  
  bJ48lW: { id: "bJ48lW",
    email: 'a@b',
    password: '123' },
  
}
/*OLD URL DATABASE FORMAT 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
*/

//URL DATABASE
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "bJ48lW" }
};

/************   Functions   **************/
const checkForEmail = (input) => {
  for (const userID in users) {
    if (users[userID].email === input) {
      return users[userID];
    }
  }
  return false;
}

const urlsForUser = (id) => {
  userUrls = [];
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls.push(url);
    }
  }
  return userUrls;
} 
/*****************************************/

//HOMEPAGE
app.get('/', (req, res) => {
  res.send('Hello! You found my Home! Are you a stalker? ... I am scared ...');
});

//URLS TABLE
app.get('/urls', (req, res) => {
  const templateVars = {
    username: users[req.cookies['User_ID']],
    usernameID: req.cookies['User_ID'], 
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
  if (req.cookies.User_ID === undefined) {
    return res.redirect('/urls/login')
  }
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
    res.redirect('/urls/login');
  } else {
    return res.status(400).send('e-mail already in use!');
  }
});

//LOGIN HANDLER
app.post('/urls/login', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('No Blanks Please!');
  } 
  let user = ''
  if (checkForEmail(req.body.email)) {
    user = checkForEmail(req.body.email);
    if (req.body.password === user.password) {
      res.cookie('User_ID', user.id);
      res.redirect('/urls');
    } else {
      return res.status(403).send('Is your name Balrog? Gandalf Stopped You! (Login Info Incorrect!)');
    }
  } else {
    return res.status(403).send('Is your name Balrog? Gandalf Stopped You! (Login Info Incorrect!)');
  }
});

//GENERATE NEW SHORTURL / REDIRECT TO SHORT URL PAGE
app.post("/urls/", (req, res) => {
  if (req.cookies.User_ID === undefined) {
    return res.redirect('/urls/login')
  }
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = {longURL:'', userID: req.cookies.User_ID}
  urlDatabase[randomShortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${randomShortURL}`);
});

// DELETE
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies.User_ID === undefined) {
    return res.redirect('/urls/login');
  } else {
    let userUrls = urlsForUser(req.cookies.User_ID);
    for (url of userUrls) {
      if (url === req.params.shortURL) {
        const shortURL = req.params.shortURL;
        delete urlDatabase[shortURL]; 
        return res.redirect('/urls');
      }
    }
  }
  return res.status(403).send('That URL does not belong to you! SHAME ON YOU!');
});

//Edit form Submission/Redirect
app.post('/urls/:shortURL', (req, res) => {
  if (req.cookies.User_ID === undefined) {
    return res.redirect('/urls/login');
  } else {
    let userUrls = urlsForUser(req.cookies.User_ID);
    for (url of userUrls) {
      if (url === req.params.shortURL) {
        const shortURL = req.params.shortURL;
        urlDatabase[shortURL].longURL = req.body.newURL;
        return res.redirect('/urls');
      }
    }
  }
  return res.status(403).send('That URL does not belong to you! SHAME ON YOU!'); 
});

//Logout Functionality
app.post('/logout', (req, res) => {
  res.clearCookie('User_ID');
  res.redirect('/urls');
});

//SHORT URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies.User_ID === undefined) {
    return res.redirect('/urls/login');
  } else {
    let userUrls = urlsForUser(req.cookies.User_ID);
    for (url of userUrls) {
      if (url === req.params.shortURL) {
        let templateVars = { 
          shortURL: req.params.shortURL, 
          longURL: urlDatabase[req.params.shortURL], 
          username: users[req.cookies['User_ID']],
        };
        return res.render("urls_show", templateVars);
      }
    }  
  }
  return res.status(403).send('That URL does not belong to you! SHAME ON YOU!');
});

//REDIRECT PATH
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


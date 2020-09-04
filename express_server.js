const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const {generateRandomString, checkForEmail, urlsForUser} = require('./helperFunctions');

//MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key"],
  })
);
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// USERS DATABASE
const users = {
  //Users for Testing Purposes
  aJ48lW: { id: "aJ48lW", email: "a@a", password: bcrypt.hashSync("123", 10) },

  bJ48lW: { id: "bJ48lW", email: "a@b", password: bcrypt.hashSync("123", 10) },
};

//URL DATABASE
const urlDatabase = {
  //URLs for Testing Purposes
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "bJ48lW" },
};

//HOMEPAGE
app.get("/", (req, res) => {
  res.send("Hello! You found my Home! Are you a stalker? ... I am scared ...");
});

//URLS TABLE
app.get("/urls", (req, res) => {
  const templateVars = {
    username: users[req.session["user_id"]],
    usernameID: req.session["user_id"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//JSON OBJECT
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//NEW URL CREATION PAGE
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect("/urls/login");
  }
  let templateVars = {
    username: users[req.session["user_id"]],
  };
  res.render("urls_new", templateVars);
});

//REGISTRATION PAGE
app.get("/urls/register", (req, res) => {
  let templateVars = {
    username: users[req.session["user_id"]],
  };
  res.render("urls_register", templateVars);
});

//LOGIN PAGE
app.get("/urls/login", (req, res) => {
  let templateVars = {
    username: users[req.session["user_id"]],
  };
  res.render("urls_login", templateVars);
});

//REGISTRATION HANDLER
app.post("/urls/register", (req, res) => {
  const userID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("No Blanks Please!");
  } 
  const user = checkForEmail(req.body.email, users);
  if (user === undefined) {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
    };
    res.redirect("/urls/login");
  } else {
    return res.status(400).send("Yoda: In use that E-mail already is!");
  }
});

//LOGIN HANDLER
app.post("/urls/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("No Blanks Please!");
  }
  const user = checkForEmail(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      return res
        .status(403)
        .send(
          "Is your name Balrog? Gandalf Stopped You! (Login Info Incorrect!)"
        );
    }
  } else {
    return res
      .status(403)
      .send(
        "Is your name Balrog? Gandalf Stopped You! (Login Info Incorrect!)"
      );
  }
});

//GENERATE NEW SHORTURL / REDIRECT TO SHORT URL PAGE
app.post("/urls/", (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect("/urls/login");
  }
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = { longURL: "", userID: req.session.user_id };
  urlDatabase[randomShortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${randomShortURL}`);
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect("/urls/login");
  } else {
    let userUrls = urlsForUser(req.session.user_id, urlDatabase);
    for (url of userUrls) {
      if (url === req.params.shortURL) {
        const shortURL = req.params.shortURL;
        delete urlDatabase[shortURL];
        return res.redirect("/urls");
      }
    }
  }
  return res.status(403).send("That URL does not belong to you! SHAME ON YOU!");
});

//Edit form Submission/Redirect
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect("/urls/login");
  } else {
    let userUrls = urlsForUser(req.session.user_id, urlDatabase);
    for (url of userUrls) {
      if (url === req.params.shortURL) {
        const shortURL = req.params.shortURL;
        urlDatabase[shortURL].longURL = req.body.newURL;
        return res.redirect("/urls");
      }
    }
  }
  return res.status(403).send("That URL does not belong to you! SHAME ON YOU!");
});

//Logout Functionality
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//SHORT URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect("/urls/login");
  } else {
    let userUrls = urlsForUser(req.session.user_id, urlDatabase);
    for (url of userUrls) {
      if (url === req.params.shortURL) {
        let templateVars = {
          shortURL: req.params.shortURL,
          longURL: urlDatabase[req.params.shortURL],
          username: users[req.session["user_id"]],
        };
        return res.render("urls_show", templateVars);
      }
    }
  }
  return res.status(403).send("That URL does not belong to you! SHAME ON YOU!");
});

//REDIRECT PATH
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

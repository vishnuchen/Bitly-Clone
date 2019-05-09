var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

app.set("view engine", "ejs")

app.use(cookieParser())

app.use(bodyParser.urlencoded({extended: true}));


function generateRandomString() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {username: req.cookies.username});
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase , username: req.cookies.username};
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] , username: req.cookies.username };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Welcome to My APP :)");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.post("/urls", (req, res) => {
  console.log(typeof(generateRandomString()))
  let shortURL = generateRandomString()
  console.log(req.body.longURL);  // Log the POST request body to the console
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("Deleted links =" +req.params.shortURL+":" +urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  var shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect(`/urls`);
});

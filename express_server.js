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


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "u", 
    password: "p"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function lookupHelper (email) {
  for (var user in users) {
    console.log("User test", users[user].email);
    if (email === users[user].email){
      return true;
    }
  }
}

function urlsForUser(id) {
  let uniqueDataLink = {};
  for (var UniqueId in urlDatabase) {
    if (urlDatabase[UniqueId].userID === id){
      //console.log("longUrl", urlDatabase[UniqueId].longURL);
      uniqueDataLink[UniqueId] = urlDatabase[UniqueId].longURL;
    }
  }
  return uniqueDataLink;
}




app.get("/urls/new", (req, res) => {
  //console.log("This is the cookie", req.cookies.user_id);
  if (req.cookies.user_id){
    res.render("urls_new", {userID: "", email: ""});
  } else {
    res.render("login", {userID: "", email: ""});
  }
});

app.get("/urls", (req, res) => { 

  let email;
  let uniqueshortLong = urlsForUser(req.cookies.user_id);
  if (req.cookies.user_id && req.cookies.user_id in users) {
    email = users[req.cookies.user_id].email;
  } else {
    email = "";
  }
  let templateVars = { urls: uniqueshortLong, userID: req.cookies.user_id , email: email};
  res.render("urls_index", templateVars);
  });

app.get("/urls/:shortURL", (req, res) => {
  let email;
  if (req.cookies.user_id && req.cookies.user_id in users) {
    email = users[req.cookies.user_id].email;
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] , userID: req.cookies.user_id, email: email};
    res.render("urls_show", templateVars);
  } else {
    email = "";
    res.send("Login to access the URL");
  }
  
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Welcome to My APP :)");
});

app.get("/register", (req, res) => {
   res.render("registration", {userID: "", email: ""});
});

app.get("/login", (req, res) => {
  res.render("login", {userID: "", email: ""});
  });

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    //console.log("400 status");
    res.status(400).send("Username or Password is empty!");
  } else if (lookupHelper(req.body.email)){
    res.status(400).send("Username already exists. Try another.");
  } else {
    const newId = generateRandomString();
    users[newId] = {
      'id' : newId,
      'email' : req.body.email,
      'password' : req.body.password }
      res.cookie('user_id', newId)
      res.redirect(`/urls`);
  }
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.post("/urls", (req, res) => {
  // console.log(typeof(generateRandomString()))
  let shortURL = generateRandomString()
  // console.log(req.body.longURL);  // Log the POST request body to the console
  urlDatabase[shortURL] = {longURL:req.body.longURL, userID:req.cookies.user_id};
  // console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
 if (req.cookies.user_id && req.cookies.user_id in users) {
  //console.log("Deleted links =" +req.params.shortURL+":" +urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
  }
});

app.post("/urls/:id", (req, res) => {
  if (req.cookies.user_id && req.cookies.user_id in users) {
    var shortURL = req.params.id;
    //console.log("changes",req.body.longURL)
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  }
});

app.post("/login", (req, res) => {
  // first : check in the database for user and pass
  const email = req.body.email
  const pswd =  req.body.password
  let loggedUser;
  for (var userID in users) {
    let user = users[userID]
    console.log(user);
    if (user.email === email && user.password === pswd) {
      loggedUser = user;
    }
   } 
   if (loggedUser === undefined) {
    res.status(400).send('Bad Request');
    return;
   } else {
    res.cookie("user_id", loggedUser.id)
    res.redirect('/urls');
   }
  
  // if user and pass exist: set a cookie and send to the browser

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect(`/urls`);
});

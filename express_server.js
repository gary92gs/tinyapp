const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs'); //ejs needs to be installed to reference to it (note it is not 'required' above)

const urlDatabases = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

};

//MIDDLEWARE BELOW//

app.use(express.urlencoded({ extended: true })); //this decodes the posted data before it reaches the server (ie. buffer => text)
app.use(cookieParser());

//ROUTES BELOW//

//for READING Create New URL Page
app.get('/urls/new', (request, response) => {
  const templateVars = {
    username: request.cookies["username"]
  };
  response.render('urls_new', templateVars);
});

//for READING MyURLs page - listing all urls in database
app.get('/urls', (request, response) => {
  const templateVars = {
    urls: urlDatabases,
    username: request.cookies["username"]
  };
  response.render('urls_index', templateVars);
});

//for DELETING individual shortURLs
app.post('/urls/:id/delete', (request, response) => {
  const key = request.params.id; //where is this coming from? (if found it, but I don't understand why I have access to it)
  delete urlDatabases[key];
  response.redirect('/urls'); //return page listing all urls
});

//for UPDATING individual shortURLs
app.post('/urls/:id/update', (request, response) => {
  const newURL = request.body.updatedURL;
  const key = request.params.id;
  urlDatabases[key] = newURL;
  response.redirect('/urls');
});

//for READING Inividual shortURLs
app.get('/urls/:id', (request, response) => {
  const templateVars = {
    id: request.params.id,
    longURL: urlDatabases[request.params.id],
    username: request.cookies["username"]
  };
  response.render('urls_show', templateVars);
});

//for CREATING new links
app.post('/urls', (request, response) => {
  const shortID = generateRandomString(request.body.longURL);
  urlDatabases[shortID] = request.body.longURL; //creates new link
  response.redirect(`/urls/${shortID}`); //then navigates to newly created link
});


//for READING original link of website from individual shortURL page
app.get('/u/:id', (request, response) => {
  response.redirect(`${urlDatabases[request.params.id]}`);
});

//for READING registration page
app.get('/register', (request, response) => {
  const templateVars = {
    username: request.cookies['username']
  };
  response.render('register', templateVars);
});

//for REGISTERING NEW USER (CREATE)
app.post('/register', (request, response) => {
  const id = generateRandomString();
  const email = request.body.email;
  const password = request.body.password;

  users[id] = {
    id,
    email,
    password
  }
  response.cookie('id',id).redirect('/urls');
});

//for LOGGING IN (CREATE)
app.post('/login', (request, response) => {
  const username = request.body.username;
  response.cookie('username', username).redirect('/urls');
});

//for LOGGING OUT (DELETE)
app.post('/logout', (request, response) => {
  const username = request.cookies.username;
  response.clearCookie('username').redirect('/urls');
});

app.get('/', (request, response) => {
  response.send('Hello!');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  let shortURL = '';
  const charMin = 48;
  const charSpan = 122 - charMin;
  const noChar = [58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96];

  while (shortURL.length < 6) {
    let randChar = charMin + Math.round(charSpan * Math.random());
    if (noChar.includes(randChar)) {
      continue;
    }
    shortURL += String.fromCharCode(randChar);
  }
  return shortURL;
};
const express = require('express');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const helpers = require('./helpers');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs'); //ejs needs to be installed to reference to it (note it is not 'required' above)

const urlDatabases = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "r2jZLU"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "r2jZLU"
  },
  "r2j5e3": {
    longURL: "http://www.google.com",
    userID: "r2j5e3"
  },
};

const users = {
  r2jZLU: {
    id: 'r2jZLU',
    email: 'gary92.gs@gmail.com',
    password: '$2a$10$7WoesiyZu1BhaTEZrtp28eJxdM7B5dbn2mAPPaKWWnORM9CO84K02', //amazing
  },
};

//MIDDLEWARE BELOW//
app.use(express.urlencoded({ extended: true })); //this decodes the posted data before it reaches the server (ie. buffer => text)
app.use(cookieSession({
  name: 'session',
  keys: ['catch22'],
}));

//ROUTES BELOW//

//for READING Create New URL Page
app.get('/urls/new', (request, response) => {
  //filter non-logged-in users(ie. no cookie or invalid cookie)
  if (!request.session.uid || !Object.keys(users).includes(request.session.uid)) {
    return response.redirect('/login');
  }
  const templateVars = {
    user: users[request.session.uid]
  };

  return response.render('urls_new', templateVars);
});

//for READING MyURLs page - listing all urls in database
app.get('/urls', (request, response) => {
  const templateVars = {
    user: users[request.session.uid],
    urls: helpers.getUserURLs(request.session.uid,urlDatabases) //only pass the urls that belong to the current user
  };
  return response.render('urls_index', templateVars);
});

//for DELETING individual shortURLs
app.post('/urls/:id/delete', (request, response) => {
  //filter users without cookie or valid cookie or url doesn't exist
  //if the short url id does not exist in the database
  if (!urlDatabases[request.params.id]) {
    return response.status(404).send('Not Found. Shortened URL does not exist for the requested URL');
  }
  const urlID = urlDatabases[request.params.id].userID;
  //if cookie doesn't exist
  const cookID = request.session.uid;
  if (!cookID) {
    return response.status(401).send('Not Authorized. You must login');
  }
  //if user does not own url
  if (urlID !== cookID) {
    return response.status(401).send('Not Authorized. You do not have access to URLs that do not belong to you');
  }

  const key = request.params.id;
  delete urlDatabases[key];
  return response.redirect('/urls'); //return page listing all urls
});

//for UPDATING individual shortURLs
app.post('/urls/:id/update', (request, response) => {
  //filters users without cookie or valid cookie or url doesn't exist
  //if the short url id does not exist in the database
  if (!urlDatabases[request.params.id]) {
    return response.status(404).send('Not Found. Shortened URL does not exist for the requested URL');
  }
  //if cookie doesn't exist
  const cookID = request.session.uid;
  if (!cookID) {
    return response.send('Not Authorized. You must login');
  }
  const urlID = urlDatabases[request.params.id].userID;
  //if user does not own url
  if (urlID !== cookID) {
    return response.status(401).send('Not Authorized. You do not have access to URLs that do not belong to you');
  }

  const newURL = request.body.updatedURL;
  const key = request.params.id;
  urlDatabases[key].longURL = newURL;
  return response.redirect('/urls');
});

//for READING Inividual shortURLs
app.get('/urls/:id', (request, response) => {
  // filter non-logged in users and users who do not have the correct cookie
  //if short url not found in database
  if (!urlDatabases[request.params.id]) {
    return response.status(404).send('Not Found. Shortened URL does not exist for the requested URL');
  }
  const urlID = urlDatabases[request.params.id].userID;
  //if cookie doesn't exist
  const cookID = request.session.uid;
  if (!cookID) {
    return response.status(401).send('Not Authorized. You must login');
  }
  //if user does not own url
  if (urlID !== cookID) {
    return response.status(401).send('Not Authorized. You do not have access to URLs that do not belong to you');
  }

  const templateVars = {
    user: users[request.session.uid],
    id: request.params.id,
    longURL: urlDatabases[request.params.id].longURL,
  };
  
  return response.render('urls_show', templateVars);
});

//for CREATING new links
app.post('/urls', (request, response) => {
  //filter non-logged-in users (ie. no cookie or invalid cookie)
  if (!request.session.uid || !Object.keys(users).includes(request.session.uid)) {
    return response.send('You must login to create short URLs\n');
  }
  const shortID = helpers.generateRandomString(request.body.longURL);
  urlDatabases[shortID] = {
    longURL: request.body.longURL,
    userID: request.session.uid
  };
  return response.redirect(`/urls/${shortID}`); //then navigates to newly created link
});

//for READING original link of website from individual shortURL page
app.get('/u/:id', (request, response) => {
  // filter out requests for non-existent shortened urls
  if (!urlDatabases[request.params.id]) {
    return response.status(400).send('The short URL you have attempted to access does not exist\n');
  }
  return response.redirect(`${urlDatabases[request.params.id].longURL}`);
});

//for READING registration page
app.get('/register', (request, response) => {
  //filter logged in users (ie. do they have a cookie)
  if (Object.keys(users).includes(request.session.uid)) {
    return response.redirect('/urls');
  }
  const templateVars = {
    user: users[request.session.uid]
    // user: users['r2jZLU'] //for unlocking myself out of website
  };
  return response.render('register', templateVars);
});

//for CREATING new user via registration page
app.post('/register', (request, response) => {
  //filter bad email/password entries
  if (!request.body.email || !request.body.password) {
    return response.status(400).redirect('/register');
  }
  //filter registration of existing user
  if(helpers.getUserByEmail) {
    return response.status(400).redirect('/login');
  }
  //happy path = generate unique user ID and save new user to database
  const uid = helpers.generateRandomString();
  const email = request.body.email;
  const password = request.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  //save user to database
  users[uid] = {
    uid,
    email,
    password: hashedPassword,
  };
  //give user cookie containing ONLY the user id
  request.session.uid = uid;
  return response.redirect('/urls');
});

//for lOGIN PAGE (READ)
app.get('/login', (request, response) => {
  //filter logged in users (ie. do they have cookie with matching id)
  if (Object.keys(users).includes(request.session.uid)) {
    return response.redirect('/urls');
  }
  const templateVars = {
    user: users[request.session.uid]
  };
  return response.render('login', templateVars);
});

//for LOGGING IN (check user credentials)
app.post('/login', (request, response) => {
  let user = null;

  //check if user email is registered in database
  if (helpers.isValidCredentials(request.body.email, request.body.password,users)) {
    user = helpers.getUserByEmail(request.body.email,users);
  } else {
    return response.status(403).send('Invalid Login Credentials');
  }
  //if user already registered and password correct, give cookie with uid
  request.session.uid = user.id;
  return response.redirect('/urls');
});

//for LOGGING OUT (DELETE)
app.post('/logout', (request, response) => {
  request.session = null;
  return response.redirect('/login');
});

app.get('/', (request, response) => {
  return response.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



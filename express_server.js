const express = require('express');
const cookieParser = require('cookie-parser');
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
  "6tg5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },
  "42X5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "done",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "doon",
  },
  r2jZLU: {
    id: 'r2jZLU',
    email: 'gary92.gs@gmail.com',
    password: 'rocks',
  },
};

//MIDDLEWARE BELOW//

app.use(express.urlencoded({ extended: true })); //this decodes the posted data before it reaches the server (ie. buffer => text)
app.use(cookieParser());

//ROUTES BELOW//

//for READING Create New URL Page
app.get('/urls/new', (request, response) => {
  //filter non-logged-in users(ie. no cookie or invalid cookie)
  if (!request.cookies.uid || !Object.keys(users).includes(request.cookies.uid)) {
    return response.redirect('/login');
  }
  const templateVars = {
    user: users[request.cookies.uid]
  };

  response.render('urls_new', templateVars);
});

//for READING MyURLs page - listing all urls in database
app.get('/urls', (request, response) => {
  //console.log(Object.entries(urlDatabases))
  const templateVars = {
    user: users[request.cookies.uid],
    urls: getUserURLs(request.cookies.uid) //only pass the urls that belong to the current user
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
  urlDatabases[key].longURL = newURL;
  response.redirect('/urls');
});

//for READING Inividual shortURLs
app.get('/urls/:id', (request, response) => {
  // filter non-logged in users and users who do not have the correct cookie
  const cookID = request.cookies.uid;
  const urlID = urlDatabases[request.params.id].userID
  if (!request.cookies.uid || urlID !== cookID) {
    return response.status(401).send('You are not authorized to view this page');
  }

  const templateVars = {
    user: users[request.cookies.uid],
    id: request.params.id,
    longURL: urlDatabases[request.params.id].longURL,
  };
  response.render('urls_show', templateVars);
});

//for CREATING new links
app.post('/urls', (request, response) => {
  //filter non-logged-in users (ie. no cookie or invalid cookie)
  if (!request.cookies.uid || !Object.keys(users).includes(request.cookies.uid)) {
    return response.send('You must login to create short URLs\n');
  }
  const shortID = generateRandomString(request.body.longURL);
  urlDatabases[shortID] = {
    longURL: request.body.longURL,
    userID: request.cookies.uid
  }; 
  response.redirect(`/urls/${shortID}`); //then navigates to newly created link
});


//for READING original link of website from individual shortURL page
app.get('/u/:id', (request, response) => {
  //filter out requests for non-existent shortened urls
  if (!Object.keys(urlDatabases).includes(request.params.id)) {
    return response.status(400).send('The short URL you have attempted to access does not exist\n');
  }
  response.redirect(`${urlDatabases[request.params.id]}`);
});

//for READING registration page
app.get('/register', (request, response) => {
  //filter logged in users (ie. do they have a cookie)
  if (Object.keys(users).includes(request.cookies.uid)) {
    return response.redirect('/urls');
  }
  const templateVars = {
    user: users[request.cookies.uid]
    // user: users['r2jZLU'] //for unlocking myself out of website
  };
  response.render('register', templateVars);
});

//for CREATING new user via registration page
app.post('/register', (request, response) => {
  //filter bad email/password entries
  if (!request.body.email || !request.body.password) {
    return response.status(400).redirect('/register');
  }
  //filter registration of existing user
  if (isUser(request.body.email)) {
    return response.status(400).redirect('/login');
  }
  //happy path = generate unique user ID and save new user to database
  const uid = generateRandomString();
  const email = request.body.email;
  const password = request.body.password;

  //save user to database
  users[uid] = {
    uid,
    email,
    password
  };
  console.log(users);
  //give user cookie containing ONLY the user id
  response.cookie('uid', uid).redirect('/urls');
});

//for lOGIN PAGE (READ)
app.get('/login', (request, response) => {
  //filter logged in users (ie. do they have cookie with matching id)
  if (Object.keys(users).includes(request.cookies.uid)) {
    return response.redirect('/urls');
  }
  const templateVars = {
    user: users[request.cookies.uid]
  };
  response.render('login', templateVars);
});

//for LOGGING IN (check user credentials)
app.post('/login', (request, response) => {
  let user = null;
  console.log('login path \n rbemail', request.body.email, 'rbpassword', request.body.password);
  //check if user email is registered in database
  if (isValidCredentials(request.body.email, request.body.password)) {
    user = getUserObj(request.body.email);
  } else {
    return response.status(403).send('Invalid Login Credentials');
  }

  //if user already registered and password correct, give cookie with uid
  response.cookie('uid', `${user.id}`).redirect('/urls');

});

//for LOGGING OUT (DELETE)
app.post('/logout', (request, response) => {
  response.clearCookie('uid').redirect('/login');
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

const getUserObj = (email) => {
  for (const uid in users) {
    if (users[uid].email === email) {
      return users[uid];
    }
  }
  return false;
};

const isUser = (email) => {
  for (const uid in users) {
    if (users[uid].email === email) {
      return true;
    }
  }
  return false;
};

const isValidCredentials = (email, password) => {
  for (const uid in users) {
    if (users[uid].email === email && users[uid].password === password) {
      return true;
    }
  }
  return false;
};

const getUserURLs = (uid) => {
  const userURLs = {};
  for (const key in urlDatabases) {
    if (urlDatabases[key].userID === uid) {
      userURLs[key] = urlDatabases[key];
    }
  }
  return userURLs;
};
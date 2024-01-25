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
  const templateVars = {
    user: users[request.cookies.uid]
  };

  response.render('urls_new', templateVars);
});

//for READING MyURLs page - listing all urls in database
app.get('/urls', (request, response) => {
  const templateVars = {
    user: users[request.cookies.uid],
    urls: urlDatabases,
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
    user: users[request.cookies.uid],
    id: request.params.id,
    longURL: urlDatabases[request.params.id],
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
    user: users[request.cookies.uid]
    // user: users['r2jZLU'] //for unlocking myself out of website
  };
  response.render('register', templateVars);
});

//for CREATING new user via registration page
app.post('/register', (request, response) => {
  //filter bad email/password entries
  if (!request.body.email || !request.body.password) {
    return response.status(400).send('The email or password you provided is invalid');
  }
  //filter registration of existing user
  if (!isNewUser(request.body.email)) {
    return response.status(400).send('The email you provided has already been registered');
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

//for LOGGING IN (CREATE) //PROBABLY NEED TO REMOVE/ALTER COOKIE FUNCTION HERE
app.get('/login', (request, response) => {
  const templateVars = {
    user: users[request.cookies.uid]
  };
  response.render('login', templateVars);
});

app.post('/login', (request, response) => {
  let user = null;
  console.log('login path \n rbemail', request.body.email, 'rbpassword', request.body.password);
  //check if user email is registered in database
  if (isValidCredentials(request.body.email, request.body.password)) {
    user = getUserObj(request.body.email);
    console.log('user retrieved: ', user);
  } else {
    return response.status(400).send('Invalid Login Credentials');
  }

  //if user already registered and password correct, give cookie with uid
  response.cookie('uid',`${user.id}`).redirect('/urls');

});

//for LOGGING OUT (DELETE)
app.post('/logout', (request, response) => {
  const uid = request.cookies.uid;
  response.clearCookie('uid').redirect('/urls');
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
  return null;
};

const isNewUser = (email) => {
  for (const uid in users) {
    if (users[uid].email === email) {
      return false; //false = not new user
    }
  }
  return true; //true = new user
};

const isValidCredentials = (email, password) => {
  console.log('inside valid cred \n email: ', email, 'password', password);
  for (const uid in users) {
    if (users[uid].email === email && users[uid].password === password) {
      return true;
    }
  }
  return false;
};
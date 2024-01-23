const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs'); //ejs needs to be installed to reference to it (note it is not 'required' above)

const urlDatabases = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//MIDDLEWARE BELOW
app.use(express.urlencoded({ extended: true })); //this decodes the posted data before it reaches the server (ie. buffer => text)


//ROUTES BELOW
app.get('/hello', (request, response) => {
  const templateVars = { greeting: "Hello World!" };
  response.render("hello_world", templateVars);
});

//must be placed above get request for '/urls/:id'
app.get('/urls/new', (request, response) => {
  response.render('urls_new');
});

app.get('/urls', (request, response) => {
  const templateVars = { urls: urlDatabases };
  response.render('urls_index', templateVars);
});
app.get('/urls/:id', (request, response) => {
  const templateVars = { id: request.params.id, longURL: urlDatabases[request.params.id] };
  response.render('urls_show', templateVars);
});

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.post('/urls', (request, response) => {
  const shortID = generateRandomString(request.body.longURL);
  urlDatabases[shortID] = request.body.longURL;
  console.log(urlDatabases)
  response.redirect('OK');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  let shortURL = '';
  let charMin = 48;
  let charSpan = 122 - charMin;
  let noChar = [58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96];

  while (shortURL.length < 6) {
    let randChar = charMin + Math.round(charSpan * Math.random());
    if (noChar.includes(randChar)) { 
      continue;
    }
    shortURL += String.fromCharCode(randChar);
  }
  return shortURL;
};
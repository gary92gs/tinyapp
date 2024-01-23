const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs'); //ejs needs to be installed to reference to it (note it is not 'required' above)

const urlDatabases = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

//app.post();

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
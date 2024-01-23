const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs'); //ejs needs to be installed to reference to it (note it is not 'required' above)

const urlDatabases = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls', (request, response) => {
  const templateVars = { urls: urlDatabases };
  response.render('urls_index', templateVars);
});

app.get('/hello', (request, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
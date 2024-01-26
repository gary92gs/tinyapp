const bcrypt = require('bcryptjs');

const getUserByEmail = (email,users) => {
  for (const uid in users) {
    if (users[uid].email === email) {
      return users[uid];
    }
  }
  return undefined;
};

const isValidCredentials = (email, password, users) => {
  for (const uid in users) {
    if (users[uid].email === email) {
      //if email is valid, then check hashed password (less time spent running synchronous bcrypt)
      if (bcrypt.compareSync(password, users[uid].password)) {
        return true;
      }
    }
  }
  return false;
};

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

const getUserURLs = (uid,urlDatabases) => {
  const userURLs = {};
  for (const key in urlDatabases) {
    if (urlDatabases[key].userID === uid) {
      userURLs[key] = urlDatabases[key];
    }
  }
  return userURLs;
};



module.exports = {
  getUserByEmail,
  isValidCredentials,
  generateRandomString,
  getUserURLs,
}
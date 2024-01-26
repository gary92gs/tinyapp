const getUserObjByEmail = (email,users) => {
  for (const uid in users) {
    if (users[uid].email === email) {
      return users[uid];
    }
  }
  return undefined;
};










module.exports = {
  getUserObjByEmail,
}
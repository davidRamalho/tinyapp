// Generates a random 6 character string to be used as userid/ShortUrls
const generateRandomString = () => {
  const char= [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
                'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
                'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

  let output = '';
  for (let i = 0; i < 6; i++) {
    output += char[Math.round(Math.random()*61)];
  };
  return output;
};

//Checks if E-mail inputed already exists in the database, if true- returns the user with that e-mail
const checkForEmail = (input, database) => {
  for (const userID in database) {
    if (database[userID].email === input) {
      return database[userID];
    }
  }
  return undefined;
};
// Returns and array with all urls in the urldatabase that belong to the user with the corresponding id
const urlsForUser = (id, database) => {
  userUrls = [];
  for (url in database) {
    if (database[url].userID === id) {
      userUrls.push(url);
    }
  }
  return userUrls;
};
/*************************************************/


module.exports = {generateRandomString, checkForEmail, urlsForUser}

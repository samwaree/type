var firebase = require('firebase/app');

require('firebase/auth');

function signup(email, password, callback) {
  console.log(email, password);
  firebase.default
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((user) => {
      console.log(user);
      callback(null);
    })
    .catch((error) => {
      callback(error.message);
    });
}

function login(userInfo, callback) {
  console.log('User logged in');
  callback(null);
}

function doesUsernameExist(username) {}

module.exports = { signup, login };

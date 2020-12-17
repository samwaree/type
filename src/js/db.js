const db = firebase.firestore();

/**
 * Signs up a user using the firebase auth
 *
 * @param {string} email Email to register
 * @param {string} password Password of account
 * @param {string} username Username to register
 * @param {function} callback Callback function for singup process, returns null or error if error
 */
function signup(email, password, username, callback) {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((user) => {
      createUser(username, user.user.uid, (error) => {
        if (error) {
          callback(error);
        } else {
          callback(null);
        }
      });
    })
    .catch((error) => {
      callback(error.message);
    });
}

/**
 * Login a user using firebase auth
 *
 * @param {string} email Email of user
 * @param {string} password Password of user
 * @param {function} callback Callback function for login process, returns null or error if error
 */
function login(email, password, callback) {
  firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(() => {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
          console.log('Successfully Signed in');
          callback(null);
        })
        .catch((error) => {
          console.log('Error logging in');
          callback(error);
        });
    })
    .catch((error) => {
      callback(error);
    });
}

/**
 * Signs a user out of firebase auth
 *
 * @param {function} callback Callback function for signout process, returns null or error if error
 */
function signout(callback) {
  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log('Successfully signed out');
      callback(null);
    })
    .catch((error) => {
      console.log('Error signing out');
      callback(error);
    });
}

/**
 * Creates a user in the data base with the given username, corresponding to the userId
 *
 * @param {} username Username of the user
 * @param {*} userId User's userId
 * @param {*} callback Callback function, returns null or error if error
 */
function createUser(username, userId, callback) {
  db.collection('users')
    .doc(userId)
    .set({
      username: username,
    })
    .then(() => {
      callback(null);
    })
    .catch((error) => {
      callback(error);
    });
}

/**
 * Returns the User given the firebase auth user
 * 
 * @param {Map} user User firebase auth object
 * @param {function} callback Callback function, returns user doc data or error if error

 */
function getUser(user, callback) {
  if (!user) {
    callback(null, 'User not logged in');
    return;
  }
  db.collection('users')
    .doc(user.uid)
    .get()
    .then((doc) => {
      if (doc.exists) {
        callback(doc.data(), null);
      } else {
        callback(null, 'User not found');
      }
    })
    .catch((error) => {
      callback(null, error);
    });
}

/**
 * Sets the User's best WPM in the db
 * @param {String} userId
 * @param {Number} wpm
 * @param {function} callback
 */
function setBestWPM(userId, wpm, callback) {
  db.collection('users')
    .doc(userId)
    .update({ bestWPM: wpm })
    .then(() => callback(null))
    .catch((error) => {
      callback(error);
    });
}

/**
 * Saves the result of a test in the db
 * @param {String} userId
 * @param {Map} results
 * @param {function} callback
 */
function saveResults(userId, results, callback) {
  db.collection('tests')
    .add({
      userId: userId,
      results: results,
      datetime: firebase.firestore.Timestamp.now(),
    })
    .then((docRef) => {
      console.log('Test saved successfully');
      callback(null);
    })
    .catch((error) => {
      callback(error);
    });
}

module.exports = { signup, login, signout, getUser, saveResults, setBestWPM };

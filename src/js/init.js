var firebase = require('firebase/app');

const firebaseConfig = {
  apiKey: 'AIzaSyCdpnqlaX_7OaHNJXVltBS95AA_oCWDI0o',
  authDomain: 'type-f89e5.firebaseapp.com',
  projectId: 'type-f89e5',
  storageBucket: 'type-f89e5.appspot.com',
  messagingSenderId: '1073436866005',
  appId: '1:1073436866005:web:b209b0a6481bf7a086795c',
  measurementId: 'G-8FTLCWGV2M',
};

function initFirebase() {
  firebase.default.initializeApp(firebaseConfig);
}

module.exports = { initFirebase };

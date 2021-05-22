require('./style.css');
require('./assets/favicon.ico');
const Cookies = require('js-cookie');
const words = require('./words.json').words;
const db = require('./js/db.js');
const Timer = require('tiny-timer').default;

const wordDisplay = document.getElementById('words');
const textInput = document.getElementById('text-input');
const highestWPM = document.getElementById('highest-wpm');
const wordCountButtons = document.getElementById('word-count-select');

const timer = new Timer({ interval: 1000, stopwatch: true });
const maxTime = 1200000;

const darkModeWPMGraphColor = 'rgba(0, 255, 255, .2)';
const darkModeAccuracyColor = 'rgba(0, 177, 0, .1)';
const lightModeAccuracyColor = 'rgba(0, 177, 0, .2)';
const lightModeWPMGraphColor = 'rgba(0, 0, 255, .2)';

var wpmGraphColor;
var accuracyGraphColor;

var authUser;
var docUser;

let onResultsPage = false;
let wordCount = 25;
let errorCount = 0;
let wordList;
let currentWordPosition = 0;
let currentLetterPosition = 0;
var testResults = [];
var resultGraph;

loadCookies();
loadWords();

let isAuthReady = false;

// Handles user logging in/out on page load
firebase.auth().onAuthStateChanged(() => {
  authUser = firebase.auth().currentUser;

  if (!isAuthReady) {
    isAuthReady = true;
    db.getUser(authUser, (u, error) => {
      if (error) {
        console.log(error);
      }
      docUser = u;
      loadNavBar();
      loadBestWPM();
      $('.loader-wrapper').fadeOut('slow');
    });
  }
});

/**
 * Loads results panel. TODO: Cleanup this method
 */
function loadResults() {
  var ctx = document.getElementById('resultsChart').getContext('2d');
  resultGraph = new Chart(ctx, {
    type: 'line',
    label: 'Seconds',
    data: {
      labels: testResults.map((a) => a.seconds),
      datasets: [
        {
          label: 'WPM',
          data: testResults.map((a) => a.wpm),
          backgroundColor: wpmGraphColor,
          borderColor: wpmGraphColor,
          yAxisID: 'y',
        },
        {
          label: 'Accuracy',
          data: testResults.map((a) => a.accuracy),
          backgroundColor: accuracyGraphColor,
          borderColor: accuracyGraphColor,
          fill: true,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      responsiveAnimationDuration: 500,
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'seconds',
            },
            ticks: { maxTicksLimit: 11 },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'wpm',
            },
            ticks: {
              min: 0,
            },
            type: 'linear',
            display: true,
            position: 'left',
            id: 'y',
          },
          {
            scaleLabel: {
              display: true,
              labelString: 'accuracy',
            },
            type: 'linear',
            display: true,
            position: 'right',
            ticks: {
              max: 100,
              min: 0,
            },
            id: 'y1',
            gridLines: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
          },
        ],
      },
    },
  });
  $('#main-page').fadeOut(300, (complete) => {
    $('#results').fadeIn(300);
    onResultsPage = true;
  });
}

/**
 * Handles keypress inputs for the site.
 *
 * @param {Object} e keypress event
 */
document.onkeypress = (e) => {
  e = e || window.event;
  if (e.key === ' ') {
    goBackToTest();
  }
};

/**
 * Loads the Best WPM from user if they are logged in.
 */
function loadBestWPM() {
  highestWPM.innerHTML =
    docUser === null || docUser.bestWPM === undefined ? 'XX' : docUser.bestWPM;
}

/**
 * Loads the NavBar depending on if the user is logged in or not
 */
function loadNavBar() {
  if (authUser) {
    $('#login').hide();
    $('#sign-out').show();
    $('#username').show();
    $('#loginToSave').hide();
    if (docUser) {
      $('#username').text(docUser.username);
    }
  } else {
    $('#login').show();
    $('#sign-out').hide();
  }
}

// Page startup
$(() => {
  $('#login-alert').hide();
  $('#results').hide();
});

// Opens the login/signup modal on click of login icon
$('#login').on('click', () => {
  $('#login-signup-modal').modal('toggle');
});

$('#goBackToTest').on('click', () => {
  goBackToTest();
});

// Handles signing user out upon clicking sign out button
$('#sign-out').on('click', () => {
  db.signout((error) => {
    if (error) {
      alert('Error Signing out');
    }
    location.reload();
  });
});

$(function () {
  $('[data-toggle="tooltip"]').tooltip({ placement: 'bottom' });
});

$('#theme-switch').on('change.bootstrapSwitch', (e) => {
  if (e.target.checked) {
    document.getElementById('theme').href = './themes/dark.css';
    Cookies.set('theme', 'dark', { expires: 999 });
    wpmGraphColor = darkModeWPMGraphColor;
    accuracyGraphColor = darkModeAccuracyColor;
  } else {
    document.getElementById('theme').href = './themes/light.css';
    Cookies.set('theme', 'light', { expires: 999 });
    wpmGraphColor = lightModeWPMGraphColor;
    accuracyGraphColor = lightModeAccuracyColor;
  }
});

wordCountButtons.addEventListener('click', (e) => {
  setWordCount(Number(e.target.innerText));
});

timer.on('tick', (ms) => {
  if (ms == 0) {
    return;
  }
  let results = calculateResults(
    ms / 60000,
    wordList.slice(0, currentWordPosition),
    Math.round(ms / 1000)
  );
  testResults.push(results);
});

// Handles the text input bar
textInput.addEventListener('input', (e) => {
  if (e.data === ' ') {
    e.preventDefault();
    textInput.value = textInput.value.slice(0, -1);
    if (textInput.value != '') {
      nextWord();
      textInput.value = '';
    }
  } else {
    if (currentWordPosition == 0 && timer.status != 'running') {
      timer.start(maxTime);
    }
    if (currentWordPosition < wordCount) {
      handleLetterInput(e.data);
      if (getCurrentWord().startsWith(textInput.value)) {
        textInput.classList.remove('wrong');
      } else {
        textInput.classList.add('wrong');
      }
    }
  }
});

function handleLetterInput(letter) {
  const childNodes = wordDisplay.childNodes;
  const word = childNodes[currentWordPosition];

  if (letter) {
    if (currentLetterPosition >= wordList[currentWordPosition].length) {
      const newLetter = document.createElement('span');
      newLetter.innerHTML = letter;
      newLetter.classList.add('incorrect-letter');
      word.insertBefore(newLetter, word.lastChild);
    } else {
      word.childNodes[currentLetterPosition].innerHTML = letter;
      if (letter !== wordList[currentWordPosition][currentLetterPosition]) {
        word.childNodes[currentLetterPosition].classList.add(
          'incorrect-letter'
        );
      } else {
        word.childNodes[currentLetterPosition].classList.add('correct-letter');
      }
    }
    currentLetterPosition++;
  } else {
    currentLetterPosition--;
    if (currentLetterPosition >= wordList[currentWordPosition].length) {
      word.removeChild(word.lastChild.previousSibling);
    } else {
      word.childNodes[currentLetterPosition].innerHTML =
        wordList[currentWordPosition][currentLetterPosition];
      word.childNodes[currentLetterPosition].classList.remove(
        'incorrect-letter'
      );
      word.childNodes[currentLetterPosition].classList.remove('correct-letter');
    }
  }
  document.getElementById('cursor').style.top =
    word.childNodes[currentLetterPosition].offsetTop + 1 + 'px';
  document.getElementById('cursor').style.left =
    word.childNodes[currentLetterPosition].offsetLeft - 2 + 'px';
}

// Handles signup form submission
$('#signupForm').on('submit', (e) => {
  e.preventDefault();
  let userInfo = $('#signupForm').serializeArray();
  let email = userInfo.find((form) => form.name === 'email').value;
  let password = userInfo.find((form) => form.name === 'password').value;
  let confirmPassword = userInfo.find(
    (form) => form.name === 'confirm_password'
  ).value;
  let username = userInfo.find((form) => form.name === 'username').value;
  if (!validatePasswordsMatch(password, confirmPassword)) {
    return;
  }
  db.signup(email, password, username, (error) => {
    if (error) {
      alert('Error creating account, please try again');
      return;
    }
    location.reload();
  });
});

// Handles login form submission
$('#loginForm').on('submit', (e) => {
  e.preventDefault();
  let userInfo = $('#loginForm').serializeArray();
  let email = userInfo.find((form) => form.name === 'email').value;
  let password = userInfo.find((form) => form.name === 'password').value;
  db.login(email, password, (error) => {
    if (error) {
      $('#login-alert').show();
      return;
    }
    location.reload();
  });
});

/**
 * If on the results page, goes back to the test page
 */
function goBackToTest() {
  if (onResultsPage) {
    loadWords();
    $('#results').fadeOut(300, (complete) => {
      $('#main-page').fadeIn(300, () => {
        textInput.focus();
      });
      onResultsPage = false;
      resultGraph.destroy();
    });
  }
}

/**
 * Returns whether or not the passord and confirm password match. Sets validity error if they do not.
 *
 * @param {string} password Password to check
 * @param {string} confirmPassword confirmPassword to check
 */
function validatePasswordsMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    document
      .getElementById('signin_confirm_password')
      .setCustomValidity('Passwords must match');
    return false;
  }
  return true;
}

/**
 * Loads random words into the word display and resets all tracking variables.
 */
function loadWords() {
  removeAllChildNodes(wordDisplay);

  wordList = getRandomWords(wordCount);
  wordList.forEach((word) => {
    let wordSpan = document.createElement('span');
    [...word].forEach((letter, index) => {
      let span = document.createElement('span');
      span.innerHTML = letter;
      span.classList.add('letter');
      wordSpan.appendChild(span);
    });
    let space = document.createElement('span');
    space.innerHTML = ' ';
    space.classList.add('space');
    wordSpan.appendChild(space);
    wordDisplay.appendChild(wordSpan);
  });

  // Reset tracking variables, highlighting and text box
  hightlightCurrentWord(0);
  testResults = [];
  timer.stop();
  currentWordPosition = 0;
  currentLetterPosition = 0;
  errorCount = 0;
  textInput.classList.remove('wrong');
  textInput.value = '';
  setTimeout(() => {
    textInput.focus();
    document.getElementById('cursor').style.top = '13px';
    document.getElementById('cursor').style.left = '28px';
  }, 10);
}

/**
 * Returns an array of randoms words of size wordCount.
 * @param {number} wordCount Number of words to get
 * @return {number} The array of random words
 */
function getRandomWords(wordCount) {
  const randomWords = [];
  for (let i = 0; i < wordCount; i++) {
    randomWords.push(words[Math.floor(Math.random() * words.length)]);
  }
  return randomWords;
}

/**
 * Sets the word count to use for the typing test and reloads word list.
 * @param {number} number The word count chosen
 */
function setWordCount(number) {
  wordCount = number;
  loadWords();
}

/**
 * Loads cookies for page. Currently loads: best wpm.
 */
function loadCookies() {
  if (Cookies.get('theme') == 'dark') {
    $('#theme-switch').attr('checked', '');
    document.getElementById('theme').href = './themes/dark.css';
    wpmGraphColor = darkModeWPMGraphColor;
    accuracyGraphColor = darkModeAccuracyColor;
  } else {
    document.getElementById('theme').href = './themes/light.css';
    wpmGraphColor = lightModeWPMGraphColor;
    accuracyGraphColor = lightModeAccuracyColor;
  }
}

/**
 * Sets the best WPM if its better than the previous best and saves to cookies.
 * @param {number} wpm The wpm to check/set as best
 */
function setBestWPM(wpm) {
  if (!authUser) {
    if (wpm > highestWPM.innerHTML || highestWPM.innerHTML == 'XX') {
      highestWPM.innerHTML = wpm;
    }
  } else if (wpm > docUser.bestWPM || docUser.bestWPM === undefined) {
    db.setBestWPM(authUser.uid, wpm, (error) => {
      if (error) {
        console.log(error);
      }
    });
    highestWPM.innerHTML = wpm;
  }
}

/**
 * Checks whether the user typed the correct word and moves on to the next word.
 * Doesn't do anything if the timer hasn't started
 */
function nextWord() {
  if (timer.status != 'running') {
    return;
  }
  currentLetterPosition = 0;
  if (wordList[currentWordPosition] !== textInput.value) {
    errorCount += wordList[currentWordPosition].length;
    if (currentWordPosition + 1 < wordCount) {
      errorCount++;
    }
    highlightIncorrect(currentWordPosition);
  }
  currentWordPosition++;

  if (currentWordPosition == wordCount) {
    let msTaken = timer.time;
    const minutesTaken = msTaken / 60000;
    const secondsTaken = msTaken / 1000;
    timer.stop();
    let results = calculateResults(
      minutesTaken,
      wordList,
      roundToTwo(secondsTaken)
    );
    testResults.push(results);
    setBestWPM(results.wpm);
    document.getElementById('wpm').innerHTML = results.wpm;
    document.getElementById('accuracy').innerHTML = results.accuracy;
    loadResults();
    if (authUser) {
      db.saveResults(authUser.uid, testResults, (error) => {
        if (error) {
          console.log(error);
        }
      });
    }
  } else {
    hightlightCurrentWord(currentWordPosition);
  }
  textInput.classList.remove('wrong');
}

/**
 * Rounds number to two decimal places
 * @param {Number} num
 */
function roundToTwo(num) {
  return +(Math.round(num + 'e+2') + 'e-2');
}

/**
 * Gets the results form the test given the words completed, minutes and seconds taken.
 *
 * @param {Number} minutesTaken Number of minutes taken
 * @param {Array} wordsCompleted Array of words already completed
 * @param {Number} secondsTaken Number of seconds taken
 */
function calculateResults(minutesTaken, wordsCompleted, secondsTaken) {
  const totalCharacters = wordsCompleted.join(' ').length;
  let adjustedWordsPerMinute =
    (totalCharacters / 5 - errorCount / 5) / minutesTaken;
  adjustedWordsPerMinute = Math.floor(
    adjustedWordsPerMinute < 0 ? 0 : adjustedWordsPerMinute
  );
  let accuracy = Math.floor(
    ((totalCharacters - errorCount) / totalCharacters) * 100
  );
  accuracy = accuracy < 0 ? 0 : accuracy;
  return {
    wpm: isNaN(adjustedWordsPerMinute) ? 0 : adjustedWordsPerMinute,
    accuracy: isNaN(accuracy) ? 100 : accuracy,
    seconds: secondsTaken,
  };
}

/**
 * Gets the current word based on currentWordPosition
 * @return {string} The current word
 */
function getCurrentWord() {
  const wordList = wordDisplay.children;
  const currentWordSpan = wordList[currentWordPosition];
  return currentWordSpan.textContent.trim();
}

/**
 * Hightlights the word at index position as the current word
 * @param {number} position The position/index of the word to highlight
 * as the current word
 */
function hightlightCurrentWord(position) {
  const childNodes = wordDisplay.childNodes;
  const word = childNodes[position];
  word.classList = [];
  word.classList.add('current-word');
  document.getElementById('cursor').style.top = word.offsetTop + 1 + 'px';
  document.getElementById('cursor').style.left = word.offsetLeft - 2 + 'px';
}

/**
 * Hightlights the word at index position as incorrect
 * @param {number} position The position/index of the word to highlight
 * as incorrect
 */
function highlightIncorrect(position) {
  const childNodes = wordDisplay.children;
  const word = childNodes[position];
  word.classList.add('incorrect');
}

/**
 * Removes all childeren from given node
 * @param {Node} parent Node to remove all children from
 */
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

module.exports = { loadWords, setWordCount };

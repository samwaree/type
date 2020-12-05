require('./style.css');
require('./assets/favicon.ico');
const timer = require('./js/timer.js');
const Cookies = require('js-cookie');
const words = require('./words.json').words;

const wordDisplay = document.getElementById('words');
const textInput = document.getElementById('text-input');
const highestWPM = document.getElementById('highest-wpm');
const wordCountButtons = document.getElementById('word-count-select');

let wordCount = 25;
let errorCount = 0;
let wordList;
let currentWordPosition = 0;

loadCookies();
loadWords();

$(function () {
  $('[data-toggle="tooltip"]').tooltip({ placement: 'bottom' });
});

$('#theme-switch').on('change.bootstrapSwitch', (e) => {
  if (e.target.checked) {
    document.getElementById('theme').href = './themes/dark.css';
    Cookies.set('theme', 'dark', { expires: 7 });
  } else {
    document.getElementById('theme').href = './themes/light.css';
    Cookies.set('theme', 'light', { expires: 7 });
  }
});

wordCountButtons.addEventListener('click', (e) => {
  setWordCount(Number(e.target.innerText));
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
    if (currentWordPosition == 0) {
      timer.startTimer();
    }
    if (currentWordPosition < wordCount) {
      if (getCurrentWord().startsWith(textInput.value)) {
        textInput.classList.remove('wrong');
      } else {
        textInput.classList.add('wrong');
      }
    }
  }
});

/**
 * Loads random words into the word display and resets all tracking variables.
 */
function loadWords() {
  removeAllChildNodes(wordDisplay);

  wordList = getRandomWords(wordCount);
  wordList.forEach((word) => {
    const span = document.createElement('span');
    span.innerHTML = word + ' ';
    wordDisplay.appendChild(span);
  });

  // Reset tracking variables, highlighting and text box
  hightlightCurrentWord(0);
  timer.endTimer();
  currentWordPosition = 0;
  errorCount = 0;
  textInput.classList.remove('wrong');
  textInput.value = '';
  textInput.focus();
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
  const wpmCookie = Cookies.get('wpm') ? Cookies.get('wpm') : 'XX';
  highestWPM.innerHTML = `BEST: ${wpmCookie}`;
  if (Cookies.get('theme') == 'dark') {
    $('#theme-switch').attr('checked', '');
    document.getElementById('theme').href = './themes/dark.css';
  } else {
    document.getElementById('theme').href = './themes/light.css';
  }
}

/**
 * Sets the best WPM if its better than the previous best and saves to cookies.
 * @param {number} wpm The wpm to check/set as best
 */
function setBestWPM(wpm) {
  if (wpm > Cookies.get('wpm') || Cookies.get('wpm') == undefined) {
    Cookies.set('wpm', wpm, { expires: 7 });
    highestWPM.innerHTML = `BEST: ${wpm}`;
  }
}

/**
 * Checks whether the user typed the correct word and moves on to the next word.
 * Doesn't do anything if the timer hasn't started
 */
function nextWord() {
  if (!timer.isTimerRunning()) {
    return;
  }
  if (getCurrentWord() === textInput.value) {
    highlightCorrect(currentWordPosition++);
  } else {
    errorCount += getCurrentWord().length;
    if (currentWordPosition + 1 < wordCount) {
      errorCount++;
    }
    highlightIncorrect(currentWordPosition++);
  }
  if (currentWordPosition == wordCount) {
    const minutesTaken = timer.endTimer();
    calculateAndSetWPM(minutesTaken);
  } else {
    hightlightCurrentWord(currentWordPosition);
  }
  textInput.classList.remove('wrong');
}

/**
 * Calculates and sets the WPM.
 * @param {number} minutesTaken Number of minutes taken
 */
function calculateAndSetWPM(minutesTaken) {
  const totalCharacters = wordList.join(' ').length;
  let adjustedWordsPerMinute =
    (totalCharacters / 5 - errorCount / 5) / minutesTaken;
  adjustedWordsPerMinute =
    adjustedWordsPerMinute < 0 ? 0 : adjustedWordsPerMinute;
  document.getElementById('wpm').innerHTML = `WPM: ${Math.floor(
    adjustedWordsPerMinute
  )} -- ACCURACY: ${Math.floor(
    ((totalCharacters - errorCount) / totalCharacters) * 100
  )}`;
  setBestWPM(Math.floor(adjustedWordsPerMinute));
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
}

/**
 * Hightlights the word at index position as correct
 * @param {number} position The position/index of the word to highlight
 *  as correct
 */
function highlightCorrect(position) {
  const childNodes = wordDisplay.children;
  const word = childNodes[position];
  word.classList.add('correct');
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

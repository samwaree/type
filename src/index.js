import "./style.css";
import "./assets/favicon.ico";
import { startTimer, endTimer, isTimerRunning } from "./js/timer.js";
const randomWords = require("random-words");
const Cookies = require("js-cookie");
const wordDisplay = document.querySelector("#words");
const textInput = document.querySelector("#text-input");
const highestWPM = document.querySelector("#highest-wpm");

let wordCount = 25;
let errorCount = 0;
let wordList;
let currentWordPosition = 0;

loadCookies();
loadWords();

// Handles setting the word count when buttons are clicked
$("#word-count-select").click((e) => {
  setWordCount(Number(e.target.innerText));
});

// Handles the text input bar
textInput.addEventListener("input", (e) => {
  if (e.data === " ") {
    e.preventDefault();
    textInput.value = textInput.value.slice(0, -1);
    if (textInput.value != "") {
      nextWord();
      textInput.value = "";
    }
  } else {
    if (currentWordPosition == 0) {
      startTimer();
    } else if (currentWordPosition < wordCount) {
      if (getCurrentWord().startsWith(textInput.value)) {
        textInput.classList.remove("wrong");
      } else {
        textInput.classList.add("wrong");
      }
    }
  }
});

/**
 * Loads random words into the word display and resets all tracking variables.
 */
export function loadWords() {
  removeAllChildNodes(wordDisplay);

  wordList = randomWords(wordCount);
  wordList.forEach((word) => {
    var span = document.createElement("span");
    span.innerHTML = word + " ";
    wordDisplay.appendChild(span);
  });

  // Reset tracking variables, highlighting and text box
  hightlightCurrentWord(0);
  currentWordPosition = 0;
  errorCount = 0;
  textInput.classList.remove("wrong");
  textInput.value = "";
  textInput.focus();
}

/**
 * Sets the word count to use for the typing test and reloads word list.
 * @param {number} number The word count chosen
 */
export function setWordCount(number) {
  wordCount = number;
  loadWords();
}

/**
 * Loads cookies for page. Currently loads: best wpm.
 */
function loadCookies() {
  var wpmCookie = Cookies.get("wpm") ? Cookies.get("wpm") : "XX";
  highestWPM.innerHTML = `BEST: ${wpmCookie}`;
}

/**
 * Sets the best WPM if its better than the previous best and saves to cookies.
 * @param {number} wpm The wpm to check/set as best
 */
function setBestWPM(wpm) {
  if (wpm > Cookies.get("wpm") || Cookies.get("wpm") == undefined) {
    Cookies.set("wpm", wpm);
    highestWPM.innerHTML = `BEST: ${wpm}`;
  }
}

/**
 * Checks whether the user typed the correct word and moves on to the next word.
 * Doesn't do anything if the timer hasn't started
 */
function nextWord() {
  if (!isTimerRunning()) {
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
    var minutesTaken = endTimer();
    calculateAndSetWPM(minutesTaken);
  } else {
    hightlightCurrentWord(currentWordPosition);
  }
  textInput.classList.remove("wrong");
}

function calculateAndSetWPM(minutesTaken) {
  var totalCharacters = wordList.join(" ").length;
  var adjustedWordsPerMinute =
    (totalCharacters / 5 - errorCount / 5) / minutesTaken;
  adjustedWordsPerMinute =
    adjustedWordsPerMinute < 0 ? 0 : adjustedWordsPerMinute;
  document.querySelector("#wpm").innerHTML = `WPM: ${Math.floor(
    adjustedWordsPerMinute
  )} -- ACCURACY: ${Math.floor(
    ((totalCharacters - errorCount) / totalCharacters) * 100
  )}`;
  setBestWPM(Math.floor(adjustedWordsPerMinute));
}

/**
 * Gets the current word based on currentWordPosition
 */
function getCurrentWord() {
  var wordList = wordDisplay.children;
  var currentWordSpan = wordList[currentWordPosition];
  return currentWordSpan.textContent.trim();
}

/**
 * Hightlights the word at index position as the current word
 * @param {number} position The position/index of the word to highlight as the current word
 */
function hightlightCurrentWord(position) {
  var childNodes = wordDisplay.children;
  var word = childNodes[position];
  word.classList = [];
  word.classList.add("current-word");
}

/**
 * Hightlights the word at index position as correct
 * @param {number} position The position/index of the word to highlight as correct
 */
function highlightCorrect(position) {
  console.log("Correct!");
  var childNodes = wordDisplay.children;
  var word = childNodes[position];
  word.classList.add("correct");
}

/**
 * Hightlights the word at index position as incorrect
 * @param {number} position The position/index of the word to highlight as incorrect
 */
function highlightIncorrect(position) {
  console.log("Incorrect!");
  var childNodes = wordDisplay.children;
  var word = childNodes[position];
  word.classList.add("incorrect");
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

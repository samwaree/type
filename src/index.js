import "./style.css";
var randomWords = require("random-words");
var Cookies = require("js-cookie");

const wordDisplay = document.querySelector("#words");
const textInput = document.querySelector("#text-input");
const highestWPM = document.querySelector("#highest-wpm");

let wordCount = 25;
let errorCount = 0;
let wordList;
let currentWordPosition = 0;
let startTime = null;

loadCookies();

function loadCookies() {
  var wpmCookie = Cookies.get("wpm") ? Cookies.get("wpm") : "XX";
  highestWPM.innerHTML = `BEST: ${wpmCookie}`;
}

function setCookies(wpm) {
  if (wpm > Cookies.get("wpm") || Cookies.get("wpm") == undefined) {
    Cookies.set("wpm", wpm);
    highestWPM.innerHTML = `BEST: ${wpm}`;
  }
}

export function setWordCount(number) {
  wordCount = number;
  loadWords();
}

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
      startTime = startTime || new Date().getTime();
      console.log("Timer started...", startTime);
    } else if (currentWordPosition < wordCount) {
      if (getCurrentWord().startsWith(textInput.value)) {
        textInput.classList.remove("wrong");
      } else {
        textInput.classList.add("wrong");
      }
    }
  }
});

function nextWord() {
  if (!startTime) {
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
    endTimer();
  } else {
    highlightWord(currentWordPosition);
  }
  textInput.classList.remove("wrong");
}

function endTimer() {
  var endTime = new Date().getTime();
  console.log("Timer stopped...");
  var difference = endTime - startTime;

  var seconds = (difference % (1000 * 60)) / 1000;
  console.log(seconds);
  var totalCharacters = wordList.join(" ").length;
  console.log(totalCharacters);
  var adjustedWordsPerMinute =
    (totalCharacters / 5 - errorCount / 5) / (seconds / 60);
  adjustedWordsPerMinute =
    adjustedWordsPerMinute < 0 ? 0 : adjustedWordsPerMinute;
  document.querySelector("#wpm").innerHTML = `WPM: ${Math.floor(
    adjustedWordsPerMinute
  )} -- ACCURACY: ${Math.floor(
    ((totalCharacters - errorCount) / totalCharacters) * 100
  )}`;
  setCookies(Math.floor(adjustedWordsPerMinute));
  startTime = null;
}

function getCurrentWord() {
  var wordList = wordDisplay.children;
  var currentWordSpan = wordList[currentWordPosition];
  return currentWordSpan.textContent.trim();
}

function highlightWord(position) {
  var childNodes = wordDisplay.children;
  var word = childNodes[position];
  word.classList = [];
  word.classList.add("current-word");
}

function highlightCorrect(position) {
  console.log("Correct!");
  var childNodes = wordDisplay.children;
  var word = childNodes[position];
  word.classList.add("correct");
}

function highlightIncorrect(position) {
  console.log("Incorrect!");
  var childNodes = wordDisplay.children;
  var word = childNodes[position];
  word.classList.add("incorrect");
}

export function loadWords() {
  removeAllChildNodes(wordDisplay);
  wordList = randomWords(wordCount);
  var div = document.createElement("div");
  wordList.forEach((word) => {
    var span = document.createElement("span");
    span.innerHTML = word + " ";
    wordDisplay.appendChild(span);
  });
  highlightWord(0);
  currentWordPosition = 0;
  errorCount = 0;
  textInput.classList.remove("wrong");
  textInput.value = "";
  textInput.focus();
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

loadWords();

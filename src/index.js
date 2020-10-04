import "./style.css";
var randomWords = require("random-words");

const wordDisplay = document.querySelector("#words");
const textInput = document.querySelector("#text-input");

let wordCount = 25;
let currentWordPosition = 0;

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
    if (getCurrentWord().startsWith(textInput.value)) {
      textInput.classList.remove("wrong");
    } else {
      textInput.classList.add("wrong");
    }
  }
});

function nextWord() {
  if (getCurrentWord() === textInput.value) {
    highlightCorrect(currentWordPosition++);
  } else {
    highlightIncorrect(currentWordPosition++);
  }
  textInput.classList.remove("wrong");
  highlightWord(currentWordPosition);
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

function loadWords() {
  removeAllChildNodes(wordDisplay);
  var wordList = randomWords(wordCount);
  var div = document.createElement("div");
  wordList.forEach((word) => {
    var span = document.createElement("span");
    span.innerHTML = word + " ";
    wordDisplay.appendChild(span);
  });
  highlightWord(0);
  currentWordPosition = 0;
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

import "./style.css";
var randomWords = require("random-words");

const wordDisplay = document.querySelector("#words");
const textInput = document.querySelector("#text-input");

let wordCount = 15;

export function setWordCount(number) {
  wordCount = number;
  loadWords();
}

textInput.addEventListener("keypress", (e) => {
  console.log(e);
  if (e.key === " ") {
    e.preventDefault();
    textInput.value = "";
  }
});

function loadWords() {
  console.log(wordDisplay);
  wordDisplay.innerHTML = randomWords(wordCount).join(" ");
}

loadWords();

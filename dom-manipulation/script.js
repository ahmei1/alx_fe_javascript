// Start with some quotes
let quotes = [
  "The best way to predict the future is to invent it.",
  "JavaScript is fun!",
  "Stay hungry, stay foolish."
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");

// Show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  quoteDisplay.textContent = quotes[randomIndex];
}

// Add a new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  if (text === "") {
    alert("Please enter a quote!");
    return;
  }
  quotes.push(text);   // Add to array
  newQuoteText.value = ""; // Clear input
  alert("New quote added!");
}

// Events
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Show one quote when page loads
document.addEventListener("DOMContentLoaded", showRandomQuote);

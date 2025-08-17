// Quotes Array (initial data)
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "JavaScript is the language of the web.", category: "Programming" },
  { text: "Stay hungry, stay foolish.", category: "Inspiration" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categorySelect = document.getElementById("categorySelect");

// Function: Show Random Quote
function showRandomQuote() {
  let filteredQuotes = quotes;

  // Filter by selected category
  const selectedCategory = categorySelect.value;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category yet!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
}

// Function: Add New Quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text === "" || category === "") {
    alert("Please fill in both fields!");
    return;
  }

  // Add new quote to array
  quotes.push({ text, category });

  // Add new category to dropdown if not exists
  if (![...categorySelect.options].some(opt => opt.value.toLowerCase() === category.toLowerCase())) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  }

  // Reset inputs
  newQuoteText.value = "";
  newQuoteCategory.value = "";
  alert("Quote added successfully!");
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Initialize with one random quote on load
document.addEventListener("DOMContentLoaded", showRandomQuote);

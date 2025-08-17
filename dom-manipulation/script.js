// ===== Dynamic Quote Generator with Server Sync =====

// Elements
const quoteText = document.getElementById("quote-text");
const addBtn = document.getElementById("add-quote");
const syncBtn = document.getElementById("sync-quotes");
const inputField = document.getElementById("quote-input");
const notification = document.getElementById("notification");

// Local storage key
const STORAGE_KEY = "quotes";

// Get quotes from local storage
function getLocalQuotes() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Save quotes to local storage
function saveLocalQuotes(quotes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

// Show random quote
function showRandomQuote() {
  const quotes = getLocalQuotes();
  if (quotes.length === 0) {
    quoteText.textContent = "No quotes available.";
    return;
  }
  const random = Math.floor(Math.random() * quotes.length);
  quoteText.textContent = quotes[random];
}

// Add new quote
addBtn.addEventListener("click", () => {
  const newQuote = inputField.value.trim();
  if (newQuote === "") return;

  const quotes = getLocalQuotes();
  quotes.push(newQuote);
  saveLocalQuotes(quotes);

  inputField.value = "";
  showRandomQuote();
});

// ===== Simulated Server =====
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch quotes from "server"
async function fetchServerQuotes() {
  const response = await fetch(SERVER_URL);
  const data = await response.json();
  // Simulate server quotes using only titles
  return data.slice(0, 5).map(item => item.title);
}

// Push quotes to "server" (simulation)
async function pushQuotesToServer(quotes) {
  await fetch(SERVER_URL, {
    method: "POST",
    body: JSON.stringify({ quotes }),
    headers: { "Content-Type": "application/json" }
  });
}

// ===== Sync Logic =====
async function syncQuotes() {
  const localQuotes = getLocalQuotes();
  const serverQuotes = await fetchServerQuotes();

  // Conflict resolution: server wins
  const mergedQuotes = [...new Set([...serverQuotes, ...localQuotes])];
  saveLocalQuotes(mergedQuotes);

  // Notify user
  notification.textContent = "✅ Synced with server (server data prioritized)";
  setTimeout(() => (notification.textContent = ""), 3000);

  // Optionally push local updates
  await pushQuotesToServer(localQuotes);

  showRandomQuote();
}

// Manual sync button
syncBtn.addEventListener("click", syncQuotes);

// Auto sync every 30s
setInterval(syncQuotes, 30000);

// Init
document.addEventListener("DOMContentLoaded", () => {
  showRandomQuote();
  syncQuotes();
});

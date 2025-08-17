// ====== Global Variables ======
const STORAGE_KEY = "quotes";
const FILTER_KEY = "lastFilter";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

let quotes = loadQuotes();
let currentCategory = localStorage.getItem(FILTER_KEY) || "all";

// ====== DOM Elements ======
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuote");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportJson");
const importFile = document.getElementById("importFile");
const syncBtn = document.getElementById("syncBtn");
const notification = document.getElementById("notification");

// ====== Storage Functions ======
function loadQuotes() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    { text: "Stay hungry, stay foolish.", category: "Motivation" },
    { text: "The best way to predict the future is to create it.", category: "Inspiration" }
  ];
}

function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  populateCategories();
}

// ====== Quote Display ======
function showRandomQuote() {
  let filtered = currentCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === currentCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const random = Math.floor(Math.random() * filtered.length);
  quoteDisplay.textContent = `"${filtered[random].text}" — [${filtered[random].category}]`;

  // Save last viewed in sessionStorage
  sessionStorage.setItem("lastQuote", quoteDisplay.textContent);
}

// ====== Adding Quotes ======
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim() || "General";

  if (!text) return alert("Quote cannot be empty!");

  quotes.push({ text, category });
  saveQuotes();

  newQuoteText.value = "";
  newQuoteCategory.value = "";

  showRandomQuote();
}

// ====== Categories ======
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === currentCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  currentCategory = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, currentCategory);
  showRandomQuote();
}

// ====== JSON Import/Export ======
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format!");
      }
    } catch {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ====== Server Sync ======
async function fetchServerQuotes() {
  const response = await fetch(SERVER_URL);
  const data = await response.json();
  return data.slice(0, 5).map(item => ({
    text: item.title,
    category: "Server"
  }));
}

async function pushQuotesToServer(localQuotes) {
  await fetch(SERVER_URL, {
    method: "POST",
    body: JSON.stringify({ quotes: localQuotes }),
    headers: { "Content-Type": "application/json" }
  });
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchServerQuotes();

    // Conflict resolution: server wins (merge unique)
    const merged = [...serverQuotes, ...quotes].reduce((acc, q) => {
      if (!acc.find(x => x.text === q.text)) acc.push(q);
      return acc;
    }, []);

    quotes = merged;
    saveQuotes();

    notification.textContent = "✅ Synced with server (server data prioritized)";
    setTimeout(() => (notification.textContent = ""), 3000);

    await pushQuotesToServer(quotes);
    showRandomQuote();
  } catch (err) {
    notification.textContent = "⚠️ Sync failed. Try again later.";
  }
}

// ====== Event Listeners ======
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categoryFilter.addEventListener("change", filterQuotes);
exportBtn.addEventListener("click", exportToJson);
importFile.addEventListener("change", importFromJsonFile);
syncBtn.addEventListener("click", syncQuotes);

// Auto sync every 30s
setInterval(syncQuotes, 30000);

// ====== Init ======
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  showRandomQuote();

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) quoteDisplay.textContent = lastQuote;

  syncQuotes();
});

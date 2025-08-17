// ====== Data Storage Helpers ======
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored quotes:", e);
      quotes = [];
    }
  }
}

function saveLastViewedQuote(quote) {
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function loadLastViewedQuote() {
  const stored = sessionStorage.getItem("lastQuote");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

// ====== Data ======
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "JavaScript is the language of the web.", category: "Programming" },
  { text: "Stay hungry, stay foolish.", category: "Inspiration" }
];

// Load from localStorage first
loadQuotes();

// ====== DOM refs ======
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn   = document.getElementById("newQuote");
const exportBtn     = document.getElementById("exportBtn");
const importFile    = document.getElementById("importFile");

let categorySelect;
let addQuoteFormWrapper;

// ====== Functions ======
function renderQuote(quote) {
  quoteDisplay.innerHTML = "";
  const card = document.createElement("div");
  const textEl = document.createElement("p");
  const metaEl = document.createElement("small");

  textEl.textContent = `"${quote.text}"`;
  metaEl.textContent = `Category: ${quote.category}`;

  card.appendChild(textEl);
  card.appendChild(metaEl);
  quoteDisplay.appendChild(card);

  // Save last viewed quote to sessionStorage
  saveLastViewedQuote(quote);
}

function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  const q = quotes[idx];
  renderQuote(q);
}

function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");

  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQ = { text, category };
  quotes.push(newQ);
  saveQuotes(); // persist to localStorage

  textEl.value = "";
  catEl.value = "";

  renderQuote(newQ);
  alert("Quote added successfully!");
}

// ====== Import/Export ======
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Expected an array.");
      }
    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };
  reader.readAsText(file);
}

// ====== Dynamic Form Creation ======
function createAddQuoteForm() {
  addQuoteFormWrapper = document.createElement("div");
  addQuoteFormWrapper.style.marginTop = "1rem";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  addQuoteFormWrapper.appendChild(textInput);
  addQuoteFormWrapper.appendChild(categoryInput);
  addQuoteFormWrapper.appendChild(addBtn);

  newQuoteBtn.insertAdjacentElement("afterend", addQuoteFormWrapper);
}

// ====== Events ======
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);

// ====== Init ======
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();

  // If sessionStorage has last viewed quote, restore it
  const last = loadLastViewedQuote();
  if (last) {
    renderQuote(last);
  } else {
    showRandomQuote();
  }
});

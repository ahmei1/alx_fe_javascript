// ================== Data ===================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Inspiration" },
  { text: "Don’t let yesterday take up too much of today.", category: "Life" }
];

// ================== DOM Elements ===================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");

// ================== Storage Helpers ===================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ================== Show Random Quote ===================
function showRandomQuote() {
  let filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available for this category.";
    return;
  }
  const random = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerHTML = `"${filteredQuotes[random].text}" 
    <div class="category">(${filteredQuotes[random].category})</div>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(filteredQuotes[random]));
}

// ================== Add Quote ===================
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Please enter both quote and category");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added successfully!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ================== Filtering ===================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  // restore last selected filter
  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) categoryFilter.value = lastFilter;
}

function getFilteredQuotes() {
  const selected = categoryFilter.value;
  if (selected === "all") return quotes;
  return quotes.filter(q => q.category === selected);
}

function filterQuotes() {
  localStorage.setItem("lastFilter", categoryFilter.value);
  showRandomQuote();
}

// ================== JSON Import / Export ===================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ================== Server Sync Simulation ===================
function syncWithServer() {
  const serverQuotes = [
    { text: "Simulated server quote #1", category: "Server" },
    { text: "Simulated server quote #2", category: "Server" }
  ];

  let conflicts = 0;
  serverQuotes.forEach(sq => {
    if (!quotes.some(lq => lq.text === sq.text)) {
      quotes.push(sq);
    } else {
      conflicts++;
    }
  });

  if (conflicts > 0) {
    notification.textContent = `Conflicts resolved: ${conflicts} duplicates ignored.`;
  } else {
    notification.textContent = "Synced with server successfully!";
  }
  saveQuotes();
  populateCategories();
}

// ================== Event Listeners ===================
newQuoteBtn.addEventListener("click", showRandomQuote);

// ================== Init ===================
populateCategories();
if (sessionStorage.getItem("lastQuote")) {
  const last = JSON.parse(sessionStorage.getItem("lastQuote"));
  quoteDisplay.innerHTML = `"${last.text}" <div class="category">(${last.category})</div>`;
} else {
  showRandomQuote();
}

// Simulate periodic server sync
setInterval(syncWithServer, 15000); // every 15 sec

// ================== Server Sync (Task 3) ===================

// Example mock server endpoint (JSONPlaceholder only supports GET/POST)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch data from server and merge with local quotes
async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // simulate server quotes from the mock data (title used as quote)
    const serverQuotes = serverData.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    let conflicts = 0;
    serverQuotes.forEach(sq => {
      if (!quotes.some(lq => lq.text === sq.text)) {
        quotes.push(sq);
      } else {
        conflicts++;
      }
    });

    if (conflicts > 0) {
      notification.textContent = `Conflicts resolved: ${conflicts} duplicates ignored.`;
    } else {
      notification.textContent = "Synced with server successfully!";
    }

    saveQuotes();
    populateCategories();
  } catch (error) {
    notification.textContent = "Error syncing with server.";
    console.error(error);
  }
}

// Push a new local quote to the server
async function pushQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-type": "application/json; charset=UTF-8" }
    });
    notification.textContent = "Quote pushed to server!";
  } catch (error) {
    notification.textContent = "Error pushing quote to server.";
    console.error(error);
  }
}
pushQuoteToServer({ text, category });


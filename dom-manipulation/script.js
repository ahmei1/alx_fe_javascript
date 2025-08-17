// ---- Storage helpers ----
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ---- Load quotes (or defaults) ----
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// ---- DOM refs ----
const categoryFilter = document.getElementById("categoryFilter");
const quoteContainer =
  document.getElementById("quoteContainer") ||
  document.getElementById("quoteDisplay"); // fallback if your container is named quoteDisplay

// ---- Populate categories dynamically ----
function populateCategories() {
  const unique = Array.from(new Set(quotes.map(q => q.category))).sort();

  // rebuild options
  categoryFilter.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All Categories";
  categoryFilter.appendChild(allOpt);

  unique.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  // restore last selected category (if any)
  const saved = localStorage.getItem("selectedCategory");
  if (saved && (saved === "all" || unique.includes(saved))) {
    categoryFilter.value = saved;
  } else {
    categoryFilter.value = "all";
  }
}
window.populateCategories = populateCategories; // (exposed for tests)

// ---- Filter & render quotes; save selected category ----
function filterQuote() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);

  let list = quotes;
  if (selected !== "all") {
    list = quotes.filter(q => q.category === selected);
  }

  // render
  quoteContainer.innerHTML = "";
  if (list.length === 0) {
    quoteContainer.textContent = "No quotes in this category yet.";
    return;
  }
  const ul = document.createElement("ul");
  list.forEach(q => {
    const li = document.createElement("li");
    li.textContent = `"${q.text}" — ${q.category}`;
    ul.appendChild(li);
  });
  quoteContainer.appendChild(ul);
}
window.filterQuote = filterQuote; // (exposed for inline onchange & tests)

// ---- Add a new quote; update storage & UI ----
function addQuote() {
  const textEl = document.getElementById("newQuote");
  const catEl  = document.getElementById("newCategory");
  const text = (textEl.value || "").trim();
  const category = (catEl.value || "").trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  // update categories while preserving current selection
  const current = categoryFilter.value;
  populateCategories();
  if ([current, "all"].includes(current)) categoryFilter.value = current;

  // refresh the filtered view
  filterQuote();

  textEl.value = "";
  catEl.value = "";
}
window.addQuote = addQuote;

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();  // builds dropdown
  filterQuote();         // applies (and saves) the current filter
});

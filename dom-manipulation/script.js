// Sample quotes with categories
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// Get DOM elements
const quoteContainer = document.getElementById("quoteContainer");
const categoryFilter = document.getElementById("categoryFilter");

// Populate dropdown with categories
function populateCategories() {
  // Get unique categories
  const categories = ["All", ...new Set(quotes.map(q => q.category))];

  // Clear existing options
  categoryFilter.innerHTML = "";

  // Add each category to dropdown
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category from localStorage
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    categoryFilter.value = savedCategory;
  }
}

// Show quotes based on filter
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  // Filter quotes
  let filtered = quotes;
  if (selectedCategory !== "All") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }

  // Display quotes
  quoteContainer.innerHTML = filtered.map(q => `<p>"${q.text}" - <em>${q.category}</em></p>`).join("");
}

// Add new quote
function addQuote() {
  const newQuote = document.getElementById("newQuote").value.trim();
  const newCategory = document.getElementById("newCategory").value.trim();

  if (newQuote && newCategory) {
    quotes.push({ text: newQuote, category: newCategory });
    localStorage.setItem("quotes", JSON.stringify(quotes));
    document.getElementById("newQuote").value = "";
    document.getElementById("newCategory").value = "";
    populateCategories(); // update dropdown
    filterQuotes(); // refresh displayed quotes
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Initial load
populateCategories();
filterQuotes();

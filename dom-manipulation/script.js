// ====== Data ======
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "JavaScript is the language of the web.", category: "Programming" },
  { text: "Stay hungry, stay foolish.", category: "Inspiration" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "Small steps every day.", category: "Motivation" }
];

// ====== DOM refs (existing from HTML) ======
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn   = document.getElementById("newQuote");

// Will be created dynamically:
let categorySelect;        // <select id="categorySelect">
let addQuoteFormWrapper;   // container for the add-quote form

// ====== Utilities ======
function uniqueCategories(list) {
  return [...new Set(list.map(q => q.category))].sort();
}

function ensureCategoryOption(cat) {
  // Add the option to the <select> if it doesn't exist
  const exists = [...categorySelect.options].some(
    (opt) => opt.value.toLowerCase() === cat.toLowerCase()
  );
  if (!exists) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  }
}

function renderQuote(quote) {
  quoteDisplay.innerHTML = ""; // clear
  const card = document.createElement("div");
  const textEl = document.createElement("p");
  const metaEl = document.createElement("small");

  textEl.textContent = `"${quote.text}"`;
  metaEl.textContent = `Category: ${quote.category}`;

  // simple styling hooks (no CSS file necessary)
  card.style.padding = "0.75rem";
  card.style.border = "1px solid #ddd";
  card.style.borderRadius = "8px";
  card.style.margin = "0.5rem 0";
  textEl.style.margin = "0 0 0.25rem 0";
  textEl.style.fontWeight = "600";

  card.appendChild(textEl);
  card.appendChild(metaEl);
  quoteDisplay.appendChild(card);
}

// ====== Required: showRandomQuote() ======
function showRandomQuote() {
  // respect selected category (if categorySelect exists)
  let pool = quotes;
  if (categorySelect && categorySelect.value !== "all") {
    const cat = categorySelect.value;
    pool = quotes.filter(q => q.category.toLowerCase() === cat.toLowerCase());
  }

  if (pool.length === 0) {
    quoteDisplay.textContent = "No quotes in this category yet.";
    return;
  }
  const idx = Math.floor(Math.random() * pool.length);
  renderQuote(pool[idx]);
}

// Make it globally accessible (in case inline handlers are used)
window.showRandomQuote = showRandomQuote;

// ====== Build Category UI (advanced DOM creation) ======
function createCategorySelect() {
  const wrapper = document.createElement("div");
  wrapper.style.margin = "1rem 0";

  const label = document.createElement("label");
  label.setAttribute("for", "categorySelect");
  label.textContent = "Filter by category: ";

  categorySelect = document.createElement("select");
  categorySelect.id = "categorySelect";

  // Default "All"
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All";
  categorySelect.appendChild(allOpt);

  // Add existing categories
  uniqueCategories(quotes).forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  // Interaction: changing category shows a suitable random quote
  categorySelect.addEventListener("change", showRandomQuote);

  wrapper.appendChild(label);
  wrapper.appendChild(categorySelect);

  // Insert right before the "Show New Quote" button for UX
  newQuoteBtn.parentNode.insertBefore(wrapper, newQuoteBtn);
}

// ====== Required: createAddQuoteForm() ======
// Builds the add-quote form dynamically, as requested.
function createAddQuoteForm() {
  addQuoteFormWrapper = document.createElement("div");
  addQuoteFormWrapper.style.marginTop = "1rem";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  textInput.style.marginRight = "0.5rem";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.marginRight = "0.5rem";

  const addBtn = document.createElement("button");
  addBtn.id = "addQuoteBtn";
  addBtn.textContent = "Add Quote";

  // Primary interaction (no inline handlers needed)
  addBtn.addEventListener("click", addQuote);

  // If someone uses the inline snippet <button onclick="addQuote()">, this still works
  window.addQuote = addQuote;

  addQuoteFormWrapper.appendChild(textInput);
  addQuoteFormWrapper.appendChild(categoryInput);
  addQuoteFormWrapper.appendChild(addBtn);

  // Place after the "Show New Quote" button
  newQuoteBtn.insertAdjacentElement("afterend", addQuoteFormWrapper);
}
window.createAddQuoteForm = createAddQuoteForm; // exposed per spec

// ====== Add Quote logic ======
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");

  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Update data
  quotes.push({ text, category });

  // Update category selector dynamically if new category was added
  ensureCategoryOption(category);

  // Clear inputs
  textEl.value = "";
  catEl.value = "";

  // Give immediate feedback: show the newly added quote
  renderQuote({ text, category });
}

// ====== Wiring base button and initial render ======
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize UI on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  createCategorySelect();     // dynamic category UI
  createAddQuoteForm();       // dynamic add-quote form
  showRandomQuote();          // show something on load
});

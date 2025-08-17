// Initial quotes data
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "work" },
    { text: "Life is what happens when you're busy making other plans.", category: "life" },
    { text: "In the middle of difficulty lies opportunity.", category: "inspiration" },
    { text: "Simplicity is the ultimate sophistication.", category: "design" },
    { text: "The best way to predict the future is to invent it.", category: "future" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const importFile = document.getElementById('importFile');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const syncBtn = document.getElementById('syncBtn');
const autoSyncCheckbox = document.getElementById('autoSync');
let syncInterval;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load quotes from local storage if available
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
        quotes = JSON.parse(savedQuotes);
    }
    
    // Load last selected category filter
    const lastFilter = localStorage.getItem('lastFilter') || 'all';
    
    // Populate categories dropdown
    populateCategories();
    
    // Set last filter
    categoryFilter.value = lastFilter;
    
    // Show initial random quote
    showRandomQuote();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    addQuoteBtn.addEventListener('click', addQuote);
    exportBtn.addEventListener('click', exportToJsonFile);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importFromJsonFile);
    syncBtn.addEventListener('click', syncWithServer);
    
    // Set up auto-sync toggle
    autoSyncCheckbox.addEventListener('change', function() {
        if (this.checked) {
            syncInterval = setInterval(syncWithServer, 30000);
            updateSyncStatus('Auto-sync enabled', 'success');
        } else {
            clearInterval(syncInterval);
            updateSyncStatus('Auto-sync disabled', 'error');
        }
    });
    
    // Start auto-sync
    syncInterval = setInterval(syncWithServer, 30000);
});

// DOM Manipulation Functions
function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    let filteredQuotes = quotes;
    
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for the selected category.</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    quoteDisplay.innerHTML = `
        <p>"${randomQuote.text}"</p>
        <p class="category">— ${randomQuote.category}</p>
    `;
    
    // Save last shown quote to session storage
    sessionStorage.setItem('lastQuote', JSON.stringify(randomQuote));
}

function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (!quoteText || !quoteCategory) {
        alert('Please enter both quote text and category');
        return;
    }
    
    const newQuote = {
        text: quoteText,
        category: quoteCategory.toLowerCase()
    };
    
    quotes.push(newQuote);
    saveQuotes();
    
    // Update categories dropdown
    populateCategories();
    
    // Clear input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Show success message
    updateSyncStatus('Quote added successfully!', 'success');
}

// Web Storage and JSON Handling
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('lastUpdated', new Date().toISOString());
}

function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'quotes.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    updateSyncStatus('Quotes exported successfully!', 'success');
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedQuotes) || !importedQuotes.every(q => q.text && q.category)) {
                throw new Error('Invalid quotes format');
            }
            
            // Merge imported quotes with existing ones, avoiding duplicates
            const existingTexts = quotes.map(q => q.text.toLowerCase());
            const newQuotes = importedQuotes.filter(q => 
                !existingTexts.includes(q.text.toLowerCase())
            );
            
            quotes.push(...newQuotes);
            saveQuotes();
            populateCategories();
            showRandomQuote();
            
            updateSyncStatus(`${newQuotes.length} new quotes imported successfully!`, 'success');
        } catch (error) {
            updateSyncStatus('Error importing quotes: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Dynamic Content Filtering
function populateCategories() {
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Save current selected category
    const selectedCategory = categoryFilter.value;
    
    // Clear and repopulate dropdown
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore selected category if it still exists
    if (categories.includes(selectedCategory)) {
        categoryFilter.value = selectedCategory;
    } else if (selectedCategory !== 'all') {
        categoryFilter.value = 'all';
    }
}

function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastFilter', selectedCategory);
    showRandomQuote();
}

// Server Sync and Conflict Resolution
async function fetchQuotesFromServer() {
    try {
        // Using JSONPlaceholder mock API for demonstration
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        
        if (!response.ok) {
            throw new Error('Failed to fetch quotes from server');
        }
        
        const data = await response.json();
        
        // Transform the mock API data to our quote format
        return data.map(post => ({
            text: post.title,
            category: 'server' // Default category for demo
        }));
    } catch (error) {
        console.error('Error fetching quotes:', error);
        updateSyncStatus('Error fetching quotes: ' + error.message, 'error');
        return [];
    }
}

async function postQuotesToServer(quotesToSend) {
    try {
        // Using JSONPlaceholder mock API for demonstration
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            body: JSON.stringify(quotesToSend),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to post quotes to server');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error posting quotes:', error);
        updateSyncStatus('Error posting quotes: ' + error.message, 'error');
        return null;
    }
}

async function syncWithServer() {
    try {
        updateSyncStatus('Syncing with server...', 'success');
        
        // 1. Fetch quotes from server
        const serverQuotes = await fetchQuotesFromServer();
        
        // 2. Get local last updated time
        const localLastUpdated = localStorage.getItem('lastUpdated');
        
        // 3. Conflict resolution
        if (serverQuotes.length > 0) {
            const existingTexts = quotes.map(q => q.text.toLowerCase());
            const newQuotes = serverQuotes.filter(q => 
                !existingTexts.includes(q.text.toLowerCase())
            );
            
            if (newQuotes.length > 0) {
                // Show conflict resolution UI if there are significant changes
                if (newQuotes.length > 3) { // Arbitrary threshold for demo
                    showConflictResolutionUI(newQuotes, quotes);
                } else {
                    quotes.push(...newQuotes);
                    saveQuotes();
                    populateCategories();
                }
                
                updateSyncStatus(`Found ${newQuotes.length} new quotes from server`, 'success');
            } else {
                updateSyncStatus('Data is up to date with server', 'success');
            }
        }
        
        // 4. Send local changes to server (simplified - in real app you'd track changes)
        if (quotes.length > 0) {
            await postQuotesToServer(quotes);
        }
        
    } catch (error) {
        updateSyncStatus('Sync failed: ' + error.message, 'error');
    }
}

function showConflictResolutionUI(serverQuotes, localQuotes) {
    // Create a modal for conflict resolution
    const modal = document.createElement('div');
    modal.className = 'conflict-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Conflict Resolution</h3>
            <p>We found ${serverQuotes.length} new quotes on the server.</p>
            <div class="conflict-options">
                <button id="keepLocal">Keep My Quotes</button>
                <button id="useServer">Add Server Quotes</button>
                <button id="mergeBoth">Merge Both</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners for the buttons
    document.getElementById('keepLocal').addEventListener('click', () => {
        modal.remove();
        updateSyncStatus('Kept local quotes', 'success');
    });
    
    document.getElementById('useServer').addEventListener('click', () => {
        // Add server quotes to local storage
        quotes.push(...serverQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
        modal.remove();
        updateSyncStatus('Added server quotes', 'success');
    });
    
    document.getElementById('mergeBoth').addEventListener('click', () => {
        // Merge both versions
        const mergedQuotes = [...localQuotes];
        const localTexts = localQuotes.map(q => q.text.toLowerCase());
        
        serverQuotes.forEach(serverQuote => {
            if (!localTexts.includes(serverQuote.text.toLowerCase())) {
                mergedQuotes.push(serverQuote);
            }
        });
        
        quotes = mergedQuotes;
        saveQuotes();
        populateCategories();
        showRandomQuote();
        modal.remove();
        updateSyncStatus('Merged local and server quotes', 'success');
    });
}

function updateSyncStatus(message, type) {
    const statusElement = document.getElementById('syncStatus');
    statusElement.textContent = message;
    statusElement.className = type;
}
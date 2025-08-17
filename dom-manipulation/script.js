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
    importFile.addEventListener('change', importFromJsonFile);
    
    // Simulate periodic server sync (every 30 seconds)
    setInterval(syncWithServer, 30000);
});

// Task 0: DOM Manipulation Functions
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

// Task 1: Web Storage and JSON Handling
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

// Task 2: Dynamic Content Filtering
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

// Task 3: Server Sync and Conflict Resolution
async function syncWithServer() {
    try {
        // In a real app, this would be an actual API call
        // For simulation, we'll use a mock response with some delay
        updateSyncStatus('Syncing with server...', 'success');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock server response - in a real app, this would come from an API
        const mockServerResponse = {
            success: true,
            data: [
                // Some existing quotes that might have been updated on the server
                { text: "The only way to do great work is to love what you do.", category: "work" },
                // Some new quotes added from another device
                { text: "Stay hungry, stay foolish.", category: "inspiration" },
                { text: "Your time is limited, don't waste it living someone else's life.", category: "life" }
            ],
            lastUpdated: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
        };
        
        // Get local last updated time
        const localLastUpdated = localStorage.getItem('lastUpdated');
        
        // Process server data
        if (mockServerResponse.success) {
            const serverQuotes = mockServerResponse.data;
            const serverLastUpdated = mockServerResponse.lastUpdated;
            
            // Conflict resolution strategy:
            // If server has newer data, merge it with local data
            // If local has newer data, keep local changes (in a real app, you might send them to server)
            
            if (!localLastUpdated || new Date(serverLastUpdated) > new Date(localLastUpdated)) {
                // Server has newer data - merge
                const existingTexts = quotes.map(q => q.text.toLowerCase());
                const newQuotes = serverQuotes.filter(q => 
                    !existingTexts.includes(q.text.toLowerCase())
                );
                
                if (newQuotes.length > 0) {
                    quotes.push(...newQuotes);
                    saveQuotes();
                    populateCategories();
                    
                    updateSyncStatus(`Synced ${newQuotes.length} new quotes from server!`, 'success');
                } else {
                    updateSyncStatus('Data is up to date with server', 'success');
                }
            } else {
                // Local data is newer - in a real app, you would send local changes to server
                updateSyncStatus('Local changes not yet sent to server', 'success');
            }
        }
    } catch (error) {
        updateSyncStatus('Sync failed: ' + error.message, 'error');
    }
}

function updateSyncStatus(message, type) {
    const statusElement = document.getElementById('syncStatus');
    statusElement.textContent = message;
    statusElement.className = type;
}
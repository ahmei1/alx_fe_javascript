// Server Simulation and Sync Configuration
const SERVER_SYNC_INTERVAL = 30000; // 30 seconds
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
let lastSyncTime = localStorage.getItem('lastSyncTime') || 0;
let syncInterval;

// Initialize server sync
function initServerSync() {
    // Load last sync time
    lastSyncTime = localStorage.getItem('lastSyncTime') || 0;
    
    // Start periodic sync
    syncInterval = setInterval(syncWithServer, SERVER_SYNC_INTERVAL);
    
    // Initial sync
    syncWithServer();
}

// Enhanced server sync function
async function syncWithServer() {
    try {
        updateSyncStatus('Starting server synchronization...', 'success');
        
        // 1. Fetch updates from server
        const serverUpdates = await fetchServerUpdates();
        
        // 2. Check for conflicts and merge changes
        const conflicts = await detectConflicts(serverUpdates);
        
        if (conflicts.length > 0) {
            // Show conflict resolution UI
            showConflictResolution(conflicts, serverUpdates);
        } else {
            // Automatic merge if no conflicts
            mergeServerUpdates(serverUpdates);
            updateSyncStatus('Data synchronized successfully', 'success');
        }
        
        // 3. Push local changes to server
        await pushLocalChanges();
        
        // Update last sync time
        lastSyncTime = Date.now();
        localStorage.setItem('lastSyncTime', lastSyncTime);
        
    } catch (error) {
        console.error('Sync error:', error);
        updateSyncStatus(`Sync failed: ${error.message}`, 'error');
    }
}

// Fetch updates from server
async function fetchServerUpdates() {
    try {
        updateSyncStatus('Checking for server updates...', 'success');
        
        const response = await fetch(`${SERVER_URL}?_since=${lastSyncTime}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch server updates');
        }
        
        const data = await response.json();
        
        // Transform server data to our quote format
        return data.map(post => ({
            id: post.id,
            text: post.title,
            category: 'server',
            body: post.body,
            serverVersion: post.id // Simulate version number
        }));
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Detect conflicts between local and server data
async function detectConflicts(serverUpdates) {
    const conflicts = [];
    
    // Check each server update against local data
    for (const serverItem of serverUpdates) {
        const localItem = quotes.find(q => q.id === serverItem.id);
        
        if (localItem) {
            // Simple conflict detection - compare versions
            if (localItem.serverVersion !== serverItem.serverVersion) {
                conflicts.push({
                    local: localItem,
                    server: serverItem,
                    type: 'version_mismatch'
                });
            }
        }
    }
    
    return conflicts;
}

// Merge server updates into local data
function mergeServerUpdates(serverUpdates) {
    let changesMade = false;
    
    serverUpdates.forEach(serverItem => {
        const existingIndex = quotes.findIndex(q => q.id === serverItem.id);
        
        if (existingIndex >= 0) {
            // Update existing quote
            quotes[existingIndex] = {
                ...quotes[existingIndex],
                ...serverItem
            };
            changesMade = true;
        } else {
            // Add new quote from server
            quotes.push(serverItem);
            changesMade = true;
        }
    });
    
    if (changesMade) {
        saveQuotes();
        populateCategories();
        updateSyncStatus(`Added ${serverUpdates.length} server updates`, 'success');
    }
}

// Push local changes to server
async function pushLocalChanges() {
    try {
        // Get local changes since last sync
        const localChanges = quotes.filter(quote => {
            return !quote.serverVersion || quote.updatedAt > lastSyncTime;
        });
        
        if (localChanges.length === 0) {
            return;
        }
        
        updateSyncStatus(`Pushing ${localChanges.length} local changes to server...`, 'success');
        
        // Simulate posting to server
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            body: JSON.stringify(localChanges),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to push changes to server');
        }
        
        // Update server versions in local data
        const result = await response.json();
        result.forEach(serverItem => {
            const localItem = quotes.find(q => q.id === serverItem.id);
            if (localItem) {
                localItem.serverVersion = serverItem.id; // Update version
            }
        });
        
        saveQuotes();
        
    } catch (error) {
        console.error('Push error:', error);
        throw error;
    }
}

// Enhanced Conflict Resolution UI
function showConflictResolution(conflicts, serverUpdates) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'conflict-modal';
    
    // Modal content
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Conflict Resolution Required</h3>
            <p>Found ${conflicts.length} conflicts with server data.</p>
            
            <div class="conflict-list">
                ${conflicts.map((conflict, index) => `
                    <div class="conflict-item">
                        <h4>Conflict #${index + 1}</h4>
                        <div class="versions">
                            <div class="local-version">
                                <h5>Your Version</h5>
                                <p>${conflict.local.text}</p>
                                <small>Category: ${conflict.local.category}</small>
                            </div>
                            <div class="server-version">
                                <h5>Server Version</h5>
                                <p>${conflict.server.text}</p>
                                <small>Category: ${conflict.server.category}</small>
                            </div>
                        </div>
                        <div class="resolution-options">
                            <button class="keep-local" data-index="${index}">Keep Local</button>
                            <button class="use-server" data-index="${index}">Use Server</button>
                            <button class="merge" data-index="${index}">Merge</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="global-options">
                <button id="resolve-all-keep">Keep All Local</button>
                <button id="resolve-all-server">Use All Server</button>
                <button id="resolve-all-smart">Smart Merge All</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners for individual conflict resolution
    modal.querySelectorAll('.keep-local').forEach(button => {
        button.addEventListener('click', () => {
            const index = button.dataset.index;
            // Keep local version
            updateSyncStatus(`Kept local version for conflict #${parseInt(index) + 1}`, 'success');
            document.querySelector(`.conflict-item:nth-child(${parseInt(index) + 1})`).style.opacity = '0.5';
        });
    });
    
    modal.querySelectorAll('.use-server').forEach(button => {
        button.addEventListener('click', () => {
            const index = button.dataset.index;
            const conflict = conflicts[index];
            // Update local with server version
            const quoteIndex = quotes.findIndex(q => q.id === conflict.server.id);
            if (quoteIndex >= 0) {
                quotes[quoteIndex] = conflict.server;
                saveQuotes();
                updateSyncStatus(`Used server version for conflict #${parseInt(index) + 1}`, 'success');
                document.querySelector(`.conflict-item:nth-child(${parseInt(index) + 1})`).style.opacity = '0.5';
            }
        });
    });
    
    modal.querySelectorAll('.merge').forEach(button => {
        button.addEventListener('click', () => {
            const index = button.dataset.index;
            const conflict = conflicts[index];
            // Merge both versions
            const quoteIndex = quotes.findIndex(q => q.id === conflict.server.id);
            if (quoteIndex >= 0) {
                quotes[quoteIndex] = {
                    ...conflict.server,
                    text: `${conflict.local.text} (merged with: ${conflict.server.text})`,
                    category: conflict.local.category === conflict.server.category ? 
                        conflict.local.category : 
                        `${conflict.local.category},${conflict.server.category}`
                };
                saveQuotes();
                updateSyncStatus(`Merged versions for conflict #${parseInt(index) + 1}`, 'success');
                document.querySelector(`.conflict-item:nth-child(${parseInt(index) + 1})`).style.opacity = '0.5';
            }
        });
    });
    
    // Add event listeners for global resolution
    document.getElementById('resolve-all-keep').addEventListener('click', () => {
        // Keep all local versions
        updateSyncStatus('Kept all local versions', 'success');
        modal.remove();
    });
    
    document.getElementById('resolve-all-server').addEventListener('click', () => {
        // Use all server versions
        conflicts.forEach(conflict => {
            const quoteIndex = quotes.findIndex(q => q.id === conflict.server.id);
            if (quoteIndex >= 0) {
                quotes[quoteIndex] = conflict.server;
            }
        });
        saveQuotes();
        updateSyncStatus('Used all server versions', 'success');
        modal.remove();
    });
    
    document.getElementById('resolve-all-smart').addEventListener('click', () => {
        // Smart merge all
        conflicts.forEach(conflict => {
            const quoteIndex = quotes.findIndex(q => q.id === conflict.server.id);
            if (quoteIndex >= 0) {
                quotes[quoteIndex] = {
                    ...conflict.server,
                    text: conflict.local.text.length > conflict.server.text.length ?
                        conflict.local.text : conflict.server.text,
                    category: conflict.local.category === conflict.server.category ?
                        conflict.local.category :
                        `${conflict.local.category},${conflict.server.category}`
                };
            }
        });
        saveQuotes();
        updateSyncStatus('Smart merged all conflicts', 'success');
        modal.remove();
    });
}

// Initialize server sync when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initServerSync();
});
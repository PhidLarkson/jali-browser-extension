// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const saveSettingsBtn = document.getElementById('save-settings');
const clearHistoryBtn = document.getElementById('clear-history');
const exportHistoryBtn = document.getElementById('export-history');
const clearFavoritesBtn = document.getElementById('clear-favorites');
const addApiKeyBtn = document.getElementById('add-api-key');
const historyList = document.getElementById('history-list');
const favoritesList = document.getElementById('favorites-list');
const apiKeysList = document.getElementById('api-keys-list');

// Default settings
const defaultSettings = {
  defaultLanguage: 'tw',
  theme: 'banana',
  fontSize: 'medium',
  highContrast: false,
  saveHistory: true,
  zenMode: false
};

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  loadSettings();
  loadHistory();
  loadFavorites();
  loadApiKeys();
});

// Tab Navigation
function initializeNavigation() {
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all nav items and sections
      navItems.forEach(navItem => navItem.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));
      
      // Add active class to clicked nav item and corresponding section
      item.classList.add('active');
      const tabId = item.getAttribute('data-tab');
      document.getElementById(`${tabId}-section`).classList.add('active');
    });
  });
  
  // Add event listeners for buttons
  saveSettingsBtn.addEventListener('click', saveSettings);
  clearHistoryBtn.addEventListener('click', clearHistory);
  exportHistoryBtn.addEventListener('click', exportHistory);
  clearFavoritesBtn.addEventListener('click', clearFavorites);
  addApiKeyBtn.addEventListener('click', addApiKey);
}

// Settings Management
function loadSettings() {
  chrome.storage.sync.get('settings', (data) => {
    const settings = data.settings || defaultSettings;
    
    // Apply settings to form
    document.getElementById('default-language').value = settings.defaultLanguage;
    document.getElementById('theme').value = settings.theme;
    document.getElementById('font-size').value = settings.fontSize;
    document.getElementById('high-contrast').checked = settings.highContrast;
    document.getElementById('save-history').checked = settings.saveHistory;
    document.getElementById('zen-mode').checked = settings.zenMode;
    
    // Apply visual settings
    applyVisualSettings(settings);
  });
}

function saveSettings() {
  const settings = {
    defaultLanguage: document.getElementById('default-language').value,
    theme: document.getElementById('theme').value,
    fontSize: document.getElementById('font-size').value,
    highContrast: document.getElementById('high-contrast').checked,
    saveHistory: document.getElementById('save-history').checked,
    zenMode: document.getElementById('zen-mode').checked
  };
  
  chrome.storage.sync.set({ settings }, () => {
    applyVisualSettings(settings);
    showNotification('Settings saved successfully');
  });
}

function applyVisualSettings(settings) {
  // Apply theme
  document.body.className = ''; // Reset classes
  
  if (settings.highContrast) {
    document.body.classList.add('high-contrast');
  }
  
  if (settings.fontSize === 'large' || settings.fontSize === 'x-large') {
    document.body.classList.add('large-font');
  }
  
  if (settings.zenMode) {
    document.body.classList.add('zen-mode');
  }
  
  // Apply theme colors (would be more extensive in real implementation)
  if (settings.theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else if (settings.theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.add('banana-theme');
  }
}

// History Management
function loadHistory() {
  chrome.storage.local.get('history', (data) => {
    const history = data.history || [];
    
    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          Your translation history will appear here
        </div>
      `;
      return;
    }
    
    historyList.innerHTML = '';
    history.reverse().forEach(item => {
      const historyItemElement = createHistoryItem(item);
      historyList.appendChild(historyItemElement);
    });
  });
}

function createHistoryItem(item) {
  const historyItem = document.createElement('div');
  historyItem.className = 'history-item';
  historyItem.innerHTML = `
    <div class="history-item-header">
      <span>${item.date}</span>
      <span>${getLanguageName(item.language)}</span>
    </div>
    <div class="history-item-text">${item.originalText}</div>
    <div class="history-item-translation">${item.translatedText}</div>
    <div class="history-actions">
      <button class="history-action-btn favorite-btn" data-id="${item.id}">
        ${item.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
      <button class="history-action-btn copy-btn" data-text="${item.translatedText}">Copy</button>
      ${item.hasAudio ? '<button class="history-action-btn play-btn" data-id="' + item.id + '">Play</button>' : ''}
      <button class="history-action-btn delete-btn" data-id="${item.id}">Delete</button>
    </div>
  `;
  
  // Add event listeners
  historyItem.querySelector('.favorite-btn').addEventListener('click', toggleFavorite);
  historyItem.querySelector('.copy-btn').addEventListener('click', copyToClipboard);
  if (item.hasAudio) {
    historyItem.querySelector('.play-btn').addEventListener('click', playAudio);
  }
  historyItem.querySelector('.delete-btn').addEventListener('click', deleteHistoryItem);
  
  return historyItem;
}

function clearHistory() {
  if (confirm('Are you sure you want to clear all history?')) {
    chrome.storage.local.set({ history: [] }, () => {
      loadHistory();
      showNotification('History cleared');
    });
  }
}

function exportHistory() {
  chrome.storage.local.get('history', (data) => {
    const history = data.history || [];
    
    if (history.length === 0) {
      showNotification('No history to export');
      return;
    }
    
    const exportData = history.map(item => {
      return `Date: ${item.date}\nLanguage: ${getLanguageName(item.language)}\nOriginal: ${item.originalText}\nTranslation: ${item.translatedText}\n\n`;
    }).join('');
    
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jali-translation-history.txt';
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('History exported successfully');
  });
}

function deleteHistoryItem(e) {
  const itemId = e.target.getAttribute('data-id');
  
  chrome.storage.local.get('history', (data) => {
    let history = data.history || [];
    history = history.filter(item => item.id !== itemId);
    
    chrome.storage.local.set({ history }, () => {
      loadHistory();
      showNotification('Item removed from history');
    });
  });
}

// Favorites Management
function loadFavorites() {
  chrome.storage.local.get('favorites', (data) => {
    const favorites = data.favorites || [];
    
    if (favorites.length === 0) {
      favoritesList.innerHTML = `
        <div class="empty-state">
          Your favorite translations will appear here
        </div>
      `;
      return;
    }
    
    favoritesList.innerHTML = '';
    favorites.forEach(item => {
      const favoriteItemElement = createHistoryItem(item);
      favoritesList.appendChild(favoriteItemElement);
    });
  });
}

function toggleFavorite(e) {
  const itemId = e.target.getAttribute('data-id');
  const isFavoriteBtn = e.target.textContent.includes('Remove');
  
  chrome.storage.local.get(['history', 'favorites'], (data) => {
    let history = data.history || [];
    let favorites = data.favorites || [];
    
    // Find the item in history
    const historyItem = history.find(item => item.id === itemId);
    
    if (historyItem) {
      // Update the isFavorite status in history
      historyItem.isFavorite = !isFavoriteBtn;
      
      if (!isFavoriteBtn) {
        // Add to favorites
        favorites.push(historyItem);
        showNotification('Added to favorites');
      } else {
        // Remove from favorites
        favorites = favorites.filter(item => item.id !== itemId);
        showNotification('Removed from favorites');
      }
      
      // Save updated data
      chrome.storage.local.set({ 
        history: history,
        favorites: favorites 
      }, () => {
        loadHistory();
        loadFavorites();
      });
    }
  });
}

function clearFavorites() {
  if (confirm('Are you sure you want to clear all favorites?')) {
    chrome.storage.local.get('history', (data) => {
      let history = data.history || [];
      
      // Update isFavorite flag in history items
      history = history.map(item => {
        item.isFavorite = false;
        return item;
      });
      
      chrome.storage.local.set({ 
        history: history,
        favorites: [] 
      }, () => {
        loadFavorites();
        loadHistory();
        showNotification('Favorites cleared');
      });
    });
  }
}

// API Key Management
function loadApiKeys() {
  chrome.storage.sync.get('apiKeys', (data) => {
    const apiKeys = data.apiKeys || [];
    
    if (apiKeys.length === 0) {
      apiKeysList.innerHTML = `
        <div class="empty-state">
          Add API keys to use different profiles
        </div>
      `;
      return;
    }
    
    apiKeysList.innerHTML = '';
    apiKeys.forEach((key, index) => {
      const keyElement = document.createElement('div');
      keyElement.className = 'api-key-item';
      keyElement.innerHTML = `
        <div class="api-key-name">${key.name}</div>
        <div class="api-key-actions">
          <button class="api-key-btn edit-key-btn" data-index="${index}">Edit</button>
          <button class="api-key-btn delete-key-btn" data-index="${index}">Delete</button>
        </div>
      `;
      
      keyElement.querySelector('.edit-key-btn').addEventListener('click', editApiKey);
      keyElement.querySelector('.delete-key-btn').addEventListener('click', deleteApiKey);
      
      apiKeysList.appendChild(keyElement);
    });
  });
}

function addApiKey() {
  const name = document.getElementById('api-key-name').value.trim();
  const value = document.getElementById('api-key-value').value.trim();
  
  if (!name || !value) {
    showNotification('Please enter both name and API key');
    return;
  }
  
  chrome.storage.sync.get('apiKeys', (data) => {
    const apiKeys = data.apiKeys || [];
    
    // Check for duplicate names
    if (apiKeys.some(key => key.name === name)) {
      showNotification('A profile with this name already exists');
      return;
    }
    
    apiKeys.push({ name, value });
    
    chrome.storage.sync.set({ apiKeys }, () => {
      document.getElementById('api-key-name').value = '';
      document.getElementById('api-key-value').value = '';
      loadApiKeys();
      showNotification('API key added successfully');
    });
  });
}

function editApiKey(e) {
  const index = parseInt(e.target.getAttribute('data-index'));
  
  chrome.storage.sync.get('apiKeys', (data) => {
    const apiKeys = data.apiKeys || [];
    const key = apiKeys[index];
    
    if (key) {
      document.getElementById('api-key-name').value = key.name;
      document.getElementById('api-key-value').value = key.value;
      
      // Remove the old key
      deleteApiKey(e, () => {
        // Focus on the add button
        addApiKeyBtn.focus();
      });
    }
  });
}

function deleteApiKey(e, callback) {
  const index = parseInt(e.target.getAttribute('data-index'));
  
  chrome.storage.sync.get('apiKeys', (data) => {
    let apiKeys = data.apiKeys || [];
    
    apiKeys.splice(index, 1);
    
    chrome.storage.sync.set({ apiKeys }, () => {
      loadApiKeys();
      showNotification('API key removed');
      if (callback) callback();
    });
  });
}

// Utility Functions
function copyToClipboard(e) {
  const text = e.target.getAttribute('data-text');
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard');
  });
}

function playAudio(e) {
  const itemId = e.target.getAttribute('data-id');
  
  chrome.storage.local.get('history', (data) => {
    const history = data.history || [];
    const item = history.find(item => item.id === itemId);
    
    if (item && item.audioData) {
      // Create audio element and play
      const audio = new Audio(item.audioData);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        showNotification('Error playing audio');
      });
    } else {
      showNotification('Audio not available');
    }
  });
}

function showNotification(message) {
  // Create a notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '10px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.padding = '8px 16px';
  notification.style.backgroundColor = '#f5db57';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  notification.style.zIndex = '1000';
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

function getLanguageName(code) {
  const languages = {
    'tw': 'Twi',
    'ee': 'Ewe',
    'gaa': 'Ga',
    'fat': 'Fante',
    'dag': 'Dagbani',
    'gur': 'Gurene',
    'yo': 'Yoruba',
    'ki': 'Kikuyu',
    'luo': 'Luo',
    'mer': 'Kimeru'
  };
  
  return languages[code] || code;
}

// Communication with background script
function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}
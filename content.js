// content.js - Handles in-page UI and interactions with the webpage

// CSS for the overlay UI - will be injected dynamically
const overlayStyles = `
  :root {
    --primary: #f8e473;
    --primary-dark: #e6cc45;
    --secondary: #fffdf0;
    --text: #333;
    --text-light: #666;
    --border: #e3d7a3;
    --radius: 12px;
    --transition: all 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .jali-translate-menu {
    position: fixed;
    top: 20%;
    right: 20px;
    background-color: var(--secondary);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 15px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: 'Georgia', 'Times New Roman', serif;
    max-width: 450px;
    transition: var(--transition);
    line-height: 1.6;
    letter-spacing: 0.5px;
    word-spacing: 2px;
    animation: fadeIn 0.5s ease-out;
  }

  .jali-translate-menu.zen-mode {
    background-color: #fffff8;
    max-width: 400px;
  }

  .jali-translate-menu.high-contrast {
    background-color: #000;
    color: #fff;
    border-color: #fff;
  }

  .jali-translate-menu p, 
  .jali-translate-menu label, 
  .jali-translate-menu input, 
  .jali-translate-menu select, 
  .jali-translate-menu button {
    line-height: 1.8;
    margin-bottom: 0.8em;
  }

  .jali-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .jali-logo {
    font-weight: bold;
    font-size: 18px;
    color: #755c00;
    font-family: 'Palatino', 'Book Antiqua', serif;
  }

  .jali-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #755c00;
    transition: var(--transition);
  }

  .jali-close-btn:hover {
    transform: translateY(-2px);
  }

  .jali-language-dropdown {
    width: 100%;
    padding: 12px;
    margin-bottom: 10px;
    border: 2px solid var(--border);
    border-radius: var(--radius);
    background-color: #fffef5;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 15px;
    transition: var(--transition);
  }

  .jali-language-dropdown:focus {
    outline: none;
    border-color: var(--primary-dark);
    box-shadow: 0 0 0 3px rgba(248, 228, 115, 0.3);
  }

  .jali-options {
    display: flex;
    gap: 15px;
    margin-bottom: 10px;
  }

  .jali-option-label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    font-weight: bold;
    color: #755c00;
    padding-left: 5px;
  }

  .jali-translate-button {
    width: 100%;
    padding: 12px;
    background-color: var(--primary);
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    font-weight: bold;
    transition: var(--transition);
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 15px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    position: relative;
    overflow: hidden;
  }

  .jali-translate-button:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  .jali-translate-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(0,0,0,0.1);
  }

  .jali-translate-button::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: -100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: 0.4s;
  }

  .jali-translate-button:hover::after {
    left: 100%;
  }

  .jali-result-container {
    margin-top: 15px;
    border-top: 1px dashed var(--border);
    padding-top: 15px;
    animation: fadeIn 0.4s ease-out;
  }

  .jali-translation-result {
    min-height: 50px;
    max-height: 200px;
    overflow-y: auto;
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 12px;
    margin-bottom: 10px;
    background-color: #fffef5;
    transition: var(--transition);
  }

  .jali-toolbar {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }

  .jali-toolbar-button {
    background-color: var(--primary);
    border: none;
    border-radius: var(--radius);
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    transition: var(--transition);
    font-family: 'Georgia', 'Times New Roman', serif;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .jali-toolbar-button:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
  }

  .jali-highlighted-text {
    background-color: rgba(248, 228, 115, 0.3);
    position: relative;
  }

  .jali-highlighted-text:hover::after {
    content: attr(data-translation);
    position: absolute;
    bottom: 100%;
    left: 0;
    background-color: var(--secondary);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 10px;
    font-size: 15px;
    z-index: 9999;
    white-space: nowrap;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    animation: fadeIn 0.3s ease-out;
    font-family: 'Georgia', 'Times New Roman', serif;
    line-height: 1.8;
    letter-spacing: 0.5px;
    word-spacing: 2px;
  }

  .jali-audio-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  *:focus {
    outline: 3px solid var(--primary);
    outline-offset: 2px;
  }
`;

// Inject styles on content script load
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = overlayStyles;
  document.head.appendChild(style);
})();

// Global tracking of highlighted text instances
const highlightedTextInstances = new Map();

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    showTranslateMenu(request.text);
  }
  return true;
});

// Show the translation menu/overlay
function showTranslateMenu(selectedText) {
  // Remove existing menu if present
  const existingMenu = document.getElementById('jaliTranslateMenu');
  if (existingMenu) existingMenu.remove();

  // Fetch user settings
  chrome.storage.sync.get(['defaultLanguage', 'theme', 'fontSize', 'useHighContrast', 'apiKey', 'zenMode'], settings => {
    // Create the translation menu
    const menu = document.createElement('div');
    menu.id = 'jaliTranslateMenu';
    menu.className = `jali-translate-menu ${settings.useHighContrast ? 'high-contrast' : ''} ${settings.zenMode ? 'zen-mode' : ''}`;
    menu.style.fontSize = getFontSizeValue(settings.fontSize || 'medium');
    
    // Set menu content
    menu.innerHTML = `
      <div class="jali-header">
        <span class="jali-logo">JALI</span>
        <button class="jali-close-btn">&times;</button>
      </div>

      <select id="jaliLanguageDropdown" class="jali-language-dropdown">
        <option value="tw" ${settings.defaultLanguage === 'tw' ? 'selected' : ''}>Twi</option>
        <option value="ee" ${settings.defaultLanguage === 'ee' ? 'selected' : ''}>Ewe</option>
        <option value="gaa" ${settings.defaultLanguage === 'gaa' ? 'selected' : ''}>Ga</option>
        <option value="fat" ${settings.defaultLanguage === 'fat' ? 'selected' : ''}>Fante</option>
        <option value="dag" ${settings.defaultLanguage === 'dag' ? 'selected' : ''}>Dagbani</option>
        <option value="gur" ${settings.defaultLanguage === 'gur' ? 'selected' : ''}>Gurene</option>
        <option value="yo" ${settings.defaultLanguage === 'yo' ? 'selected' : ''}>Yoruba</option>
        <option value="ki" ${settings.defaultLanguage === 'ki' ? 'selected' : ''}>Kikuyu</option>
        <option value="luo" ${settings.defaultLanguage === 'luo' ? 'selected' : ''}>Luo</option>
        <option value="mer" ${settings.defaultLanguage === 'mer' ? 'selected' : ''}>Kimeru</option>
      </select>

      <div class="jali-options">
        <label class="jali-option-label">
          <input type="checkbox" id="jaliTranslateOption" checked>
          <span>Text</span>
        </label>
        <label class="jali-option-label">
          <input type="checkbox" id="jaliAudioOption">
          <span>Audio</span>
        </label>
        <label class="jali-option-label">
          <input type="checkbox" id="jaliHighlightOption">
          <span>Highlight</span>
        </label>
      </div>

      <button id="jaliTranslateButton" class="jali-translate-button">Translate</button>

      <div id="jaliResultContainer" class="jali-result-container" style="display: none;">
        <div id="jaliTranslationResult" class="jali-translation-result"></div>
        
        <div id="jaliAudioContainer" class="jali-audio-container" style="display: none;">
          <audio id="jaliTranslationAudio" controls></audio>
          <button id="jaliDownloadAudio" class="jali-toolbar-button">Download</button>
        </div>
        
        <div class="jali-toolbar">
          <button id="jaliCopyText" class="jali-toolbar-button">Copy Text</button>
          <button id="jaliSaveFavorite" class="jali-toolbar-button">Save to Favorites</button>
          <button id="jaliExportImage" class="jali-toolbar-button">Export as Image</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    // Add event listeners
    setupEventListeners(selectedText, settings.apiKey);
  });
}

// Set up event listeners for the menu
function setupEventListeners(selectedText, apiKey) {
  const menu = document.getElementById('jaliTranslateMenu');
  const closeBtn = menu.querySelector('.jali-close-btn');
  const translateBtn = document.getElementById('jaliTranslateButton');
  const copyTextBtn = document.getElementById('jaliCopyText');
  const saveFavoriteBtn = document.getElementById('jaliSaveFavorite');
  const exportImageBtn = document.getElementById('jaliExportImage');
  const downloadAudioBtn = document.getElementById('jaliDownloadAudio');
  
  // Close button
  closeBtn.addEventListener('click', () => menu.remove());

  // Translate button
  translateBtn.addEventListener('click', () => {
    const targetLang = document.getElementById('jaliLanguageDropdown').value;
    const shouldTranslate = document.getElementById('jaliTranslateOption').checked;
    const shouldGetAudio = document.getElementById('jaliAudioOption').checked;
    const shouldHighlight = document.getElementById('jaliHighlightOption').checked;
    
    const resultContainer = document.getElementById('jaliResultContainer');
    const translationResult = document.getElementById('jaliTranslationResult');
    const audioContainer = document.getElementById('jaliAudioContainer');
    const translationAudio = document.getElementById('jaliTranslationAudio');
    
    resultContainer.style.display = 'block';
    translationResult.innerText = 'Translating...';
    
    // Get the API key from storage
    chrome.storage.sync.get(['apiKey'], data => {
      const activeApiKey = apiKey || data.apiKey;
      
      // Make translation request to background script
      chrome.runtime.sendMessage({
        action: 'translateText',
        text: selectedText,
        sourceLang: 'en',
        targetLang: targetLang,
        apiKey: activeApiKey
      }, response => {
        if (response.success) {
          const translatedText = response.data;
          
          // Display translated text if option is selected
          if (shouldTranslate) {
            translationResult.innerText = translatedText;
          } else {
            translationResult.innerText = '[Translation hidden]';
          }
          
          // Highlight the original text on the page if option is selected
          if (shouldHighlight) {
            highlightTextOnPage(selectedText, translatedText, targetLang);
          }
          
          // Get audio if option is selected and language is supported
          if (shouldGetAudio) {
            audioContainer.style.display = 'flex';
            
            chrome.runtime.sendMessage({
              action: 'getAudio',
              text: translatedText,
              language: targetLang,
              apiKey: activeApiKey
            }, audioResponse => {
              if (audioResponse.success) {
                translationAudio.src = audioResponse.data;
                translationAudio.style.display = 'block';
              } else {
                translationResult.innerText += '\n\n[Audio not available for this language]';
              }
            });
          } else {
            audioContainer.style.display = 'none';
          }
          
          // Save translation to history
          chrome.runtime.sendMessage({
            action: 'saveTranslation',
            originalText: selectedText,
            translatedText: translatedText,
            language: targetLang,
            timestamp: Date.now()
          });
        } else {
          translationResult.innerText = 'Translation failed. Please try again.';
        }
      });
    });
  });
  
  // Copy text button
  copyTextBtn.addEventListener('click', () => {
    const text = document.getElementById('jaliTranslationResult').innerText;
    navigator.clipboard.writeText(text)
      .then(() => {
        copyTextBtn.innerText = 'Copied!';
        setTimeout(() => {
          copyTextBtn.innerText = 'Copy Text';
        }, 2000);
      });
  });
  
  // Save to favorites button
  saveFavoriteBtn.addEventListener('click', () => {
    const originalText = selectedText;
    const translatedText = document.getElementById('jaliTranslationResult').innerText;
    const language = document.getElementById('jaliLanguageDropdown').value;
    
    chrome.storage.sync.get(['favorites'], data => {
      const favorites = data.favorites || [];
      favorites.unshift({
        originalText,
        translatedText,
        language,
        timestamp: Date.now()
      });
      
      chrome.storage.sync.set({ favorites }, () => {
        saveFavoriteBtn.innerText = 'Saved!';
        setTimeout(() => {
          saveFavoriteBtn.innerText = 'Save to Favorites';
        }, 2000);
      });
    });
  });
  
  // Export as image button
  exportImageBtn.addEventListener('click', () => {
    const resultContainer = document.getElementById('jaliResultContainer');
    
    html2canvas(resultContainer).then(canvas => {
      const link = document.createElement('a');
      link.download = 'jali-translation.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  });
  
  // Download audio button
  downloadAudioBtn.addEventListener('click', () => {
    const audio = document.getElementById('jaliTranslationAudio');
    if (audio.src) {
      const link = document.createElement('a');
      link.download = 'jali-audio.mp3';
      link.href = audio.src;
      link.click();
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (menu && !menu.contains(event.target)) {
      menu.remove();
    }
  });
}

// Highlight selected text on the page
function highlightTextOnPage(originalText, translatedText, language) {
  // Search for text nodes containing the exact text
  const textNodes = [];
  findTextNodes(document.body, originalText, textNodes);
  
  // Highlight each occurrence
  textNodes.forEach(node => {
    const range = document.createRange();
    range.selectNodeContents(node);
    
    const span = document.createElement('span');
    span.className = 'jali-highlighted-text';
    span.setAttribute('data-translation', translatedText);
    span.setAttribute('data-language', language);
    
    range.surroundContents(span);
    
    // Store reference for later retrieval
    const uniqueId = 'jali-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    span.id = uniqueId;
    highlightedTextInstances.set(uniqueId, {
      originalText,
      translatedText,
      language
    });
  });
}

// Helper function to find text nodes containing a specific string
function findTextNodes(element, searchText, results) {
  if (element.nodeType === Node.TEXT_NODE) {
    if (element.textContent.includes(searchText)) {
      results.push(element);
    }
  } else {
    for (let i = 0; i < element.childNodes.length; i++) {
      findTextNodes(element.childNodes[i], searchText, results);
    }
  }
}

// Helper function to get font size value based on user setting
function getFontSizeValue(size) {
  const sizes = {
    'small': '12px',
    'medium': '14px',
    'large': '16px',
    'x-large': '18px'
  };
  return sizes[size] || sizes.medium;
}

// Simple implementation of html2canvas for image export
// In a real extension, you would include the actual library
function html2canvas(element) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = element.offsetWidth;
    canvas.height = element.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fffdf0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText('JALI Translation', 10, 20);
    ctx.fillText(element.querySelector('#jaliTranslationResult').innerText, 10, 50);
    resolve(canvas);
  });
}
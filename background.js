// background.js - Handles API requests, context menu, and storage management

// Service worker setup and context menu creation
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: "translateText",
    title: "Translate Text",
    contexts: ["selection"]
  });

  // Initialize storage with default settings if not already set
  chrome.storage.sync.get(['apiKey', 'defaultLanguage', 'saveHistory', 'theme', 'fontSize', 'useHighContrast'], result => {
    if (!result.apiKey) {
      chrome.storage.sync.set({
        apiKey: '9e262bab68f04e20aab7f5a9d0410c92', // Default API key
        apiKeys: {}, // For storing multiple API keys with profile names
        defaultLanguage: 'tw',
        saveHistory: true,
        theme: 'banana',
        fontSize: 'medium',
        useHighContrast: false,
        translationHistory: []
      });
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateText") {
    chrome.tabs.sendMessage(tab.id, {
      action: "translate",
      text: info.selectionText
    });
  }
});

// Handle API requests from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translateText") {
    translateText(request.text, request.sourceLang, request.targetLang, request.apiKey)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === "getAudio") {
    getAudioForText(request.text, request.language, request.apiKey)
      .then(audioData => sendResponse({ success: true, data: audioData }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === "saveTranslation") {
    saveTranslationToHistory(request.originalText, request.translatedText, request.language, request.timestamp);
    sendResponse({ success: true });
    return true;
  }
});

// Translation API function
async function translateText(text, sourceLang, targetLang, apiKey) {
  try {
    const body = {
      "in": text,
      "lang": `${sourceLang}-${targetLang}`
    };

    const response = await fetch('https://translation-api.ghananlp.org/v1/translate', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

// Text-to-Speech API function
async function getAudioForText(text, language, apiKey) {
  try {
    const body = {
      "text": text,
      "language": language
    };

    const response = await fetch('https://translation-api.ghananlp.org/tts/v1/tts', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error('Audio generation failed');
    }

    // Return base64 encoded audio data
    const blob = await response.blob();
    return await blobToBase64(blob);
  } catch (error) {
    console.error('Audio generation error:', error);
    throw error;
  }
}

// Helper function to convert blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Save translation to history in storage
function saveTranslationToHistory(originalText, translatedText, language, timestamp) {
  chrome.storage.sync.get(['translationHistory', 'saveHistory'], result => {
    if (result.saveHistory === false) return;
    
    let history = result.translationHistory || [];
    history.unshift({
      originalText,
      translatedText,
      language,
      timestamp: timestamp || Date.now()
    });
    
    // Limit history to 100 items
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    
    chrome.storage.sync.set({ translationHistory: history });
  });
}
// background.js - Chrome Extension Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('Vocalis extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    groqKey: '',
    calendarKey: '',
    translateKey: '',
    enableMeetings: true,
    enableLiveStream: true
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(null, (settings) => {
      sendResponse(settings);
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set(request.data, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'transcribe') {
    // Handle transcription request
    sendResponse({ status: 'processing' });
  }
});

// Right-click context menu
chrome.contextMenus.create({
  id: 'vocalis-record',
  title: 'Start Vocalis Recording',
  contexts: ['page']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'vocalis-record') {
    chrome.tabs.sendMessage(tab.id, { action: 'startRecording' });
  }
});
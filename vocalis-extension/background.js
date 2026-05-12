// background.js - Service Worker

chrome.runtime.onInstalled.addListener(() => {
    console.log('✅ Vocalis installed');
    
    chrome.storage.sync.set({
        language: 'en-US',
        liveCaption: true,
        autoExport: false
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.sync.get(null, (items) => {
            sendResponse(items);
        });
        return true;
    }
});
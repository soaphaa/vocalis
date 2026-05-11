// popup.js - Extension popup functionality

// Get elements
const groqKey = document.getElementById('groqKey');
const calendarKey = document.getElementById('calendarKey');
const translateKey = document.getElementById('translateKey');
const detectLang = document.getElementById('detectLang');
const translateLang = document.getElementById('translateLang');
const enableMeetings = document.getElementById('enableMeetings');
const enableLiveStream = document.getElementById('enableLiveStream');
const btnSave = document.getElementById('btnSave');
const btnOpen = document.getElementById('btnOpen');
const statusMsg = document.getElementById('statusMsg');

// Load settings on popup open
document.addEventListener('DOMContentLoaded', loadSettings);

// Save settings when button clicked
btnSave.addEventListener('click', saveSettings);

// Open app in new tab
btnOpen.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://vocalis-cyan.vercel.app/' });
});

// Load settings from Chrome storage
function loadSettings() {
    chrome.storage.sync.get(
        {
            groqKey: '',
            calendarKey: '',
            translateKey: '',
            detectLang: 'auto',
            translateLang: 'none',
            enableMeetings: true,
            enableLiveStream: true
        },
        (items) => {
            groqKey.value = items.groqKey;
            calendarKey.value = items.calendarKey;
            translateKey.value = items.translateKey;
            detectLang.value = items.detectLang;
            translateLang.value = items.translateLang;
            enableMeetings.checked = items.enableMeetings;
            enableLiveStream.checked = items.enableLiveStream;
        }
    );
}

// Save settings to Chrome storage
function saveSettings() {
    if (!groqKey.value) {
        showStatus('⚠️ Groq API key is required', false);
        return;
    }

    const settings = {
        groqKey: groqKey.value,
        calendarKey: calendarKey.value,
        translateKey: translateKey.value,
        detectLang: detectLang.value,
        translateLang: translateLang.value,
        enableMeetings: enableMeetings.checked,
        enableLiveStream: enableLiveStream.checked
    };

    chrome.storage.sync.set(settings, () => {
        showStatus('✓ Settings saved', true);
        
        // Hide message after 2 seconds
        setTimeout(() => {
            statusMsg.classList.remove('show');
        }, 2000);
    });
}

// Show status message
function showStatus(message, success) {
    statusMsg.textContent = message;
    statusMsg.classList.add('show');
    
    if (!success) {
        statusMsg.style.background = 'rgba(239, 68, 68, 0.1)';
        statusMsg.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        statusMsg.style.color = '#ef4444';
    }
}
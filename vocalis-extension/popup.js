// popup.js - Extension popup functionality

// DEFAULT GROQ KEY
const DEFAULT_GROQ_KEY = '';

// Get elements
const groqKey = document.getElementById('groqKey');
const calendarKey = document.getElementById('calendarKey');
const translateKey = document.getElementById('translateKey');
const detectLang = document.getElementById('detectLang');
const translateLang = document.getElementById('translateLang');
const enableMeetings = document.getElementById('enableMeetings');
const enableLiveStream = document.getElementById('enableLiveStream');
const btnSave = document.getElementById('btnSave');
const btnClose = document.getElementById('btnClose');
const statusMsg = document.getElementById('statusMsg');

// Accessibility controls
const btnTextSize = document.getElementById('btnTextSize');
const btnContrast = document.getElementById('btnContrast');
const btnDyslexia = document.getElementById('btnDyslexia');

let textSizeMultiplier = 1;
let isHighContrast = false;
let isDyslexiaMode = false;

// Load settings on popup open
document.addEventListener('DOMContentLoaded', loadSettings);

// Save settings when button clicked
btnSave.addEventListener('click', saveSettings);

// Close popup
btnClose.addEventListener('click', () => {
    window.close();
});

// ========== ACCESSIBILITY CONTROLS ==========

// A+ Button (Text Size)
btnTextSize.addEventListener('click', () => {
    textSizeMultiplier += 0.1;
    if (textSizeMultiplier > 1.5) textSizeMultiplier = 1;
    
    const baseFontSize = 13;
    const newSize = baseFontSize * textSizeMultiplier;
    document.body.style.fontSize = newSize + 'px';
});

// ◐ Button (High Contrast)
btnContrast.addEventListener('click', () => {
    isHighContrast = !isHighContrast;
    
    if (isHighContrast) {
        document.body.style.background = '#ffffff';
        document.body.style.color = '#000000';
        document.querySelectorAll('input, select, button, label').forEach(el => {
            el.style.color = '#000000';
        });
        btnContrast.classList.add('active');
    } else {
        document.body.style.background = '#0f1419';
        document.body.style.color = '#e2e8f0';
        btnContrast.classList.remove('active');
        location.reload();
    }
});

// D Button (Dyslexia Font)
btnDyslexia.addEventListener('click', () => {
    isDyslexiaMode = !isDyslexiaMode;
    
    if (isDyslexiaMode) {
        document.body.style.fontFamily = "'OpenDyslexic', 'Arial', sans-serif";
        document.body.style.letterSpacing = '0.5px';
        btnDyslexia.classList.add('active');
        
        // Load OpenDyslexic font
        const link = document.createElement('link');
        link.href = 'https://cdn.jsdelivr.net/npm/opendyslexic@1.0.10/index.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    } else {
        document.body.style.fontFamily = "'Sora', sans-serif";
        document.body.style.letterSpacing = 'normal';
        btnDyslexia.classList.remove('active');
    }
});

// ========== SETTINGS FUNCTIONS ==========

// Load settings from Chrome storage
function loadSettings() {
    chrome.storage.sync.get(
        {
            groqKey: DEFAULT_GROQ_KEY,  // Default hybrid key
            calendarKey: '',
            translateKey: '',
            detectLang: 'auto',
            translateLang: 'none',
            enableMeetings: true,
            enableLiveStream: true
        },
        (items) => {
            groqKey.value = items.groqKey;
            groqKey.type = 'password';  // Show as dots ••••••
            calendarKey.value = items.calendarKey;
            calendarKey.type = 'password';
            translateKey.value = items.translateKey;
            translateKey.type = 'password';
            detectLang.value = items.detectLang;
            translateLang.value = items.translateLang;
            enableMeetings.checked = items.enableMeetings;
            enableLiveStream.checked = items.enableLiveStream;
            
            // Auto-save default if first time
            if (!items.groqKey || items.groqKey === DEFAULT_GROQ_KEY) {
                chrome.storage.sync.set({groqKey: DEFAULT_GROQ_KEY});
            }
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
    } else {
        statusMsg.style.background = 'rgba(16, 185, 129, 0.1)';
        statusMsg.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        statusMsg.style.color = '#10b981';
    }
}
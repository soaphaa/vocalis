// popup.js - Settings handler

const langSelect = document.getElementById('langSelect');
const enableLiveCaption = document.getElementById('enableLiveCaption');
const enableAutoExport = document.getElementById('enableAutoExport');
const btnSave = document.getElementById('btnSave');
const btnA = document.getElementById('btnA');
const btnCon = document.getElementById('btnCon');
const status = document.getElementById('status');

let fontSize = 100;
let highContrast = false;

// Load settings
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get({
        language: 'en-US',
        liveCaption: true,
        autoExport: false
    }, (items) => {
        langSelect.value = items.language;
        enableLiveCaption.checked = items.liveCaption;
        enableAutoExport.checked = items.autoExport;
    });
});

// Save settings
btnSave.addEventListener('click', () => {
    const settings = {
        language: langSelect.value,
        liveCaption: enableLiveCaption.checked,
        autoExport: enableAutoExport.checked
    };

    chrome.storage.sync.set(settings, () => {
        status.textContent = 'Settings saved';
        status.className = 'status success';
        setTimeout(() => {
            status.className = 'status';
        }, 2000);
    });
});

// Accessibility - Text size
btnA.addEventListener('click', () => {
    fontSize += 10;
    if (fontSize > 150) fontSize = 100;
    document.body.style.fontSize = (fontSize / 100) * 13 + 'px';
});

// Accessibility - Contrast
btnCon.addEventListener('click', () => {
    highContrast = !highContrast;
    if (highContrast) {
        document.body.style.background = '#ffffff';
        document.body.style.color = '#000000';
        document.querySelectorAll('select, button').forEach(el => {
            el.style.background = '#f5f5f5';
            el.style.color = '#000000';
            el.style.borderColor = '#000000';
        });
        btnCon.style.background = '#000000';
        btnCon.style.color = '#ffffff';
    } else {
        document.body.style.background = '#0f1419';
        document.body.style.color = '#e2e8f0';
        document.querySelectorAll('select, button').forEach(el => {
            el.style.background = '#2d3748';
            el.style.color = '#e2e8f0';
        });
        btnCon.style.background = '#2d3748';
        btnCon.style.color = '#e2e8f0';
    }
});
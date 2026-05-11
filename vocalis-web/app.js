// VOCALIS - SIMPLE PHASE 3 APP
// Live transcription, translation, meeting detection

// CONSTANTS
const GROQ_API = 'https://api.groq.com/openai/v1/audio/transcriptions';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

// STATE
let recording = false;
let paused = false;
let audioChunks = [];
let mediaRecorder = null;
let mediaStream = null;
let recordStartTime = null;
let currentText = '';
let currentTranslation = '';
let targetLanguage = 'none';

// API KEYS
let groqKey = localStorage.getItem('groqKey') || '';
let calendarKey = localStorage.getItem('calendarKey') || '';
let translateKey = localStorage.getItem('translateKey') || '';

// SETTINGS
let enableMeetings = localStorage.getItem('enableMeetings') !== 'false';
let enableLiveStream = localStorage.getItem('enableLiveStream') !== 'false';

// DOM ELEMENTS
const btnRecord = document.getElementById('btnRecord');
const btnPause = document.getElementById('btnPause');
const btnSettings = document.getElementById('btnSettings');
const btnCloseSettings = document.getElementById('btnCloseSettings');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const btnClearData = document.getElementById('btnClearData');

const timer = document.getElementById('timer');
const statusDot = document.getElementById('statusDot');
const transcriptOriginal = document.getElementById('transcriptOriginal');
const transcriptTranslation = document.getElementById('transcriptTranslation');
const transcriptSection = document.getElementById('transcriptSection');
const translationPanel = document.getElementById('translationPanel');

const settingsModal = document.getElementById('settingsModal');
const inputGroqKey = document.getElementById('inputGroqKey');
const inputCalendarKey = document.getElementById('inputCalendarKey');
const inputTranslateKey = document.getElementById('inputTranslateKey');
const selectLanguage = document.getElementById('selectLanguage');
const selectTranslate = document.getElementById('selectTranslate');
const checkMeetings = document.getElementById('checkMeetings');
const checkLiveStream = document.getElementById('checkLiveStream');

const meetingNotif = document.getElementById('meetingNotif');
const notifText = document.getElementById('notifText');
const btnAddMeeting = document.getElementById('btnAddMeeting');
const btnDismiss = document.getElementById('btnDismiss');

const btnCopy = document.getElementById('btnCopy');
const btnDownload = document.getElementById('btnDownload');
const btnToggleTranslate = document.getElementById('btnToggleTranslate');
const historyList = document.getElementById('historyList');

// INITIALIZE
document.addEventListener('DOMContentLoaded', function() {
    // Load API keys
    if (groqKey) inputGroqKey.value = groqKey;
    if (calendarKey) inputCalendarKey.value = calendarKey;
    if (translateKey) inputTranslateKey.value = translateKey;
    
    // Load settings
    checkMeetings.checked = enableMeetings;
    checkLiveStream.checked = enableLiveStream;
    
    // Setup listeners
    btnRecord.addEventListener('click', toggleRecording);
    btnPause.addEventListener('click', togglePause);
    btnSettings.addEventListener('click', openSettings);
    btnCloseSettings.addEventListener('click', closeSettings);
    btnSaveSettings.addEventListener('click', saveSettings);
    btnClearData.addEventListener('click', clearData);
    btnCopy.addEventListener('click', copyText);
    btnDownload.addEventListener('click', downloadText);
    btnToggleTranslate.addEventListener('click', toggleTranslate);
    btnAddMeeting.addEventListener('click', addMeeting);
    btnDismiss.addEventListener('click', dismissMeeting);
    
    settingsModal.addEventListener('click', function(e) {
        if (e.target === settingsModal) closeSettings();
    });
    
    loadHistory();
});

// RECORDING
async function toggleRecording() {
    if (recording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(mediaStream);
        audioChunks = [];
        currentText = '';
        currentTranslation = '';
        recording = true;
        paused = false;
        recordStartTime = Date.now();
        
        // Process audio in 1-second chunks for live streaming
        mediaRecorder.start(1000);
        
        // When each chunk is available
        mediaRecorder.ondataavailable = async (event) => {
            audioChunks.push(event.data);
            
            // Live stream: process chunk immediately
            if (enableLiveStream) {
                const transcription = await transcribeChunk(event.data);
                if (transcription) {
                    currentText += (currentText ? ' ' : '') + transcription;
                    displayLiveText(transcription);
                    
                    // Translate if enabled
                    if (targetLanguage !== 'none' && translateKey) {
                        const translated = await translateChunk(transcription);
                        if (translated) {
                            currentTranslation += (currentTranslation ? ' ' : '') + translated;
                            displayLiveTranslation(translated);
                        }
                    }
                    
                    // Check for meetings
                    if (enableMeetings) {
                        checkForMeetings(transcription);
                    }
                }
            }
        };
        
        mediaRecorder.onstop = function() {
            // If not live streaming, process now
            if (!enableLiveStream) {
                processAllAudio();
            }
        };
        
        updateUI();
        transcriptSection.style.display = 'block';
        startTimer();
        
    } catch (error) {
        alert('Microphone access denied');
        console.error(error);
    }
}

function stopRecording() {
    mediaRecorder.stop();
    mediaStream.getTracks().forEach(track => track.stop());
    recording = false;
    paused = false;
    updateUI();
}

function togglePause() {
    if (paused) {
        mediaRecorder.resume();
        paused = false;
    } else {
        mediaRecorder.pause();
        paused = true;
    }
    updateUI();
}

// TRANSCRIPTION
async function transcribeChunk(chunk) {
    if (!groqKey) return null;
    
    try {
        const formData = new FormData();
        formData.append('file', chunk, 'audio.webm');
        formData.append('model', 'whisper-large-v3-turbo');
        
        const response = await fetch(GROQ_API, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${groqKey}` },
            body: formData
        });
        
        if (!response.ok) return null;
        const data = await response.json();
        return data.text;
        
    } catch (error) {
        console.error('Transcription error:', error);
        return null;
    }
}

async function processAllAudio() {
    // Process entire recording at once
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const text = await transcribeChunk(audioBlob);
    if (text) {
        currentText = text;
        displayLiveText(text);
    }
}

// DISPLAY
function displayLiveText(text) {
    const p = document.createElement('p');
    p.textContent = text;
    p.style.color = '#0066cc';
    p.style.fontWeight = '500';
    transcriptOriginal.appendChild(p);
    transcriptOriginal.scrollTop = transcriptOriginal.scrollHeight;
}

function displayLiveTranslation(text) {
    const p = document.createElement('p');
    p.textContent = text;
    p.style.color = '#0066cc';
    p.style.fontWeight = '500';
    transcriptTranslation.appendChild(p);
    transcriptTranslation.scrollTop = transcriptTranslation.scrollHeight;
}

// TRANSLATION
async function translateChunk(text) {
    if (!translateKey || !text) return null;
    
    try {
        const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': translateKey
            },
            body: JSON.stringify({
                q: text,
                target: targetLanguage,
                source: 'auto'
            })
        });
        
        if (!response.ok) return null;
        const data = await response.json();
        return data.data?.translations?.[0]?.translatedText;
        
    } catch (error) {
        console.error('Translation error:', error);
        return null;
    }
}

function toggleTranslate() {
    const lang = selectTranslate.value;
    if (lang === 'none') {
        targetLanguage = 'none';
        translationPanel.style.display = 'none';
        btnToggleTranslate.textContent = 'Enable Translation';
    } else {
        targetLanguage = lang;
        translationPanel.style.display = 'block';
        btnToggleTranslate.textContent = 'Disable Translation';
    }
}

// MEETING DETECTION
function checkForMeetings(text) {
    const patterns = [
        /let[']?s\s+(?:meet|do|schedule|call)\s+(?:on\s+)?(\w+\s+\d{1,2})/gi,
        /meeting\s+(?:on|at|for)\s+(\w+\s+\d{1,2})/gi,
        /how\s+about\s+(\w+\s+\d{1,2})/gi
    ];
    
    patterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const dateStr = match[1];
            showMeetingNotif(dateStr, text);
        }
    });
}

function showMeetingNotif(date, context) {
    notifText.textContent = `"${context.substring(0, 60)}..." Schedule for ${date}?`;
    meetingNotif.dataset.date = date;
    meetingNotif.classList.add('show');
    
    setTimeout(() => {
        meetingNotif.classList.remove('show');
    }, 8000);
}

async function addMeeting() {
    const date = meetingNotif.dataset.date;
    if (!calendarKey) {
        alert('Google Calendar API key needed');
        return;
    }
    
    try {
        const parsed = parseDate(date);
        const event = {
            summary: 'Meeting',
            start: { date: parsed },
            end: { date: parsed }
        };
        
        const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${calendarKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });
        
        if (response.ok) {
            alert('Added to calendar!');
            meetingNotif.classList.remove('show');
        }
    } catch (error) {
        console.error('Calendar error:', error);
    }
}

function dismissMeeting() {
    meetingNotif.classList.remove('show');
}

function parseDate(dateStr) {
    // Simple parsing: just return today's date for now
    // In production would use better parsing
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// TIMER
function startTimer() {
    const timerInterval = setInterval(() => {
        if (!recording) {
            clearInterval(timerInterval);
            return;
        }
        
        const elapsed = Math.floor((Date.now() - recordStartTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        timer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
}

// UI
function updateUI() {
    if (recording) {
        btnRecord.classList.add('recording');
        btnRecord.textContent = '⏹️ Stop Recording';
        btnPause.disabled = false;
        statusDot.classList.add('recording');
    } else {
        btnRecord.classList.remove('recording');
        btnRecord.textContent = '🎤 Start Recording';
        btnPause.disabled = true;
        statusDot.classList.remove('recording');
    }
    
    btnPause.textContent = paused ? 'Resume' : 'Pause';
}

// ACTIONS
function copyText() {
    navigator.clipboard.writeText(currentText);
    alert('Copied!');
}

function downloadText() {
    const element = document.createElement('a');
    element.href = URL.createObjectURL(new Blob([currentText], { type: 'text/plain' }));
    element.download = `vocalis_${new Date().toISOString().slice(0, 10)}.txt`;
    element.click();
}

// SETTINGS
function openSettings() {
    settingsModal.classList.add('show');
}

function closeSettings() {
    settingsModal.classList.remove('show');
}

function saveSettings() {
    groqKey = inputGroqKey.value;
    calendarKey = inputCalendarKey.value;
    translateKey = inputTranslateKey.value;
    enableMeetings = checkMeetings.checked;
    enableLiveStream = checkLiveStream.checked;
    
    localStorage.setItem('groqKey', groqKey);
    localStorage.setItem('calendarKey', calendarKey);
    localStorage.setItem('translateKey', translateKey);
    localStorage.setItem('enableMeetings', enableMeetings);
    localStorage.setItem('enableLiveStream', enableLiveStream);
    
    closeSettings();
    alert('Saved!');
}

async function clearData() {
    if (!confirm('Clear all sessions?')) return;
    
    try {
        await db.clearAll('sessions');
        historyList.innerHTML = '<p class="empty-msg">No sessions yet</p>';
    } catch (error) {
        console.error(error);
    }
}

// HISTORY
async function saveSession() {
    const session = {
        timestamp: new Date().toISOString(),
        text: currentText,
        duration: Math.round((Date.now() - recordStartTime) / 1000),
        hasTranslation: currentTranslation.length > 0
    };
    
    try {
        await db.addSession(session);
        loadHistory();
    } catch (error) {
        console.error(error);
    }
}

async function loadHistory() {
    try {
        const sessions = await db.getAllSessions();
        historyList.innerHTML = '';
        
        if (sessions.length === 0) {
            historyList.innerHTML = '<p class="empty-msg">No sessions yet</p>';
            return;
        }
        
        sessions.reverse().slice(0, 9).forEach(session => {
            const div = document.createElement('div');
            div.className = 'history-item';
            
            const date = new Date(session.timestamp).toLocaleDateString();
            const preview = session.text.substring(0, 100);
            const duration = session.duration;
            
            div.innerHTML = `
                <div class="history-date">${date}</div>
                <div class="history-text">${session.text.substring(0, 50)}...</div>
                <div class="history-preview">${preview}...</div>
                <div class="history-meta">${duration}s ${session.hasTranslation ? '• Translated' : ''}</div>
            `;
            
            historyList.appendChild(div);
        });
    } catch (error) {
        console.error(error);
    }
}

console.log('Vocalis Phase 3 loaded');
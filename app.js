/**
 * ============================================
 * ACCESSTALK - MAIN APPLICATION LOGIC
 * Phase 1: Audio Capture & Groq Transcription
 * ============================================
 * 
 * This file handles:
 * 1. Audio recording from microphone
 * 2. Sending audio to Groq Whisper API
 * 3. Displaying real-time transcription
 * 4. Removing filler words
 * 5. Managing recording sessions
 * 
 * IMPORTANT: This is where AI integration happens!
 */

// ========== CONSTANTS ==========
const FILLER_WORDS = [
    'um', 'uh', 'like', 'you know', 'basically', 'literally',
    'actually', 'you know what', 'so like', 'i mean', 'anyway',
    'err', 'umm', 'ahh', 'well'
];

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/audio/transcriptions';

// ========== STATE MANAGEMENT ==========
const appState = {
    isRecording: false,
    isPaused: false,
    audioChunks: [],        // Stores audio data
    mediaRecorder: null,
    mediaStream: null,
    currentTranscription: '',
    sessionStartTime: null,
    recordingDuration: 0,
    apiKey: localStorage.getItem('groqApiKey') || '',
};

// ========== DOM ELEMENTS ==========
const elements = {
    // Buttons
    recordBtn: document.getElementById('recordBtn'),
    overlayBtn: document.getElementById('overlayBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    clearDataBtn: document.getElementById('clearDataBtn'),
    
    // Display areas
    transcriptionDisplay: document.getElementById('transcriptionDisplay'),
    statusBar: document.getElementById('statusBar'),
    statusIndicator: document.getElementById('statusIndicator'),
    statusText: document.getElementById('statusText'),
    recordingTime: document.getElementById('recordingTime'),
    wordCount: document.getElementById('wordCount'),
    languageDisplay: document.getElementById('languageDisplay'),
    
    // AI status
    aiIndicator: document.getElementById('aiIndicator'),
    aiStatusText: document.getElementById('aiStatusText'),
    
    // History
    historyList: document.getElementById('historyList'),
    
    // Settings modal
    settingsModal: document.getElementById('settingsModal'),
    groqApiKey: document.getElementById('groqApiKey'),
    languageSelect: document.getElementById('languageSelect'),
    filterFillerWords: document.getElementById('filterFillerWords'),
    enableSpeakerDetection: document.getElementById('enableSpeakerDetection'),
    enableTranslation: document.getElementById('enableTranslation'),
    overlayOpacity: document.getElementById('overlayOpacity'),
    
    // Other
    loadingOverlay: document.getElementById('loadingOverlay'),
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 AccessTalk initializing...');
    
    // Load saved API key
    if (appState.apiKey) {
        elements.groqApiKey.value = appState.apiKey;
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load recording history from database
    loadHistory();
    
    console.log('✅ AccessTalk ready!');
});

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Recording controls
    elements.recordBtn.addEventListener('click', toggleRecording);
    elements.pauseBtn.addEventListener('click', togglePause);
    
    // Settings
    elements.settingsBtn.addEventListener('click', openSettings);
    elements.closeSettingsBtn.addEventListener('click', closeSettings);
    elements.saveSettingsBtn.addEventListener('click', saveSettings);
    elements.clearDataBtn.addEventListener('click', clearAllData);
    
    // Close modal when clicking outside
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            closeSettings();
        }
    });
}

// ========== RECORDING FUNCTIONS ==========

/**
 * Toggle recording on/off
 * 
 * WHAT THIS DOES:
 * 1. Request microphone access
 * 2. Create MediaRecorder to capture audio
 * 3. Collect audio chunks as they're recorded
 * 4. When done, send to Groq API for transcription
 * 
 * KEY CONCEPT: This is where audio capture happens!
 */
async function toggleRecording() {
    if (appState.isRecording) {
        // STOP recording
        stopRecording();
    } else {
        // START recording
        startRecording();
    }
}

async function startRecording() {
    try {
        console.log('🎤 Requesting microphone access...');
        
        // REQUEST MICROPHONE ACCESS
        // This is a browser permission - user must allow access
        appState.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });
        
        console.log('✅ Microphone access granted');
        
        // INITIALIZE MediaRecorder
        // This object captures audio from the microphone
        appState.mediaRecorder = new MediaRecorder(appState.mediaStream);
        appState.audioChunks = [];
        
        // Collect audio data as it's recorded
        appState.mediaRecorder.ondataavailable = (event) => {
            appState.audioChunks.push(event.data);
        };
        
        // When recording stops, process the audio
        appState.mediaRecorder.onstop = () => {
            processRecordedAudio();
        };
        
        // START RECORDING
        appState.mediaRecorder.start();
        appState.isRecording = true;
        appState.sessionStartTime = Date.now();
        
        // Update UI
        updateRecordingUI();
        startTimerUpdate();
        
        console.log('⏹️ Recording started');
    } catch (error) {
        console.error('❌ Microphone access denied:', error);
        showError('Please allow microphone access to use AccessTalk');
    }
}

function stopRecording() {
    if (!appState.mediaRecorder) return;
    
    console.log('⏹️ Stopping recording...');
    
    // Stop the MediaRecorder
    appState.mediaRecorder.stop();
    
    // Stop the audio stream
    appState.mediaStream.getTracks().forEach(track => track.stop());
    
    appState.isRecording = false;
    appState.isPaused = false;
    
    // Update UI
    updateRecordingUI();
    
    console.log('✅ Recording stopped');
}

function togglePause() {
    if (appState.isPaused) {
        appState.mediaRecorder.resume();
        appState.isPaused = false;
    } else {
        appState.mediaRecorder.pause();
        appState.isPaused = true;
    }
    
    updateRecordingUI();
}

/**
 * Process audio after recording stops
 * 
 * WHAT THIS DOES:
 * 1. Converts collected audio chunks into a single audio file (Blob)
 * 2. Sends to Groq Whisper API
 * 3. Receives transcription text
 * 4. Cleans up filler words
 * 5. Displays result and saves to database
 * 
 * KEY CONCEPT: This is where AI enters!
 * Groq Whisper API is an AI model that converts speech → text
 */
async function processRecordedAudio() {
    try {
        // CREATE audio blob from chunks
        // A "blob" is binary data - in this case, audio data
        const audioBlob = new Blob(appState.audioChunks, {
            type: 'audio/webm'
        });
        
        console.log(`📁 Audio blob created: ${(audioBlob.size / 1024).toFixed(2)} KB`);
        
        // SEND TO GROQ API
        // This is the AI part - Groq receives audio and returns text
        showProcessing(true);
        const transcription = await sendToGroqAPI(audioBlob);
        showProcessing(false);
        
        if (!transcription) {
            showError('Transcription failed. Check your API key in settings.');
            return;
        }
        
        // CLEAN UP transcription
        const cleaned = cleanTranscription(transcription);
        
        appState.currentTranscription = cleaned;
        
        // DISPLAY results
        displayTranscription(cleaned);
        updateStats();
        
        // SAVE to database
        await saveSession(cleaned);
        
        console.log('✅ Transcription complete');
    } catch (error) {
        console.error('❌ Error processing audio:', error);
        showError('An error occurred while processing audio');
    }
}

/**
 * Send audio to Groq Whisper API
 * 
 * WHAT IS AN API?
 * API = Application Programming Interface
 * It's a way to communicate with another computer (in this case, Groq's servers)
 * 
 * WHAT HAPPENS:
 * 1. We package the audio file with our API key
 * 2. Send it to Groq's server via HTTP POST request
 * 3. Wait for response
 * 4. Get back the text transcription
 * 
 * WHY GROQ?
 * - Fast (10x faster than OpenAI)
 * - Cheap (good pricing)
 * - Accurate (uses same Whisper model)
 */
async function sendToGroqAPI(audioBlob) {
    if (!appState.apiKey) {
        showError('No API key set. Please add your Groq API key in settings.');
        return null;
    }
    
    try {
        // CREATE FormData to send to API
        // FormData is how we send files to web servers
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-large-v3-turbo');
        formData.append('language', elements.languageSelect.value);
        
        console.log('📤 Sending audio to Groq API...');
        console.log(`Model: whisper-large-v3-turbo`);
        console.log(`Language: ${elements.languageSelect.value}`);
        
        // SEND HTTP POST REQUEST
        // fetch() = send data to a web server
        // headers = metadata about the request
        // Authorization = tells Groq who we are using API key
        const response = await fetch(GROQ_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${appState.apiKey}`
            },
            body: formData,
            timeout: 30000  // 30 second timeout
        });
        
        console.log(`📥 Response status: ${response.status}`);
        
        // CHECK if request was successful
        if (!response.ok) {
            const error = await response.json();
            console.error('API Error:', error);
            
            if (response.status === 401) {
                showError('Invalid API key. Check your Groq credentials.');
            } else {
                showError(`API Error: ${error.error?.message || 'Unknown error'}`);
            }
            return null;
        }
        
        // PARSE response
        // response.json() = convert response from JSON format to JavaScript object
        const data = await response.json();
        
        console.log('✅ Transcription received from Groq');
        console.log(`Text: ${data.text.substring(0, 100)}...`);
        
        return data.text;
    } catch (error) {
        console.error('❌ Network error:', error);
        showError('Network error. Check your connection and API key.');
        return null;
    }
}

/**
 * Clean transcription by removing filler words
 * 
 * WHAT THIS DOES:
 * "um, like, i think we should, uh, meet tomorrow"
 * becomes:
 * "i think we should meet tomorrow"
 * 
 * This uses REGEX - a way to find and replace text patterns
 * \\b = word boundary (don't match partial words)
 * 'gi' = global (all occurrences) + case-insensitive
 */
function cleanTranscription(text) {
    let cleaned = text;
    
    // Remove filler words if setting is enabled
    if (elements.filterFillerWords.checked) {
        FILLER_WORDS.forEach(word => {
            // Create a regex pattern for each filler word
            // \\b ensures we only match whole words
            // 'gi' = global + case-insensitive
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            cleaned = cleaned.replace(regex, '');
        });
        
        // Clean up extra spaces
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
    }
    
    return cleaned;
}

/**
 * Display transcription in the UI
 */
function displayTranscription(text) {
    elements.transcriptionDisplay.innerHTML = '';
    
    // Split into paragraphs for better readability
    const paragraphs = text.split(/\n\n+/);
    
    paragraphs.forEach(para => {
        const p = document.createElement('p');
        p.textContent = para;
        elements.transcriptionDisplay.appendChild(p);
    });
    
    console.log('📝 Transcription displayed');
}

/**
 * Update word count and language display
 */
function updateStats() {
    const words = appState.currentTranscription.split(/\s+/).length;
    elements.wordCount.textContent = words;
    
    const language = elements.languageSelect.options[elements.languageSelect.selectedIndex].text;
    elements.languageDisplay.textContent = language;
}

// ========== TIMER FUNCTIONS ==========

/**
 * Update recording time display (MM:SS format)
 */
function startTimerUpdate() {
    const timerInterval = setInterval(() => {
        if (!appState.isRecording) {
            clearInterval(timerInterval);
            return;
        }
        
        const elapsed = Math.floor((Date.now() - appState.sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        elements.recordingTime.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        elements.recordingTime.classList.remove('hidden');
    }, 1000);
}

// ========== UI UPDATE FUNCTIONS ==========

/**
 * Update button states and visual indicators
 */
function updateRecordingUI() {
    if (appState.isRecording) {
        // Recording is active
        elements.recordBtn.classList.add('recording');
        elements.recordBtn.querySelector('.btn-text').textContent = 'Stop Recording';
        elements.pauseBtn.disabled = false;
        elements.overlayBtn.disabled = false;
        
        // Update status
        elements.statusIndicator.classList.remove('active');
        elements.statusIndicator.classList.add('recording');
        elements.statusText.textContent = 'Recording...';
    } else {
        // Recording is stopped
        elements.recordBtn.classList.remove('recording');
        elements.recordBtn.querySelector('.btn-text').textContent = 'Start Recording';
        elements.pauseBtn.disabled = true;
        elements.recordingTime.classList.add('hidden');
        
        // Update status
        elements.statusIndicator.classList.remove('recording');
        elements.statusText.textContent = appState.currentTranscription ? 'Completed' : 'Ready';
    }
    
    // Pause button text
    if (appState.isPaused) {
        elements.pauseBtn.querySelector('.btn-text').textContent = 'Resume';
    } else {
        elements.pauseBtn.querySelector('.btn-text').textContent = 'Pause';
    }
}

/**
 * Show/hide AI processing indicator
 */
function showProcessing(isProcessing) {
    if (isProcessing) {
        elements.aiIndicator.classList.add('processing');
        elements.aiStatusText.textContent = 'Processing with Groq Whisper...';
        elements.loadingOverlay.classList.add('active');
    } else {
        elements.aiIndicator.classList.remove('processing');
        elements.aiStatusText.textContent = 'Ready';
        elements.loadingOverlay.classList.remove('active');
    }
}

/**
 * Show error message
 */
function showError(message) {
    elements.aiIndicator.classList.add('error');
    elements.aiStatusText.textContent = `Error: ${message}`;
    console.error('❌', message);
    
    setTimeout(() => {
        elements.aiIndicator.classList.remove('error');
        elements.aiStatusText.textContent = 'Ready';
    }, 5000);
}

// ========== SETTINGS MODAL ==========

/**
 * Open settings modal
 */
function openSettings() {
    elements.settingsModal.classList.add('active');
}

/**
 * Close settings modal
 */
function closeSettings() {
    elements.settingsModal.classList.remove('active');
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    // Save API key
    const apiKey = elements.groqApiKey.value.trim();
    if (apiKey) {
        localStorage.setItem('groqApiKey', apiKey);
        appState.apiKey = apiKey;
        console.log('✅ Settings saved');
    } else {
        showError('Please enter a Groq API key');
        return;
    }
    
    closeSettings();
}

/**
 * Clear all data from database
 */
async function clearAllData() {
    if (!confirm('Are you sure? This will delete all transcription history.')) {
        return;
    }
    
    try {
        await db.clearAll('sessions');
        elements.historyList.innerHTML = 
            '<p class="placeholder-text">No sessions yet. Start recording to create one.</p>';
        console.log('✅ All data cleared');
    } catch (error) {
        showError('Failed to clear data');
        console.error(error);
    }
}

// ========== DATABASE FUNCTIONS ==========

/**
 * Save a recording session to database
 */
async function saveSession(transcription) {
    const session = {
        timestamp: new Date().toISOString(),
        text: transcription,
        duration: appState.recordingDuration,
        language: elements.languageSelect.value,
        wordCount: transcription.split(/\s+/).length
    };
    
    try {
        await db.addSession(session);
        console.log('✅ Session saved to database');
        loadHistory();
    } catch (error) {
        console.error('❌ Failed to save session:', error);
    }
}

/**
 * Load and display recording history
 */
async function loadHistory() {
    try {
        const sessions = await db.getAllSessions();
        
        if (sessions.length === 0) {
            elements.historyList.innerHTML = 
                '<p class="placeholder-text">No sessions yet. Start recording to create one.</p>';
            return;
        }
        
        elements.historyList.innerHTML = '';
        
        // Show most recent first
        sessions.reverse().slice(0, 5).forEach(session => {
            const item = createHistoryItem(session);
            elements.historyList.appendChild(item);
        });
        
        console.log(`✅ Loaded ${sessions.length} sessions`);
    } catch (error) {
        console.error('❌ Failed to load history:', error);
    }
}

/**
 * Create a history item DOM element
 */
function createHistoryItem(session) {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    const date = new Date(session.timestamp);
    const timeStr = date.toLocaleString();
    
    div.innerHTML = `
        <div class="history-item-title">
            ${date.toLocaleDateString()}
        </div>
        <div class="history-item-meta">
            <span>${session.wordCount} words</span>
            <span>${session.duration}s duration</span>
        </div>
        <div class="history-item-preview">
            ${session.text.substring(0, 150)}...
        </div>
    `;
    
    return div;
}

// ========== EXPORTS ==========
// Make functions available globally for testing
window.app = {
    toggleRecording,
    saveSettings,
    showError
};

console.log('📚 AccessTalk app.js loaded');
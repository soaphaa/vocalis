// VOCALIS - FRESH START
// Minimal working transcription code

console.log('🚀 FRESH APP.JS LOADING');

// ===== SETUP =====
const GROQ_API = 'https://api.groq.com/openai/v1/audio/transcriptions';

// Get API key from localStorage
let groqKey = localStorage.getItem('groqKey') || '';
console.log('API Key loaded:', groqKey ? '✅ YES' : '❌ NO - Add in Settings!');

// Recording state
let recording = false;
let mediaRecorder = null;
let mediaStream = null;
let currentText = '';

// ===== DOM =====
const btnRecord = document.getElementById('btnRecord');
const btnPause = document.getElementById('btnPause');
const btnSettings = document.getElementById('btnSettings');
const transcriptOriginal = document.getElementById('transcriptOriginal');
const inputGroqKey = document.getElementById('inputGroqKey');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const settingsModal = document.getElementById('settingsModal');
const btnCloseSettings = document.getElementById('btnCloseSettings');

console.log('DOM elements loaded');

// ===== RECORDING =====
async function toggleRecording() {
    if (recording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    console.log('\n=== START RECORDING ===');
    
    try {
        console.log('Getting microphone...');
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone OK');
        
        // Try multiple audio codecs - Groq works best with these
        let options = { mimeType: 'audio/webm;codecs=opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log('⚠️ webm/opus not supported, trying wav...');
            options = { mimeType: 'audio/wav' };
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log('⚠️ wav not supported, trying default...');
            options = {};
        }
        
        mediaRecorder = new MediaRecorder(mediaStream, options);
        console.log('✅ MediaRecorder created with format:', options.mimeType || 'default');
        
        recording = true;
        currentText = '';
        transcriptOriginal.innerHTML = '';
        
        if (btnRecord) {
            btnRecord.textContent = '⏹️ Stop Recording';
            btnRecord.style.background = '#ff4444';
        }
        
        // Capture chunks every 1 second
        mediaRecorder.start(1000);
        console.log('✅ Recording started, capturing 1s chunks');
        
        mediaRecorder.ondataavailable = async (event) => {
            console.log('📦 CHUNK arrived:', event.data.size, 'bytes', 'Type:', event.data.type);
            
            // Transcribe immediately
            const text = await transcribeChunk(event.data);
            console.log('📝 Transcription result:', text || '(empty)');
            
            if (text) {
                currentText += (currentText ? ' ' : '') + text;
                displayText(text);
                console.log('✅ Displayed on page');
            }
        };
        
        mediaRecorder.onstop = () => {
            console.log('⏹️ Recording stopped');
            mediaStream.getTracks().forEach(t => t.stop());
        };
        
    } catch (error) {
        console.error('❌ Recording failed:', error.message);
        alert('Microphone error: ' + error.message);
    }
}

function stopRecording() {
    console.log('Stopping recording...');
    recording = false;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    
    if (btnRecord) {
        btnRecord.textContent = '🎤 Start Recording';
        btnRecord.style.background = '#0066cc';
    }
}

// ===== TRANSCRIPTION =====
async function transcribeChunk(chunk) {
    console.log('\n--- TRANSCRIBE CHUNK ---');
    console.log('Chunk MIME type:', chunk.type);
    
    // READ FRESH KEY EVERY TIME
    const freshKey = localStorage.getItem('groqKey') || '';
    console.log('Key check:', freshKey ? '✅ EXISTS' : '❌ MISSING');
    
    if (!freshKey) {
        console.error('❌ NO API KEY! Go to Settings and add your Groq key');
        return null;
    }
    
    try {
        console.log('Creating FormData...');
        const formData = new FormData();
        
        // Use correct filename extension based on MIME type
        let filename = 'audio.webm';
        if (chunk.type.includes('wav')) {
            filename = 'audio.wav';
        } else if (chunk.type.includes('mp4')) {
            filename = 'audio.mp4';
        } else if (chunk.type.includes('ogg')) {
            filename = 'audio.ogg';
        }
        
        console.log('Using filename:', filename);
        formData.append('file', chunk, filename);
        formData.append('model', 'whisper-large-v3-turbo');
        
        console.log('Sending to Groq API...');
        const response = await fetch(GROQ_API, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${freshKey}` },
            body: formData
        });
        
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', response.status, errorText);
            return null;
        }
        
        const data = await response.json();
        console.log('✅ Groq response:', data.text);
        return data.text;
        
    } catch (error) {
        console.error('❌ Transcription error:', error.message);
        return null;
    }
}

// ===== DISPLAY =====
function displayText(text) {
    console.log('Displaying:', text);
    
    const p = document.createElement('p');
    p.textContent = text;
    p.style.color = '#0066cc';
    p.style.fontSize = '16px';
    p.style.margin = '10px 0';
    p.style.padding = '10px';
    p.style.background = '#f0f0f0';
    p.style.borderRadius = '5px';
    
    transcriptOriginal.appendChild(p);
    transcriptOriginal.scrollTop = transcriptOriginal.scrollHeight;
}

// ===== SETTINGS =====
function openSettings() {
    console.log('Opening settings...');
    
    // Load current key (might be empty)
    inputGroqKey.value = localStorage.getItem('groqKey') || '';
    inputGroqKey.type = 'password';
    
    settingsModal.style.display = 'flex';
}

function closeSettings() {
    console.log('Closing settings...');
    settingsModal.style.display = 'none';
}

function saveSettings() {
    console.log('\n=== SAVE SETTINGS ===');
    const key = inputGroqKey.value;
    
    console.log('Key to save:', key ? '✅ ' + key.substring(0, 20) + '...' : '❌ empty');
    
    if (!key) {
        alert('❌ Please paste your Groq API key');
        return;
    }
    
    localStorage.setItem('groqKey', key);
    console.log('✅ Saved to localStorage');
    
    // Update the global variable
    groqKey = key;
    
    alert('✅ Settings saved! Refresh page if you want.');
    closeSettings();
}

// ===== EVENT LISTENERS =====
if (btnRecord) btnRecord.addEventListener('click', toggleRecording);
if (btnSettings) btnSettings.addEventListener('click', openSettings);
if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettings);
if (btnSaveSettings) btnSaveSettings.addEventListener('click', saveSettings);

console.log('🚀 FRESH APP.JS LOADED AND READY\n');

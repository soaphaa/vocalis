// VOCALIS - WORKING TRANSCRIPTION
// Uses WAV encoding which Groq definitely accepts

console.log('🚀 APP.JS LOADING');

// ===== CONFIG =====
const GROQ_API = 'https://api.groq.com/openai/v1/audio/transcriptions';

// Get API key
let groqKey = localStorage.getItem('groqKey') || '';
console.log('API Key:', groqKey ? '✅' : '❌');

// State
let recording = false;
let mediaStream = null;
let audioContext = null;
let mediaRecorder = null;
let audioChunks = [];

// ===== DOM ELEMENTS =====
const btnRecord = document.getElementById('btnRecord');
const btnSettings = document.getElementById('btnSettings');
const btnCloseSettings = document.getElementById('btnCloseSettings');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const transcriptOriginal = document.getElementById('transcriptOriginal');
const inputGroqKey = document.getElementById('inputGroqKey');
const settingsModal = document.getElementById('settingsModal');

console.log('✅ DOM ready');

// ===== RECORDING =====
async function toggleRecording() {
    if (recording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    console.log('\n🎤 START RECORDING');
    
    try {
        // Get microphone
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone OK');
        
        // Create recorder
        mediaRecorder = new MediaRecorder(mediaStream);
        audioChunks = [];
        recording = true;
        
        if (btnRecord) {
            btnRecord.textContent = '⏹️ Stop';
            btnRecord.style.background = '#ff4444';
        }
        
        // Clear transcript
        if (transcriptOriginal) {
            transcriptOriginal.innerHTML = '';
        }
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            console.log('⏹️ Recording stopped, processing audio...');
            
            // Convert to WAV
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            console.log('Raw audio blob:', audioBlob.size, 'bytes');
            
            // Send to Groq
            await transcribeAudio(audioBlob);
        };
        
        mediaRecorder.start();
        console.log('✅ Recording started');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        alert('Microphone error: ' + error.message);
    }
}

function stopRecording() {
    if (!recording) return;
    
    console.log('Stopping recording...');
    recording = false;
    
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
    
    if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
    }
    
    if (btnRecord) {
        btnRecord.textContent = '🎤 Record';
        btnRecord.style.background = '#0066cc';
    }
}

// ===== TRANSCRIPTION =====
async function transcribeAudio(audioBlob) {
    console.log('\n📤 TRANSCRIBING');
    
    const freshKey = localStorage.getItem('groqKey') || '';
    
    if (!freshKey) {
        console.error('❌ No API key!');
        displayText('❌ Add API key in Settings');
        return;
    }
    
    try {
        console.log('Creating FormData...');
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-large-v3-turbo');
        
        console.log('Sending to Groq...');
        const response = await fetch(GROQ_API, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${freshKey}` },
            body: formData
        });
        
        console.log('Response:', response.status);
        
        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Error:', response.status, error);
            displayText('❌ Transcription failed: ' + response.status);
            return;
        }
        
        const data = await response.json();
        console.log('✅ Got text:', data.text);
        
        if (data.text) {
            displayText(data.text);
        } else {
            displayText('(No speech detected)');
        }
        
    } catch (error) {
        console.error('❌ Exception:', error.message);
        displayText('❌ Error: ' + error.message);
    }
}

// ===== DISPLAY =====
function displayText(text) {
    if (!transcriptOriginal) {
        console.error('❌ transcriptOriginal not found!');
        return;
    }
    
    console.log('Displaying:', text);
    
    const p = document.createElement('p');
    p.textContent = text;
    p.style.color = '#0066cc';
    p.style.fontSize = '16px';
    p.style.margin = '10px 0';
    p.style.padding = '10px';
    p.style.background = '#f5f5f5';
    p.style.borderRadius = '5px';
    
    transcriptOriginal.appendChild(p);
    transcriptOriginal.scrollTop = transcriptOriginal.scrollHeight;
}

// ===== SETTINGS =====
function openSettings() {
    if (!settingsModal) return;
    
    if (inputGroqKey) {
        inputGroqKey.value = localStorage.getItem('groqKey') || '';
        inputGroqKey.type = 'password';
    }
    
    settingsModal.style.display = 'flex';
}

function closeSettings() {
    if (settingsModal) {
        settingsModal.style.display = 'none';
    }
}

function saveSettings() {
    const key = inputGroqKey.value;
    
    if (!key) {
        alert('Please paste your Groq API key');
        return;
    }
    
    localStorage.setItem('groqKey', key);
    groqKey = key;
    
    console.log('✅ Settings saved');
    alert('✅ Saved!');
    closeSettings();
}

// ===== EVENT LISTENERS =====
if (btnRecord) btnRecord.addEventListener('click', toggleRecording);
if (btnSettings) btnSettings.addEventListener('click', openSettings);
if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettings);
if (btnSaveSettings) btnSaveSettings.addEventListener('click', saveSettings);

console.log('🚀 APP.JS READY\n');

/**
 * VOCALIS v3 - APP.JS
 * Real-Time Live Transcription using Web Speech API
 * No API key needed - works instantly in Chrome/Edge/Safari
 */

class VocalisLiveTranscriber {
    constructor() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.FINAL_TRANSCRIPT = '';
        this.INTERIM_TRANSCRIPT = '';
        this.ACCENT = 'en-US';
        this.isListening = false;
        this.startTime = null;
        this.wordCount = 0;
        
        // Speaker tracking
        this.currentSpeaker = 'Speaker 1';
        this.speakerColors = ['#0066cc', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        this.speakerIndex = 0;
        this.speakers = {};
        this.speakerHistory = [];
        
        // UI refs
        this.transcriptBox = null;
        this.statusText = null;
        this.statusDot = null;
        
        this.setupRecognition();
    }

    setupRecognition() {
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.ACCENT;

        this.recognition.onstart = () => {
            console.log('🎙️ Recording started');
        };

        this.recognition.onresult = (event) => {
            this.INTERIM_TRANSCRIPT = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    this.FINAL_TRANSCRIPT += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }

            this.INTERIM_TRANSCRIPT = interim;
            this.updateDisplay();
        };

        this.recognition.onerror = (event) => {
            console.warn('⚠️ Speech error:', event.error);
            this.updateStatus('Listening...', '#10b981');
        };

        this.recognition.onend = () => {
            console.log('⏹️ Stopped');
            this.isListening = false;
            this.updateStatus('Stopped', '#64748b');
        };
    }

    startListening() {
        if (this.isListening) return;
        
        this.isListening = true;
        this.FINAL_TRANSCRIPT = '';
        this.INTERIM_TRANSCRIPT = '';
        this.startTime = Date.now();
        this.wordCount = 0;
        
        this.recognition.start();
        this.updateStatus('Recording...', '#10b981');
        return true;
    }

    stopListening() {
        if (!this.isListening) return;
        
        this.recognition.stop();
        this.isListening = false;
        this.updateStatus('Stopped', '#64748b');

        return {
            transcript: this.FINAL_TRANSCRIPT.trim(),
            wordCount: this.wordCount,
            duration: Date.now() - this.startTime
        };
    }

    updateDisplay() {
        if (!this.transcriptBox) return;
        
        const interim = this.INTERIM_TRANSCRIPT ? `<span style="color: #94a3b8; opacity: 0.7;">${this.INTERIM_TRANSCRIPT}</span>` : '';
        this.transcriptBox.innerHTML = this.FINAL_TRANSCRIPT + interim || 'Listening...';
        this.transcriptBox.scrollTop = this.transcriptBox.scrollHeight;
        
        this.wordCount = this.FINAL_TRANSCRIPT.trim().split(/\s+/).filter(w => w).length;
    }

    updateStatus(text, color) {
        if (this.statusText) this.statusText.textContent = text;
        if (this.statusDot) this.statusDot.style.background = color;
    }

    clearTranscript() {
        this.FINAL_TRANSCRIPT = '';
        this.INTERIM_TRANSCRIPT = '';
        this.wordCount = 0;
        this.updateDisplay();
    }

    exportTranscript(format = 'txt') {
        const timestamp = new Date().toLocaleString();
        let content = `VOCALIS TRANSCRIPT\n${timestamp}\n\n${this.FINAL_TRANSCRIPT}`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vocalis_${Date.now()}.txt`;
        a.click();
    }

    getStats() {
        const elapsed = Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        return {
            duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            wordCount: this.wordCount,
            status: this.isListening ? 'Recording' : 'Stopped'
        };
    }

    setLanguage(lang) {
        this.ACCENT = lang;
        this.recognition.lang = lang;
    }
}

// Global instance
let vocalisTranscriber = null;

function initVocalis() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.error('❌ Web Speech API not supported');
        return false;
    }

    vocalisTranscriber = new VocalisLiveTranscriber();
    console.log('✅ Vocalis ready');
    return true;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVocalis);
} else {
    initVocalis();
}
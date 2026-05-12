/**
 * VOCALIS v4 - APP.JS
 * COMPLETE WITH EXTENSIVE LOGGING
 */

console.log('[VOCALIS INIT] app.js script starting');

class VocalisLiveTranscriber {
    constructor() {
        console.log('[VOCALIS CONSTRUCTOR] ===== STARTING CONSTRUCTOR =====');
        console.log('[VOCALIS CONSTRUCTOR] Step 1: Getting SpeechRecognition');
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        console.log('[VOCALIS CONSTRUCTOR] SpeechRecognition available:', SpeechRecognition ? 'YES' : 'NO');
        
        if (!SpeechRecognition) {
            console.error('[VOCALIS ERROR] Web Speech API not available in this browser!');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        console.log('[VOCALIS CONSTRUCTOR] Step 2: SpeechRecognition instance created');
        
        this.FINAL_TRANSCRIPT = '';
        this.INTERIM_TRANSCRIPT = '';
        this.ACCENT = 'en-US';
        this.isListening = false;
        this.startTime = null;
        this.wordCount = 0;
        console.log('[VOCALIS CONSTRUCTOR] Step 3: Basic properties initialized');
        
        // Speaker tracking
        this.currentSpeaker = null;
        this.speakers = {};
        this.speakerHistory = [];
        this.speakerColors = ['#0066cc', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#a855f7'];
        this.nextSpeakerIndex = 0;
        console.log('[VOCALIS CONSTRUCTOR] Step 4: Speaker tracking initialized');
        
        // Language/translation support
        this.secondaryLanguage = null;
        this.secondaryRecognition = null;
        this.secondaryTranscript = '';
        console.log('[VOCALIS CONSTRUCTOR] Step 5: Language support initialized');
        
        // UI refs
        this.transcriptBox = null;
        this.statusText = null;
        this.statusDot = null;
        this.speakerDisplay = null;
        this.translationBox = null;
        this.taskDetectionCallback = null;
        console.log('[VOCALIS CONSTRUCTOR] Step 6: UI refs initialized (all null)');
        
        // Task detection
        this.detectedTasks = [];
        this.lastDetectionTime = 0;
        this.detectionCooldown = 2000;
        console.log('[VOCALIS CONSTRUCTOR] Step 7: Task detection initialized');
        
        this.setupRecognition();
        console.log('[VOCALIS CONSTRUCTOR] Step 8: setupRecognition() called');
        console.log('[VOCALIS CONSTRUCTOR] ===== CONSTRUCTOR COMPLETE =====');
    }

    setupRecognition() {
        console.log('[VOCALIS SETUP] ===== STARTING SETUP RECOGNITION =====');
        
        this.recognition.continuous = true;
        console.log('[VOCALIS SETUP] continuous = true');
        
        this.recognition.interimResults = true;
        console.log('[VOCALIS SETUP] interimResults = true');
        
        this.recognition.lang = this.ACCENT;
        console.log('[VOCALIS SETUP] lang = ' + this.ACCENT);

        this.recognition.onstart = () => {
            console.log('[VOCALIS EVENT onstart] ===== RECOGNITION STARTED =====');
            console.log('[VOCALIS EVENT onstart] User granted microphone access');
        };

        this.recognition.onresult = (event) => {
            console.log('[VOCALIS EVENT onresult] ===== GOT RESULTS =====');
            console.log('[VOCALIS EVENT onresult] Total results: ' + event.results.length);
            console.log('[VOCALIS EVENT onresult] Result index: ' + event.resultIndex);
            
            this.INTERIM_TRANSCRIPT = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const isFinal = event.results[i].isFinal;
                const confidence = event.results[i][0].confidence;
                
                console.log('[VOCALIS RESULT] Index: ' + i + ' | Text: "' + transcript + '" | Final: ' + isFinal + ' | Confidence: ' + confidence);
                
                if (isFinal) {
                    console.log('[VOCALIS FINAL] Adding to FINAL_TRANSCRIPT: "' + transcript + '"');
                    this.FINAL_TRANSCRIPT += transcript + ' ';
                    console.log('[VOCALIS FINAL] FINAL_TRANSCRIPT is now: "' + this.FINAL_TRANSCRIPT + '"');
                } else {
                    console.log('[VOCALIS INTERIM] Interim: "' + transcript + '"');
                    interim += transcript;
                }
            }

            this.INTERIM_TRANSCRIPT = interim;
            console.log('[VOCALIS EVENT onresult] Calling updateDisplay()');
            this.updateDisplay();
            console.log('[VOCALIS EVENT onresult] updateDisplay() returned');
        };

        this.recognition.onerror = (event) => {
            console.error('[VOCALIS ERROR onerror] Error: ' + event.error);
            this.updateStatus('Error: ' + event.error, '#ef4444');
        };

        this.recognition.onend = () => {
            console.log('[VOCALIS EVENT onend] Recognition ended');
            this.isListening = false;
            this.updateStatus('Stopped', '#64748b');
        };
        
        console.log('[VOCALIS SETUP] ===== SETUP COMPLETE =====');
    }

    startListening() {
        console.log('[VOCALIS START] ===== START LISTENING CALLED =====');
        console.log('[VOCALIS START] isListening: ' + this.isListening);
        
        if (this.isListening) {
            console.warn('[VOCALIS START] Already listening, returning false');
            return false;
        }
        
        try {
            console.log('[VOCALIS START] Setting flags...');
            this.isListening = true;
            console.log('[VOCALIS START] isListening set to TRUE');
            
            this.FINAL_TRANSCRIPT = '';
            this.INTERIM_TRANSCRIPT = '';
            this.startTime = Date.now();
            this.wordCount = 0;
            console.log('[VOCALIS START] Transcript reset, startTime: ' + this.startTime);
            
            if (!this.currentSpeaker && Object.keys(this.speakers).length === 0) {
                console.log('[VOCALIS START] No speakers exist, adding Speaker 1');
                this.addSpeaker('Speaker 1');
            }
            
            console.log('[VOCALIS START] Calling recognition.start()');
            this.recognition.start();
            console.log('[VOCALIS START] recognition.start() executed successfully');
            
            console.log('[VOCALIS START] Calling updateStatus');
            this.updateStatus('Recording...', '#10b981');
            console.log('[VOCALIS START] updateStatus called');
            
            console.log('[VOCALIS START] ===== START LISTENING RETURNING TRUE =====');
            return true;
        } catch (error) {
            console.error('[VOCALIS START ERROR] ' + error.message);
            console.error('[VOCALIS START ERROR] Stack: ' + error.stack);
            return false;
        }
    }

    stopListening() {
        console.log('[VOCALIS STOP] ===== STOP LISTENING CALLED =====');
        console.log('[VOCALIS STOP] isListening: ' + this.isListening);
        
        if (!this.isListening) {
            console.warn('[VOCALIS STOP] Not listening, returning null');
            return null;
        }
        
        try {
            console.log('[VOCALIS STOP] Calling recognition.stop()');
            this.recognition.stop();
            console.log('[VOCALIS STOP] recognition.stop() executed');
            
            this.isListening = false;
            console.log('[VOCALIS STOP] isListening set to FALSE');
            
            this.updateStatus('Stopped', '#64748b');
            
            const result = {
                transcript: this.FINAL_TRANSCRIPT.trim(),
                wordCount: this.wordCount,
                duration: Date.now() - this.startTime
            };
            console.log('[VOCALIS STOP] Final result: ' + JSON.stringify(result));
            return result;
        } catch (error) {
            console.error('[VOCALIS STOP ERROR] ' + error.message);
            return null;
        }
    }

    updateDisplay() {
        console.log('[VOCALIS DISPLAY] ===== UPDATE DISPLAY CALLED =====');
        console.log('[VOCALIS DISPLAY] transcriptBox is null: ' + (this.transcriptBox === null));
        
        if (!this.transcriptBox) {
            console.warn('[VOCALIS DISPLAY] transcriptBox is null, cannot update');
            return;
        }
        
        const interim = this.INTERIM_TRANSCRIPT ? '<span style="color: #94a3b8; opacity: 0.7;">' + this.INTERIM_TRANSCRIPT + '</span>' : '';
        const speakerPrefix = this.currentSpeaker ? '[' + this.currentSpeaker + '] ' : '';
        const displayText = speakerPrefix + this.FINAL_TRANSCRIPT + interim;
        
        console.log('[VOCALIS DISPLAY] Current speaker: ' + (this.currentSpeaker || 'NONE'));
        console.log('[VOCALIS DISPLAY] Display text length: ' + displayText.length);
        console.log('[VOCALIS DISPLAY] Display text preview: ' + displayText.substring(0, 100));
        
        this.transcriptBox.innerHTML = displayText || 'Listening...';
        this.transcriptBox.scrollTop = this.transcriptBox.scrollHeight;
        
        this.wordCount = this.FINAL_TRANSCRIPT.trim().split(/\s+/).filter(w => w).length;
        console.log('[VOCALIS DISPLAY] Word count: ' + this.wordCount);
        
        if (this.speakerDisplay && this.currentSpeaker) {
            console.log('[VOCALIS DISPLAY] Updating speaker display for: ' + this.currentSpeaker);
            const speaker = this.speakers[this.currentSpeaker];
            if (speaker) {
                this.speakerDisplay.innerHTML = '<span style="color: ' + speaker.color + '; font-weight: bold;">Now: ' + this.currentSpeaker + '</span>';
            }
        }
        
        console.log('[VOCALIS DISPLAY] Calling detectTasks');
        this.detectTasks();
        console.log('[VOCALIS DISPLAY] ===== UPDATE DISPLAY COMPLETE =====');
    }

    updateStatus(text, color) {
        console.log('[VOCALIS STATUS] text="' + text + '" color="' + color + '"');
        console.log('[VOCALIS STATUS] statusText is null: ' + (this.statusText === null));
        console.log('[VOCALIS STATUS] statusDot is null: ' + (this.statusDot === null));
        
        if (this.statusText) {
            this.statusText.textContent = text;
            console.log('[VOCALIS STATUS] statusText updated');
        }
        
        if (this.statusDot) {
            this.statusDot.style.background = color;
            console.log('[VOCALIS STATUS] statusDot color updated');
        }
    }

    addSpeaker(name) {
        console.log('[VOCALIS ADDSPEAKER] ===== ADD SPEAKER: ' + name + ' =====');
        console.log('[VOCALIS ADDSPEAKER] Speaker already exists: ' + (this.speakers[name] ? 'YES' : 'NO'));
        
        if (this.speakers[name]) {
            console.warn('[VOCALIS ADDSPEAKER] Speaker ' + name + ' already exists');
            return false;
        }
        
        const color = this.speakerColors[this.nextSpeakerIndex % this.speakerColors.length];
        this.speakers[name] = {
            name: name,
            color: color,
            statements: []
        };
        this.nextSpeakerIndex++;
        this.currentSpeaker = name;
        
        console.log('[VOCALIS ADDSPEAKER] Speaker added: ' + name + ' with color: ' + color);
        console.log('[VOCALIS ADDSPEAKER] currentSpeaker set to: ' + name);
        console.log('[VOCALIS ADDSPEAKER] Total speakers now: ' + Object.keys(this.speakers).length);
        return true;
    }

    newSpeaker(name) {
        console.log('[VOCALIS NEWSPEAKER] ===== NEW SPEAKER: ' + name + ' =====');
        console.log('[VOCALIS NEWSPEAKER] Speaker exists: ' + (this.speakers[name] ? 'YES' : 'NO'));
        
        if (!this.speakers[name]) {
            console.warn('[VOCALIS NEWSPEAKER] Speaker does not exist: ' + name);
            return false;
        }
        
        console.log('[VOCALIS NEWSPEAKER] Adding newline to transcript');
        if (this.FINAL_TRANSCRIPT && !this.FINAL_TRANSCRIPT.endsWith('\n')) {
            this.FINAL_TRANSCRIPT += '\n';
            console.log('[VOCALIS NEWSPEAKER] Newline added');
        }
        
        this.currentSpeaker = name;
        console.log('[VOCALIS NEWSPEAKER] currentSpeaker changed to: ' + name);
        
        this.INTERIM_TRANSCRIPT = '';
        
        console.log('[VOCALIS NEWSPEAKER] Calling updateDisplay');
        this.updateDisplay();
        console.log('[VOCALIS NEWSPEAKER] ===== NEW SPEAKER COMPLETE =====');
        return true;
    }

    getSpeakers() {
        console.log('[VOCALIS GETSPEAKERS] Called, returning ' + Object.keys(this.speakers).length + ' speakers');
        return Object.values(this.speakers);
    }

    clearTranscript() {
        console.log('[VOCALIS CLEAR] ===== CLEAR TRANSCRIPT CALLED =====');
        this.FINAL_TRANSCRIPT = '';
        this.INTERIM_TRANSCRIPT = '';
        this.secondaryTranscript = '';
        this.wordCount = 0;
        console.log('[VOCALIS CLEAR] All transcript fields cleared');
        this.updateDisplay();
        console.log('[VOCALIS CLEAR] ===== CLEAR COMPLETE =====');
    }

    detectTasks() {
        console.log('[VOCALIS DETECT] ===== DETECT TASKS CALLED =====');
        const now = Date.now();
        const timeSinceLastDetection = now - this.lastDetectionTime;
        console.log('[VOCALIS DETECT] Time since last detection: ' + timeSinceLastDetection + 'ms (cooldown: ' + this.detectionCooldown + 'ms)');
        
        if (timeSinceLastDetection < this.detectionCooldown) {
            console.log('[VOCALIS DETECT] Still in cooldown, skipping detection');
            return;
        }

        const text = this.FINAL_TRANSCRIPT.toLowerCase();
        console.log('[VOCALIS DETECT] Analyzing transcript (length: ' + text.length + ')');
        console.log('[VOCALIS DETECT] Transcript preview: ' + text.substring(0, 200));

        // Meeting patterns
        const meetingPatterns = [
            /(?:meeting|call|conference|sync|standup|check.?in)\s+(?:on|at|for|this|next)?\s*([a-z]+ \d+(?:st|nd|rd|th)?\s+at\s+\d{1,2}:?\d{2}(?:am|pm)?)/gi,
            /(?:let'?s\s+)?(?:meet|call|schedule)\s+(?:on|at|for|this|next)?\s*([a-z]+ \d+(?:st|nd|rd|th)?(?:\s+at\s+\d{1,2}:?\d{2}(?:am|pm)?)?)/gi,
            /(?:scheduled?)\s+(?:meeting|call|for)\s+(?:on)?\s*([a-z]+ \d+(?:st|nd|rd|th)?\s+at\s+\d{1,2}:?\d{2}(?:am|pm)?)/gi,
            /(?:meet)\s+(?:next|this)?\s*([a-z](?:onday|uesday|ednesday|hursday|riday|aturday|unday))\s+at\s+(\d{1,2}:?\d{2}(?:am|pm)?)/gi,
            /(?:appointment|booking)\s+(?:on|for)?\s*([a-z]+ \d+(?:st|nd|rd|th)?\s+at\s+\d{1,2}:?\d{2}(?:am|pm)?)/gi
        ];

        console.log('[VOCALIS DETECT] Checking ' + meetingPatterns.length + ' meeting patterns');
        
        meetingPatterns.forEach((pattern, patternIndex) => {
            console.log('[VOCALIS DETECT] Testing meeting pattern ' + patternIndex);
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const dateTimeStr = match[1] || match[2];
                console.log('[VOCALIS DETECT] MEETING MATCH FOUND: "' + dateTimeStr + '"');
                
                if (dateTimeStr) {
                    const task = {
                        type: 'meeting',
                        description: 'Meeting: ' + dateTimeStr,
                        dateTime: dateTimeStr,
                        raw: match[0]
                    };
                    
                    if (!this.isTaskDuplicate(task)) {
                        console.log('[VOCALIS DETECT] Meeting added to detected tasks: ' + dateTimeStr);
                        this.detectedTasks.push(task);
                        this.lastDetectionTime = now;
                        
                        if (this.taskDetectionCallback) {
                            console.log('[VOCALIS DETECT] Calling taskDetectionCallback for meeting');
                            this.taskDetectionCallback(task);
                        } else {
                            console.warn('[VOCALIS DETECT] taskDetectionCallback is NULL!');
                        }
                    } else {
                        console.log('[VOCALIS DETECT] Meeting is duplicate, skipping');
                    }
                }
            }
        });

        // Task patterns
        const taskPatterns = [
            /(?:remind\s+(?:me|us)?\s+to|don't forget to|make sure to|need to|have to|should|gotta)\s+([^.!?\n]+?)(?:\s+(?:by|on|at|before|after)\s+([a-z]+ \d+(?:st|nd|rd|th)?(?:\s+at\s+\d{1,2}:?\d{2}(?:am|pm)?)?))?(?:[.!?\n]|$)/gi,
            /(?:task|todo|todo item|action item):\s+([^.!?\n]+?)(?:\s+(?:by|due|on|at)\s+([a-z]+ \d+(?:st|nd|rd|th)?(?:\s+at\s+\d{1,2}:?\d{2}(?:am|pm)?)?))?(?:[.!?\n]|$)/gi,
            /(?:deadline|due)\s+(?:is|on)?\s*([a-z]+ \d+(?:st|nd|rd|th)?(?:\s+at\s+\d{1,2}:?\d{2}(?:am|pm)?)?)\s+for\s+([^.!?\n]+?)(?:[.!?\n]|$)/gi,
            /(?:schedule|plan|set\s+up)\s+([^.!?\n]+?)\s+for\s+([a-z]+ \d+(?:st|nd|rd|th)?(?:\s+at\s+\d{1,2}:?\d{2}(?:am|pm)?)?)(?:[.!?\n]|$)/gi
        ];

        console.log('[VOCALIS DETECT] Checking ' + taskPatterns.length + ' task patterns');
        
        taskPatterns.forEach((pattern, patternIndex) => {
            console.log('[VOCALIS DETECT] Testing task pattern ' + patternIndex);
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const taskDesc = match[1];
                const deadline = match[2];
                
                console.log('[VOCALIS DETECT] TASK MATCH FOUND: "' + taskDesc + '" | Deadline: "' + (deadline || 'NONE') + '"');
                
                if (taskDesc) {
                    const task = {
                        type: 'task',
                        description: taskDesc.trim(),
                        deadline: deadline ? deadline.trim() : null,
                        raw: match[0]
                    };
                    
                    if (!this.isTaskDuplicate(task)) {
                        console.log('[VOCALIS DETECT] Task added: ' + taskDesc);
                        this.detectedTasks.push(task);
                        this.lastDetectionTime = now;
                        
                        if (this.taskDetectionCallback) {
                            console.log('[VOCALIS DETECT] Calling taskDetectionCallback for task');
                            this.taskDetectionCallback(task);
                        } else {
                            console.warn('[VOCALIS DETECT] taskDetectionCallback is NULL!');
                        }
                    } else {
                        console.log('[VOCALIS DETECT] Task is duplicate, skipping');
                    }
                }
            }
        });

        console.log('[VOCALIS DETECT] ===== DETECT TASKS COMPLETE =====');
    }

    isTaskDuplicate(newTask) {
        console.log('[VOCALIS DUPLICATE] Checking if duplicate: ' + newTask.description);
        const isDuplicate = this.detectedTasks.some(existing => 
            existing.type === newTask.type && 
            existing.description.toLowerCase() === newTask.description.toLowerCase()
        );
        console.log('[VOCALIS DUPLICATE] Is duplicate: ' + isDuplicate);
        return isDuplicate;
    }

    generateCalendarLink(dateTimeStr) {
        console.log('[VOCALIS CALENDAR] ===== GENERATE CALENDAR LINK =====');
        console.log('[VOCALIS CALENDAR] Input: ' + dateTimeStr);
        
        try {
            const parsed = this.parseDateTime(dateTimeStr);
            console.log('[VOCALIS CALENDAR] Parsed result: ' + JSON.stringify(parsed));
            
            if (!parsed) {
                console.warn('[VOCALIS CALENDAR] Could not parse datetime');
                return null;
            }

            const { date, time } = parsed;
            console.log('[VOCALIS CALENDAR] Date: ' + date + ' | Time: ' + time);
            
            const startDateTime = date.replace(/-/g, '') + 'T' + (time ? time.replace(/:/g, '') + '00' : '090000');
            const endDateTime = date.replace(/-/g, '') + 'T' + (time ? time.replace(/:/g, '') + '00' : '100000');
            
            console.log('[VOCALIS CALENDAR] Start: ' + startDateTime + ' | End: ' + endDateTime);

            const params = {
                action: 'TEMPLATE',
                text: 'Meeting',
                dates: startDateTime + '/' + endDateTime,
                ctz: 'America/New_York'
            };

            const queryString = Object.keys(params)
                .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
                .join('&');

            const googleCalendarUrl = 'https://calendar.google.com/calendar/render?' + queryString;
            console.log('[VOCALIS CALENDAR] Generated URL: ' + googleCalendarUrl);
            return googleCalendarUrl;
        } catch (error) {
            console.error('[VOCALIS CALENDAR ERROR] ' + error.message);
            return null;
        }
    }

    parseDateTime(dateTimeStr) {
        console.log('[VOCALIS PARSE] ===== PARSE DATETIME =====');
        console.log('[VOCALIS PARSE] Input: ' + dateTimeStr);
        
        const now = new Date();
        const currentYear = now.getFullYear();
        
        let normalized = dateTimeStr.toLowerCase().replace(/(\d+)(?:st|nd|rd|th)/g, '$1');
        console.log('[VOCALIS PARSE] Normalized: ' + normalized);
        
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        let month = null;
        let day = null;
        
        for (let i = 0; i < months.length; i++) {
            if (normalized.includes(months[i])) {
                month = i + 1;
                console.log('[VOCALIS PARSE] Found month: ' + months[i] + ' (number: ' + month + ')');
                break;
            }
        }
        
        const dayMatch = normalized.match(/(\d{1,2})/);
        if (dayMatch) {
            day = parseInt(dayMatch[1]);
            console.log('[VOCALIS PARSE] Found day: ' + day);
        }
        
        if (!month || !day) {
            console.warn('[VOCALIS PARSE] Could not extract month or day');
            return null;
        }
        
        const timeMatch = normalized.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
        let time = null;
        
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
            const meridiem = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
            
            console.log('[VOCALIS PARSE] Time match - hours: ' + hours + ' minutes: ' + minutes + ' meridiem: ' + meridiem);
            
            if (meridiem === 'pm' && hours !== 12) {
                hours += 12;
            } else if (meridiem === 'am' && hours === 12) {
                hours = 0;
            }
            
            time = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
            console.log('[VOCALIS PARSE] Converted time: ' + time);
        }
        
        const dateStr = currentYear + '-' + month.toString().padStart(2, '0') + '-' + day.toString().padStart(2, '0');
        
        const result = { date: dateStr, time: time };
        console.log('[VOCALIS PARSE] ===== PARSE RESULT =====');
        console.log('[VOCALIS PARSE] ' + JSON.stringify(result));
        return result;
    }
}

let vocalisTranscriber = null;

function initVocalis() {
    console.log('[VOCALIS GLOBAL] ===== INIT VOCALIS =====');
    console.log('[VOCALIS GLOBAL] window.SpeechRecognition: ' + (window.SpeechRecognition ? 'YES' : 'NO'));
    console.log('[VOCALIS GLOBAL] window.webkitSpeechRecognition: ' + (window.webkitSpeechRecognition ? 'YES' : 'NO'));
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.error('[VOCALIS GLOBAL ERROR] Web Speech API not supported in this browser!');
        alert('Web Speech API not supported. Please use Chrome or Edge.');
        return false;
    }

    vocalisTranscriber = new VocalisLiveTranscriber();
    console.log('[VOCALIS GLOBAL] vocalisTranscriber instance created and ready');
    console.log('[VOCALIS GLOBAL] vocalisTranscriber properties:');
    console.log('[VOCALIS GLOBAL]   - isListening: ' + vocalisTranscriber.isListening);
    console.log('[VOCALIS GLOBAL]   - currentSpeaker: ' + vocalisTranscriber.currentSpeaker);
    console.log('[VOCALIS GLOBAL]   - speakers: ' + JSON.stringify(vocalisTranscriber.speakers));
    console.log('[VOCALIS GLOBAL] ===== INIT COMPLETE =====');
    return true;
}

console.log('[VOCALIS GLOBAL] app.js loaded, document.readyState: ' + document.readyState);

if (document.readyState === 'loading') {
    console.log('[VOCALIS GLOBAL] Document is loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initVocalis);
} else {
    console.log('[VOCALIS GLOBAL] Document already loaded, calling initVocalis now');
    initVocalis();
}

console.log('[VOCALIS GLOBAL] app.js script execution complete');
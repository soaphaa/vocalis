/**
 * VOCALIS CONTENT.JS
 * COMPLETE WITH EXTENSIVE LOGGING
 */

console.log('[VOCALIS CONTENT] ===== CONTENT.JS LOADED =====');

if (chrome && chrome.runtime) {
    console.log('[VOCALIS CONTENT] Chrome runtime detected: YES');

    // Create floating button
    console.log('[VOCALIS CONTENT] Creating floating REC button');
    const btn = document.createElement('button');
    btn.id = 'vocalis-float-btn';
    btn.innerHTML = 'REC';
    btn.title = 'Open Vocalis';

    btn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
        color: white;
        border: none;
        font-size: 12px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 102, 204, 0.4);
        z-index: 10000;
        font-weight: bold;
    `;

    btn.addEventListener('click', () => {
        console.log('[VOCALIS CONTENT BUTTON] Float button clicked');
        toggleRecorder();
    });
    
    document.body.appendChild(btn);
    console.log('[VOCALIS CONTENT] Float button appended to body');

    let isRecording = false;

    function toggleRecorder() {
        console.log('[VOCALIS TOGGLE] ===== TOGGLE RECORDER CALLED =====');
        const existing = document.getElementById('vocalis-recorder');
        console.log('[VOCALIS TOGGLE] Existing recorder panel found: ' + (existing ? 'YES' : 'NO'));
        
        if (existing) {
            console.log('[VOCALIS TOGGLE] Toggling visibility');
            existing.style.display = existing.style.display === 'none' ? 'flex' : 'none';
            console.log('[VOCALIS TOGGLE] New display state: ' + existing.style.display);
        } else {
            console.log('[VOCALIS TOGGLE] No existing panel, calling openRecorder');
            openRecorder();
        }
    }

    // TASK NOTIFICATION POPUP
    function showTaskNotification(task) {
        console.log('[VOCALIS NOTIFICATION] ===== SHOW TASK NOTIFICATION =====');
        console.log('[VOCALIS NOTIFICATION] Task type: ' + task.type);
        console.log('[VOCALIS NOTIFICATION] Task description: ' + task.description);
        console.log('[VOCALIS NOTIFICATION] Task dateTime: ' + (task.dateTime || 'NONE'));
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            width: 380px;
            background: linear-gradient(135deg, #0f1419 0%, #1a202c 100%);
            border: 2px solid #0066cc;
            border-radius: 8px;
            padding: 20px;
            z-index: 10004;
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            box-shadow: 0 8px 32px rgba(0, 102, 204, 0.3);
            animation: slideIn 0.4s ease-out;
        `;

        console.log('[VOCALIS NOTIFICATION] Creating title element');
        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 14px;
            font-weight: 700;
            color: #0066cc;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        title.textContent = task.type === 'meeting' ? 'MEETING DETECTED' : 'TASK DETECTED';
        console.log('[VOCALIS NOTIFICATION] Title text: ' + title.textContent);

        console.log('[VOCALIS NOTIFICATION] Creating description element');
        const desc = document.createElement('div');
        desc.style.cssText = `
            font-size: 13px;
            color: #cbd5e1;
            margin-bottom: 12px;
            line-height: 1.5;
        `;
        
        if (task.type === 'meeting') {
            desc.textContent = task.description || 'Meeting: ' + task.dateTime;
            console.log('[VOCALIS NOTIFICATION] Meeting description: ' + desc.textContent);
        } else {
            desc.textContent = task.description + (task.deadline ? ' (Due: ' + task.deadline + ')' : '');
            console.log('[VOCALIS NOTIFICATION] Task description: ' + desc.textContent);
        }

        console.log('[VOCALIS NOTIFICATION] Creating buttons container');
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        `;

        if (task.type === 'meeting') {
            console.log('[VOCALIS NOTIFICATION] Creating Google Calendar button for meeting');
            const googleBtn = document.createElement('button');
            googleBtn.textContent = 'Add to Google Calendar';
            googleBtn.style.cssText = `
                flex: 1;
                padding: 10px 16px;
                background: #0066cc;
                border: none;
                color: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all 150ms ease;
                min-width: 140px;
            `;

            googleBtn.addEventListener('click', () => {
                console.log('[VOCALIS NOTIFICATION CLICK] Google Calendar button clicked');
                console.log('[VOCALIS NOTIFICATION CLICK] Task dateTime: ' + task.dateTime);
                
                if (!vocalisTranscriber) {
                    console.error('[VOCALIS NOTIFICATION CLICK] vocalisTranscriber is NULL!');
                    alert('Transcriber not ready');
                    return;
                }
                
                console.log('[VOCALIS NOTIFICATION CLICK] Calling generateCalendarLink');
                const calendarUrl = vocalisTranscriber.generateCalendarLink(task.dateTime);
                console.log('[VOCALIS NOTIFICATION CLICK] Generated URL: ' + calendarUrl);
                
                if (calendarUrl) {
                    console.log('[VOCALIS NOTIFICATION CLICK] Opening URL in new window');
                    window.open(calendarUrl, '_blank');
                } else {
                    console.error('[VOCALIS NOTIFICATION CLICK] Could not generate calendar link');
                    alert('Could not parse date/time. Please check the meeting details.');
                }
            });

            console.log('[VOCALIS NOTIFICATION] Creating Outlook button');
            const outlookBtn = document.createElement('button');
            outlookBtn.textContent = 'Add to Outlook';
            outlookBtn.style.cssText = `
                flex: 1;
                padding: 10px 16px;
                background: #0066cc;
                border: none;
                color: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all 150ms ease;
                min-width: 140px;
            `;

            outlookBtn.addEventListener('click', () => {
                console.log('[VOCALIS NOTIFICATION CLICK] Outlook button clicked');
                const outlookUrl = 'https://outlook.live.com/calendar/0/';
                console.log('[VOCALIS NOTIFICATION CLICK] Opening Outlook: ' + outlookUrl);
                window.open(outlookUrl, '_blank');
            });

            buttonsContainer.appendChild(googleBtn);
            buttonsContainer.appendChild(outlookBtn);
            console.log('[VOCALIS NOTIFICATION] Meeting buttons added');
        } else {
            console.log('[VOCALIS NOTIFICATION] Creating task dismiss button');
            const remindBtn = document.createElement('button');
            remindBtn.textContent = 'Got it';
            remindBtn.style.cssText = `
                flex: 1;
                padding: 10px 16px;
                background: #10b981;
                border: none;
                color: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all 150ms ease;
            `;

            remindBtn.addEventListener('click', () => {
                console.log('[VOCALIS NOTIFICATION CLICK] Got it button clicked');
                notification.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            });

            buttonsContainer.appendChild(remindBtn);
            console.log('[VOCALIS NOTIFICATION] Task button added');
        }

        console.log('[VOCALIS NOTIFICATION] Creating close button');
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'X';
        closeBtn.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 28px;
            height: 28px;
            background: #ef4444;
            border: none;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 150ms ease;
        `;

        closeBtn.addEventListener('click', () => {
            console.log('[VOCALIS NOTIFICATION CLICK] Close button clicked');
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        });

        notification.appendChild(title);
        notification.appendChild(desc);
        notification.appendChild(buttonsContainer);
        notification.appendChild(closeBtn);

        document.body.appendChild(notification);
        console.log('[VOCALIS NOTIFICATION] Notification appended to body');

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            console.log('[VOCALIS NOTIFICATION] Auto-dismissing notification after 8 seconds');
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 8000);
        
        console.log('[VOCALIS NOTIFICATION] ===== NOTIFICATION COMPLETE =====');
    }

    function openRecorder() {
        console.log('[VOCALIS RECORDER] ===== OPEN RECORDER CALLED =====');
        console.log('[VOCALIS RECORDER] Creating main overlay div');
        
        const overlay = document.createElement('div');
        overlay.id = 'vocalis-recorder';
        overlay.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 400px;
            background: linear-gradient(135deg, #0f1419 0%, #1a202c 100%);
            border-top: 2px solid #0066cc;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        `;

        console.log('[VOCALIS RECORDER] Creating top bar');
        const topBar = document.createElement('div');
        topBar.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            border-bottom: 1px solid #2d3748;
            flex-shrink: 0;
            gap: 16px;
        `;

        console.log('[VOCALIS RECORDER] Creating status info');
        const statusInfo = document.createElement('div');
        statusInfo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 16px;
            background: rgba(0, 102, 204, 0.1);
            border-radius: 6px;
        `;

        const statusDot = document.createElement('div');
        statusDot.id = 'vocalis-status-dot';
        statusDot.style.cssText = `
            width: 12px;
            height: 12px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 1.5s ease-in-out infinite;
        `;

        const statusText = document.createElement('span');
        statusText.id = 'vocalis-status-text';
        statusText.textContent = 'Ready';
        statusText.style.cssText = `
            font-size: 13px;
            font-weight: 600;
        `;

        statusInfo.appendChild(statusDot);
        statusInfo.appendChild(statusText);
        console.log('[VOCALIS RECORDER] Status info created');

        console.log('[VOCALIS RECORDER] Creating controls div');
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
        `;

        console.log('[VOCALIS RECORDER] Creating RECORD button');
        const recordBtn = document.createElement('button');
        recordBtn.textContent = 'RECORD';
        recordBtn.style.cssText = `
            padding: 10px 20px;
            background: #ef4444;
            border: none;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 150ms ease;
        `;

        recordBtn.addEventListener('click', () => {
            console.log('[VOCALIS RECORD BUTTON] ===== RECORD BUTTON CLICKED =====');
            console.log('[VOCALIS RECORD BUTTON] isRecording: ' + isRecording);
            console.log('[VOCALIS RECORD BUTTON] vocalisTranscriber exists: ' + (vocalisTranscriber ? 'YES' : 'NO'));
            
            if (!vocalisTranscriber) {
                console.error('[VOCALIS RECORD BUTTON] vocalisTranscriber is NULL!');
                statusText.textContent = 'ERROR: Not ready';
                return;
            }
            
            if (!isRecording) {
                console.log('[VOCALIS RECORD BUTTON] Starting recording');
                
                console.log('[VOCALIS RECORD BUTTON] Setting UI refs...');
                vocalisTranscriber.transcriptBox = document.getElementById('vocalis-transcript-box');
                console.log('[VOCALIS RECORD BUTTON] transcriptBox set: ' + (vocalisTranscriber.transcriptBox ? 'OK' : 'NULL'));
                
                vocalisTranscriber.statusText = statusText;
                console.log('[VOCALIS RECORD BUTTON] statusText set: OK');
                
                vocalisTranscriber.statusDot = statusDot;
                console.log('[VOCALIS RECORD BUTTON] statusDot set: OK');
                
                vocalisTranscriber.speakerDisplay = document.getElementById('vocalis-speaker-display');
                console.log('[VOCALIS RECORD BUTTON] speakerDisplay set: ' + (vocalisTranscriber.speakerDisplay ? 'OK' : 'NULL'));
                
                vocalisTranscriber.translationBox = document.getElementById('vocalis-translation-box');
                console.log('[VOCALIS RECORD BUTTON] translationBox set: ' + (vocalisTranscriber.translationBox ? 'OK' : 'NULL'));
                
                console.log('[VOCALIS RECORD BUTTON] Setting taskDetectionCallback');
                vocalisTranscriber.taskDetectionCallback = showTaskNotification;
                console.log('[VOCALIS RECORD BUTTON] taskDetectionCallback set');
                
                console.log('[VOCALIS RECORD BUTTON] Calling vocalisTranscriber.startListening()');
                const success = vocalisTranscriber.startListening();
                console.log('[VOCALIS RECORD BUTTON] startListening returned: ' + success);
                
                if (success) {
                    isRecording = true;
                    recordBtn.textContent = 'STOP';
                    recordBtn.style.background = '#10b981';
                    statusText.textContent = 'Recording...';
                    console.log('[VOCALIS RECORD BUTTON] Recording started, UI updated');
                } else {
                    console.error('[VOCALIS RECORD BUTTON] Failed to start recording');
                    statusText.textContent = 'Failed to start';
                }
            } else {
                console.log('[VOCALIS RECORD BUTTON] Stopping recording');
                console.log('[VOCALIS RECORD BUTTON] Calling vocalisTranscriber.stopListening()');
                vocalisTranscriber.stopListening();
                console.log('[VOCALIS RECORD BUTTON] stopListening returned');
                
                isRecording = false;
                recordBtn.textContent = 'RECORD';
                recordBtn.style.background = '#ef4444';
                statusText.textContent = 'Stopped';
                console.log('[VOCALIS RECORD BUTTON] Recording stopped, UI updated');
            }
            console.log('[VOCALIS RECORD BUTTON] ===== RECORD BUTTON COMPLETE =====');
        });

        console.log('[VOCALIS RECORDER] Creating CLEAR button');
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'CLEAR';
        clearBtn.style.cssText = `
            padding: 10px 16px;
            background: #2d3748;
            border: 1px solid #475569;
            color: #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
        `;
        clearBtn.addEventListener('click', () => {
            console.log('[VOCALIS CLEAR BUTTON] Clear button clicked');
            if (vocalisTranscriber) {
                console.log('[VOCALIS CLEAR BUTTON] Calling vocalisTranscriber.clearTranscript()');
                vocalisTranscriber.clearTranscript();
            } else {
                console.error('[VOCALIS CLEAR BUTTON] vocalisTranscriber is NULL');
            }
        });

        console.log('[VOCALIS RECORDER] Creating EXPORT button');
        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'EXPORT';
        exportBtn.style.cssText = `
            padding: 10px 16px;
            background: #2d3748;
            border: 1px solid #475569;
            color: #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
        `;
        exportBtn.addEventListener('click', () => {
            console.log('[VOCALIS EXPORT BUTTON] Export button clicked');
            if (vocalisTranscriber) {
                console.log('[VOCALIS EXPORT BUTTON] Calling vocalisTranscriber.exportTranscript()');
                vocalisTranscriber.exportTranscript();
            } else {
                console.error('[VOCALIS EXPORT BUTTON] vocalisTranscriber is NULL');
            }
        });

        console.log('[VOCALIS RECORDER] Creating SPEAKERS button');
        const speakerKeyBtn = document.createElement('button');
        speakerKeyBtn.textContent = 'SPEAKERS (1-8)';
        speakerKeyBtn.style.cssText = `
            padding: 10px 16px;
            background: #8b5cf6;
            border: none;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
        `;
        speakerKeyBtn.addEventListener('click', () => {
            console.log('[VOCALIS SPEAKERS BUTTON] Speakers button clicked');
            const panel = document.getElementById('vocalis-speaker-panel');
            console.log('[VOCALIS SPEAKERS BUTTON] Panel found: ' + (panel ? 'YES' : 'NO'));
            if (panel) {
                console.log('[VOCALIS SPEAKERS BUTTON] Current display: ' + panel.style.display);
                panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
                console.log('[VOCALIS SPEAKERS BUTTON] New display: ' + panel.style.display);
            }
        });

        controls.appendChild(recordBtn);
        controls.appendChild(clearBtn);
        controls.appendChild(exportBtn);
        controls.appendChild(speakerKeyBtn);

        console.log('[VOCALIS RECORDER] Creating close button');
        const a11y = document.createElement('div');
        a11y.style.cssText = `
            display: flex;
            gap: 8px;
        `;

        const btnClose = document.createElement('button');
        btnClose.textContent = 'X';
        btnClose.style.cssText = `
            width: 36px;
            height: 36px;
            background: #ef4444;
            border: none;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
        `;
        btnClose.addEventListener('click', () => {
            console.log('[VOCALIS CLOSE BUTTON] Close button clicked');
            overlay.style.display = 'none';
        });

        a11y.appendChild(btnClose);
        topBar.appendChild(statusInfo);
        topBar.appendChild(controls);
        topBar.appendChild(a11y);

        console.log('[VOCALIS RECORDER] Creating main content area');
        const content = document.createElement('div');
        content.style.cssText = `
            flex: 1;
            display: flex;
            gap: 10px;
            padding: 16px;
            overflow: hidden;
        `;

        console.log('[VOCALIS RECORDER] Creating transcript panel');
        const transcriptPanel = document.createElement('div');
        transcriptPanel.style.cssText = `
            flex: 1.5;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;

        const transcriptLabel = document.createElement('div');
        transcriptLabel.textContent = 'TRANSCRIPT (MULTIPLE SPEAKERS)';
        transcriptLabel.style.cssText = `
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;

        const transcriptBox = document.createElement('div');
        transcriptBox.id = 'vocalis-transcript-box';
        transcriptBox.style.cssText = `
            flex: 1;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 6px;
            padding: 12px;
            border: 1px solid #2d3748;
            font-size: 13px;
            line-height: 1.8;
            overflow-y: auto;
            color: #e2e8f0;
            word-wrap: break-word;
            white-space: pre-wrap;
        `;
        transcriptBox.textContent = 'Listening...';

        transcriptPanel.appendChild(transcriptLabel);
        transcriptPanel.appendChild(transcriptBox);
        console.log('[VOCALIS RECORDER] Transcript panel created');

        console.log('[VOCALIS RECORDER] Creating right panel');
        const rightPanel = document.createElement('div');
        rightPanel.style.cssText = `
            flex: 1.5;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;

        const speakerDisplay = document.createElement('div');
        speakerDisplay.id = 'vocalis-speaker-display';
        speakerDisplay.textContent = 'Current: No speaker';
        speakerDisplay.style.cssText = `
            padding: 8px 12px;
            background: rgba(0, 102, 204, 0.2);
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            border-left: 3px solid #0066cc;
        `;

        const translationLabel = document.createElement('div');
        translationLabel.textContent = 'OTHER LANGUAGE';
        translationLabel.style.cssText = `
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 8px;
        `;

        const translationBox = document.createElement('div');
        translationBox.id = 'vocalis-translation-box';
        translationBox.style.cssText = `
            flex: 1;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 6px;
            padding: 12px;
            border: 1px solid #2d3748;
            font-size: 13px;
            line-height: 1.6;
            overflow-y: auto;
            color: #10b981;
            word-wrap: break-word;
        `;
        translationBox.textContent = 'Set language below...';

        const langLabel = document.createElement('div');
        langLabel.textContent = 'LANGUAGE';
        langLabel.style.cssText = `
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            margin-top: 8px;
        `;

        const langSelect = document.createElement('select');
        langSelect.style.cssText = `
            width: 100%;
            padding: 6px;
            background: #1a1f2e;
            border: 1px solid #2d3748;
            color: #e2e8f0;
            border-radius: 4px;
            font-size: 11px;
        `;

        const langs = [
            { code: 'en-US', name: 'English (US)' },
            { code: 'es-ES', name: 'Spanish' },
            { code: 'fr-FR', name: 'French' },
            { code: 'de-DE', name: 'German' },
            { code: 'it-IT', name: 'Italian' },
            { code: 'pt-BR', name: 'Portuguese' },
            { code: 'ja-JP', name: 'Japanese' },
            { code: 'zh-CN', name: 'Mandarin' },
            { code: 'ru-RU', name: 'Russian' },
            { code: 'ko-KR', name: 'Korean' }
        ];

        langs.forEach(lang => {
            const opt = document.createElement('option');
            opt.value = lang.code;
            opt.textContent = lang.name;
            langSelect.appendChild(opt);
        });

        langSelect.addEventListener('change', (e) => {
            console.log('[VOCALIS LANG SELECT] Language changed to: ' + e.target.value);
            if (vocalisTranscriber) {
                console.log('[VOCALIS LANG SELECT] Calling setSecondaryLanguage');
                vocalisTranscriber.setSecondaryLanguage(e.target.value);
            } else {
                console.error('[VOCALIS LANG SELECT] vocalisTranscriber is NULL');
            }
        });

        rightPanel.appendChild(speakerDisplay);
        rightPanel.appendChild(translationLabel);
        rightPanel.appendChild(translationBox);
        rightPanel.appendChild(langLabel);
        rightPanel.appendChild(langSelect);

        content.appendChild(transcriptPanel);
        content.appendChild(rightPanel);

        console.log('[VOCALIS RECORDER] Creating speaker panel');
        const speakerPanel = document.createElement('div');
        speakerPanel.id = 'vocalis-speaker-panel';
        speakerPanel.style.cssText = `
            display: none;
            position: fixed;
            right: 20px;
            bottom: 420px;
            width: 280px;
            background: #0f1419;
            border: 1px solid #2d3748;
            border-radius: 8px;
            padding: 16px;
            z-index: 10002;
            color: #e2e8f0;
            font-size: 13px;
            max-height: 300px;
            overflow-y: auto;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        `;

        const speakerTitle = document.createElement('div');
        speakerTitle.textContent = 'SPEAKER MANAGEMENT';
        speakerTitle.style.cssText = `
            font-weight: 600;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #2d3748;
        `;
        speakerPanel.appendChild(speakerTitle);

        const addSpeakerDiv = document.createElement('div');
        addSpeakerDiv.style.cssText = 'display: flex; gap: 6px; margin-bottom: 12px;';

        const speakerInput = document.createElement('input');
        speakerInput.placeholder = 'Speaker name';
        speakerInput.style.cssText = `
            flex: 1;
            padding: 6px;
            background: #1a1f2e;
            border: 1px solid #2d3748;
            color: #e2e8f0;
            border-radius: 4px;
            font-size: 12px;
        `;

        const addSpeakerBtn = document.createElement('button');
        addSpeakerBtn.textContent = 'ADD';
        addSpeakerBtn.style.cssText = `
            padding: 6px 12px;
            background: #0066cc;
            border: none;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
        `;

        addSpeakerBtn.addEventListener('click', () => {
            console.log('[VOCALIS ADD SPEAKER BUTTON] ===== ADD SPEAKER CLICKED =====');
            const name = speakerInput.value.trim();
            console.log('[VOCALIS ADD SPEAKER BUTTON] Input value: "' + name + '"');
            
            if (name && vocalisTranscriber) {
                console.log('[VOCALIS ADD SPEAKER BUTTON] Calling addSpeaker');
                vocalisTranscriber.addSpeaker(name);
                console.log('[VOCALIS ADD SPEAKER BUTTON] addSpeaker returned');
                speakerInput.value = '';
                console.log('[VOCALIS ADD SPEAKER BUTTON] Input cleared');
                console.log('[VOCALIS ADD SPEAKER BUTTON] Calling updateSpeakerList');
                updateSpeakerList();
                console.log('[VOCALIS ADD SPEAKER BUTTON] updateSpeakerList returned');
            } else {
                if (!name) console.warn('[VOCALIS ADD SPEAKER BUTTON] Name is empty');
                if (!vocalisTranscriber) console.error('[VOCALIS ADD SPEAKER BUTTON] vocalisTranscriber is NULL');
            }
        });

        addSpeakerDiv.appendChild(speakerInput);
        addSpeakerDiv.appendChild(addSpeakerBtn);
        speakerPanel.appendChild(addSpeakerDiv);

        const speakerList = document.createElement('div');
        speakerList.id = 'vocalis-speaker-list';
        speakerList.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';
        speakerPanel.appendChild(speakerList);

        function updateSpeakerList() {
            console.log('[VOCALIS UPDATE SPEAKERS] ===== UPDATE SPEAKER LIST =====');
            speakerList.innerHTML = '';
            console.log('[VOCALIS UPDATE SPEAKERS] Cleared speaker list HTML');
            
            if (!vocalisTranscriber) {
                console.error('[VOCALIS UPDATE SPEAKERS] vocalisTranscriber is NULL');
                return;
            }
            
            const speakers = vocalisTranscriber.getSpeakers();
            console.log('[VOCALIS UPDATE SPEAKERS] Got speakers, count: ' + speakers.length);
            
            speakers.forEach((speaker, index) => {
                console.log('[VOCALIS UPDATE SPEAKERS] Creating item for speaker ' + index + ': ' + speaker.name);
                
                const speakerItem = document.createElement('div');
                speakerItem.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    background: rgba(0, 102, 204, 0.1);
                    border-radius: 4px;
                    border-left: 3px solid ${speaker.color};
                `;

                const keyBind = document.createElement('div');
                keyBind.textContent = (index + 1);
                keyBind.style.cssText = `
                    min-width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${speaker.color};
                    color: white;
                    border-radius: 3px;
                    font-size: 11px;
                    font-weight: 600;
                `;

                const nameDiv = document.createElement('div');
                nameDiv.textContent = speaker.name;
                nameDiv.style.cssText = 'flex: 1;';

                const btnSwitch = document.createElement('button');
                btnSwitch.textContent = 'USE';
                btnSwitch.style.cssText = `
                    padding: 4px 8px;
                    background: #0066cc;
                    border: none;
                    color: white;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 11px;
                `;

                btnSwitch.addEventListener('click', () => {
                    console.log('[VOCALIS USE SPEAKER] ===== USE SPEAKER CLICKED =====');
                    console.log('[VOCALIS USE SPEAKER] Speaker: ' + speaker.name);
                    
                    if (vocalisTranscriber) {
                        console.log('[VOCALIS USE SPEAKER] Calling newSpeaker');
                        vocalisTranscriber.newSpeaker(speaker.name);
                        console.log('[VOCALIS USE SPEAKER] newSpeaker returned');
                        console.log('[VOCALIS USE SPEAKER] Calling updateSpeakerList');
                        updateSpeakerList();
                        console.log('[VOCALIS USE SPEAKER] updateSpeakerList returned');
                    } else {
                        console.error('[VOCALIS USE SPEAKER] vocalisTranscriber is NULL');
                    }
                    console.log('[VOCALIS USE SPEAKER] ===== USE SPEAKER COMPLETE =====');
                });

                speakerItem.appendChild(keyBind);
                speakerItem.appendChild(nameDiv);
                speakerItem.appendChild(btnSwitch);
                speakerList.appendChild(speakerItem);
                
                console.log('[VOCALIS UPDATE SPEAKERS] Speaker item added');
            });
            
            console.log('[VOCALIS UPDATE SPEAKERS] ===== UPDATE COMPLETE =====');
        }

        // Keyboard shortcuts with visual feedback
        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 8) {
                console.log('[VOCALIS KEYDOWN] ===== KEY PRESSED: ' + e.key + ' =====');
                e.preventDefault();
                console.log('[VOCALIS KEYDOWN] preventDefault called');
                
                if (vocalisTranscriber) {
                    console.log('[VOCALIS KEYDOWN] Getting speakers');
                    const speakers = vocalisTranscriber.getSpeakers();
                    console.log('[VOCALIS KEYDOWN] Speakers count: ' + speakers.length);
                    console.log('[VOCALIS KEYDOWN] Looking for speaker at index ' + (num - 1));
                    
                    if (speakers[num - 1]) {
                        const speakerName = speakers[num - 1].name;
                        const speakerColor = speakers[num - 1].color;
                        console.log('[VOCALIS KEYDOWN] Found speaker: ' + speakerName + ' Color: ' + speakerColor);
                        
                        console.log('[VOCALIS KEYDOWN] Calling newSpeaker');
                        vocalisTranscriber.newSpeaker(speakerName);
                        console.log('[VOCALIS KEYDOWN] newSpeaker returned');
                        
                        console.log('[VOCALIS KEYDOWN] Calling updateSpeakerList');
                        updateSpeakerList();
                        console.log('[VOCALIS KEYDOWN] updateSpeakerList returned');
                        
                        console.log('[VOCALIS KEYDOWN] Calling showKeyFeedback');
                        showKeyFeedback(e.key, speakerColor);
                        console.log('[VOCALIS KEYDOWN] showKeyFeedback returned');
                    } else {
                        console.warn('[VOCALIS KEYDOWN] No speaker at index ' + (num - 1));
                    }
                } else {
                    console.error('[VOCALIS KEYDOWN] vocalisTranscriber is NULL');
                }
                console.log('[VOCALIS KEYDOWN] ===== KEY COMPLETE =====');
            }
        });

        function showKeyFeedback(key, color) {
            console.log('[VOCALIS KEY FEEDBACK] ===== SHOW KEY FEEDBACK =====');
            console.log('[VOCALIS KEY FEEDBACK] Key: ' + key + ' Color: ' + color);
            
            const feedback = document.createElement('div');
            feedback.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: ${color};
                color: white;
                padding: 20px 40px;
                border-radius: 50%;
                font-size: 32px;
                font-weight: bold;
                z-index: 10003;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 120px;
                height: 120px;
                animation: keyFeedback 0.6s ease-out;
                pointer-events: none;
            `;
            feedback.textContent = key;
            
            console.log('[VOCALIS KEY FEEDBACK] Appending feedback to body');
            document.body.appendChild(feedback);
            
            console.log('[VOCALIS KEY FEEDBACK] Scheduling removal after 600ms');
            setTimeout(() => {
                console.log('[VOCALIS KEY FEEDBACK] Removing feedback');
                feedback.remove();
            }, 600);
        }

        overlay.appendChild(topBar);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        document.body.appendChild(speakerPanel);

        console.log('[VOCALIS RECORDER] Creating animation styles');
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.2); }
            }
            @keyframes keyFeedback {
                0% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1);
                }
                100% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(1.5);
                }
            }
            @keyframes slideIn {
                0% {
                    opacity: 0;
                    transform: translateX(400px);
                }
                100% {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes slideOut {
                0% {
                    opacity: 1;
                    transform: translateX(0);
                }
                100% {
                    opacity: 0;
                    transform: translateX(400px);
                }
            }
        `;
        document.head.appendChild(style);

        console.log('[VOCALIS RECORDER] ===== OPEN RECORDER COMPLETE =====');
    }

    // FLOATING NOTES PANEL
    function createNotesPanel() {
        console.log('[VOCALIS NOTES] Creating notes panel');
        
        const notesPanel = document.createElement('div');
        notesPanel.id = 'vocalis-notes-panel';
        notesPanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 90px;
            width: 300px;
            background: #0f1419;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            z-index: 9999;
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-height: 500px;
            overflow-y: auto;
            display: none;
        `;

        const notesHeader = document.createElement('div');
        notesHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #2d3748;
        `;

        const notesTitle = document.createElement('div');
        notesTitle.textContent = 'NOTES';
        notesTitle.style.cssText = `
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;

        const closeNotesBtn = document.createElement('button');
        closeNotesBtn.textContent = 'X';
        closeNotesBtn.style.cssText = `
            width: 24px;
            height: 24px;
            background: #ef4444;
            border: none;
            color: white;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
        `;

        closeNotesBtn.addEventListener('click', () => {
            console.log('[VOCALIS NOTES CLOSE] Close button clicked');
            notesPanel.style.display = 'none';
        });

        notesHeader.appendChild(notesTitle);
        notesHeader.appendChild(closeNotesBtn);
        notesPanel.appendChild(notesHeader);

        const notesInput = document.createElement('textarea');
        notesInput.id = 'vocalis-notes-input';
        notesInput.placeholder = 'Type notes here... Ctrl+Enter to add';
        notesInput.style.cssText = `
            width: 100%;
            height: 80px;
            padding: 8px;
            background: #1a1f2e;
            border: 1px solid #2d3748;
            color: #e2e8f0;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            margin-bottom: 8px;
            resize: none;
        `;

        notesInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                console.log('[VOCALIS NOTES INPUT] Ctrl+Enter pressed');
                const text = notesInput.value.trim();
                if (text) {
                    console.log('[VOCALIS NOTES INPUT] Adding note: ' + text);
                    addNoteEntry(text);
                    notesInput.value = '';
                }
            }
        });

        const addNoteBtn = document.createElement('button');
        addNoteBtn.textContent = 'ADD NOTE';
        addNoteBtn.style.cssText = `
            width: 100%;
            padding: 8px;
            background: #f59e0b;
            border: none;
            color: #0f1419;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 12px;
        `;

        addNoteBtn.addEventListener('click', () => {
            console.log('[VOCALIS NOTES BUTTON] Add note button clicked');
            const text = notesInput.value.trim();
            if (text) {
                console.log('[VOCALIS NOTES BUTTON] Adding note: ' + text);
                addNoteEntry(text);
                notesInput.value = '';
            }
        });

        notesPanel.appendChild(notesInput);
        notesPanel.appendChild(addNoteBtn);

        const notesList = document.createElement('div');
        notesList.id = 'vocalis-notes-list';
        notesList.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
        notesPanel.appendChild(notesList);

        function addNoteEntry(text) {
            console.log('[VOCALIS NOTE ENTRY] Adding note entry: ' + text);
            
            const noteEntry = document.createElement('div');
            noteEntry.style.cssText = `
                padding: 8px;
                background: rgba(245, 158, 11, 0.1);
                border-radius: 4px;
                border-left: 3px solid #f59e0b;
                font-size: 12px;
                line-height: 1.4;
            `;

            const noteTime = document.createElement('div');
            noteTime.textContent = new Date().toLocaleTimeString();
            noteTime.style.cssText = 'font-size: 10px; color: #94a3b8; margin-bottom: 4px;';

            const noteText = document.createElement('div');
            noteText.textContent = text;

            noteEntry.appendChild(noteTime);
            noteEntry.appendChild(noteText);
            notesList.appendChild(noteEntry);
            notesList.scrollTop = notesList.scrollHeight;
            
            console.log('[VOCALIS NOTE ENTRY] Note added and visible');
        }

        return notesPanel;
    }

    const notesPanel = createNotesPanel();
    document.body.appendChild(notesPanel);
    console.log('[VOCALIS NOTES] Notes panel created and appended');

    const notesToggleBtn = document.createElement('button');
    notesToggleBtn.id = 'vocalis-notes-toggle';
    notesToggleBtn.innerHTML = 'NOTES';
    notesToggleBtn.title = 'Toggle notes panel';

    notesToggleBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 90px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        border: none;
        font-size: 11px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        z-index: 9998;
        font-weight: bold;
        transition: all 200ms ease;
    `;

    notesToggleBtn.addEventListener('click', () => {
        console.log('[VOCALIS NOTES TOGGLE] ===== NOTES TOGGLE CLICKED =====');
        console.log('[VOCALIS NOTES TOGGLE] Current display: ' + notesPanel.style.display);
        notesPanel.style.display = notesPanel.style.display === 'none' ? 'flex' : 'none';
        console.log('[VOCALIS NOTES TOGGLE] New display: ' + notesPanel.style.display);
    });

    notesToggleBtn.addEventListener('mouseenter', () => {
        notesToggleBtn.style.transform = 'scale(1.1)';
    });

    notesToggleBtn.addEventListener('mouseleave', () => {
        notesToggleBtn.style.transform = 'scale(1)';
    });

    document.body.appendChild(notesToggleBtn);
    console.log('[VOCALIS NOTES] Notes toggle button created and appended');

    console.log('[VOCALIS CONTENT] ===== CONTENT.JS SETUP COMPLETE =====');
} else {
    console.error('[VOCALIS CONTENT] Chrome runtime NOT available!');
}
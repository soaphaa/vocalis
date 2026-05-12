// VOCALIS CONTENT.JS - Injected into meeting pages

if (chrome && chrome.runtime) {
    console.log('✅ Vocalis content script loaded');

    // Create floating button
    const btn = document.createElement('button');
    btn.id = 'vocalis-float-btn';
    btn.innerHTML = '🎙️';
    btn.title = 'Open Vocalis Recording';

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
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 102, 204, 0.4);
        z-index: 10000;
        transition: all 200ms ease;
    `;

    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.1)';
        btn.style.boxShadow = '0 8px 20px rgba(0, 102, 204, 0.6)';
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 4px 12px rgba(0, 102, 204, 0.4)';
    });

    btn.addEventListener('click', toggleRecorder);
    document.body.appendChild(btn);

    function toggleRecorder() {
        const existing = document.getElementById('vocalis-recorder');
        if (existing) {
            existing.style.display = existing.style.display === 'none' ? 'flex' : 'none';
        } else {
            openRecorder();
        }
    }

    function openRecorder() {
        const overlay = document.createElement('div');
        overlay.id = 'vocalis-recorder';
        overlay.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 320px;
            background: linear-gradient(135deg, #0f1419 0%, #1a202c 100%);
            border-top: 2px solid #0066cc;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        `;

        // TOP BAR
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

        // Status
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

        // CONTROLS
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            gap: 8px;
            align-items: center;
        `;

        const recordBtn = document.createElement('button');
        recordBtn.textContent = 'Record';
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

        let isRecording = false;
        recordBtn.addEventListener('click', async () => {
            if (!isRecording) {
                const success = vocalisTranscriber.startListening();
                if (success) {
                    isRecording = true;
                    recordBtn.textContent = 'Stop';
                    recordBtn.style.background = '#10b981';
                    statusText.textContent = 'Recording...';
                    statusDot.style.background = '#10b981';
                }
            } else {
                vocalisTranscriber.stopListening();
                isRecording = false;
                recordBtn.textContent = 'Record';
                recordBtn.style.background = '#ef4444';
                statusText.textContent = 'Stopped';
                statusDot.style.background = '#64748b';
            }
        });

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.style.cssText = `
            padding: 10px 16px;
            background: #2d3748;
            border: 1px solid #475569;
            color: #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            transition: all 150ms ease;
        `;
        clearBtn.addEventListener('click', () => {
            vocalisTranscriber.clearTranscript();
        });
        clearBtn.addEventListener('mouseenter', () => {
            clearBtn.style.background = '#0066cc';
        });
        clearBtn.addEventListener('mouseleave', () => {
            clearBtn.style.background = '#2d3748';
        });

        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Export';
        exportBtn.style.cssText = `
            padding: 10px 16px;
            background: #2d3748;
            border: 1px solid #475569;
            color: #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            transition: all 150ms ease;
        `;
        exportBtn.addEventListener('click', () => {
            vocalisTranscriber.exportTranscript();
        });
        exportBtn.addEventListener('mouseenter', () => {
            exportBtn.style.background = '#0066cc';
        });
        exportBtn.addEventListener('mouseleave', () => {
            exportBtn.style.background = '#2d3748';
        });

        controls.appendChild(recordBtn);
        controls.appendChild(clearBtn);
        controls.appendChild(exportBtn);

        // ACCESSIBILITY
        const a11y = document.createElement('div');
        a11y.style.cssText = `
            display: flex;
            gap: 8px;
            align-items: center;
        `;

        const btnA = document.createElement('button');
        btnA.textContent = 'A+';
        btnA.title = 'Increase text size';
        btnA.style.cssText = `
            width: 36px;
            height: 36px;
            background: #2d3748;
            border: 1px solid #475569;
            color: #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 150ms ease;
        `;
        let fontSize = 100;
        btnA.addEventListener('click', () => {
            fontSize += 10;
            if (fontSize > 150) fontSize = 100;
            document.getElementById('vocalis-transcript-box').style.fontSize = (fontSize / 100) * 14 + 'px';
        });
        btnA.addEventListener('mouseenter', () => {
            btnA.style.background = '#0066cc';
        });
        btnA.addEventListener('mouseleave', () => {
            btnA.style.background = '#2d3748';
        });

        const btnCon = document.createElement('button');
        btnCon.textContent = 'Con';
        btnCon.title = 'High contrast';
        btnCon.style.cssText = `
            width: 36px;
            height: 36px;
            background: #2d3748;
            border: 1px solid #475569;
            color: #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition: all 150ms ease;
        `;
        let highContrast = false;
        btnCon.addEventListener('click', () => {
            highContrast = !highContrast;
            if (highContrast) {
                overlay.style.background = '#ffffff';
                overlay.style.color = '#000000';
                document.getElementById('vocalis-transcript-box').style.background = '#f9f9f9';
                document.getElementById('vocalis-transcript-box').style.color = '#000000';
                btnCon.style.background = '#000000';
                btnCon.style.color = '#ffffff';
            } else {
                overlay.style.background = 'linear-gradient(135deg, #0f1419 0%, #1a202c 100%)';
                overlay.style.color = '#e2e8f0';
                document.getElementById('vocalis-transcript-box').style.background = 'rgba(0, 0, 0, 0.2)';
                document.getElementById('vocalis-transcript-box').style.color = '#e2e8f0';
                btnCon.style.background = '#2d3748';
                btnCon.style.color = '#e2e8f0';
            }
        });

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
            font-size: 16px;
            font-weight: 600;
            transition: all 150ms ease;
        `;
        btnClose.addEventListener('click', () => {
            overlay.style.display = 'none';
        });

        a11y.appendChild(btnA);
        a11y.appendChild(btnCon);
        a11y.appendChild(btnClose);

        topBar.appendChild(statusInfo);
        topBar.appendChild(controls);
        topBar.appendChild(a11y);

        // TRANSCRIPT AREA
        const content = document.createElement('div');
        content.style.cssText = `
            flex: 1;
            display: flex;
            gap: 20px;
            padding: 16px;
            overflow-y: auto;
        `;

        const transcriptPanel = document.createElement('div');
        transcriptPanel.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;

        const label = document.createElement('div');
        label.textContent = 'TRANSCRIPT';
        label.style.cssText = `
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
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            padding: 16px;
            border: 1px solid #2d3748;
            font-size: 14px;
            line-height: 1.6;
            overflow-y: auto;
            color: #e2e8f0;
            word-wrap: break-word;
        `;
        transcriptBox.textContent = 'Listening...';

        transcriptPanel.appendChild(label);
        transcriptPanel.appendChild(transcriptBox);
        content.appendChild(transcriptPanel);

        overlay.appendChild(topBar);
        overlay.appendChild(content);

        // ANIMATION
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(overlay);

        // Connect transcriber
        if (vocalisTranscriber) {
            vocalisTranscriber.transcriptBox = transcriptBox;
            vocalisTranscriber.statusText = statusText;
            vocalisTranscriber.statusDot = statusDot;
        }
    }
}
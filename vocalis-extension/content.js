// content.js - Runs on meeting pages (Google Meet, Zoom, Teams, etc)
// Creates floating button that opens Ava-style recording UI

if (chrome && chrome.runtime) {
  console.log('Vocalis content script loaded on:', window.location.hostname);
  
  // Create floating button (circle, top center-right)
  const btn = document.createElement('button');
  btn.id = 'vocalis-float-btn';
  btn.textContent = '🎤';
  btn.title = 'Click to open Vocalis Recording';
  
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
    font-weight: 600;
  `;
  
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 8px 20px rgba(0, 102, 204, 0.6)';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 12px rgba(0, 102, 204, 0.4)';
  });
  
  btn.addEventListener('click', toggleVocalisRecorder);
  document.body.appendChild(btn);
  
  // ========== AVA-STYLE RECORDING UI ==========
  function toggleVocalisRecorder() {
    const overlay = document.getElementById('vocalis-recorder-overlay');
    
    if (overlay) {
      // Toggle existing overlay
      if (overlay.style.display === 'none') {
        overlay.style.display = 'flex';
      } else {
        overlay.style.display = 'none';
      }
    } else {
      // Create new overlay
      openVocalisRecorder();
    }
  }
  
  function openVocalisRecorder() {
    if (document.getElementById('vocalis-recorder-overlay')) {
      document.getElementById('vocalis-recorder-overlay').style.display = 'flex';
      return;
    }
    
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'vocalis-recorder-overlay';
    overlay.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 250px;
      background: linear-gradient(135deg, #0f1419 0%, #1a202c 100%);
      border-top: 2px solid #0066cc;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
      z-index: 10001;
      display: flex;
      flex-direction: column;
      color: #e2e8f0;
      font-family: 'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    
    // ===== TOP CONTROL BAR =====
    const topBar = document.createElement('div');
    topBar.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid #2d3748;
      flex-shrink: 0;
    `;
    
    // Left: Speaker info
    const speakerInfo = document.createElement('div');
    speakerInfo.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      background: rgba(0, 102, 204, 0.1);
      border-radius: 6px;
    `;
    
    const speakerDot = document.createElement('div');
    speakerDot.style.cssText = `
      width: 12px;
      height: 12px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    `;
    
    const speakerName = document.createElement('span');
    speakerName.textContent = '🎤 Recording';
    speakerName.style.cssText = `
      font-size: 13px;
      font-weight: 600;
    `;
    
    speakerInfo.appendChild(speakerDot);
    speakerInfo.appendChild(speakerName);
    
    // Center: Controls
    const controls = document.createElement('div');
    controls.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
    `;
    
    // Mute button
    const muteBtn = document.createElement('button');
    muteBtn.textContent = '🎤';
    muteBtn.title = 'Toggle mute';
    muteBtn.style.cssText = `
      width: 36px;
      height: 36px;
      background: #2d3748;
      border: 1px solid #475569;
      color: #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      transition: all 150ms ease;
    `;
    muteBtn.addEventListener('click', () => {
      muteBtn.textContent = muteBtn.textContent === '🎤' ? '🔇' : '🎤';
      muteBtn.style.background = muteBtn.textContent === '🔇' ? '#ef4444' : '#2d3748';
    });
    muteBtn.addEventListener('mouseenter', () => {
      muteBtn.style.background = '#0066cc';
      muteBtn.style.borderColor = '#0066cc';
    });
    muteBtn.addEventListener('mouseleave', () => {
      muteBtn.style.background = muteBtn.textContent === '🔇' ? '#ef4444' : '#2d3748';
    });
    
    // Speaker volume
    const speakerBtn = document.createElement('button');
    speakerBtn.textContent = '🔊';
    speakerBtn.title = 'Speaker volume';
    speakerBtn.style.cssText = `
      width: 36px;
      height: 36px;
      background: #2d3748;
      border: 1px solid #475569;
      color: #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      transition: all 150ms ease;
    `;
    speakerBtn.addEventListener('mouseenter', () => {
      speakerBtn.style.background = '#0066cc';
      speakerBtn.style.borderColor = '#0066cc';
    });
    speakerBtn.addEventListener('mouseleave', () => {
      speakerBtn.style.background = '#2d3748';
    });
    
    // Transcript toggle
    const transcriptBtn = document.createElement('button');
    transcriptBtn.textContent = '📝';
    transcriptBtn.title = 'Toggle transcript';
    transcriptBtn.style.cssText = `
      width: 36px;
      height: 36px;
      background: #2d3748;
      border: 1px solid #475569;
      color: #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      transition: all 150ms ease;
    `;
    transcriptBtn.addEventListener('mouseenter', () => {
      transcriptBtn.style.background = '#0066cc';
      transcriptBtn.style.borderColor = '#0066cc';
    });
    transcriptBtn.addEventListener('mouseleave', () => {
      transcriptBtn.style.background = '#2d3748';
    });
    
    // Settings button
    const settingsBtn = document.createElement('button');
    settingsBtn.textContent = '⚙️';
    settingsBtn.title = 'Settings';
    settingsBtn.style.cssText = `
      width: 36px;
      height: 36px;
      background: #2d3748;
      border: 1px solid #475569;
      color: #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      transition: all 150ms ease;
    `;
    settingsBtn.addEventListener('mouseenter', () => {
      settingsBtn.style.background = '#0066cc';
      settingsBtn.style.borderColor = '#0066cc';
    });
    settingsBtn.addEventListener('mouseleave', () => {
      settingsBtn.style.background = '#2d3748';
    });
    
    controls.appendChild(muteBtn);
    controls.appendChild(speakerBtn);
    controls.appendChild(transcriptBtn);
    controls.appendChild(settingsBtn);
    
    // Right: Accessibility + close
    const rightControls = document.createElement('div');
    rightControls.style.cssTime = `
      display: flex;
      gap: 12px;
      align-items: center;
    `;
    
    // A+ Button
    const btnTextSize = document.createElement('button');
    btnTextSize.textContent = 'A+';
    btnTextSize.title = 'Increase text size';
    btnTextSize.style.cssText = `
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
    let textSizeMultiplier = 1;
    btnTextSize.addEventListener('click', () => {
      textSizeMultiplier += 0.1;
      if (textSizeMultiplier > 1.5) textSizeMultiplier = 1;
      const newSize = 13 * textSizeMultiplier;
      overlay.style.fontSize = newSize + 'px';
    });
    btnTextSize.addEventListener('mouseenter', () => {
      btnTextSize.style.background = '#0066cc';
      btnTextSize.style.borderColor = '#0066cc';
    });
    btnTextSize.addEventListener('mouseleave', () => {
      btnTextSize.style.background = '#2d3748';
    });
    
    // ◐ Button
    const btnContrast = document.createElement('button');
    btnContrast.textContent = '◐';
    btnContrast.title = 'High contrast mode';
    btnContrast.style.cssText = `
      width: 36px;
      height: 36px;
      background: #2d3748;
      border: 1px solid #475569;
      color: #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      transition: all 150ms ease;
    `;
    let isHighContrast = false;
    btnContrast.addEventListener('click', () => {
      isHighContrast = !isHighContrast;
      if (isHighContrast) {
        overlay.style.background = '#ffffff';
        overlay.style.color = '#000000';
        overlay.style.borderTop = '2px solid #000000';
        btnContrast.style.background = '#0066cc';
        btnContrast.style.borderColor = '#0066cc';
      } else {
        overlay.style.background = 'linear-gradient(135deg, #0f1419 0%, #1a202c 100%)';
        overlay.style.color = '#e2e8f0';
        overlay.style.borderTop = '2px solid #0066cc';
        btnContrast.style.background = '#2d3748';
        btnContrast.style.borderColor = '#475569';
      }
    });
    btnContrast.addEventListener('mouseenter', () => {
      if (!isHighContrast) {
        btnContrast.style.background = '#0066cc';
        btnContrast.style.borderColor = '#0066cc';
      }
    });
    btnContrast.addEventListener('mouseleave', () => {
      if (!isHighContrast) {
        btnContrast.style.background = '#2d3748';
        btnContrast.style.borderColor = '#475569';
      }
    });
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close recorder';
    closeBtn.style.cssText = `
      width: 36px;
      height: 36px;
      background: #ef4444;
      border: none;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      font-weight: 600;
      transition: all 150ms ease;
    `;
    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = '#dc2626';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = '#ef4444';
    });
    
    rightControls.appendChild(btnTextSize);
    rightControls.appendChild(btnContrast);
    rightControls.appendChild(closeBtn);
    
    topBar.appendChild(speakerInfo);
    topBar.appendChild(controls);
    topBar.appendChild(rightControls);
    
    // ===== CONTENT AREA =====
    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      display: flex;
      gap: 20px;
      padding: 16px;
      overflow-y: auto;
    `;
    
    // Transcript panel
    const transcriptPanel = document.createElement('div');
    transcriptPanel.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    
    const transcriptLabel = document.createElement('div');
    transcriptLabel.textContent = 'Transcript';
    transcriptLabel.style.cssText = `
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
    `;
    
    const transcriptBox = document.createElement('div');
    transcriptBox.style.cssText = `
      flex: 1;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      padding: 12px;
      border: 1px solid #2d3748;
      font-size: 13px;
      line-height: 1.6;
      overflow-y: auto;
      color: #e2e8f0;
    `;
    transcriptBox.textContent = 'Listening...';
    
    transcriptPanel.appendChild(transcriptLabel);
    transcriptPanel.appendChild(transcriptBox);
    
    // Translation panel
    const translationPanel = document.createElement('div');
    translationPanel.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    
    const translationLabel = document.createElement('div');
    translationLabel.textContent = 'Translation (Live)';
    translationLabel.style.cssText = `
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
    `;
    
    const translationBox = document.createElement('div');
    translationBox.style.cssText = `
      flex: 1;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      padding: 12px;
      border: 1px solid #2d3748;
      font-size: 13px;
      line-height: 1.6;
      overflow-y: auto;
      color: #10b981;
    `;
    translationBox.textContent = 'Translation will appear here...';
    
    translationPanel.appendChild(translationLabel);
    translationPanel.appendChild(translationBox);
    
    content.appendChild(transcriptPanel);
    content.appendChild(translationPanel);
    
    overlay.appendChild(topBar);
    overlay.appendChild(content);
    
    // Add keyframe animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(overlay);
  }
}
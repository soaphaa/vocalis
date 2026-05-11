// content.js - Runs on meeting pages (Google Meet, Zoom, Teams, etc)

// Check if extension is available
if (chrome && chrome.runtime) {
  console.log('Vocalis content script loaded on:', window.location.hostname);
  
  // Create floating button
  const btn = document.createElement('button');
  btn.id = 'vocalis-float-btn';
  btn.textContent = '🎤';
  btn.title = 'Click to open Vocalis';
  
  // Style the button
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.4);
    z-index: 10000;
    transition: all 200ms ease;
  `;
  
  // Hover effect
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 8px 20px rgba(0, 102, 204, 0.6)';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 12px rgba(0, 102, 204, 0.4)';
  });
  
  // Click to open Vocalis popup
  btn.addEventListener('click', () => {
    openVocalisPopup();
  });
  
  // Add button to page
  document.body.appendChild(btn);
  
  // Create popup window
  function openVocalisPopup() {
    // Check if popup already exists
    if (document.getElementById('vocalis-popup')) {
      document.getElementById('vocalis-popup').style.display = 'block';
      return;
    }
    
    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'vocalis-popup';
    popup.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 400px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      z-index: 10001;
      display: flex;
      flex-direction: column;
      border: 1px solid #d1d5db;
      overflow: hidden;
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    `;
    header.textContent = 'Vocalis';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    `;
    closeBtn.addEventListener('click', () => {
      popup.remove();
    });
    header.appendChild(closeBtn);
    
    // Content area
    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16px;
    `;
    
    // Message
    const msg = document.createElement('p');
    msg.textContent = 'Click below to start recording';
    msg.style.cssText = `
      color: #6b7280;
      text-align: center;
      font-size: 14px;
    `;
    
    // Record button
    const recBtn = document.createElement('button');
    recBtn.textContent = '🎤 Start Recording';
    recBtn.style.cssText = `
      background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
    `;
    
    let recording = false;
    recBtn.addEventListener('click', () => {
      recording = !recording;
      if (recording) {
        recBtn.textContent = '⏹️ Stop Recording';
        recBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        msg.textContent = 'Recording...';
      } else {
        recBtn.textContent = '🎤 Start Recording';
        recBtn.style.background = 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)';
        msg.textContent = 'Recording stopped';
      }
    });
    
    content.appendChild(msg);
    content.appendChild(recBtn);
    
    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 12px 16px;
      border-top: 1px solid #d1d5db;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
    `;
    footer.textContent = 'Open settings for API keys';
    
    popup.appendChild(header);
    popup.appendChild(content);
    popup.appendChild(footer);
    
    document.body.appendChild(popup);
  }
}
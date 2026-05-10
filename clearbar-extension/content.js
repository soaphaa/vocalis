const existingBar = document.getElementById("clearbar-extension-root");

if(!existingBar){
    const bar = document.createElement("div");
    bar.id = "clearbar-extension-root";
    bar.innerHTML = `
    <div class="clearbar-left">
      <div id="clearbarStatusDot" class="clearbar-status-dot"></div>
      <div>
        <p class="clearbar-title">ClearBar</p>
        <p id="clearbarCaption" class="clearbar-caption">
          Ready to support clearer conversations.
        </p>
      </div>
    </div>
    
    <div class="clearbar-actions">
      <button id="clearbarRecordButton" class="clearbar-button">
        Start Listening
      </button>
      <button id="clearbarCloseButton" class="clearbar-close">
        ×
      </button>
    </div>
  `;
    
    document.body.appendChild(bar);
    
    const recordButton = document.getElementById("clearbarRecordButton");
    const closeButton = document.getElementById("clearbarCloseButton");
    const caption = document.getElementById("clearbarCaption");
    const statusDot = document.getElementById("clearbarStatusDot");
    
    let isListening = false;
    let recognition = null;
    
    const SpeechRecognition = 
    window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition){
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        
        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i<event.results.length; i++){
                transcript += event.result[i][0].transcript;
            }
            
            caption.textContent = transcript || "Listening...";
        };
        recognition.onerror = () => {
            caption.textContent = "Speech recognition stopped. Try again.";
            stopListening();
        };
    } else {
        caption.textContent = "Speech recognition is not supported in this browser.";
    }
    
    
    recordButton.addEventListener("click", () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    });
    closeButton.addEventListened("click", () => {
        bar.remove();
    });
    
}


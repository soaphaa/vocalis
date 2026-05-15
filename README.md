# Vocalis

A Chrome extension that transcribes lectures and meetings in real-time, making information accessible for students who struggle to keep up with fast speech, language barriers, or hearing loss.

---

## What It Does

Vocalis listens to what's being said in your classroom or meeting and displays it as text in real-time. It automatically highlights important information like test dates, deadlines, and meetings. You can switch between multiple speakers, look up definitions of complex words, and export everything when you're done.

---

## The Problem

Students with hearing loss, those learning in a second language, or anyone who processes information slower than real-time speech gets left behind. By the time they understand one sentence, the teacher has moved on to three more. They work twice as hard and learn half as much. Vocalis fixes this.

---

## Installation

1. Put all files in a single folder
2. Open Chrome and go to chrome://extensions
3. Turn on "Developer mode" (top right)
4. Click "Load unpacked" and select your folder
5. Open google meets, teams, docs, etc. and you'll see the VOCALIS button in the top right

---

## How to Use

**Open the panel**
Click the VOCALIS button to open the transcript panel.

**Start recording**
Click RECORD to start transcribing. Everything said will appear on your screen.

**Manage speakers**
Click SPEAKERS to add people. You can rename them and press 1-8 to switch between speakers while recording.

**Take notes**
Click NOTES to open the notepad. You can take notes while recording by typing and pressing Ctrl+Enter.

**Export your transcript**
Click EXPORT to download your transcript as a text file with tasks and meetings extracted.

**Manual detection**
Press Ctrl+M while recording to manually trigger meeting/test detection if auto-detection misses something.

---

## Features

**Real-time transcription**
Using the browser's Web Speech API. No API key needed. Works without internet once loaded.

**Speaker management**
8 pre-set speakers you can rename.

**Automatic detection**
Meetings and test dates are detected automatically. Creates actual Google Calendar events when you click the notification.

**Task extraction**
Deadlines and action items are automatically highlighted in red.

**Translation support**
Enable in settings to see translations in real-time as you record.

**Notes panel**
Draggable notes panel so you can write notes while the transcript appears.

**Keyboard shortcuts**
Press 1-8 to switch speakers instantly while recording.

---

## Technical Details

**Built with**
Vanilla HTML, CSS, and JavaScript. No dependencies.

**Speech recognition**
Uses the Web Speech API. Continuous mode is enabled so it keeps listening even if there are pauses.

**Detection**
Pattern matching with regular expressions detects meetings, tests, and tasks.

**Calendar integration**
Meeting and test notifications create real Google Calendar events with proper date/time parsing.

**Translation**
Uses the MyMemory API for free real-time translation.

**Settings storage**
All settings are stored in Chrome's sync storage so they persist across devices.

---

## Known Limitations

Speech recognition accuracy depends on clear audio and a quiet environment.

The system doesn't auto-detect who's speaking. You switch speakers manually.

Translation speed depends on internet connection.

Meeting detection works best with clear date/time phrases. "Next Friday" is recognized. Vague references might be missed.

Works only in Chrome and Edge. Firefox doesn't support the Web Speech API.

---

## File Structure

- **manifest.json** - Extension configuration and permissions
- **app.js** - Core transcription engine, speech recognition, task/meeting detection
- **content.js** - UI elements, buttons, panels, notifications
- **background.js** - Service worker for settings management
- **popup.html** - Settings interface
- **popup.js** - Settings handler

---

Enjoy!

**Speaker list not showing**
If the speaker list isn't showing, wait a moment for the page to fully load. Sometimes it takes half a second for the extension to initialize.

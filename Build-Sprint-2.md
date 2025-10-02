[acm_readme.md](https://github.com/user-attachments/files/22662717/acm_readme.md)
# ACM Flight Tracking & Audio Communications Project

## Project Overview

A real-time flight tracking application for Boca Raton Airport (BCT) that integrates SDR (Software Defined Radio) audio communications with an interactive map interface. The system displays flight information, tracks aircraft positions, and provides access to recorded ATC (Air Traffic Control) communications with automatic transcriptions.

**Tech Stack:**
- Frontend: React (Vite), Leaflet.js for mapping
- Backend: Node.js with Express.js
- Database: Firebase (Authentication & Firestore)
- Audio Processing: Automatic transcription pipeline

---

## New Features Implemented

### 1. Firebase Database Integration
- Migrated from Supabase to Firebase for authentication and data storage
- Real-time flight data synchronization from Firestore
- User authentication with email/password
- Protected routes requiring login

### 2. Audio Player with Auto-Detection
- Automatic detection of new MP3 files in designated folder
- Real-time transcript display for each recording
- Custom audio controls with play/pause, previous/next track
- Playlist that updates every 10 seconds without manual code changes

### 3. Enhanced Map Interface
- Single red marker for Boca Raton Airport with flight list in popup
- Modal view for detailed flight information
- Audio recordings button for easy navigation
- Real-time aircraft position tracking capability (SDR-ready)

---

## Implementation Process

### Firebase Migration

**Steps Completed:**
1. Created Firebase project and enabled Authentication & Firestore
2. Installed Firebase SDK: `npm install firebase`
3. Created `firebaseConfig.js` with project credentials
4. Updated authentication components (Login.jsx, Signup.jsx, ProtectedRoute.jsx)
5. Migrated database queries from Supabase syntax to Firestore
6. Set up Firestore security rules for authenticated access

**Key Files Modified:**
- `src/firebaseConfig.js` - Firebase initialization
- `src/Components/Login.jsx` - Firebase Auth integration
- `src/Components/Signup.jsx` - User registration
- `src/routes/ProtectedRoute.jsx` - Auth state management
- `src/Components/MapView.jsx` - Firestore data fetching

### Auto-Updating Audio Player

**Implementation Steps:**
1. Created Node.js backend server (`server.js`) with Express
2. Installed dependencies: `npm install express cors`
3. Built API endpoint to read `/public/audio/` folder
4. Implemented auto-matching logic for MP3 and TXT files
5. Created polling mechanism in frontend (10-second intervals)
6. Designed audio player UI with transcript display

**Backend Logic:**
```javascript
// Reads folder, filters MP3 files, matches with transcripts
app.get('/api/playlist', (req, res) => {
  // Scans directory for .mp3 files
  // Checks for matching .txt transcripts
  // Returns JSON playlist
});
```

**Frontend Integration:**
```javascript
useEffect(() => {
  fetchPlaylist(); // Initial load
  const interval = setInterval(fetchPlaylist, 10000); // Poll every 10s
  return () => clearInterval(interval);
}, []);
```

**File Structure Required:**
```
public/audio/
├── recording1.mp3
├── recording1.txt
├── recording2.mp3
└── recording2.txt
```

### Map & Flight Data Display

**Process:**
1. Hardcoded Boca Raton Airport location as single marker
2. Firebase flights collection stores flight metadata
3. Popup displays flight list from Firestore
4. Modal component shows detailed flight information
5. Click-to-view functionality for each flight

**Data Flow:**
```
Firebase Firestore → MapView.jsx → Airport Popup → Flight Modal
```

---

## Features Completed

### ✅ Authentication System
- User registration and login
- Session management with Firebase Auth
- Protected routes (map access requires authentication)
- Automatic session persistence

### ✅ Interactive Map
- Leaflet.js map centered on Boca Raton Airport
- Custom red marker icon for airport
- Flight list in popup (shows first 2, expandable to all)
- Real-time data from Firebase Firestore
- Navigation button to audio recordings page

### ✅ Flight Information System
- Flight data stored in Firebase (route, time, status, airline, aircraft type)
- Detailed modal view with:
  - Departure/arrival airport information
  - Boarding and arrival times
  - Gate and terminal details
  - Aircraft specifications
  - Flight duration and distance
  - Audio communications placeholder

### ✅ Audio Player
- Automatic file detection from `/public/audio/` folder
- Play/pause/previous/next controls
- Progress bar with seek functionality
- Track duration display
- Playlist with visual indicators for current track
- Updates every 10 seconds without page refresh

### ✅ Transcript Display
- Automatic loading of transcript for each audio file
- Formatted text display with proper line spacing
- Scrollable container for long transcripts
- Matches MP3 filename (e.g., `flight1.mp3` → `flight1.txt`)

### ✅ Backend API Server
- Express.js server on port 3001
- REST API endpoint: `/api/playlist`
- Automatic folder scanning
- CORS enabled for local development
- ES6 module syntax

---

## Running the Project

### Prerequisites
- Node.js installed
- Firebase project created
- Environment variables configured (`.env`)

### Installation
```bash
npm install
```

### Starting the Application
Two servers must run simultaneously:

**Terminal 1 - React Frontend:**
```bash
npm run dev
```
Access at: `http://localhost:5173`

**Terminal 2 - Backend API:**
```bash
node server.js
```
API runs at: `http://localhost:3001`

### Alternative (Single Command)
Install concurrently:
```bash
npm install concurrently
```

Add to `package.json` scripts:
```json
"start:all": "concurrently \"npm run dev\" \"npm run server\""
```

Run both:
```bash
npm run start:all
```

---

## Project Structure

```
acm-demo-2.0/
├── public/
│   └── audio/                    # Audio files and transcripts
│       ├── *.mp3
│       └── *.txt
├── src/
│   ├── Components/
│   │   ├── AudioPlayer.jsx       # Audio player with auto-detection
│   │   ├── AudioPlayer.css       # Audio player styling
│   │   ├── Login.jsx             # Firebase authentication
│   │   ├── Signup.jsx            # User registration
│   │   ├── MapView.jsx           # Interactive flight map
│   │   └── MapView.css           # Map styling
│   ├── routes/
│   │   └── ProtectedRoute.jsx    # Auth guard for routes
│   ├── firebaseConfig.js         # Firebase initialization
│   ├── App.jsx                   # Main routing component
│   └── App.css                   # Global styles
├── server.js                     # Backend API for audio files
├── package.json
└── README.md
```

---

## Firebase Collections Structure

### `locations` Collection
```javascript
{
  lat: 26.3785,
  lng: -80.1077,
  description: "Boca Raton Airport (BCT)",
  airportCode: "BCT",
  airportName: "Boca Raton Airport",
  city: "Boca Raton",
  state: "Florida"
}
```

### `flights` Collection
```javascript
{
  flightId: "flight-1",
  route: "RDU to BCT",
  time: "2:56 PM",
  boardingTime: "2:26 PM",
  arrivalTime: "5:11 PM",
  airline: "SkyWay Express",
  flightNumber: "SW1234",
  aircraft: "Cessna Citation CJ3",
  status: "On Time",
  gate: "A3",
  terminal: "Private Aviation Terminal",
  duration: "2 hours 15 minutes",
  distance: "678 miles",
  departureAirport: {
    code: "RDU",
    name: "Raleigh-Durham International Airport",
    city: "Raleigh",
    state: "North Carolina"
  },
  arrivalAirport: {
    code: "BCT",
    name: "Boca Raton Airport",
    city: "Boca Raton",
    state: "Florida"
  }
}
```

### `aircraft_positions` Collection (Future SDR Integration)
```javascript
{
  aircraftId: "A12345",
  callsign: "SW1234",
  latitude: 26.3785,
  longitude: -80.1077,
  altitude: 1500,
  speed: 120,
  heading: 270,
  verticalRate: 0,
  squawk: "1200",
  onGround: false,
  timestamp: "2024-12-01T15:30:00Z"
}
```

---

## SDR Integration (Pending)

### Workflow
1. SDR receiver captures ADS-B signals at 1090 MHz
2. Decoding software processes signals into flight data
3. Audio recordings saved as MP3 files
4. Transcription script processes audio to TXT files
5. Both files copied to `/public/audio/` folder
6. Backend API detects new files within 10 seconds
7. Playlist automatically updates in frontend

### Requirements
- MP3 and TXT files must have matching filenames
- Files must be placed in `/public/audio/` directory
- Filename format: `[identifier].mp3` and `[identifier].txt`

**Example:**
```
hudson.mp3  →  hudson.txt  ✅
hudson.mp3  →  hudson_processed.txt  ❌
```

---

## Known Limitations

1. **Manual Firebase Updates:** Flight data must be added manually to Firestore
2. **Local Development Only:** Backend server configured for localhost
3. **File Naming Convention:** Strict matching required for audio/transcript pairs
4. **Polling Interval:** 10-second delay for new file detection
5. **No Authentication on API:** Backend endpoint publicly accessible on local network

---

## Future Enhancements

- [ ] Real-time SDR data integration
- [ ] Live aircraft position tracking on map
- [ ] Automatic flight data population from ADS-B
- [ ] Cloud deployment (Firebase Hosting + Cloud Functions)
- [ ] Mobile-responsive design improvements
- [ ] Audio waveform visualization
- [ ] Search and filter functionality for recordings
- [ ] Historical flight data analytics
- [ ] Multiple airport support

---

## Team

ACM Project Team - Fall 2024
Project Deadline: December 2024

---

## License

Educational project - Boca Raton Airport Flight Tracking System

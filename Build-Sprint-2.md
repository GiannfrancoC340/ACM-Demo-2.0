# Airplane Communications Mapping Project - Build Sprint 2

This project was created by Giannfranco Crovetto.

Valid for Engineering Design 2 - Fall 2025. From September 14 2025 - October 6 2025.

## Project Overview

Our group project - Airplane Communications Mapping - is a system that captures, organizes, and analyzes real-time air traffic control 
(ATC) communications using software-defined radios (SDRs). It pairs live audio with real-time aircraft tracking and transcribes the 
conversations using speech-to-text tools. The system also uses stress detection algorithms to flag when a pilot may be under 
emotional strain. This information is presented through a web-based dashboard designed for aviation analysts, students, and enthusiasts 
to review live and past flight communications more easily and effectively. 

This is Build Spring 2, which is the current build of the project. The way this project is planned this semester is ~~2 build sprints - Build Spring 1, ranging from August 16 - September 14, and Build Spring 2, ranging from September 14 to the present.~~ *UPDATE: As of October 6 2025, there will be 3 build sprints. The schedule is below this paragraph.* The reason for this is because after updating the home + login + signup, the next order of business was to migrate from Supabase to Firebase, and that was a big change. So, it made sense to do another build sprint for everything post Firebase setup until the first demo as it will be a lot of hard work to continue on. The core functionality remains the same, there are a ton of new features and QOL changes. For starters, there is Firebase database integration, a working audio player with audio detection, enhanced map interface, and a backend API server to handle audio requests. On top of that, there is a Settings button to view settings, password requirements component, updated styles including adding the logo ~~and clicking the logo, and incorporated a leaflet map background purely for visuals.~~
This is our schedule for the build sprints:
- [x] **Build Sprint 1:** August 16 2025 - September 14 2025
* Accounts for picking up work since Spring 2025 and adds an audio section within FlightInfo.jsx, modal popup for individual flights, and a new and improved home + login + signup pages.

- [x] **Build Sprint 2:** September 14 2025 - October 6 2025
* Accounts for everything since BS1/Firebase migration until the first demo. Essentially this is the work done starting with Firebase migration up to the first demo.
* There is Firebase database integration, a working audio player with audio detection, enhanced map interface, backend API server to handle audio requests, password requirements component, settings button, and updated project styles.

- [x] **Build Sprint 3:** October 6 2025 - December 2 2025
* Accounts for everything since BS2/first demo until the final deadline.

**Tech Stack:**
- Frontend: React (Vite), Leaflet.js for mapping
- Backend: Node.js with Express.js
- Database: Firebase (Authentication & Firestore)
- Audio Processing: Automatic transcription pipeline

## Time Spent

Time spent on this project: **7 hours and 10 minutes**. Spans from September 14 2025 - October 6 2025.

## Process

This new project build was a fun and rigorous experience. There were many moments of breakthroughs, code errors, and learning new technologies. It required all of us to work hard and focus on implementing these features. It took me some time to implement all these features, and it took a few group meetings to discuss what to add. Eventually, all these features were added and it looks great so far. For this build, it started with migrating from Supabase to Firebase as I did not want to have my project become inactive after 7 days of inactivity. With Firebase, that is not the case plus it seems more sophisticated for live tracking project like ours. So, the choice was easy and I began working.

On September 14, I consulted with Claude to create a pipeline migration guide for Firebase. I had to start with the Firebase setup and configuration. I had to create a new project, enable required services such as authentication which includes email + password. Then, I created the database and started the Firebase configuration by installing the dependencies and created a Firebase client file to hold the API keys to connect to my project. I used Claude to help me out and it was extremely helpful. Next, I had to update the login, signup, and ProtectedRoute.jsx, to handle Firebase authentication. Next, I had to create collections on the database and populate with sample data (for now). I had to create 3 collections (locations, flights, aircraft_positions) within Firestore Database, the database used by Firebase. Next, I had to update MapView.jsx to update the database fetching part, and then add real-time aircraft positions component within the same file. I updated the .env file to securely store the API keys, and create a new security rule on Firebase. Once done I began testing, and everything was working well until I got to the map. I saw that there was only a marker that showed the airport and that's it. I had to debug and saw that I had to update the fetch flights from Firestore component. I got that working, but then the map was creating markers based on the flights available on Firestore, and not having a marker with popups. I took some time off and 4 days later I got back to fixing the issue. So, I got to work and saw that the collections on Firestore had capitalization errors, and I changed that. It did not work so I was stumped, so I then consulted Claude and found out that the MapView was rendering the flights from Firestore as markers, and not just the airport which pulls flight data from Firestore. I got that working which was a success, then I added the rest of the hardcoded data to ensure functionality and it worked.

On September 25, I created an audio player to have the user listen to stored audios. First, I created an audio folder under public, created an AudioPlayer.jsx and AudioPlayer.css. Next, I added a button on MapView to take me to a new page to view these audios, I also added the route to App.jsx. Once done, I created sample MP3 files to see if they are visible and it was working. I also decided to include the transcriptions in .txt, and I got that to work no problem. These files are under audios, and everytime I have a new listing, I would update the array in AudioPlayer.jsx. I needed to update the transcript component so that was simple. I made sure to update the CSS and it was working perfectly. I did encounter a small error where some styles would not appear but I forgot to import AudioPlayer.css to AudioPlayer.jsx so I felt really stupid. But it is all good now. I added a live audio that we got along with the transcript file and it displayed perfectly, confirming a huge progress in our project.

Next, one of my groupmates suggested we use PHP to auto update everything when a new file is uploaded. However, React/Vite projects can't directly use PHP files so I had work with something different. So the following day, I ultimately decided to create a backend API file to handle updates. Claude suggested this was the least destructive manner so I decided to go with this. First, I had to install the dependencies, and then create a backend file using Node.js and CommonJS. Next, I had to update the AudioPlayer.jsx to incorporate auto update from the backend, and finally test it by running 2 separate servers. I then encountered an error where the backend file was using CommonJS syntax, but it caused an error because my project is using an ES module. I needed to change it to use ES6 import syntax, as this does not work with CommonJS. I used Express.js instead and it was surprisingly easy, I never did this before and it makes me feel good about getting it right with the proper help. Then I began to run it but I initially did not know that both servers had to be running at the same time in 2 separate files simultaneously, I was doing it in 1 file. So, I ran both in 2 separate files and saw that everything was working except the live audio file, we will call this hudson as it is the audio recording of the Hudson River crash back in January. I then suspected that the backend had to have matching MP3 and txt files, so I changed the names of both files to match and voila, it was perfect. 

A week later, I decided to test out the project functionality by having a friend of mines test the project out. I consulted with a friend of mine who had not seen this project before, and I had him go through the project as a demo. He went through it no problem whatsoever and got to experience every feature of the project. At the end, I sent him a document that would have him type his experience, what he liked and didn't like and any feedback. He suggested a password requirements component so I made a note for a future task. Afterward, I got his feedback typed on the document and recorded it for feedback purposes. Names are not needed, so it was confidential. I also did a lot of GitHub document work as it is noticeable with these markdown files. So, I went to work on the next task which was to update the styles and implement the password requirement component. First, I added the logo to the home page as that was requested by Justin. So, I did that by adding the logo as an image under the assets folder and wrote code to insert it. Next, I created the Settings.jsx and Settings.css files to create settings. Right now, the settings do not apply anything as it is just for show but hopefully I can get that working soon. I created some sample settings to make it look professional. Next, I added a button to both MapView.jsx and App.jsx to allow the user to be taken to the settings page when clicked. I added the route to the routes section and updated the styles once again to ensure grid centering is enabled and hover effects are enabled. ~~Third, I changed the background of the Login.jsx and Signup.jsx to have the leaflet map blurred, and then having that be set as the background. I had to add TileLayers to the login and signup to enable leaflet access, and I had to import leaflet to the 2 files. I changed Auth.css to update the styles accordingly by adding a blurred map container and added an overlay to dim the map and improve readibility.~~ Lastly, I added the password requirement functionality to ensure that NEW users can have a stricter password. I created a password validation function, updated password validity conditions, and added a feature where it would check password requirements before submitting to Firebase. I added the password requirement display in the return function; all of this is within the Signup.jsx file. Also I updated the Auth.css file to use the new styles and it looks great. ~~Also, I added a clicking feature to the logo where if the user clicks it for a certain amount of times, a funny easter egg pops up. I made sure to add hover and animation styles. I updated the Home function in App.jsx to add clicking using useState, and I added CSS styles to App.css. I find it neat and niche so that is cool.~~

Now, I need to implement the SDR receiver to be connected to my project using direct file outputting or another manner, and we should be virtually done with the project. Some polishing and style changes would be necessary too but that is afterwards. For the 1st demo of the Fall semester, my groupmates agreed that everything I had done was sufficient for demos, and if possible, getting SDR data to my project before the demo would be awesome but even after the demo it is fine. It just depends on if there is any work to be done with the SDR receiver.

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

### 4. Settings Page
- Created a Settings file to view settings
- On the home page, a button is available to view settings
- On the map page, there is a button available to view settings page as well
- Professional settings display

### 5. Updated Style Changes and Improvements
- Added the Logo to the home page
- ~~It is clickable with a neat easter egg~~
- Added respective styling
- ~~Updated the background of the signup and login to have a blurred map~~
- ~~Uses leaflet map with blur as a purely visual background element~~

### 6. Password Requirement Component
- Real-time password validation
- Added several password requirements
- Visual feedback and disabled submit button until requirements met
- Improved UI experience

---

## Required Features

The following **required** functionality is completed:


- [x] **Web Page includes a home, login, and signup screens**
  - Users can see the home page when they first load into the project
  - Users can see the logo on the home page
  - ~~Users can click on the logo for a neat easter egg~~
  - Users can click on the login and signup buttons to be taken to either login or signup
  - Users can navigate between all 3 screens seamlessly
  - The home + login + signup have new and improved styles such as hover effects and background gradients to look more modern!
  - The user can see and click on the Settings button to view the settings page
- [x] **Users can signup for an account or login to an account**
  - Web page must support signup and login functionality thanks to Firebase
  - If the user is new, they must signup for an account. The user can signup using:
    - Email
    - Password
    - No email verification is necessary 
  - If the user has an account, they can login using their email and password
  - The user must meet the requirements for creating a password
  - It will not work until the user successfully meets the requirements
  - Once either is completed, the user will be taken to the MapView screen
  - The user can log out by clicking the back button on their browser
  - ~~The user can see the leaflet map as a purely visual background element on both the login and signup screen.~~
- [x] ~~**Users can click on the logo for an easter egg**~~
  - ~~The user is able to click on the logo~~
  - ~~The surprise is a fun little surprise that not everyone will think about~~
- [x] **Settings page is viewable for everyone**
  - The Settings button can be clicked by everyone
  - The user can see all available settings
  - None of these settings actually affect the app's behavior
  - The user can exit out of the settings page
- [x] **Web Page includes a MapView component**
  - The MapView component is the next screen all users will see after logging in
  - The map will be centered over the Boca Raton Airport
  - The map will have a **red marker** over the BCT airport at all times
  - The user can move around the map and zoom in or out
  - The user cannot create a new marker or delete any marker
- [x] **Users can interact with the MapView**
  - The user can click on the red marker to view all available flights
  - The flights are sample hardcoded data for tests
  - Once clicked, the marker will display:
    - A small overview of the airport
    - Number of flights incoming
    - The first set of flights for today
    - A button to view more flights
  - If the user wants to see more or all flights, the See All Flightss button at the bottom will work
  - Each flight is color coded and has hover effects to enhance the style and embrace a modern appearance
  - The user can close the marker by clicking on it again or clicking outside the popup
  - The user can click on each individual flight to see all details
  - The user can see an Audio Recordings button to click and view available audios for listening.
  - The user can see a Settings button to click
  - The user can view the settings page and exit freely
  - The user cannot change any settings as none of these settings actually affect the app's behavior
- [x] **Users can click on any individual flight**
  - If the user wants to view all the flight details for an individual flight, they are able to
  - When the user clicks on an individual flight, they will be able to see the flight detail within the same page thanks to modal popup
  - Modal popup approach provides a better user experience since users can view flight details without losing their place on the map, and they can quickly switch between different flights without having to navigate back and forth
  - If the user wants to exit, they can click the x button or click outside the popup to exit
  - They can see for each available flight:
    - route
    - time
    - boarding time
    - arrival time
    - airline
    - flight number
    - aircraft
    - status
    - gate
    - terminal
    - duration
    - distance
    - departure airport
    - arrival airport
    - audio recordings, with the following parameters:
      - title
      - duration
      - time
      - placeholder for actual live audio
  - All information is color coded respectively
  - Audio recordings cannot be played, but can be accessed by clicking the different options
  - The user can navigate back by clicking the Back to Map button
  - Users cannot delete any individual flight data, or modify it
- [x] **Firebase functionality**
  - Firebase handles user authentication, and runs the Firestore database
  - Authentication can store:
    - User ID
    - Email
    - Created at
    - First signed in
    - Provider
  - Firestore database has 3 collections:
    - flights
    - locations
    - aircraft_positions
  - Each collection has sample hardcoded data
  - Once the SDR implementation is complete, this will be populated with live data
  - The user is able to view all flights from Firestore
- [x] **Users can listen to audios on Audio Player**
  - The user is able to access this by clicking the Audio Recordings button on the MapView
  - They can see now playing audio, playlist of all audios, and transcript of each selected audio
  - The user can navigate between all available audios using the controls buttons
  - The user can pause and play a selected audio
  - The user can select any audio from the playlist
  - The user can see the transcript for each selected audio
  - The user can go back by clicking the back button 

---

## GIFs

### Progress Report 3 (9/8/25 - 9/14/25)

Here are the GIFs showcasing the functionality of the project:

**User Login (with Firebase)**

![ACM Fall 2025 progress report 3-1](https://github.com/user-attachments/assets/7eb5d216-8127-4a7a-b431-e3cd609d984d)

**Flight Modal Popup + Audio recordings section**

![ACM Fall 2025 progress report 3-2](https://github.com/user-attachments/assets/55422bae-aed9-4988-a3bf-325e6d35de8b)

**Full Video Walkthrough**

https://github.com/user-attachments/assets/86d48823-802a-4543-ae77-9a68cd9292c2


### Progress Report 4 (9/15/25 - 9/21/25)

**User Login**

![ACM Fall 2025 progress report 4-1](https://github.com/user-attachments/assets/9c8356cf-2a43-45ea-a9b7-f836d8ea5838)

**Flight Modal Popup + Audio recordings section**

![ACM Fall 2025 progress report 4-2](https://github.com/user-attachments/assets/dfefbe43-6a71-401d-925b-6468a3b2a52d)

**Full Video Walkthrough**

https://github.com/user-attachments/assets/d14eb297-8352-4781-8064-8cfaa13c4ef8


### Progress Report 5 (9/22/25 - 9/28/25)

**User Login**

![ACM Fall 2025 progress report 5-1](https://github.com/user-attachments/assets/29db2644-ced3-4712-af0a-d8bb68bf6f46)

**Flight Modal Popup + Audio recordings section**

![ACM Fall 2025 progress report 5-2](https://github.com/user-attachments/assets/dd3549ae-8883-4148-9781-09200f3f795e)

**Audio Player**

![ACM Fall 2025 progress report 5-3](https://github.com/user-attachments/assets/7f6469ac-41fe-44d7-8270-b5c56d0c013e)

**Audio now playing**

![ACM Fall 2025 progress report 5-4](https://github.com/user-attachments/assets/a34c61a0-ab60-4a1b-831d-ac1c53659d74)

**Terminal commands**

![ACM Fall 2025 progress report 5-5](https://github.com/user-attachments/assets/b75f9482-86c8-4f24-9c10-8760e531ae04)

**Full Video Walkthrough**

https://github.com/user-attachments/assets/7ad13271-0e92-46c9-ae28-cc3b392bfee1


### Progress Report 6 (9/29/25 - 10/5/25)

**Settings Button**

![ACM Fall 2025 progress report 6-1](https://github.com/user-attachments/assets/b67558ff-d481-46e9-ad60-648bc3c39919)

**New and improved User Signup**

![ACM Fall 2025 progress report 6-2](https://github.com/user-attachments/assets/dd39d1cf-b41d-43c1-abb9-44f79a46f8ea)

**Map View Functionality**

![ACM Fall 2025 progress report 6-3](https://github.com/user-attachments/assets/6f19c377-a44d-43c2-af4c-d7a58546d863)

**Audio Player**

![ACM Fall 2025 progress report 6-4](https://github.com/user-attachments/assets/ce4f1a71-b415-4d49-8ebc-93f7fe6ed50a)

**Terminal commands**

![ACM Fall 2025 progress report 5-5](https://github.com/user-attachments/assets/aa758a8c-b669-495d-b03f-e2e8fda9354b)

**Full Video Walkthrough**

https://github.com/user-attachments/assets/9cadd783-27e2-4502-a153-84ed5446de39

https://github.com/user-attachments/assets/cf287e07-0d9e-48fe-9ad6-e793745b1448

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

### Settings Implementation

**Steps Completed:**
1. Created Settings.jsx to hold Settings logic
2. Created Settings.css to create proper styling
3. Added a Settings button to App.jsx and MapView.jsx for easy navigation
4. Updated routes section on App.jsx

**Key Files Modified:**
- `src/Components/Settings.jsx` - Settings file
- `src/Components/Settings.css` - Settings styles
- `src/Components/MapView.jsx` - Added Settings button
- `src/Components/App.jsx` - Added Settings button and updated routing

### Password Requirements Component

**Steps Completed:**
1. Updated Signup.jsx to add requirement logic and real-time validation
2. Added a password requirement display to Signup.jsx
3. Updated Auth.css to incorporate new style changes

**Key Files Modified:**
- `src/Components/Signup.jsx` - Added password requirement functionality
- `src/Components/Auth.css` - New display styles

### Updated Style Changes

**Steps Completed:**
1. Updated App.jsx to add the logo
2. Added the logo to `src/assets/`
3. ~~Updated Signup.jsx and Login.jsx to incorporate a leaflet map background~~
4. ~~Updated Auth.css to style the blurred map background~~
5. ~~Updated App.jsx to enable clicking functionality to the logo~~
6. ~~Created a new logo easter egg within App.jsx~~
7. Updated App.css to include proper styles

**Key Files Modified:**
- `src/Components/App.jsx` - Added logo and clicking feature
- `public/assets/` - Added the logo for reference
- ~~`src/Components/Signup.jsx` - Added leaflet map background~~
- ~~`src/Components/Login.jsx` - Added leaflet map background~~
- ~~`src/Components/Auth.css` - Added blurred map background styles~~
- `src/Components/App.css` - Added click effect styles

---

## Features Completed

### ✅ Authentication System
- User registration and login
- Password requirements component for improved password validation
- Session management with Firebase Auth
- Protected routes (map access requires authentication)
- Automatic session persistence

### ✅ Interactive Map
- Leaflet.js map centered on Boca Raton Airport
- Custom red marker icon for airport
- Flight list in popup (shows first 2, expandable to all)
- Real-time data from Firebase Firestore
- Navigation button to audio recordings page
- Settings button to settings page

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

### ✅ Settings Implementation
- A new component with various settings options
- Created styles for the settings page
- Done in JSX and CSS respectively
- The settings are saved to localStorage when you click "Save Settings"
- However, none of these settings actually affect the app's behavior right now

### ✅ Various Style Changes
- Added logo to the home page
- ~~Clicking the logo is enabled~~
- ~~Incorporated a leaflet background map for signup and login pages as purely visual~~
- Added settings button on the home page
- ~~Added styles for click effect~~

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
│   ├── assets/
│       └── ACM Logo.png          # ACM Logo
│   ├── Components/
│   │   ├── AudioPlayer.css       # Audio player styling
│   │   ├── AudioPlayer.jsx       # Audio player with auto-detection
│   │   ├── Auth.css              # Login and Signup styling
│   │   ├── Debug.jsx             # Checks if database connection is working
│   │   ├── FlightInfo.css        # Flight Info styling
│   │   ├── FlightInfo.jsx        # Contains sample hardcoded data for flights
│   │   ├── Login.jsx             # Firebase authentication
│   │   ├── MapView.css           # Map styling
│   │   ├── MapView.jsx           # Interactive flight map
│   │   ├── Settings.css          # Settings styling
│   │   ├── Settings.jsx          # Settings component
│   │   └── Signup.jsx            # User registration
│   ├── routes/
│   │   └── ProtectedRoute.jsx    # Auth guard for routes
│   ├── firebaseConfig.js         # Firebase initialization
│   ├── App.jsx                   # Main routing component
│   ├── App.css                   # Global styles
│   ├── index.css                 # Root styles
│   ├── main.jsx                  # App rendering with React Router Dom
│   └── supabaseClient.js         # Firebase initialization (will delete soon)
├── server.js                     # Backend API for audio files
├── package.json
├── index.html
├── Build-Sprint-1.md
├── Build-Sprint-2.md
├── Build-Sprint-3.md
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

ACM Project Team - Spring 2025
Project Deadline: December 2025

---

## License

Educational project - Boca Raton Airport Flight Tracking System












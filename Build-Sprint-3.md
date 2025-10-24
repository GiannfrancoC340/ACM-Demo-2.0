# Airplane Communications Mapping Project - Build Sprint 3

This project was created by Giannfranco Crovetto.

Valid for Engineering Design 2 - Fall 2025. From October 6 2025 - December 2nd 2025

## Overview

Our group project - Airplane Communications Mapping - is a system that captures, organizes, and analyzes real-time air traffic control 
(ATC) communications using software-defined radios (SDRs). It pairs live audio with real-time aircraft tracking and transcribes the 
conversations using speech-to-text tools. The system also uses stress detection algorithms to flag when a pilot may be under 
emotional strain. This information is presented through a web-based dashboard designed for aviation analysts, students, and enthusiasts 
to review live and past flight communications more easily and effectively. 

This is Build Sprint 3, the final build sprint before the final deadline. This counts for all progress made for the project from the first in-class demo, which was on October 6 2025 until the final deadline of December 2 2025. What sets this sprint apart from the previous 2 sprints is this is the longest one, and it will finalize our project, ensure the project has proper styling and updated functionalities to conform to our specifications. 
As a recap, this is the schedule of the build sprints:
- [x] **Build Sprint 1:** August 16 2025 - September 14 2025
* Accounts for picking up work since Spring 2025 and adds an audio section within FlightInfo.jsx, modal popup for individual flights, and a new and improved home + login + signup pages.

- [x] **Build Sprint 2:** September 14 2025 - October 6 2025
* Accounts for everything since BS1/Firebase migration until the first demo. Essentially this is the work done starting with Firebase migration up to the first demo.
* There is Firebase database integration, a working audio player with audio detection, enhanced map interface, backend API server to handle audio requests, password requirements component, settings button, and updated project styles.

- [x] **Build Sprint 3:** October 6 2025 - December 2 2025
* Accounts for everything since BS2/first demo until the final deadline.

## Time Spent

Time spent on this project: **3 hours and 30 minutes**. Spans from October 6 2025 - December 2 2025.

## Required Features

The following **required** functionality is completed:


- [x] **Web Page includes a home, login, and signup screens**
  - Users can see the home page when they first load into the project
  - Users can see the logo on the home page
  - Users can click on the logo for a neat easter egg
  - Users can click on the login and signup buttons to be taken to either login or signup
  - Users can navigate between all 3 screens seamlessly
  - The home + login + signup have new and improved styles such as hover effects and background gradients to look more modern!
  - The user can see and click on the Settings button to view the settings page
  - The user can see a welcome card within the settings IF they are logged in
  - If they are not, they will not see it
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
  - The user can see the leaflet map as a purely visual background element on both the login and signup screen.
- [x] **Users can click on the logo for an easter egg**
  - The user is able to click on the logo
  - The surprise is a fun little surprise that not everyone will think about
- [x] **Settings page is viewable for everyone**
  - The Settings button can be clicked by everyone
  - The user can see all available settings
  - None of these settings actually affect the app's behavior
  - The user can exit out of the settings page
  - The user can see a welcome card within the settings IF they are logged in
  - If they are not, they will not see it
  - The user can logout from the settings page if they would like
  - It would take them to the home screen
- [x] **Users can logout**
  - The user can logout from the settings page if they would like
  - It would take them to the home screen
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
  - The user is now able to see live flights within a certain radius!
  - The user can click the Live Aircraft button to toggle flights or not
  - The user can slide the search radius to search within a radius from 10 - 150 km
  - The user can click on each live flight
  - It will display a lot of information such as flight number and altitude
  - The flights update the position on the map every 90 seconds
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
  - Audio recordings ARE NOW functional and displayed when available to listen
  - Audio will be available to play for flights where audio is listed
  - If audio is not there for a flight, it is not functional
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
  - The user can go back by clicking the back button or the back to map button
  - The user can listen to the audios for each individual flight here as well
  - The user can see the NEW stress transcript module for each audio recording!
  - This works for all types of audios within the audio playlist
  - It will show various analytical data for each audio, such as stress, arousal, and fear
- [x] **Users can see live flights**
  - The user is now able to see live flights within a certain radius!
  - The user can click the Live Aircraft button to toggle flights or not
  - The user can slide the search radius to search within a radius from 10 - 150 km
  - The user can click on each live flight
  - It will display a lot of information such as flight number and altitude
  - The flights update the position on the map every 90 seconds

## Process

After our demo on October 6, we all felt good for completing the demo and being proud of the work we did. It was a quick celebratory moment and then back to work for us. Later that day, I went back to work on the project. I added a clicking feature to the logo where if the user clicks it for a certain amount of times, a funny easter egg pops up. I made sure to add hover and animation styles. I updated the Home function in App.jsx to add clicking using useState, and I added CSS styles to App.css. I find it neat and niche so that is cool. Later, I added a logout functionality to the project, where the user is now able to logout from the Settings page whenever. I added a  useEffect and a const handleLogout function, made to handle each part respectively. Also, I added more styles to the project. The first one is changing the layout of the settings to grid from flex. Then, I added a thanks section within the settings, to give thanks for the people who gave me advice on the project. I also added a welcome section to greet the user within the settings, whenever a user is logged in. I also added a back to map button in the AudioPlayer screen, added style effects to the loading state when the audio player is empty, and added styles for error handling if the backend is offline. These style changes make the project look much more modern and dynamic.

The next thing I did after is to check how to connect the audios to each individual flight on the flight modal popup. When I click on an individual flight, I can see the information and below it I can see the supposed audio files, but there is nothing there as the data is hardcoded for now. Right now, the audio communications in the flight modal are separate from the audio player. First, I had to add a new field to each flight called audioRecordings. It was tedious but worthwhile. Then, I had to update the Flight Modal in MapView.jsx to use Firebase data. Then, I had to update the audio section of Flight Modal to handle missing audioRecordings. Lastly, I had to test it out. Everything was good except everytime I clicked on an individual flight, I would get a blank screen, so I had to debug and fix it. I had to add flights = {flights} to the modal popup, and I updated the FlightInfoModal component to accept the flight prop. I got an blank screen again, so I consulted with Claude again. I managed to get it fixed but I saw that in the browser console, I got a TypeError, so Claude suggested it was the filter, so I  found out that the validation/filtering in your fetchFlights function is stripping them out. I fixed that and it was working again. The fix was to add .filter() to filter for flight time, route, and flightId. The reason is .filter() only removes flights that don't meet criteria. It keeps the FULL flight object with all fields and now departureAirport, arrivalAirport, audioRecordings all exist.

After seeing this work out, I decided to test it out. I thought it was easy as creating a test mp3 with the same name as the audio URL and it would work, but it was way more complicated than I thought. I had to do extra work on top of the fix I did above essentially. The plan was to manually create or change an already existing mp3 file to the same name as an audio with the same URL, hoping it would work but it did not play. I got to debugging with Claude. First, I had to add useEffect hooks and audio event listeners to ensure playing audio would work. I then got a blank screen, I checked the browser conosle and found a React Hook Order violation error, so I had to move the placement of the hooks at the very top. These current and future changes are within the FlightInfoModal function of MapView.jsx by the way. I got it to work, but the audio player still did not play. I looked through the Console and Network tabs in the browser console and found a bunch of script and fetch and png files being pulled but no mp3, so that was the problem: the audio file was not being loaded at all. The issue was that the audio element was created before the audioUrl is available, so the src never gets set properly. Sadly, the browser console was giving me an error where the audio URL is undefined, so that means the information is coming from Firebase and not the project data itself. So I had to change that, I merged the Firebase data with the hardcoded data and I got it to work, but the player was not updating so it was a quick UI fix.

I decided to then update server.js to make the backend API fully functioning with other components in my project.  I updated server.js to add to the API to load audios to each corresponding flight. I updated the backend and updated the first useEffect in FlightInfoModal to incorporate the backend. I got a 404 error on the browser console and realized it was with the API server not having a proper endpoint. I added the missing formatTitle function and added error handling with try and catch. Then, I saw each flight had no audio, so I had to debug it again. The backend was returning audios for flights with a hyphen, but the audio did not, so I had to ensure not to break anything important. Fortunately, I found a way to have the backend read the files as “flight1” and not “flight-1” where the latter was what the backend was reading. I updated the backend to handle both naming conventions. I got it to work properly, which was a good feeling. I then saw that there was only 1 audio file on the flight modal popup, so I then found out that the way I had it before, where all the audios were there but playback was not functional, is not optimal. Rather, it is better practice to have less audio that properly functions and not multiple audio that do nothing. The other flights show "No audio recordings available" because there are no matching files in your /audio folder. If I want more audio to appear, I need to drop the files to the /audio folder with the correct naming patterns. I wanted to add the other hardcoded audio files, but that was not optimal because it is bad user experience, misleading that audios do not exist, and confusing for users, they could assume it is a bug. The current behavior is much better than before as it shows truthful audios that can play, clear messaging where audios that play, play, and for audios that are not there, it says “No audio recordings available for this flight yet”. One last thing I noticed was that the new format was very bleak, so I wanted to store more metadata to the audios, so I added metadata extraction to the formatTitle on server.js. Fortunately, I got it to work and it looks much better and professional now.

The next task that I did was incorporating Barry's stress detection module to the project. First, I had to uninstall and reinstall chocolatey and then install FFmpeg. I then had to create a project directory, create an audio input directory, and then create the Python virtual environment. I then ran into an error where I had to fix it using an override command within PowerShell administrator. I then installed the Python packages, but I ran into an error where it was installing the packages in Python 3.13, but I needed 3.11. I had to install Python 3.11, remove the virtual environment, and create a new virtual environment using Python 3.11. Next, I had to activate the environment, verify the Python version, and update the package manager. I got it to work and then downloaded the Vosk Speech Recognition model, but I got an error with curl, so I had to run a new curl command to conform to my device. Then I had to download the Python files which Barry soon sent me. I then changed the directory of the combined.py file to use my /audio folder path and then updated the directory of the transcript_module.py file to use the Vosk model. I got that done and then I created a bias_atc.txt file to ensure that the transcript module has a list of keywords that pilots use in ATC communications. I then went to test it and encountered an error message, saying “Folder 'C:\audio-transcription\vosk-model-small-en-us-0.15' does not contain model files”. Barry then helped me debug as this was an annoying issue. We then found out that we had to set UTF-8 encoding every time I ran PowerShell, as if I ran it permanently, it would break my laptop. We then got it to work but found a small UnicodeDecodeError, where we had to run another set of commands just to run it, similar to running a command to ensure UTF-8 is active. Shortly after, it was running but the transcript files were not being updated, so we found out that aifc-mirror was not installed, so we installed a pyaifc package. Then it was not working again, so we restarted the environment to run Python 3.11 again and it worked, after running the proper commands.  

So, the way this all works is I need to run PowerShell as an administrator and run 5 commands to ensure this all works. Then, for each mp3 file in the /audio folder, the module would process and transcribe the stress and transcript. If one already exists, it stays “watching”, but this means it is waiting for a new file to be uploaded. So, I go to run my project and then I see the new and improved transcript files in AudioPlayer.

The last task that I did for the week was to implement the live flight tracking component to the project. Barry and I had researched APIs to use and we found the OpenSky API that is used to track live flights. It works well with React and Leaflet based projects so it was a huge relief. I wanted to implement this in the least destructive manner possible. First, I had to create the OpenSky API service file that holds the API and necessary code to read the data from OpenSky. Next, I had to create a file to display live aircraft on the map, then I had to update MapView.jsx to conform to these changes and lastly update MapView.css to update the styles. I got the code to work, but I did not see any flights, so I wondered if I implemented something wrong or if I needed to create an account on OpenSky. So, I made changes to restrictions on certain geolocations like Boca Raton Airport. This included adding a visual search radius overlay, ranging from 10 km to 150km. I had to update openSkyService.js to handle dynamic results, create the search radius file, update LiveAircraftLayer.jsx to handle dynamic results, update MapView to handle dynamic results and add control panel to toggle live flights. I ran the code and got it to work, which was amazing. I was proud of the work I did. One thing I did notice was that the plane icons looked like shurikens so I changed the createAirplaneIcon function in LiveAircraftLayer.jsx to create plane emojis as the icons. It looks much cleaner and simpler than before. Another change I made was updating the styles of the aircraft popups. I made sure to update them with modern styles. 

On Sunday, when I ran the project to work on it again, I got 2 errors in the browser console: CORS error and 503 Service Unavailable. I knew it wasn’t the refresh rate limit as I had not opened the project within the past 24 hours, so it must have been a CORS error. I had to route the OpenSky API calls to run through a proxy server and update server.js to handle this. I updated the server.js and openSkyService.js files to ensure that the new code was implemented and it worked. I saw live flights and interactive calls in the browser console. I also noticed that some proxy variables were not being used, so I had to fix the code to ensure they were working correctly. Lastly, I changed the refresh rate to 90 seconds from 60 seconds as that was eating a lot of daily rates. This looks extremely cool and I am going to keep working on this.

## GIFs

### Progress Report 7 (10/6/25 - 10/19/25)

**Python Environment commands**

![ACM Fall 2025 progress report 7-1](https://github.com/user-attachments/assets/f2c5ec0c-9268-4c69-9785-b221135629a0)

**Terminal commands**

![ACM Fall 2025 progress report 7-2](https://github.com/user-attachments/assets/9c5d4abb-a05e-4241-b181-9bf63f9724c0)

**Settings**

![ACM Fall 2025 progress report 7-3](https://github.com/user-attachments/assets/43e727d5-3a62-4861-a358-298a0ca3c296)

**User Login**

![ACM Fall 2025 progress report 7-4](https://github.com/user-attachments/assets/2eef9105-0e97-4e14-a3ab-d3c3721b4e80)

**Live Flight Tracking functionality**

![ACM Fall 2025 progress report 7-5](https://github.com/user-attachments/assets/6eb5f719-5ccd-423d-bf2e-ffccf3c19ad7)

**Button Navigation**

![ACM Fall 2025 progress report 7-6](https://github.com/user-attachments/assets/0ddaa436-ab74-4920-8d70-04868ffa4401)

**Audio Player**

![ACM Fall 2025 progress report 7-7](https://github.com/user-attachments/assets/ae5681dc-6a24-4165-af8e-eb1bc81dfa69)

**Individual Flight Modal**

![ACM Fall 2025 progress report 7-8](https://github.com/user-attachments/assets/826186b3-49d3-460f-b93d-68257616c554)

**Browser Console**

![ACM Fall 2025 progress report 7-9](https://github.com/user-attachments/assets/ee9b5ca6-5855-4a84-b70e-7f154bcd6640)

**User Logout**

![ACM Fall 2025 progress report 7-10](https://github.com/user-attachments/assets/ecda6b19-e8ef-48c3-889d-0d6ea327cb80)

**Full Video Walkthrough**



https://github.com/user-attachments/assets/50b868ca-ab76-40de-9e06-75b7eac7f8fc



https://github.com/user-attachments/assets/fa9d8001-7bf4-4138-95ca-e16740602ea5



https://github.com/user-attachments/assets/a702f016-cbda-4346-9a01-433a913677c9



https://github.com/user-attachments/assets/dab58390-1613-40cd-b449-dcd999a2f1f6




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

After our first demo presentation on October 6, insert the process here

## Time Spent

Time spent on this project: **3 hours and 30 minutes**. Spans from October 6 2025 - December 2 2025.

## Required Features

The following **required** functionality is completed:


- [x] **Web Page includes a home, login, and signup screens**
  - Users can see the home page when they first load into the project
  - Users can click on the login and signup buttons to be taken to either login or signup
  - Users can navigate between all 3 screens seamlessly
  - The home + login + signup have new and improved styles such as hover effects and background gradients to look more modern!
- [x] **Users can signup for an account or login to an account**
  - Web page must support signup and login functionality thanks to Supabase
  - If the user is new, they must signup for an account. The user can signup using:
    - Email
    - Password
    - No email verification is necessary 
  - If the user has an account, they can login using their email and password
  - Once either is completed, the user will be taken to the MapView screen
  - The user can log out by clicking the back button on their browser
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
- [x] **Supabase functionality**
  - Supabase can handle user authentication
  - It can store:
    - User ID
    - Email
    - Created at
    - Last sign in
    - Provider
  - Supabase handles the following policies:
    - Users can delete their own locations
    - Users can insert their own locations
    - Users can update their own locations
    - Users can view their own locations
  - However, these policies have no effect on the project itself
  - Supabase has 1 table ready: Locations
  - The table is currently empty, as it is used for live SDR data
  - The project only has hardcoded sample data
  - So that means, for the sample hardcoded data, the policies, and Locations table has no effect
  - Only authentication is working

## Process

Talk about the process here

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


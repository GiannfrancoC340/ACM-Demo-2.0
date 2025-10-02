# Airplane Communications Mapping Demo 

This demo project was created by Giannfranco Crovetto.

Valid for Engineering Design 2 - Fall 2025. From August 16 2025 - September 14 2025.

## Overview

Our group project - Airplane Communications Mapping - is a system that captures, organizes, and analyzes real-time air traffic control 
(ATC) communications using software-defined radios (SDRs). It pairs live audio with real-time aircraft tracking and transcribes the 
conversations using speech-to-text tools. The system also uses stress detection algorithms to flag when a pilot may be under 
emotional strain. This information is presented through a web-based dashboard designed for aviation analysts, students, and enthusiasts 
to review live and past flight communications more easily and effectively. 

This is Build Sprint 1, where it shows the progress made from the first demo back in April 2025. It explains the process from recovering the 
project, adding an audio section within FlightInfo.jsx, modal popup for individual flights, and a new and improved home + login + signup pages.
The core functionality from April remains the same, with 3 new and important features added. First, when the user loads into the project, 
they will see the improved Home screen where it looks more modern. Then, if the user needs to signup or login, they will see a more 
modern layout. This improves the design of the previous iteration where it was basic and plain. Now, when the user loads into the 
MapView component, they can click on the marker and see a list of available flights. If the user clicks on an individual flight, 
they are not taken to a new screen, but rather they are still on the MapView component, but the individual flight screen is on top of it. 
It acts as a modal popup, to prevent directing to a new screen and staying in one screen. Also, in each individual flight screen, the 
user can see audio details such as landing comms, and departure comms. These new features are important for the modularity of our project.

## Time Spent

Time spent on this project: **4 hours and 15 minutes**. Spans from August 16 2025 - September 14 2025.

## Required Features

The following **required** functionality is completed:


- [x] **Web Page includes a home, login, and signup screens**
  - Users can see the home page when they first load into the project
  - Users can click on the login and signup buttons to be taken to either login or signup
  - Users can navigate between all 3 screens seamlessly
  - The home + login + signup have new and improved styles to look more modern!
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
  - Modal popup approach provides a better user experience since users can view flight details without losing their place on the map, and they can quickly switch between different flights without having to navigate back and forth.
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
    - audio recordings
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

This was 

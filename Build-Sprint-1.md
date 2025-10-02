# Airplane Communications Mapping Project - Build Sprint 1

This project was created by Giannfranco Crovetto.

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

This was a very rigid, unflattering, and exciting experience for this iteration. So, for a recap, back in April I had completed a working demo of our project and it was great. I was hoping to work on the project over the summer, however I ultimately did not do that so I felt like I wasted a lot of time that I could have been working on the project. My other groupmates did not work on their respective parts over the summer, so I felt relieved that I was not the only one who did nothing. However, that means no one did anything so I feel like something new should be done. So I felt motivated and opened up the project to see what I can add. Come to see that I can't get it to run, so I check my code and it is the same as when I last touched it. It cannot be a code issue so I checked the database on Supabase and found that the project was paused as it has been more than 7 days since inactivity. I then went to recover the project thinking I can do it no big deal, but it has been more than 90 days since the last activity so it could not be recovered. Unless I downloaded some files and packages but I decided not to. So, I went to brainstorming and decided to create a new folder - I would have to copy the code, install the dependencies, create a new database on Supabase and copy the necessary API keys. That did not seem like a lot as I knew how to copy the code and what not. Only thing was, I could not even access the table editor or SQL editor on Supabase as it was way expired, so I had to start from scratch. Luckily, I still had the Claude chat prompts so I went ahead and went through each one hoping to find the right one and did went back to square one. 

First I created a new folder for the ACM project, this time it is a 2.0 version... a more and improved version. I created the React structure, connected to my GitHub repository via Git, committed the code and that was a good and quick start. Then I installed the dependencies of React Router, Leaflet, and Supabase. Then I went ahead and copied the code, starting with the src folder, Components folder, Routes folder, and supabaseClient.js file. It was super easy as it was just a copy and paste fest, but it was super tedious so that was bothersome but whatever. This all took me almost 30 minutes. Then I realized I had to create the database and I was dreading it as I had lost my step in databases. I went through the Claude chat prompts and luckily, I found the required table code and SQL code so I copied that, made sure to copy the API keys, and then created the .env file to store the keys there securely and voila, project recover done.

The next part, after spending almost 1 hour and 30 minutes recovering the project, I went ahead and added section, where the user is able to listen to audio recordings. This was agreed upon by my group back in April so I wanted to show that I did get something important done over the summer. I was working on recovering this project on August 16, 2 days before the Fall semester started. I edited the FlightInfo.jsx file to include an audio recordings section, each flight has an audio recordings array listed with duration, time, title and a placeholder for actual live audio, it has an interactive audio player, and it supports MP3 files. I did see that the audio sections are not clickable so I made sure to enable clicking, so that was neat. Unfortunately, I did not add any MP3 files to test so I could not figure out if the play and pause button work but I am pretty sure they should work.

Two weeks later and I was told by my groupmates that whenever a user clicks on an individual flight, it takes them to a new screen with all the details there. Now, we all agreed that can be modified, so we wanted the user to stay on the map screen and see the individual flight details as a popup. So, I went ahead and looked to create a flight modal popup where it just creates a popup in the map screen. It was relatively simple, as I had to move all the flight data to MapView.jsx for the popup to work as it would access the data on the same file, created a modal component to handle popup, converted flight links to buttons, and added modal styling. Once done, I had successfully created flight modal popup and it looked fantastic.

The next part was to update the home, login, and signup section of my project. I decided to go full scale modern with these files. I went with updating the login and signup first. I updated the buttons to make them stand out more, form containers to add a card look and gradient background, inputs for rounded corners, error and success messages to make them more color-oriented, and added a subtle fade-in animation when the login and signup cards appear. I created Auth.css to store these changes, and cleaned up App.css to remove redundant files. Then, I went ahead and worked on the home page. I added a layout to make it have a card-like layout, and it worked except for one thing: the background gradient was not wrapping around the whole screen, so I did some debugging with ChatGPT and found out that some part of App.css had a gray background and not white, so that fixed it. Ultimately, the changes I have made while they were small, they impacted our group and our project tremendously. 

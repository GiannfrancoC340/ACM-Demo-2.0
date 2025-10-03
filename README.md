# Airplane Communications Mapping Demo 

This demo project was created by Giannfranco Crovetto.

Valid for Engineering Design 1 - Spring 2025. From April 17 2025 - April 28 2025.

## Overview

Our group project - Airplane Communications Mapping - is a system that captures, organizes, and analyzes real-time air traffic control (ATC) communications using software-defined radios (SDRs). It pairs live audio with real-time aircraft tracking and transcribes the conversations using speech-to-text tools. The system also uses stress detection algorithms to flag when a pilot may be under emotional strain. This information is presented through a web-based dashboard designed for aviation analysts, students, and enthusiasts to review live and past flight communications more easily and effectively. 

In this specific demo, I will be showcasing a standard demo run. When the user first loads into the app, the user will see the home screen, that has 2 links to signup for an account or login to an existing account. The user authentication is handled by Supabase, it only records the user accounts as there is no data being pulled from the database yet at least. Then once the user is logged in, there will be an interactive map to see. The map is set to view over the Boca Raton airport by default as there is a red marker over it. The user is able to zoom out, zoom in, and move around the map. The user can click on the red marker and see the incoming flights. The user can see more flights if they wish by clicking the button below it, and the user can click on each individual flight to see specific flight information for that corresponding flight. In that page, it has specific flight information regarding that flight, like flight number, destination, arrival time, departure time etc. 

## Time Spent

Time spent on this project: **5 hours and 30 minutes**. Spans from April 17 2025 - April 28 2025.

## Required Features

The following **required** functionality is completed:


- [x] **Web Page includes a home, login, and signup screens**
  - Users can see the home page when they first load into the project
  - Users can click on the login and signup buttons to be taken to either login or signup
  - Users can navigate between all 3 screens seamlessly 
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
  - When the user clicks on an individual flight, they will be taken to a new screen depicting all information
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
  - All information is color coded respectively
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

This project involved a lot of modularity, scaling, dedication, and creative thinking to code. Our group had decided to go with the airplane communication mapping project and we decided that a website would be the best way to display our project. So, my responsibility was to create the website. We were given a good amount of times, like more than 6 weeks I recall to show some progress. I had decided to use React as my front-end, and Supabase as my database/back-end since I was fresh off using it in a separate class project. So I felt that it was the perfect time and mix to use both together. 

First, I created a new folder called ACM and installed React within it. It gave me a bunch of files as usual, next I configured Git to the project to track my code, commit and push to GitHub. Then, I pushed some basic code to GitHub, and then pushed the rest of the code. I did some changes to the starter code that React gave me as I did not need it anymore. Next, I created 5 new files to work with. I knew I needed a user authentication for this project so I was aware of that. I then got to work on coding, working on App.jsx to store the mainframe. App.css to store CSS for the entire project, Home.jsx to create a home page, AuthContext.jsx to store authentication logic, PrivateRoute.jsx to enable users are on a private route when navigating through the project, Login.jsx to handle logins, and Header.jsx to create a nice header. I then installed React Router to enable Routing via Link, and then added a map to enable a map view. I then realized I needed a Signup.jsx file to handle signups so I went ahead and did that, and conformed my project to update this. 

The following day, I went ahead and installed Leaflet to my project. Leaflet is a JavaScript library for interactive maps, it requires its associated CSS file for enabling proper styling and display of map elements like markers, popups, and controls. Once I got that working, I went ahead and connected Supabase to my project. On Supabase, I created a new database project and made a locations table and created some SQL code to make it functioning. Within Supabase, an authentication table is created to handle and store logins and signups. Once done, I installed the necessary dependencies to my project. I had to edit my Login, Signup, App to conform to Supabase and I created a MapView.jsx file to handle the map. I deleted PrivateRoute (replaced core functionality with a ProtectedRoute instead), Home, and Header as they were obsolete. Now, my project pipeline was to: home -> signup OR login -> map view. I then saw I was getting blank screens after blank screens so I had to try something new.

I consulted with Claude a ton to help me out. I ended up changing the Leaflet logic, path case sensitivity, fix the double router problem in App, and created a Debug.jsx file to help with debugging. I still got a blank screen, so I updated #root in App.css to make it wider, and updated MapView to override these constraints. I created a MapView.css to handle CSS for MapView only. I finally got it working and felt proud. Then, I updated my locations table on Supabase with a more comprehensive SQL file to enable row level security and various policies. I had to update MapView and supabaseClient.js (client file) to conform this. I also created a .env file to store variables to hold the API keys to my project in a safe and hidden path. I got some errors, that were painful so I ended up fixing some things that were minute and got it to work. It was the App.jsx file not having the proper routing. I ended up fixing it shortly and called it a day.

Later on, I worked extensively on the MapView. Using Leaflet, I created a red marker to hold a marker to the BCT airport. I then got to work on the Map and Flight list components, starting off with flight information of flights entering BCT. I went with hardcoded data to show sample flight data. I then went on to create FlightInfo.jsx to hold individual flight information as a popup when I click on the BCT airport marker. MapView was updated to handle clickable flights, and I updated App with proper flight routes. I then updated the styling to make it look better, and I got great progress done with the MapView. I then added 3 new flights with the same logic as before, updated the CSS, and created a button to view all available flights. I felt as I was getting great progress done that could be what we could use for our live implementation. I added in depth flight detail functionality for each flight, to view the individual flight details. I added more niche details and done. The project was complete with sample hardcoded data, necessary for our final project presentation.

## GIFs

Here are the GIFs showcasing the functionality of the project:



// // src/services/flightLogger.js

// // Track which flights we've already logged (in-memory)
// const loggedFlights = new Set();

// /**
//  * Log a flight to the backend
//  * Only logs each unique flight once per session
//  */
// export async function logFlight(flight) {
//   try {
//     // Create unique key for this flight (callsign + date)
//     const today = new Date().toDateString();
//     const flightKey = `${flight.icao24}-${today}`;
    
//     // Check if we've already logged this flight today
//     if (loggedFlights.has(flightKey)) {
//       return; // Already logged, skip
//     }
    
//     // Log to backend
//     const response = await fetch('http://localhost:3001/api/log-flight', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ flight }),
//     });
    
//     if (response.ok) {
//       // Mark as logged
//       loggedFlights.add(flightKey);
//       console.log('📝 Logged flight to file:', flight.callsign || flight.icao24);
//     }
    
//   } catch (error) {
//     console.error('Error logging flight:', error);
//     // Fail silently - don't break app if logging fails
//   }
// }

// /**
//  * Log multiple flights at once
//  */
// export async function logFlights(flights) {
//   for (const flight of flights) {
//     await logFlight(flight);
//   }
// }

// /**
//  * Clear the logged flights set (useful for testing)
//  */
// export function clearLoggedFlights() {
//   loggedFlights.clear();
//   console.log('🗑️ Cleared logged flights cache');
// }
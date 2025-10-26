// mapHelpers.js - Helper functions, constants, and data for MapView

import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// ============================================================================
// ICON DEFINITIONS
// ============================================================================

// Fix for the default icon
export const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Create a custom red icon
const redIconUrl = "data:image/svg+xml;base64," + btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
  <path fill="#e04141" stroke="#ffffff" stroke-width="1" d="M12.5,1C5.6,1,0,6.6,0,13.5c0,4.6,2.4,8.7,6,11c0,0,0.1,0.1,0.1,0.1l5.6,16.1c0.2,0.5,0.8,0.8,1.4,0.5c0.2-0.1,0.4-0.2,0.5-0.5L19.2,24c0,0,0.1-0.1,0.1-0.1c3.6-2.3,6-6.4,6-11C25.3,6.6,19.4,1,12.5,1z M12.5,18c-2.5,0-4.5-2-4.5-4.5s2-4.5,4.5-4.5s4.5,2,4.5,4.5S15,18,12.5,18z"/>
</svg>
`);

export const redIcon = L.icon({
  iconUrl: redIconUrl,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get BCT-related flights from live aircraft data
 */
export function getBCTFlights(aircraft) {
  const BCT_LAT = 26.3785;
  const BCT_LNG = -80.1077;
  const NEARBY_THRESHOLD = 10; // km
  const LOW_ALTITUDE_THRESHOLD = 3000; // meters (~10,000 ft)
  
  const nearby = aircraft.filter(plane => {
    const distance = calculateDistance(BCT_LAT, BCT_LNG, plane.latitude, plane.longitude);
    return distance <= NEARBY_THRESHOLD && plane.altitude && plane.altitude < LOW_ALTITUDE_THRESHOLD;
  });
  
  const departing = nearby.filter(plane => 
    plane.vertical_rate && plane.vertical_rate > 2 // Climbing (m/s)
  );
  
  const arriving = nearby.filter(plane => 
    plane.vertical_rate && plane.vertical_rate < -2 // Descending (m/s)
  );
  
  return { departing, arriving, total: nearby.length };
}

/**
 * Convert live aircraft data to flight detail format for modal
 */
export function convertLiveAircraftToFlight(plane, direction) {
  const BCT = {
    code: "BCT",
    name: "Boca Raton Airport",
    city: "Boca Raton",
    state: "Florida"
  };
  
  const isDeparture = direction === 'departing';
  const currentTime = new Date();
  const timeStr = currentTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return {
    flightId: `live-${plane.icao24}`,
    route: isDeparture 
      ? `BCT to ${plane.origin_country}` 
      : `${plane.origin_country} to BCT`,
    time: timeStr,
    boardingTime: isDeparture ? timeStr : 'N/A',
    arrivalTime: !isDeparture ? timeStr : 'N/A',
    airline: "Unknown Carrier",
    flightNumber: plane.callsign || plane.icao24.toUpperCase(),
    aircraft: "Unknown Aircraft",
    status: "In Flight (Live)",
    gate: "TBD",
    terminal: "Unknown",
    duration: "Unknown",
    distance: `${calculateDistance(BCT.lat, BCT.lng, plane.latitude, plane.longitude).toFixed(1)} km from BCT`,
    departureAirport: isDeparture ? BCT : {
      code: "UNK",
      name: "Unknown Airport",
      city: plane.origin_country,
      state: ""
    },
    arrivalAirport: !isDeparture ? BCT : {
      code: "UNK",
      name: "Unknown Airport", 
      city: plane.origin_country,
      state: ""
    },
    // Live flight specific data
    liveData: {
      icao24: plane.icao24,
      latitude: plane.latitude,
      longitude: plane.longitude,
      altitude: plane.altitude,
      velocity: plane.velocity,
      heading: plane.heading,
      vertical_rate: plane.vertical_rate,
      on_ground: plane.on_ground
    },
    audioRecordings: [] // Live flights won't have recordings yet
  };
}

// ============================================================================
// FLIGHT DATA
// ============================================================================

// Flight data (detailed flight information - this will eventually come from Firebase)
export const flightData = {
  'flight-1': {
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
    },
    audioRecordings: [
      {
        id: 1,
        title: "Pre-flight Communications",
        description: "Ground control and taxi instructions",
        audioUrl: "/audio/flight1-preflight.mp3",
        duration: "2:34",
        timestamp: "2:20 PM"
      },
      {
        id: 2,
        title: "Takeoff Clearance",
        description: "Tower communications for departure",
        audioUrl: null,
        duration: "1:45",
        timestamp: "2:55 PM"
      },
      {
        id: 3,
        title: "En Route Communications",
        description: "Air traffic control during flight",
        audioUrl: null,
        duration: "3:12",
        timestamp: "3:30 PM"
      }
    ]
  },
  'flight-2': {
    route: "BCT to MIA",
    time: "4:30 PM",
    boardingTime: "4:00 PM",
    arrivalTime: "5:15 PM",
    airline: "Florida Connect",
    flightNumber: "FC567",
    aircraft: "Pilatus PC-12",
    status: "On Time",
    gate: "B2",
    terminal: "Main Terminal",
    duration: "45 minutes",
    distance: "52 miles",
    departureAirport: {
      code: "BCT",
      name: "Boca Raton Airport",
      city: "Boca Raton",
      state: "Florida"
    },
    arrivalAirport: {
      code: "MIA",
      name: "Miami International Airport",
      city: "Miami",
      state: "Florida"
    },
    audioRecordings: [
      {
        id: 1,
        title: "Departure Clearance",
        description: "Initial clearance and taxi to runway",
        audioUrl: null,
        duration: "1:28",
        timestamp: "4:25 PM"
      },
      {
        id: 2,
        title: "Approach Communications",
        description: "Miami approach and landing clearance",
        audioUrl: null,
        duration: "2:15",
        timestamp: "5:10 PM"
      }
    ]
  },
  'flight-3': {
    route: "BCT to ATL",
    time: "5:15 PM",
    boardingTime: "4:45 PM",
    arrivalTime: "7:10 PM",
    airline: "Southern Airways",
    flightNumber: "SA789",
    aircraft: "Embraer Phenom 300",
    status: "On Time",
    gate: "C1",
    terminal: "Private Aviation Terminal",
    duration: "1 hour 55 minutes",
    distance: "581 miles",
    departureAirport: {
      code: "BCT",
      name: "Boca Raton Airport",
      city: "Boca Raton",
      state: "Florida"
    },
    arrivalAirport: {
      code: "ATL",
      name: "Hartsfield-Jackson Atlanta International Airport",
      city: "Atlanta",
      state: "Georgia"
    },
    audioRecordings: [
      {
        id: 1,
        title: "Ground Operations",
        description: "Ground control and pushback clearance",
        audioUrl: null,
        duration: "2:01",
        timestamp: "5:10 PM"
      },
      {
        id: 2,
        title: "Departure Control",
        description: "Initial climb and route clearance",
        audioUrl: null,
        duration: "1:52",
        timestamp: "5:20 PM"
      },
      {
        id: 3,
        title: "Atlanta Approach",
        description: "Descent and approach to ATL",
        audioUrl: null,
        duration: "4:20",
        timestamp: "7:05 PM"
      }
    ]
  },
  'flight-4': {
    route: "BCT to LGA",
    time: "6:45 PM",
    boardingTime: "6:15 PM",
    arrivalTime: "9:30 PM",
    airline: "East Coast Express",
    flightNumber: "ECE456",
    aircraft: "Bombardier Challenger 350",
    status: "Delayed (7:15 PM)",
    gate: "A5",
    terminal: "Private Aviation Terminal",
    duration: "2 hours 45 minutes",
    distance: "1,070 miles",
    departureAirport: {
      code: "BCT",
      name: "Boca Raton Airport",
      city: "Boca Raton",
      state: "Florida"
    },
    arrivalAirport: {
      code: "LGA",
      name: "LaGuardia Airport",
      city: "New York",
      state: "New York"
    },
    audioRecordings: [
      {
        id: 1,
        title: "Delay Notification",
        description: "Ground control regarding departure delay",
        audioUrl: null,
        duration: "0:45",
        timestamp: "6:50 PM"
      },
      {
        id: 2,
        title: "Revised Clearance",
        description: "Updated departure clearance",
        audioUrl: null,
        duration: "1:33",
        timestamp: "7:10 PM"
      }
    ]
  },
  'flight-5': {
    route: "MCO to BCT",
    time: "7:30 PM",
    boardingTime: "7:00 PM",
    arrivalTime: "8:20 PM",
    airline: "Florida Sky",
    flightNumber: "FS321",
    aircraft: "Beechcraft King Air 350",
    status: "On Time",
    gate: "D4",
    terminal: "Main Terminal",
    duration: "50 minutes",
    distance: "162 miles",
    departureAirport: {
      code: "MCO",
      name: "Orlando International Airport",
      city: "Orlando",
      state: "Florida"
    },
    arrivalAirport: {
      code: "BCT",
      name: "Boca Raton Airport",
      city: "Boca Raton",
      state: "Florida"
    },
    audioRecordings: [
      {
        id: 1,
        title: "Orlando Departure",
        description: "Clearance delivery and taxi instructions",
        audioUrl: null,
        duration: "1:20",
        timestamp: "7:25 PM"
      },
      {
        id: 2,
        title: "BCT Arrival",
        description: "Approach and landing at Boca Raton",
        audioUrl: null,
        duration: "2:05",
        timestamp: "8:15 PM"
      }
    ]
  }
};
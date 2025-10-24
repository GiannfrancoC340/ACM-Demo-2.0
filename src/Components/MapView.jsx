import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import { collection, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import './MapView.css'
import { Link } from 'react-router-dom'
import LiveAircraftLayer from './LiveAircraftLayer'
import SearchRadiusCircle from './SearchRadiusCircle'

// Fix for the default icon
let DefaultIcon = L.icon({
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

const redIcon = L.icon({
  iconUrl: redIconUrl,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Helper: Calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
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

// Helper: Get BCT-related flights
function getBCTFlights(aircraft) {
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

// Flight data (detailed flight information for modal - this will eventually come from Firebase too)
const flightData = {
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

// Flight Info Modal Component
function FlightInfoModal({ flightId, flights, onClose }) {
  // ===== ALL HOOKS MUST BE AT THE TOP - NO EARLY RETURNS BEFORE THIS SECTION =====
  
  // ALL useState declarations
  const [flightDetails, setFlightDetails] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedAudio, setSelectedAudio] = useState(0);
  
  // ALL useRef declarations
  const audioRef = useRef(null);

  // ALL useEffect declarations
  
  // 1. Load flight details from backend API or fallback data
  useEffect(() => {
    // Try to fetch from backend API first
    fetch(`http://localhost:3001/api/flight/${flightId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Backend API not available');
        }
        return res.json();
      })
      .then(data => {
        console.log('Loaded flight from backend API:', data);
        // Merge backend data with hardcoded flightData for complete info
        const hardcodedFlight = flightData[flightId];
        setFlightDetails({
          ...hardcodedFlight, // Use hardcoded data as base
          audioRecordings: data.audioRecordings || hardcodedFlight.audioRecordings // Override with backend audio if available
        });
      })
      .catch(err => {
        console.log('Backend API error, using hardcoded data:', err.message);
        // Fallback to hardcoded data
        const hardcodedFlight = flightData[flightId];
        if (hardcodedFlight) {
          console.log('Using hardcoded flight data for:', flightId);
          setFlightDetails(hardcodedFlight);
        } else {
          // Last resort: check Firebase
          const firebaseFlight = flights.find(f => f.flightId === flightId);
          if (firebaseFlight) {
            console.log('Using Firebase flight data for:', flightId);
            setFlightDetails(firebaseFlight);
          }
        }
      });
  }, [flightId, flights]);

  // 2. Handle play/pause logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.log('No audio ref');
      return;
    }
    
    // Get current audio URL safely
    const audioUrl = flightDetails?.audioRecordings?.[selectedAudio]?.audioUrl;
    console.log('Current audio URL:', audioUrl);
    console.log('Audio element src:', audio.src);
    console.log('Is playing:', isPlaying);
    
    if (!audioUrl) {
      console.log('No audio URL available');
      return;
    }

    if (isPlaying) {
      console.log('Attempting to play audio...');
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        console.error('Error details:', err.message);
        setIsPlaying(false);
      });
    } else {
      console.log('Pausing audio...');
      audio.pause();
    }
  }, [isPlaying, flightDetails, selectedAudio]);

  // 3. Set up audio event listeners whenever flightDetails or selectedAudio changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      console.log('Time update:', audio.currentTime);
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      console.log('Metadata loaded, duration:', audio.duration);
      setDuration(audio.duration);
    };
    const handleEnded = () => {
      console.log('Audio ended');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // If audio is already loaded, set duration immediately
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [flightDetails, selectedAudio]); // Re-attach listeners when audio source changes

  // 4. Reset audio when selection changes and load new source
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      
      // Get the new audio URL
      const newAudioUrl = flightDetails?.audioRecordings?.[selectedAudio]?.audioUrl;
      console.log('Loading new audio source:', newAudioUrl);
      
      if (newAudioUrl) {
        audio.src = newAudioUrl;
        audio.load(); // Force the browser to load the new source
        console.log('Audio loaded, src set to:', audio.src);
      }
    }
  }, [selectedAudio, flightDetails]);

  // ===== END OF HOOKS SECTION - NOW WE CAN DO CONDITIONAL LOGIC =====

  // Early return check - MUST be after all hooks
  if (!flightDetails) {
    return null;
  }

  // Safe to access flightDetails now
  const flight = flightDetails;
  const currentAudio = flight.audioRecordings?.[selectedAudio] || null;
  
  // Handler functions
  const togglePlayPause = () => {
    console.log('Toggle play/pause clicked');
    console.log('Current audio:', currentAudio);
    
    if (!currentAudio?.audioUrl) {
      console.log('No audio URL - showing alert');
      alert('Audio file not available yet. This is a placeholder for future audio recordings.');
      return;
    }
    
    console.log('Setting isPlaying to:', !isPlaying);
    setIsPlaying(!isPlaying);
  };

  const handleAudioSelect = (index) => {
    setSelectedAudio(index);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render
  return (
    <div className="flight-modal-overlay" onClick={onClose}>
      <div className="flight-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <div className="flight-info-container">
          <div className="flight-header">
            <h1>{flight.route}</h1>
            <div className="flight-time">{flight.time}</div>
            <div className="flight-status">Status: <span className={`status ${flight.status.includes('Delayed') ? 'delayed' : 'on-time'}`}>{flight.status}</span></div>
          </div>
          
          <div className="flight-details">
            <div className="flight-card">
              <h2>Flight Details</h2>
              <table className="details-table">
                <tbody>
                  <tr>
                    <td>Airline:</td>
                    <td>{flight.airline}</td>
                  </tr>
                  <tr>
                    <td>Flight Number:</td>
                    <td>{flight.flightNumber}</td>
                  </tr>
                  <tr>
                    <td>Aircraft:</td>
                    <td>{flight.aircraft}</td>
                  </tr>
                  <tr>
                    <td>Duration:</td>
                    <td>{flight.duration}</td>
                  </tr>
                  <tr>
                    <td>Distance:</td>
                    <td>{flight.distance}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flight-card">
              <h2>Departure</h2>
              <div className="airport-code">{flight.departureAirport.code}</div>
              <div className="airport-name">{flight.departureAirport.name}</div>
              <div className="airport-location">{flight.departureAirport.city}, {flight.departureAirport.state}</div>
              
              <div className="time-info">
                <div className="time-label">Boarding Time:</div>
                <div className="time-value">{flight.boardingTime}</div>
              </div>
              
              <div className="gate-info">
                <span>Terminal: {flight.terminal}</span>
                <span>Gate: {flight.gate}</span>
              </div>
            </div>
            
            <div className="flight-card">
              <h2>Arrival</h2>
              <div className="airport-code">{flight.arrivalAirport.code}</div>
              <div className="airport-name">{flight.arrivalAirport.name}</div>
              <div className="airport-location">{flight.arrivalAirport.city}, {flight.arrivalAirport.state}</div>
              
              <div className="time-info">
                <div className="time-label">Estimated Arrival:</div>
                <div className="time-value">{flight.arrivalTime}</div>
              </div>
            </div>
          </div>

          {/* Audio Communications Section */}
          <div className="flight-details">
            <div className="flight-card audio-section">
              <h2>Audio Communications</h2>
              <p className="audio-description">Listen to recorded air traffic control communications for this flight</p>
              
              <div className="audio-recordings-list">
                <h3>Available Recordings:</h3>
                {flight.audioRecordings && flight.audioRecordings.length > 0 ? (
                  flight.audioRecordings.map((recording, index) => (
                    <div 
                      key={recording.id} 
                      className={`audio-item ${selectedAudio === index ? 'active' : ''}`}
                      onClick={() => handleAudioSelect(index)}
                    >
                      <div className="audio-item-header">
                        <span className="audio-title">{recording.title}</span>
                        <span className="audio-duration">{recording.duration}</span>
                      </div>
                      <div className="audio-item-details">
                        <span className="audio-description-text">{recording.description}</span>
                        <span className="audio-timestamp">Recorded at {recording.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="audio-placeholder">No audio recordings available for this flight yet.</p>
                )}
              </div>

              {/* Audio Player */}
              {currentAudio && (
                <div className="audio-player">
                  <h3>Now Playing: {currentAudio.title}</h3>
                  
                  {/* Remove src from here - we'll set it dynamically in useEffect */}
                  <audio 
                    ref={audioRef}
                  />
                  
                  <div className="audio-controls">
                    <button 
                      className="play-pause-btn" 
                      onClick={togglePlayPause}
                      disabled={!currentAudio.audioUrl}
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                    
                    <div className="audio-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                        ></div>
                      </div>
                      <div className="time-display">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!currentAudio.audioUrl && (
                    <div className="audio-placeholder">
                      <p>Audio recording will be available here once uploaded</p>
                      <p>File format: MP3, WAV, or OGG</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MapView() {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredFlight, setHoveredFlight] = useState(null)
  const [showAllFlights, setShowAllFlights] = useState(false)
  const [selectedFlightId, setSelectedFlightId] = useState(null)
  const [showLiveAircraft, setShowLiveAircraft] = useState(true)
  const [showRadius, setShowRadius] = useState(true)
  const [searchRadius, setSearchRadius] = useState(50)
  const [demoMode, setDemoMode] = useState(false)
  const [liveAircraft, setLiveAircraft] = useState([]) // NEW: Store live aircraft data
  
  const bocaRatonAirport = {
    lat: 26.3785,
    lng: -80.1077,
    description: "Boca Raton Airport (BCT)",
  };

  const fallbackFlights = [
    { flightId: "flight-1", route: "RDU to BCT", time: "2:56 PM" },
    { flightId: "flight-2", route: "BCT to MIA", time: "4:30 PM" },
    { flightId: "flight-3", route: "BCT to ATL", time: "5:15 PM" },
    { flightId: "flight-4", route: "BCT to LGA", time: "6:45 PM" },
    { flightId: "flight-5", route: "MCO to BCT", time: "7:30 PM" }
  ];

  useEffect(() => {
    async function fetchFlights() {
      try {
        const flightsRef = collection(db, 'flights')
        const snapshot = await getDocs(flightsRef)
        const firebaseFlights = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        console.log("Fetched Firebase flights:", firebaseFlights)
        
        const validFlights = firebaseFlights.filter(flight => 
          flight.route && flight.time && flight.flightId
        )

        console.log("Valid flights with all data:", validFlights)
        
        if (validFlights.length > 0) {
          setFlights(validFlights)
        } else {
          console.log("No valid Firebase flights, using fallback")
          setFlights(fallbackFlights)
        }
        
      } catch (err) {
        console.error("Error fetching flights:", err)
        setFlights(fallbackFlights)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFlights()
  }, [])

  const handlePopupClose = () => {
    setShowAllFlights(false)
  }

  const handleFlightClick = (flightId) => {
    console.log("Clicked flight:", flightId)
    setSelectedFlightId(flightId)
  }

  const closeModal = () => {
    setSelectedFlightId(null)
  }

  const initialFlightsToShow = flights.slice(0, 2)
  
  if (loading) return <div>Loading map data...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="map-page">
      <Link 
        to="/audio" 
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '12px 24px',
          backgroundColor: '#e04141',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        🎧 Audio Recordings
      </Link>

      <Link 
        to="/settings" 
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '12px 24px',
          backgroundColor: '#4285f4',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        ⚙️ Settings
      </Link>

      <div style={{
        position: 'absolute',
        top: '80px',
        right: '20px',
        zIndex: 1000,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        minWidth: '250px'
      }}>
        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={() => setShowLiveAircraft(!showLiveAircraft)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: showLiveAircraft ? '#10b981' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ✈️ Live Aircraft: {showLiveAircraft ? 'ON' : 'OFF'}
          </button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '0.9rem',
            color: '#374151'
          }}>
            <input
              type="checkbox"
              checked={showRadius}
              onChange={(e) => setShowRadius(e.target.checked)}
            />
            Show search radius
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '0.9rem',
            color: '#374151',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
            />
            <span>
              🎬 Demo Mode 
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '4px' }}>
                (faster updates)
              </span>
            </span>
          </label>
          
          {demoMode && (
            <div style={{
              fontSize: '0.7rem',
              color: '#ef4444',
              marginTop: '4px',
              marginLeft: '24px'
            }}>
              ⚠️ Uses more API calls
            </div>
          )}
        </div>

        <div>
          <label style={{ 
            display: 'block',
            fontSize: '0.9rem',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Search Radius: <strong>{searchRadius} km</strong>
          </label>
          <input
            type="range"
            min="10"
            max="150"
            step="10"
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#9ca3af',
            marginTop: '4px'
          }}>
            <span>10 km</span>
            <span>150 km</span>
          </div>
        </div>
      </div>

      <MapContainer 
        center={[bocaRatonAirport.lat, bocaRatonAirport.lng]} 
        zoom={13} 
        className="map-container"
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker 
          position={[bocaRatonAirport.lat, bocaRatonAirport.lng]} 
          icon={redIcon}
        >
          <Popup onClose={handlePopupClose}>
            <div className="airport-popup">
              <h3>{bocaRatonAirport.description}</h3>
              <p>A public-use airport serving South Florida</p>
              
              {/* NEW: Show live flight count */}
              {liveAircraft.length > 0 ? (
                <>
                  <p style={{ fontWeight: 'bold', color: '#10b981', marginTop: '10px' }}>
                    🔴 LIVE: {getBCTFlights(liveAircraft).total} aircraft nearby
                  </p>
                  
                  {/* Departing Flights */}
                  <div style={{ marginTop: '15px' }}>
                    <h4 style={{ color: '#2563eb', margin: '0 0 10px 0' }}>
                      🛫 Departing ({getBCTFlights(liveAircraft).departing.length})
                    </h4>
                    {getBCTFlights(liveAircraft).departing.length > 0 ? (
                      <ul className="flights-list">
                        {getBCTFlights(liveAircraft).departing.map((plane) => (
                          <li key={plane.icao24}>
                            <div className="flight-item">
                              <span className="flight-icon">🛫</span>
                              <div>
                                <span className="flight-route">{plane.callsign}</span>
                                <span style={{ fontSize: '0.85rem', color: '#666', display: 'block' }}>
                                  Alt: {Math.round(plane.altitude * 3.28084)} ft | 
                                  ↗ {Math.round(plane.vertical_rate * 196.85)} ft/min
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: '#666' }}>No departures detected</p>
                    )}
                  </div>
                  
                  {/* Arriving Flights */}
                  <div style={{ marginTop: '15px' }}>
                    <h4 style={{ color: '#10b981', margin: '0 0 10px 0' }}>
                      🛬 Arriving ({getBCTFlights(liveAircraft).arriving.length})
                    </h4>
                    {getBCTFlights(liveAircraft).arriving.length > 0 ? (
                      <ul className="flights-list">
                        {getBCTFlights(liveAircraft).arriving.map((plane) => (
                          <li key={plane.icao24}>
                            <div className="flight-item">
                              <span className="flight-icon">🛬</span>
                              <div>
                                <span className="flight-route">{plane.callsign}</span>
                                <span style={{ fontSize: '0.85rem', color: '#666', display: 'block' }}>
                                  Alt: {Math.round(plane.altitude * 3.28084)} ft | 
                                  ↘ {Math.abs(Math.round(plane.vertical_rate * 196.85))} ft/min
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: '#666' }}>No arrivals detected</p>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ fontWeight: 'bold', marginTop: '10px' }}>
                  Enable Live Aircraft to see BCT traffic
                </p>
              )}
              
              {/* Keep your hardcoded flights as backup/historical data */}
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #ddd' }}>
                <h4>📅 Today's Scheduled Flights ({flights.length})</h4>
                <ul className="flights-list">
                  {(showAllFlights ? flights : initialFlightsToShow).map((flight) => (
                    <li key={flight.flightId}>
                      <div 
                        className={`flight-link ${hoveredFlight === flight.flightId ? 'hover' : ''}`}
                        onClick={() => handleFlightClick(flight.flightId)}
                        onMouseEnter={() => setHoveredFlight(flight.flightId)}
                        onMouseLeave={() => setHoveredFlight(null)}
                      >
                        <div className="flight-item">
                          <span className="flight-icon">✈️</span>
                          <div>
                            <span className="flight-route">{flight.route}</span> - {flight.time}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {!showAllFlights && flights.length > initialFlightsToShow.length && (
                  <button 
                    className="see-more-button" 
                    onClick={() => setShowAllFlights(true)}
                  >
                    See All Flights ({flights.length})
                  </button>
                )}
                
                {showAllFlights && (
                  <button 
                    className="see-less-button" 
                    onClick={() => setShowAllFlights(false)}
                  >
                    Show Less
                  </button>
                )}
              </div>
              
              <div className="coordinates-info">
                Coordinates: {bocaRatonAirport.lat.toFixed(4)}, {bocaRatonAirport.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        <SearchRadiusCircle 
          radiusKm={searchRadius}
          visible={showRadius}
        />

        <LiveAircraftLayer 
          enabled={showLiveAircraft}
          radiusKm={searchRadius}
          refreshInterval={demoMode ? 20000 : 90000}
          onAircraftUpdate={setLiveAircraft}
        />
      </MapContainer>

      {selectedFlightId && (
        <FlightInfoModal 
          flightId={selectedFlightId}
          flights={flights}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
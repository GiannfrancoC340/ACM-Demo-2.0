import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import './MapView.css'

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

// Flight data (moved from FlightInfo.jsx)
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
        audioUrl: null,
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
function FlightInfoModal({ flightId, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedAudio, setSelectedAudio] = useState(0);
  const audioRef = useRef(null);
  
  const flight = flightData[flightId];
  
  if (!flight) return null;
  
  const currentAudio = flight.audioRecordings[selectedAudio];
  
  const togglePlayPause = () => {
    if (!currentAudio.audioUrl) {
      alert('Audio file not available yet. This is a placeholder for future audio recordings.');
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioSelect = (index) => {
    setSelectedAudio(index);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
                {flight.audioRecordings.map((recording, index) => (
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
                ))}
              </div>

              {/* Audio Player */}
              <div className="audio-player">
                <h3>Now Playing: {currentAudio.title}</h3>
                
                <audio 
                  ref={audioRef} 
                  src={currentAudio.audioUrl} 
                  style={{ display: 'none' }}
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
                      <span>{currentAudio.duration}</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MapView() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredFlight, setHoveredFlight] = useState(null)
  const [showAllFlights, setShowAllFlights] = useState(false)
  const [selectedFlightId, setSelectedFlightId] = useState(null) // New state for modal
  
  const bocaRatonAirport = {
    lat: 26.3785,
    lng: -80.1077,
    description: "Boca Raton Airport (BCT)",
    flightCount: 5,
    flights: [
      { id: "flight-1", route: "RDU to BCT", time: "2:56 PM" },
      { id: "flight-2", route: "BCT to MIA", time: "4:30 PM" },
      { id: "flight-3", route: "BCT to ATL", time: "5:15 PM" },
      { id: "flight-4", route: "BCT to LGA", time: "6:45 PM" },
      { id: "flight-5", route: "MCO to BCT", time: "7:30 PM" }
    ]
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase.from('locations').select('*')
        if (error) {
          console.error("Error fetching locations:", error)
          setError(`Error: ${error.message}`)
        } else {
          console.log("Fetched locations:", data)
          setLocations(data || [])
        }
      } catch (err) {
        console.error("Exception:", err)
        setError(`Exception: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePopupClose = () => {
    setShowAllFlights(false)
  }

  const handleFlightClick = (flightId) => {
    setSelectedFlightId(flightId)
  }

  const closeModal = () => {
    setSelectedFlightId(null)
  }

  const initialFlightsToShow = bocaRatonAirport.flights.slice(0, 2)
  
  if (loading) return <div>Loading map data...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="map-page">
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
              <p style={{ fontWeight: 'bold' }}>Number of flights leaving BCT: {bocaRatonAirport.flightCount}</p>
              
              <div style={{ marginTop: '10px' }}>
                <h4>Today's Flights:</h4>
                <ul className="flights-list">
                  {(showAllFlights ? bocaRatonAirport.flights : initialFlightsToShow).map((flight) => (
                    <li key={flight.id}>
                      <div 
                        className={`flight-link ${hoveredFlight === flight.id ? 'hover' : ''}`}
                        onClick={() => handleFlightClick(flight.id)}
                        onMouseEnter={() => setHoveredFlight(flight.id)}
                        onMouseLeave={() => setHoveredFlight(null)}
                      >
                        <div className="flight-item">
                          <span className="flight-icon">✈️</span>
                          <div>
                            <span className="flight-route">{flight.route}</span> - {flight.time}
                            <span className="flight-info-hint">
                              {hoveredFlight === flight.id ? '→ View flight details' : 'Click for details'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="coordinates-info">
                Coordinates: {bocaRatonAirport.lat.toFixed(4)}, {bocaRatonAirport.lng.toFixed(4)}
              </div>
              
              {!showAllFlights && bocaRatonAirport.flights.length > initialFlightsToShow.length && (
                <button 
                  className="see-more-button" 
                  onClick={() => setShowAllFlights(true)}
                >
                  See All Flights ({bocaRatonAirport.flights.length})
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
          </Popup>
        </Marker>
        
        {locations && locations.length > 0 && locations.map(loc => (
          <Marker 
            key={loc.id} 
            position={[loc.lat, loc.lng]} 
            icon={redIcon}
          >
            <Popup>{loc.description}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Flight Info Modal */}
      {selectedFlightId && (
        <FlightInfoModal 
          flightId={selectedFlightId} 
          onClose={closeModal}
        />
      )}
    </div>
  )
}
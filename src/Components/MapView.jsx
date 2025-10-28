// MapView.jsx - Main map component (refactored)

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './MapView.css';
import { Link } from 'react-router-dom';
import LiveAircraftLayer from './LiveAircraftLayer';
import SearchRadiusCircle from './SearchRadiusCircle';
import FlightInfoModal from './FlightInfoModal';
import { redIcon, getBCTFlights } from './maphelpers';

export default function MapView() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [showAllFlights, setShowAllFlights] = useState(false);
  const [hoveredFlight, setHoveredFlight] = useState(null);
  const [showLiveAircraft, setShowLiveAircraft] = useState(true);
  const [liveAircraft, setLiveAircraft] = useState([]);
  const [showRadius, setShowRadius] = useState(true);
  const [searchRadius, setSearchRadius] = useState(50);
  const [demoMode, setDemoMode] = useState(false);
  const popupRef = useRef(null);
  
  const initialFlightsToShow = flights.slice(0, 3);

  const bocaRatonAirport = {
    lat: 26.3785,
    lng: -80.1077,
    description: "Boca Raton Airport (BCT)"
  };

  // Fetch flights from Firebase
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const flightsCollection = collection(db, 'flights');
        const flightsSnapshot = await getDocs(flightsCollection);
        const flightsList = flightsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFlights(flightsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching flights:", error);
        setLoading(false);
      }
    };

    fetchFlights();

    // Optional: Real-time listener
    const unsubscribe = onSnapshot(collection(db, 'flights'), (snapshot) => {
      const flightsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFlights(flightsList);
    });

    return () => unsubscribe();
  }, []);

  const handleFlightClick = (flightId) => {
    setSelectedFlightId(flightId);
  };

  const closeModal = () => {
    setSelectedFlightId(null);
  };

  const handlePopupClose = () => {
    setShowAllFlights(false);
  };

  if (loading) {
    return (
      <div className="map-loading">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="map-page">
      {/* Audio Recordings Button - Top Right */}
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

      {/* Settings Button - Bottom Left */}
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

      {/* Live Aircraft Controls - Top Right Below Audio */}
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
              
              {/* Show live flight count */}
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
                            <div 
                              className={`flight-link ${hoveredFlight === `live-${plane.icao24}` ? 'hover' : ''}`}
                              onClick={() => handleFlightClick(`live-${plane.icao24}`)}
                              onMouseEnter={() => setHoveredFlight(`live-${plane.icao24}`)}
                              onMouseLeave={() => setHoveredFlight(null)}
                            >
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
                            <div 
                              className={`flight-link ${hoveredFlight === `live-${plane.icao24}` ? 'hover' : ''}`}
                              onClick={() => handleFlightClick(`live-${plane.icao24}`)}
                              onMouseEnter={() => setHoveredFlight(`live-${plane.icao24}`)}
                              onMouseLeave={() => setHoveredFlight(null)}
                            >
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
              
              {/* Keep hardcoded flights as backup/historical data */}
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
          liveAircraft={liveAircraft}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
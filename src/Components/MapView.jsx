// MapView.jsx - Main map component (refactored)

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './MapView.css';
import LiveAircraftLayer from './LiveAircraftLayer';
import SearchRadiusCircle from './SearchRadiusCircle';
import FlightInfoModal from './FlightInfoModal';
import { redIcon, getBCTFlights } from './maphelpers';
import { getAPICallCount } from '../services/aviationStackService';
import MapNavbar from './MapNavbar';

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
  const [positionDelay, setPositionDelay] = useState(3); // NEW: Default 3 minutes
  const popupRef = useRef(null);
  const [apiCallCount, setApiCallCount] = useState(0);
  
  // NEW: Log delay changes
  useEffect(() => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`⚙️ POSITION DELAY CHANGED: ${positionDelay} minutes`);
    console.log(`🎚️ Mode: ${positionDelay === 0 ? 'REAL-TIME (🔴 LIVE)' : `DELAYED (🕐 ${positionDelay} min ago)`}`);
    console.log(`⏰ Current time: ${new Date().toLocaleTimeString()}`);
    if (positionDelay > 0) {
      const targetTime = new Date(Date.now() - (positionDelay * 60 * 1000));
      console.log(`📍 Showing positions from: ${targetTime.toLocaleTimeString()}`);
    }
    console.log(`${'='.repeat(60)}\n`);
  }, [positionDelay]);
  
  const initialFlightsToShow = flights.slice(0, 3);

  const miamiAirport = {
    lat: 25.7959,
    lng: -80.2870,
    description: "Miami International Airport (MIA)"
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

  // Add this useEffect to update the counter display
  useEffect(() => {
    const interval = setInterval(() => {
      setApiCallCount(getAPICallCount());
    }, 1000);
    return () => clearInterval(interval);
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
    <div className="map-page" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Navbar - Full Width */}
      <MapNavbar
        showLiveAircraft={showLiveAircraft}
        setShowLiveAircraft={setShowLiveAircraft}
        showRadius={showRadius}
        setShowRadius={setShowRadius}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
        apiCallCount={apiCallCount}
        positionDelay={positionDelay}
        setPositionDelay={setPositionDelay}
      />

      {/* NEW: Delay Status Indicator */}
      {showLiveAircraft && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 999,
          width: '100%',
          padding: '10px 30px',
          backgroundColor: positionDelay > 0 ? '#fff3cd' : '#d1fae5',
          borderBottom: `2px solid ${positionDelay > 0 ? '#f59e0b' : '#10b981'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '0.95rem',
          fontWeight: '600',
          color: positionDelay > 0 ? '#78350f' : '#065f46'
        }}>
          {positionDelay === 0 ? (
            <>
              <span style={{ fontSize: '1.2rem' }}>🔴</span>
              <span>LIVE - Showing real-time aircraft positions</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '1.2rem' }}>🕐</span>
              <span>
                DELAYED - Showing positions from {positionDelay} minute{positionDelay !== 1 ? 's' : ''} ago
              </span>
              <span style={{ 
                fontSize: '0.85rem', 
                padding: '4px 8px', 
                backgroundColor: 'rgba(0,0,0,0.1)', 
                borderRadius: '4px',
                marginLeft: '10px'
              }}>
                Audio transcription sync mode
              </span>
            </>
          )}
        </div>
      )}

      {/* Map Container - Takes remaining space */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        width: '100%',
        overflow: 'hidden'
      }}>

      {/* The Map */}
      <MapContainer 
        center={[miamiAirport.lat, miamiAirport.lng]} 
        zoom={13} 
        className="map-container"
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker 
          position={[miamiAirport.lat, miamiAirport.lng]} 
          icon={redIcon}
        >
          <Popup onClose={handlePopupClose}>
            <div className="airport-popup">
              <h3>{miamiAirport.description}</h3>
              <p>Major international hub serving South Florida</p>
              
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
                Coordinates: {miamiAirport.lat.toFixed(4)}, {miamiAirport.lng.toFixed(4)}
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
          positionDelay={positionDelay}
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
    </div>
  );
}
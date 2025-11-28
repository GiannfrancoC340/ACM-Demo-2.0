// MapView.jsx - Main map component (refactored)

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './MapView.css';
import LiveAircraftLayer from './LiveAircraftLayer';
import SearchRadiusCircle from './SearchRadiusCircle';
import FlightInfoModal from './FlightInfoModal';
import { redIcon, getBCTFlights, flightData } from './maphelpers';
import { getAPICallCount } from '../services/aviationStackService';
import MapNavbar from './MapNavbar';

export default function MapView() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [showAllFlights, setShowAllFlights] = useState(false);
  const [showAllSampleFlights, setShowAllSampleFlights] = useState(false);
  const [hoveredFlight, setHoveredFlight] = useState(null);
  const [showLiveAircraft, setShowLiveAircraft] = useState(true);
  const [liveAircraft, setLiveAircraft] = useState([]);
  const [showRadius, setShowRadius] = useState(true);
  const [searchRadius, setSearchRadius] = useState(50);
  const [positionDelay, setPositionDelay] = useState(3);
  const [showTrails, setShowTrails] = useState(true);
  const popupRef = useRef(null);
  const [apiCallCount, setApiCallCount] = useState(0);
  
  // Load settings from localStorage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : { refreshInterval: 30, trailLength: 50 };
  });
  
  // Load position delay and other settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);  // Update settings state
        if (parsed.positionDelay !== undefined) {
          setPositionDelay(parsed.positionDelay);
          console.log('📥 Loaded position delay from settings:', parsed.positionDelay);
        }
        if (parsed.showTrails !== undefined) {  // ✅ ADD THIS
          setShowTrails(parsed.showTrails);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);
  
  // Log delay changes
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

  const bocaRatonAirport = {
    lat: 26.3785,
    lng: -80.1077,
    description: "Boca Raton Airport (BCT)"
  };

  // Helper: Get today's date in YYYY-MM-DD format (LOCAL timezone)
  function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // NEW: Fetch ONLY today's flights from Firebase
  useEffect(() => {
    const fetchTodaysFlights = async () => {
      try {
        const today = getTodayDate();
        console.log('📅 Fetching flights for today:', today);
        
        const flightsCollection = collection(db, 'flights');
        const flightsSnapshot = await getDocs(flightsCollection);
        
        // Filter client-side for today's flights
        const allFlights = flightsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const todaysFlights = allFlights.filter(flight => 
          flight.flightId && flight.flightId.includes(today)
        );
        
        console.log(`✅ Found ${todaysFlights.length} flights for today (out of ${allFlights.length} total)`);
        setFlights(todaysFlights);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching today's flights:", error);
        setLoading(false);
      }
    };

    fetchTodaysFlights();

    // Real-time listener for TODAY's flights only
    const unsubscribe = onSnapshot(collection(db, 'flights'), (snapshot) => {
      const today = getTodayDate();
      const flightsList = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(flight => flight.flightId && flight.flightId.includes(today));
      
      console.log(`🔄 Real-time update: ${flightsList.length} flights for today`);
      setFlights(flightsList);
    });

    return () => unsubscribe();
  }, []);

  // Update API counter display
  useEffect(() => {
    const interval = setInterval(() => {
      setApiCallCount(getAPICallCount());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get tile layer configuration based on map style setting
  const getTileLayerConfig = () => {
    const mapStyle = settings.mapStyle || 'standard';
    
    const configs = {
      standard: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
      satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
      },
      dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      },
      terrain: {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
      }
    };
    
    return configs[mapStyle] || configs.standard;
  };

  const handleFlightClick = (flightId) => {
    setSelectedFlightId(flightId);
  };

  const closeModal = () => {
    setSelectedFlightId(null);
  };

  const handlePopupClose = () => {
    setShowAllFlights(false);
    setShowAllSampleFlights(false);
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
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
        apiCallCount={apiCallCount}
        positionDelay={positionDelay}
        setPositionDelay={setPositionDelay}
      />

      {/* Map Container - Takes remaining space */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        width: '100%',
        overflow: 'hidden'
      }}>

      {/* The Map */}
      <MapContainer 
        center={[bocaRatonAirport.lat, bocaRatonAirport.lng]} 
        zoom={13} 
        className="map-container"
      >
        <TileLayer 
          url={getTileLayerConfig().url}
          attribution={getTileLayerConfig().attribution}
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
              
              {/* FIXED: Only show clicked flights for TODAY */}
              {flights.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #ddd' }}>
                  <h4>📅 Today's Clicked Flights ({flights.length})</h4>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                    Flights you've clicked on today
                  </p>
                  <ul className="flights-list">
                    {(showAllFlights ? flights : initialFlightsToShow).map((flight) => (
                      <li key={flight.flightId || flight.id}>
                        <div 
                          className={`flight-link ${hoveredFlight === (flight.flightId || flight.id) ? 'hover' : ''}`}
                          onClick={() => handleFlightClick(flight.flightId || flight.id)}
                          onMouseEnter={() => setHoveredFlight(flight.flightId || flight.id)}
                          onMouseLeave={() => setHoveredFlight(null)}
                        >
                          <div className="flight-item">
                            <span className="flight-icon">✈️</span>
                            <div>
                              <span className="flight-route">{flight.route}</span> - {flight.time}
                              {flight.clickCount > 1 && (
                                <span style={{ 
                                  marginLeft: '8px', 
                                  fontSize: '0.75rem', 
                                  backgroundColor: '#e0e0e0', 
                                  padding: '2px 6px', 
                                  borderRadius: '10px' 
                                }}>
                                  {flight.clickCount}x
                                </span>
                              )}
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
              )}

              {/* Hardcoded Scheduled Flights */}
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #ddd' }}>
                <h4>🧪 Sample Flights (Demo)</h4>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                  Pre-configured flights with audio recordings
                </p>
                <ul className="flights-list">
                  {Object.entries(flightData)
                    .slice(0, showAllSampleFlights ? undefined : 2)
                    .map(([flightId, flight]) => (
                    <li key={flightId}>
                      <div 
                        className={`flight-link ${hoveredFlight === flightId ? 'hover' : ''}`}
                        onClick={() => handleFlightClick(flightId)}
                        onMouseEnter={() => setHoveredFlight(flightId)}
                        onMouseLeave={() => setHoveredFlight(null)}
                      >
                        <div className="flight-item">
                          <span className="flight-icon">✈️</span>
                          <div>
                            <span className="flight-route">{flight.route}</span> - {flight.time}
                            {flight.audioRecordings && flight.audioRecordings.length > 0 && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '0.75rem', 
                                backgroundColor: '#10b981', 
                                color: 'white',
                                padding: '2px 6px', 
                                borderRadius: '10px' 
                              }}>
                                🎧 {flight.audioRecordings.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {!showAllSampleFlights && Object.keys(flightData).length > 2 && (
                  <button 
                    className="see-more-button" 
                    onClick={() => setShowAllSampleFlights(true)}
                  >
                    See All Sample Flights ({Object.keys(flightData).length})
                  </button>
                )}
                
                {showAllSampleFlights && (
                  <button 
                    className="see-less-button" 
                    onClick={() => setShowAllSampleFlights(false)}
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
          refreshInterval={settings.refreshInterval * 1000}
          onAircraftUpdate={setLiveAircraft}
          positionDelay={positionDelay}
          showTrails={showTrails}
          trailLength={settings.trailLength || 50}
          iconSize={settings.iconSize}
          trailStyle={settings.trailStyle}
          trailColor={settings.trailColor}
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
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
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

// Set the default icon for all markers
L.Marker.prototype.options.icon = DefaultIcon;

// Create a custom red icon using the base64 approach
const redIconUrl = "data:image/svg+xml;base64," + btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
  <path fill="#e04141" stroke="#ffffff" stroke-width="1" d="M12.5,1C5.6,1,0,6.6,0,13.5c0,4.6,2.4,8.7,6,11c0,0,0.1,0.1,0.1,0.1l5.6,16.1c0.2,0.5,0.8,0.8,1.4,0.5c0.2-0.1,0.4-0.2,0.5-0.5L19.2,24c0,0,0.1-0.1,0.1-0.1c3.6-2.3,6-6.4,6-11C25.3,6.6,19.4,1,12.5,1z M12.5,18c-2.5,0-4.5-2-4.5-4.5s2-4.5,4.5-4.5s4.5,2,4.5,4.5S15,18,12.5,18z"/>
</svg>
`);

// Create a usable Leaflet icon from the base64 SVG
const redIcon = L.icon({
  iconUrl: redIconUrl,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

export default function MapView() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredFlight, setHoveredFlight] = useState(null)
  const [showAllFlights, setShowAllFlights] = useState(false)
  
  // Boca Raton Airport coordinates and flight data
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

  // Reset the expanded view when popup is closed
  const handlePopupClose = () => {
    setShowAllFlights(false)
  }

  // Display only the initial flights (limited to 2)
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
        
        {/* Boca Raton Airport marker with clickable flight information */}
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
                  {/* Show all flights if expanded, otherwise just the initial ones */}
                  {(showAllFlights ? bocaRatonAirport.flights : initialFlightsToShow).map((flight) => (
                    <li key={flight.id}>
                      <Link 
                        to={`/flights/${flight.id}`} 
                        className={`flight-link ${hoveredFlight === flight.id ? 'hover' : ''}`}
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
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="coordinates-info">
                Coordinates: {bocaRatonAirport.lat.toFixed(4)}, {bocaRatonAirport.lng.toFixed(4)}
              </div>
              
              {/* Only show the "See More" button if not already showing all flights and there are more flights to show */}
              {!showAllFlights && bocaRatonAirport.flights.length > initialFlightsToShow.length && (
                <button 
                  className="see-more-button" 
                  onClick={() => setShowAllFlights(true)}
                >
                  See All Flights ({bocaRatonAirport.flights.length})
                </button>
              )}
              
              {/* Show "Show Less" button when expanded */}
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
        
        {/* Map your actual location data */}
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
    </div>
  )
}
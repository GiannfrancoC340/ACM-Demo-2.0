// src/components/LiveAircraftLayer.jsx
import { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  fetchLiveAircraft, 
  formatAltitude, 
  formatSpeed,
  calculateDistance 
} from '../services/openSkyService';

// Helper function to convert heading to cardinal direction
function getCardinalDirection(heading) {
  if (!heading && heading !== 0) return '';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((heading % 360) / 45)) % 8;
  return directions[index];
}

// Create airplane icon that rotates based on heading
function createAirplaneIcon(heading) {
  const rotation = heading || 0;
  
  return L.divIcon({
    html: `
      <div style="
        font-size: 24px;
        transform: rotate(${rotation}deg);
        transform-origin: center;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        ✈️
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
    className: 'aircraft-icon'
  });
}

export default function LiveAircraftLayer({ enabled = true, refreshInterval = 30000, radiusKm = 50 }) {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;

    const updateAircraft = async () => {
      setLoading(true);
      try {
        const data = await fetchLiveAircraft(radiusKm); // Pass radius parameter
        setAircraft(data.aircraft);
        setLastUpdate(new Date(data.timestamp * 1000));
        console.log(`Loaded ${data.aircraft.length} live aircraft within ${radiusKm}km`);
      } catch (error) {
        console.error('Failed to update aircraft:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    updateAircraft();

    // Set up periodic refresh
    const interval = setInterval(updateAircraft, refreshInterval);

    return () => clearInterval(interval);
  }, [enabled, refreshInterval, radiusKm]); // Add radiusKm to dependencies

  if (!enabled) return null;

  return (
    <>
      {aircraft.map(plane => (
        <Marker
          key={plane.icao24}
          position={[plane.latitude, plane.longitude]}
          icon={createAirplaneIcon(plane.heading)}
        >
          <Popup>
            <div style={{ 
              minWidth: '280px', 
              fontFamily: 'Arial, sans-serif',
              padding: '5px'
            }}>
              {/* Header Section */}
              <div style={{
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                margin: '-15px -20px 15px -20px',
                padding: '15px 20px',
                borderRadius: '8px 8px 0 0',
                color: 'white'
              }}>
                <div style={{ 
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✈️ {plane.callsign}
                </div>
                <div style={{ 
                  fontSize: '0.85rem',
                  opacity: 0.9
                }}>
                  {plane.origin_country}
                </div>
              </div>
              
              {/* Flight Information Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px'
              }}>
                {/* Altitude */}
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '6px',
                  borderLeft: '3px solid #2563eb'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#64748b',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    Altitude
                  </div>
                  <div style={{ 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#1e293b'
                  }}>
                    {formatAltitude(plane.altitude)}
                  </div>
                </div>

                {/* Speed */}
                <div style={{
                  padding: '10px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '6px',
                  borderLeft: '3px solid #f59e0b'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#78350f',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    Speed
                  </div>
                  <div style={{ 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#1e293b'
                  }}>
                    {formatSpeed(plane.velocity)}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>ICAO24:</span>
                  <span style={{ fontFamily: 'monospace', color: '#1e293b' }}>{plane.icao24.toUpperCase()}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Heading:</span>
                  <span style={{ color: '#1e293b' }}>
                    {plane.heading?.toFixed(0)}° 
                    <span style={{ fontSize: '0.9rem', marginLeft: '4px' }}>
                      {getCardinalDirection(plane.heading)}
                    </span>
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Distance from BCT:</span>
                  <span style={{ color: '#1e293b', fontWeight: 'bold' }}>
                    {calculateDistance(plane.latitude, plane.longitude)} km
                  </span>
                </div>

                {/* Vertical Rate */}
                {plane.vertical_rate && Math.abs(plane.vertical_rate) > 0.1 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Vertical Rate:</span>
                    <span style={{ 
                      color: plane.vertical_rate > 0 ? '#10b981' : '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      {plane.vertical_rate > 0 ? '↗' : '↘'} 
                      {Math.abs(plane.vertical_rate * 196.85).toFixed(0)} ft/min
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ 
                marginTop: '12px', 
                padding: '10px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.75rem',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                📡 Live data from OpenSky Network
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Status indicator in corner */}
      {lastUpdate && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '10px',
          zIndex: 1000,
          background: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%',
              backgroundColor: loading ? '#fbbf24' : '#10b981',
              animation: loading ? 'pulse 1.5s infinite' : 'none'
            }}></div>
            <span>
              {aircraft.length} live aircraft
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      )}
    </>
  );
}
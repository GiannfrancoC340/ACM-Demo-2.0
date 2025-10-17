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

// Create airplane icon that rotates based on heading
function createAirplaneIcon(heading) {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <g transform="rotate(${heading || 0}, 16, 16)">
        <path fill="#2563eb" stroke="#ffffff" stroke-width="1.5" 
          d="M16,2 L18,14 L28,16 L18,18 L16,30 L14,18 L4,16 L14,14 Z"/>
        <circle cx="16" cy="16" r="2" fill="#ffffff"/>
      </g>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    className: 'aircraft-icon'
  });
}

export default function LiveAircraftLayer({ enabled = true, refreshInterval = 30000 }) {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;

    const updateAircraft = async () => {
      setLoading(true);
      try {
        const data = await fetchLiveAircraft();
        setAircraft(data.aircraft);
        setLastUpdate(new Date(data.timestamp * 1000));
        console.log(`Loaded ${data.aircraft.length} live aircraft`);
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
  }, [enabled, refreshInterval]);

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
            <div style={{ minWidth: '250px', fontFamily: 'Arial, sans-serif' }}>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: '#2563eb',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '5px'
              }}>
                ✈️ {plane.callsign}
              </h3>
              
              <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '4px 8px 4px 0' }}>ICAO24:</td>
                    <td style={{ padding: '4px 0' }}>{plane.icao24}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '4px 8px 4px 0' }}>Country:</td>
                    <td style={{ padding: '4px 0' }}>{plane.origin_country}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '4px 8px 4px 0' }}>Altitude:</td>
                    <td style={{ padding: '4px 0' }}>{formatAltitude(plane.altitude)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '4px 8px 4px 0' }}>Speed:</td>
                    <td style={{ padding: '4px 0' }}>{formatSpeed(plane.velocity)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '4px 8px 4px 0' }}>Heading:</td>
                    <td style={{ padding: '4px 0' }}>{plane.heading?.toFixed(0)}°</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '4px 8px 4px 0' }}>Distance from BCT:</td>
                    <td style={{ padding: '4px 0' }}>
                      {calculateDistance(plane.latitude, plane.longitude)} km
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div style={{ 
                marginTop: '10px', 
                padding: '8px',
                backgroundColor: '#f0f4ff',
                borderRadius: '4px',
                fontSize: '0.85rem',
                color: '#666'
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
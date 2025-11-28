// src/components/LiveAircraftLayer.jsx
import { useEffect, useState, Fragment } from 'react';
import { Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  fetchLiveAircraft, 
  formatAltitude, 
  formatSpeed,
  calculateDistance 
} from '../services/openSkyService';
import { logFlightDetections } from '../services/flightLogger';

// Helper function to convert heading to cardinal direction
function getCardinalDirection(heading) {
  if (!heading && heading !== 0) return '';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((heading % 360) / 45)) % 8;
  return directions[index];
}

// Create airplane icon that rotates based on heading
function createAirplaneIcon(heading) {
  const rotation = (heading -45) || 0;
  
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

export default function LiveAircraftLayer({ 
  enabled = true, 
  refreshInterval = 30000, 
  radiusKm = 50, 
  onAircraftUpdate = null,
  positionDelay = 0, // NEW: delay in minutes (0 = real-time)
  showTrails = true,
  trailLength = 50  // NEW: number of trail points to keep
}) {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [flightTrails, setFlightTrails] = useState({}); // Store flight trails
  const [positionBuffer, setPositionBuffer] = useState({}); // NEW: Store historical positions
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;

    const updateAircraft = async () => {
      setLoading(true);
      try {
        const data = await fetchLiveAircraft(radiusKm);
        const currentTime = Date.now();
        
        // NEW: Store positions in buffer with timestamps
        setPositionBuffer(prevBuffer => {
          const newBuffer = { ...prevBuffer };
          
          let newAircraftCount = 0;
          let totalCleaned = 0;
          
          data.aircraft.forEach(plane => {
            if (!newBuffer[plane.icao24]) {
              newBuffer[plane.icao24] = [];
              newAircraftCount++;
            }
            
            // Add current position with timestamp
            newBuffer[plane.icao24].push({
              ...plane,
              timestamp: currentTime
            });
            
            // Keep 15 minutes of history (900 seconds)
            const cutoffTime = currentTime - (15 * 60 * 1000);
            const beforeCleanup = newBuffer[plane.icao24].length;
            newBuffer[plane.icao24] = newBuffer[plane.icao24].filter(
              pos => pos.timestamp > cutoffTime
            );
            const afterCleanup = newBuffer[plane.icao24].length;
            totalCleaned += (beforeCleanup - afterCleanup);
          });
          
          // Clean up old aircraft not seen in 10 minutes
          const currentIcao24s = new Set(data.aircraft.map(a => a.icao24));
          const removedAircraft = [];
          Object.keys(newBuffer).forEach(icao24 => {
            if (!currentIcao24s.has(icao24)) {
              const lastSeen = newBuffer[icao24][newBuffer[icao24].length - 1]?.timestamp;
              if (currentTime - lastSeen > 10 * 60 * 1000) {
                removedAircraft.push(icao24);
                delete newBuffer[icao24];
              }
            }
          });
          
          // Summary log
          const totalPositions = Object.values(newBuffer).reduce((sum, positions) => sum + positions.length, 0);
          console.log(`📥 Buffer update: ${data.aircraft.length} aircraft stored | ${newAircraftCount} new | ${totalCleaned} cleaned | ${removedAircraft.length} removed`);
          console.log(`💾 Buffer status: ${Object.keys(newBuffer).length} aircraft, ${totalPositions} total positions`);
          
          return newBuffer;
        });
        
        setLastUpdate(new Date(data.timestamp * 1000));
        console.log(`Loaded ${data.aircraft.length} live aircraft within ${radiusKm}km`);
        
        // Log flight detections
        logFlightDetections(data.aircraft).catch(err => 
          console.error('Error logging detections:', err)
        );

        // Update flight trails
        setFlightTrails(prevTrails => {
          const newTrails = { ...prevTrails };
          
          // Add current positions to trails
          data.aircraft.forEach(plane => {
            if (!newTrails[plane.icao24]) {
              newTrails[plane.icao24] = [];
            }
            
            // Add current position
            newTrails[plane.icao24].push({
              lat: plane.latitude,
              lng: plane.longitude,
              timestamp: currentTime,
              altitude: plane.altitude
            });
            
            // Keep only last N positions based on trailLength setting
            if (newTrails[plane.icao24].length > trailLength) {
              newTrails[plane.icao24].shift();
            }
          });
          
          // Clean up trails for aircraft no longer in range
          const currentIcao24s = new Set(data.aircraft.map(a => a.icao24));
          Object.keys(newTrails).forEach(icao24 => {
            if (!currentIcao24s.has(icao24)) {
              delete newTrails[icao24];
            }
          });
          
          return newTrails;
        });
        
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
  }, [enabled, refreshInterval, radiusKm]);

  // NEW: Calculate delayed positions when delay changes
  useEffect(() => {
    const now = Date.now();
    
    if (positionDelay === 0) {
      // Real-time mode - use most recent positions from buffer
      console.log('🔴 REAL-TIME MODE - Showing current positions');
      
      const realtimeAircraft = Object.keys(positionBuffer).map(icao24 => {
        const positions = positionBuffer[icao24];
        return positions[positions.length - 1]; // Most recent
      })
      .filter(Boolean)
      .filter(plane => {  // ✅ Filter by radius
        const distance = calculateDistance(plane.latitude, plane.longitude);
        return distance <= radiusKm;
      });
      
      console.log(`✅ Displaying ${realtimeAircraft.length} aircraft at real-time positions`);
      setAircraft(realtimeAircraft);
      
      if (onAircraftUpdate) {
        onAircraftUpdate(realtimeAircraft);
      }
    } else {
      // Delayed mode - find positions from X minutes ago
      const targetTime = now - (positionDelay * 60 * 1000);
      const targetDate = new Date(targetTime);
      
      console.log(`🕐 DELAYED MODE - Delay: ${positionDelay} minutes`);
      console.log(`⏰ Current time: ${new Date(now).toLocaleTimeString()}`);
      console.log(`📍 Target time: ${targetDate.toLocaleTimeString()} (${positionDelay} min ago)`);
      console.log(`🗂️ Buffer size: ${Object.keys(positionBuffer).length} aircraft`);
      
      const delayedAircraft = [];
      let totalAgeDiff = 0;
      let minAge = Infinity;
      let maxAge = 0;
      
      Object.keys(positionBuffer).forEach(icao24 => {
        const positions = positionBuffer[icao24];
        
        // Find position closest to target time
        let closestPosition = null;
        let smallestDiff = Infinity;
        
        positions.forEach(pos => {
          const diff = Math.abs(pos.timestamp - targetTime);
          if (diff < smallestDiff) {
            smallestDiff = diff;
            closestPosition = pos;
          }
        });
        
        if (closestPosition) {
          // ✅ ADD DISTANCE CHECK HERE
          const distance = calculateDistance(closestPosition.latitude, closestPosition.longitude);
          if (distance <= radiusKm) {  // ✅ Only add if within radius
            const posAge = (now - closestPosition.timestamp) / 1000 / 60; // minutes
            totalAgeDiff += posAge;
            minAge = Math.min(minAge, posAge);
            maxAge = Math.max(maxAge, posAge);
            delayedAircraft.push(closestPosition);
          }
        }
      });
      
      const avgAge = delayedAircraft.length > 0 ? totalAgeDiff / delayedAircraft.length : 0;
      
      console.log(`📊 Position ages: min ${minAge.toFixed(1)}m | avg ${avgAge.toFixed(1)}m | max ${maxAge.toFixed(1)}m`);
      console.log(`✅ Displaying ${delayedAircraft.length} aircraft at delayed positions`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      setAircraft(delayedAircraft);
      
      if (onAircraftUpdate) {
        onAircraftUpdate(delayedAircraft);
      }
    }
  }, [positionBuffer, positionDelay, radiusKm, onAircraftUpdate]);  // ✅ Add radiusKm dependency

  if (!enabled) return null;

  return (
    <>
      {aircraft.map(plane => (
        <Fragment key={plane.icao24}>
          {/* Draw flight trail */}
          {showTrails && flightTrails[plane.icao24] && flightTrails[plane.icao24].length > 1 && (
            <Polyline
              positions={flightTrails[plane.icao24].map(pos => [pos.lat, pos.lng])}
              pathOptions={{
                color: '#3b82f6',
                weight: 2,
                opacity: 0.6,
                lineJoin: 'round'
              }}
            />
          )}
          
          {/* Aircraft marker */}
          <Marker
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
        </Fragment>
      ))}
      
      {/* Status indicator in corner */}
      {lastUpdate && (
        <div style={{
          position: 'absolute',
          top: '10px',
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
// src/services/openSkyService.js

const OPENSKY_BASE_URL = 'https://opensky-network.org/api';
// Use proxy for CORS bypass
const USE_PROXY = true; // Set to false if CORS is fixed
const PROXY_URL = 'http://localhost:3001/api/opensky';

// Boca Raton Airport coordinates with search radius
const BCT_COORDS = {
  lat: 26.3785,
  lng: -80.1077,
  radius: 50 // km radius for search - ADJUST THIS VALUE!
  // Recommended values:
  // - 25 km: Very close traffic only (arrivals/departures)
  // - 50 km: Default - good balance for regional traffic
  // - 100 km: Wider area including Miami and Fort Lauderdale traffic
  // - 150 km: Very wide coverage (will show many more aircraft)
};

/**
 * Calculate bounding box around Boca Raton Airport
 */
function getBoundingBox(lat, lng, radiusKm) {
  const latDelta = radiusKm / 111; // roughly 111km per degree latitude
  const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  
  return {
    lamin: lat - latDelta,
    lamax: lat + latDelta,
    lomin: lng - lngDelta,
    lomax: lng + lngDelta
  };
}

/**
 * Fetch live aircraft data near Boca Raton Airport
 * Rate limit: max 400 requests per day (free tier)
 * @param {number} radiusKm - Search radius in kilometers (default: 50)
 */
export async function fetchLiveAircraft(radiusKm = 50) {
  try {
    const bbox = getBoundingBox(BCT_COORDS.lat, BCT_COORDS.lng, radiusKm);
    
    const url = `${OPENSKY_BASE_URL}/states/all?` + 
      `lamin=${bbox.lamin}&lamax=${bbox.lamax}&` +
      `lomin=${bbox.lomin}&lomax=${bbox.lomax}`;
    
    console.log(`🛫 Fetching aircraft within ${radiusKm}km of BCT...`);
    console.log('📍 Bounding box:', bbox);
    console.log('🔗 API URL:', url);
    
    const response = await fetch(url);
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`OpenSky API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📦 Raw API data:', data);
    console.log('✈️ Total states returned:', data.states?.length || 0);
    
    // Transform OpenSky data to our format
    const result = transformAircraftData(data);
    console.log('✅ Processed aircraft:', result.aircraft.length);
    console.log('🛩️ Aircraft details:', result.aircraft);
    
    return result;
  } catch (error) {
    console.error('💥 Error fetching live aircraft:', error);
    console.error('📋 Error details:', error.message);
    return { aircraft: [], timestamp: Date.now() };
  }
}

/**
 * Transform OpenSky API response to usable format
 * OpenSky state vector format:
 * [0] icao24, [1] callsign, [2] origin_country, [3] time_position,
 * [4] last_contact, [5] longitude, [6] latitude, [7] baro_altitude,
 * [8] on_ground, [9] velocity, [10] true_track, [11] vertical_rate
 */
function transformAircraftData(data) {
  if (!data || !data.states) {
    return { aircraft: [], timestamp: Date.now() };
  }
  
  const aircraft = data.states
    .filter(state => {
      // Filter out aircraft on ground and with invalid positions
      return state[6] !== null && state[5] !== null && !state[8];
    })
    .map(state => ({
      icao24: state[0],
      callsign: state[1]?.trim() || 'Unknown',
      origin_country: state[2],
      latitude: state[6],
      longitude: state[5],
      altitude: state[7], // meters
      velocity: state[9], // m/s
      heading: state[10], // degrees
      vertical_rate: state[11], // m/s
      on_ground: state[8],
      last_contact: state[4]
    }));
  
  return {
    aircraft,
    timestamp: data.time || Date.now()
  };
}

/**
 * Get flight route information (requires authentication for full access)
 * This is a placeholder - full route data requires OpenSky premium
 */
export async function getFlightRoute(icao24, timestamp) {
  try {
    const url = `${OPENSKY_BASE_URL}/tracks/all?icao24=${icao24}&time=${timestamp}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Route data unavailable');
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Route data not available:', error);
    return null;
  }
}

/**
 * Format altitude for display
 */
export function formatAltitude(meters) {
  if (!meters) return 'N/A';
  const feet = Math.round(meters * 3.28084);
  return `${feet.toLocaleString()} ft`;
}

/**
 * Format speed for display
 */
export function formatSpeed(metersPerSecond) {
  if (!metersPerSecond) return 'N/A';
  const knots = Math.round(metersPerSecond * 1.94384);
  return `${knots} kts`;
}

/**
 * Calculate distance from Boca Raton Airport
 */
export function calculateDistance(lat, lng) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat - BCT_COORDS.lat) * Math.PI / 180;
  const dLng = (lng - BCT_COORDS.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(BCT_COORDS.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance.toFixed(1);
}
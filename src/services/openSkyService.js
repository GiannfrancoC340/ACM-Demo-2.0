// src/services/openSkyService.js

const OPENSKY_BASE_URL = 'https://opensky-network.org/api';

// Use proxy for CORS bypass
const USE_PROXY = true;
const PROXY_URL = 'http://localhost:3001/api/opensky';

// OpenSky OAuth2 Credentials (required for accounts created after March 2025)
const OPENSKY_CLIENT_ID = import.meta.env.VITE_OPENSKY_CLIENT_ID || null;
const OPENSKY_CLIENT_SECRET = import.meta.env.VITE_OPENSKY_CLIENT_SECRET || null;

// Token management
let accessToken = null;
let tokenExpiry = null;

// Boca Raton Airport coordinates with search radius
const BCT_COORDS = {
  lat: 26.3785,
  lng: -80.1077,
  radius: 50 // km radius for search
};

/**
 * Get OAuth2 access token from OpenSky (via backend proxy)
 * Tokens are cached and refreshed when expired
 */
async function getAccessToken() {
  // If we have a valid token, return it
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('🔑 Using cached OAuth2 token');
    return accessToken;
  }

  // If no credentials, return null (will use anonymous)
  if (!OPENSKY_CLIENT_ID || !OPENSKY_CLIENT_SECRET) {
    return null;
  }

  try {
    console.log('🔄 Requesting new OAuth2 token...');

    // Use backend proxy to avoid CORS
    const response = await fetch('http://localhost:3001/api/opensky-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: OPENSKY_CLIENT_ID,
        client_secret: OPENSKY_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      console.error('❌ OAuth2 token request failed:', response.status);
      const errorData = await response.json().catch(() => ({}));
      console.error('Error details:', errorData);
      return null;
    }

    const data = await response.json();
    accessToken = data.access_token;
    
    // Set expiry to 5 minutes before actual expiry for safety
    const expiresIn = data.expires_in || 3600; // Default 1 hour
    tokenExpiry = Date.now() + (expiresIn - 300) * 1000;

    console.log('✅ OAuth2 token obtained, expires in', expiresIn, 'seconds');
    return accessToken;
  } catch (error) {
    console.error('💥 Error getting OAuth2 token:', error);
    return null;
  }
}

/**
 * Calculate bounding box around airport
 */
function getBoundingBox(lat, lng, radiusKm) {
  const latDelta = radiusKm / 111;
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
 * Rate limit: 400 requests/day (anonymous) or 4,000/day (OAuth2)
 */
export async function fetchLiveAircraft(radiusKm = 50) {
  try {
    const bbox = getBoundingBox(BCT_COORDS.lat, BCT_COORDS.lng, radiusKm);
    
    // Get access token (will be null if no credentials)
    const token = await getAccessToken();
    
    let url;
    let fetchOptions = {};
    
    if (USE_PROXY) {
      // Use our backend proxy to avoid CORS
      url = `${PROXY_URL}?` + 
        `lamin=${bbox.lamin}&lamax=${bbox.lamax}&` +
        `lomin=${bbox.lomin}&lomax=${bbox.lomax}`;
      
      // If we have OAuth2 token, pass it to the proxy via header
      if (token) {
        fetchOptions.headers = {
          'X-OpenSky-Token': token,
        };
        console.log('🔐 Using OAuth2 authenticated requests (4,000/day limit)');
      } else {
        console.log('🔓 Using anonymous OpenSky requests (400/day limit)');
      }
    } else {
      // Direct API call (may have CORS issues)
      url = `${OPENSKY_BASE_URL}/states/all?` + 
        `lamin=${bbox.lamin}&lamax=${bbox.lamax}&` +
        `lomin=${bbox.lomin}&lomax=${bbox.lomax}`;
      
      if (token) {
        fetchOptions.headers = {
          'Authorization': `Bearer ${token}`
        };
        console.log('🔐 Using OAuth2 authenticated requests (4,000/day limit)');
      } else {
        console.log('🔓 Using anonymous OpenSky requests (400/day limit)');
      }
    }
    
    console.log(`🛫 Fetching aircraft within ${radiusKm}km of BCT...`);
    console.log('📍 Bounding box:', bbox);
    console.log('🔗 API URL:', url);
    
    const response = await fetch(url, fetchOptions);
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      
      // Provide helpful error messages      
      if (response.status === 503) {
        throw new Error('OpenSky Network is temporarily unavailable. Try again in a few minutes.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Wait a few minutes before trying again.');
      } else if (response.status === 401) {
        // Token might be invalid, clear it
        accessToken = null;
        tokenExpiry = null;
        throw new Error('OpenSky authentication failed. Token may be invalid.');
      } else {
        throw new Error(`OpenSky API error: ${response.status} - ${errorText}`);
      }
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
    
    // Return empty result instead of crashing
    return { aircraft: [], timestamp: Date.now(), error: error.message };
  }
}

/**
 * Transform OpenSky API response to usable format
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
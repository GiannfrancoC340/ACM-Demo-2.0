// src/services/aviationStackService.js

const API_KEY = import.meta.env.VITE_AVIATIONSTACK_API_KEY; // Replace with your actual key
const BASE_URL = 'http://api.aviationstack.com/v1'; 

// Add at the top of the file
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch flight details by callsign
 */
export async function getFlightDetails(callsign) {
  try {
    const cleanCallsign = callsign?.trim();
    if (!cleanCallsign) return null;

    // Check cache first (works for both success and failure)
    const cached = cache.get(cleanCallsign);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 Using cached data for ${cleanCallsign}`);
      return cached.data; // Could be flight data OR null
    }

    // Try IATA format first
    let response = await fetch(
      `${BASE_URL}/flights?access_key=${API_KEY}&flight_iata=${cleanCallsign}`
    );
    
    let data = await response.json();
    
    // If no results, try ICAO format
    if (!data.data || data.data.length === 0) {
      console.log(`No results for IATA ${cleanCallsign}, trying ICAO...`);
      response = await fetch(
        `${BASE_URL}/flights?access_key=${API_KEY}&flight_icao=${cleanCallsign}`
      );
      data = await response.json();
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flight details: ${response.status}`);
    }
    
    let result = null; // Default to null
    
    if (data.data && data.data.length > 0) {
      const flight = data.data[0];
      result = {
        airline: flight.airline?.name || null,
        airlineIATA: flight.airline?.iata || null,
        flightNumber: flight.flight?.iata || callsign,
        aircraft: flight.aircraft?.registration || null,
        aircraftType: flight.aircraft?.iata || null,
        departure: {
          airport: flight.departure?.airport || null,
          iata: flight.departure?.iata || null,
          terminal: flight.departure?.terminal || null,
          gate: flight.departure?.gate || null,
          scheduledTime: flight.departure?.scheduled || null
        },
        arrival: {
          airport: flight.arrival?.airport || null,
          iata: flight.arrival?.iata || null,
          terminal: flight.arrival?.terminal || null,
          gate: flight.arrival?.gate || null,
          scheduledTime: flight.arrival?.scheduled || null
        },
        status: flight.flight_status || null
      };
    }
    
    // ✨ NEW: Cache the result regardless (success OR null)
    cache.set(cleanCallsign, {
      data: result, // Could be enriched data OR null
      timestamp: Date.now()
    });
    
    console.log(result ? `✅ Cached enriched data for ${cleanCallsign}` : `📦 Cached "no data" result for ${cleanCallsign}`);
    
    return result;
    
  } catch (error) {
    console.error('Error fetching flight details from AviationStack:', error);
    return null;
  }
}
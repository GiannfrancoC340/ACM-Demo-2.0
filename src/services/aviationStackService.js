// src/services/aviationStackService.js

const API_KEY = 'YOUR_AVIATIONSTACK_API_KEY'; // Replace with your actual key
const BASE_URL = 'http://api.aviationstack.com/v1';

/**
 * Fetch flight details by callsign
 */
export async function getFlightDetails(callsign) {
  try {
    const cleanCallsign = callsign?.trim();
    if (!cleanCallsign) return null;

    const response = await fetch(
      `${BASE_URL}/flights?access_key=${API_KEY}&flight_iata=${cleanCallsign}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch flight details');
    }
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const flight = data.data[0];
      return {
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
    
    return null;
  } catch (error) {
    console.error('Error fetching flight details from AviationStack:', error);
    return null;
  }
}
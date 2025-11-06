// src/services/aeroDataBoxService.js

const API_KEY = import.meta.env.VITE_AERODATABOX_API_KEY;
const BASE_URL = 'https://aerodatabox.p.rapidapi.com/aircrafts';

const cache = new Map();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days (registration rarely changes)

/**
 * Get aircraft details by ICAO24 or registration
 */
export async function getAircraftDetails(icao24) {
  try {
    const cleanIcao = icao24?.trim().toUpperCase();
    if (!cleanIcao) return null;

    // Check cache
    const cached = cache.get(cleanIcao);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 Using cached aircraft data for ${cleanIcao}`);
      return cached.data;
    }

    console.log(`🔍 Looking up aircraft details for ${cleanIcao}`);

    const response = await fetch(
      `${BASE_URL}/icao24/${cleanIcao}`,
      {
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`AeroDataBox lookup failed: ${response.status}`);
    }

    const data = await response.json();
    
    const result = {
      registration: data.reg || null,
      aircraftType: data.typeName || data.model || null,
      manufacturer: data.manufacturerName || null,
      owner: data.operatorName || null,
      serialNumber: data.serialNumber || null
    };

    // Cache the result
    cache.set(cleanIcao, {
      data: result,
      timestamp: Date.now()
    });

    console.log(`✅ Aircraft details found for ${cleanIcao}:`, result);
    return result;

  } catch (error) {
    console.error('Error fetching aircraft details from AeroDataBox:', error);
    return null;
  }
}
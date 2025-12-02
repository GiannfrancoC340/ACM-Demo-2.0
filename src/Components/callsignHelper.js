/**
 * Helper functions for analyzing aircraft callsigns
 */

/**
 * Detect if a callsign appears to be from a commercial airline
 * Based on ICAO airline designator patterns
 */
export function isCommercialCallsign(callsign) {
  if (!callsign) return false;
  
  const clean = callsign.trim().toUpperCase();
  
  // Common commercial airline ICAO codes
  const commercialPrefixes = [
    'AAL',  // American Airlines
    'DAL',  // Delta
    'UAL',  // United
    'SWA',  // Southwest
    'JBU',  // JetBlue
    'FFT',  // Frontier
    'NKS',  // Spirit
    'ASA',  // Alaska Airlines
    'HAL',  // Hawaiian Airlines
    'SKW',  // SkyWest
    'ENY',  // Envoy Air
    'ENV',  // Envoy Air (alternative code)
    'CPZ',  // Compass Airlines
    'FDX',  // FedEx
    'UPS',  // UPS
    'ABX',  // ABX Air
    'GTI',  // Atlas Air
    'AJT',  // Amerijet International
    'BAW',  // British Airways
    'DLH',  // Lufthansa
    'AFR',  // Air France
    'KLM',  // KLM
    'ACA',  // Air Canada
    'VOI',  // Volaris
    'VIV',  // VivaAerobus
    'AMX',  // Aeromexico
    'JNY',  // JetNetherlands
    'SVA',  // Riyadh Air
    'UAE',  // Emirates
    'AVA',  // Avianca
    'CMP',  // Copa Airlines
    'THY',  // Turkish Airlines
    'BHS',  // Bahamasair
    'LAN',  // LATAM Airlines
    'TAM',  // LATAM Airlines (Brazil)
    'JTA',  // LATAM Airlines (alternate)
    'ETD',  // Etihad Airways
    'AAY',  // Allegiant Air
    'TVI',  // Tropic Ocean Airways (scheduled seaplane service)
    'CKS',  // Kalitta Air (cargo)
    'ATN',  // Air Transport International (cargo)
    'WWI',  // Western Global Airlines (cargo)
  ];
  
  // Check if callsign starts with a known commercial prefix
  for (const prefix of commercialPrefixes) {
    if (clean.startsWith(prefix)) {
      return true;
    }
  }
  
  // Pattern: 3 letters + numbers (e.g., AAL2341, DAL1234)
  // This is the typical ICAO flight number format
  const icaoPattern = /^[A-Z]{3}\d{1,4}[A-Z]?$/;
  if (icaoPattern.test(clean)) {
    return true;
  }
  
  // If it starts with 'N' followed by numbers, it's likely a tail number (private)
  if (/^N\d/.test(clean)) {
    return false;
  }
  
  return false;
}

/**
 * Check if an aircraft type is exclusively private/general aviation
 * These aircraft are never used by commercial airlines
 */
export function isPrivateAircraftType(aircraftType) {
  if (!aircraftType) return false;
  
  const privateTypes = [
    // Single-engine trainers (most common GA)
    'CESSNA 172',
    'CESSNA 182',
    'CESSNA 206',
    'PIPER CHEROKEE',
    'PIPER ARCHER',
    'PIPER WARRIOR',
    'CIRRUS SR20',
    'CIRRUS SR22',
    
    // Light twins
    'PIPER SENECA',
    'BEECHCRAFT BARON',
    'CESSNA 310',
    
    // Very light jets (typically private)
    'CESSNA CITATION MUSTANG',
    
    // Helicopters (unless explicitly commercial)
    'ROBINSON R22',
    'ROBINSON R44',
  ];
  
  const upperType = aircraftType.toUpperCase();
  
  // Check for exact matches or partial matches
  return privateTypes.some(type => 
    upperType.includes(type) || type.includes(upperType)
  );
}

/**
 * Check if callsign is from a charter/fractional operator
 * These operators use commercial-style callsigns but are private/charter operations
 */
export function isCharterOperator(callsign) {
  if (!callsign) return false;
  
  const clean = callsign.trim().toUpperCase();
  
  const charterPrefixes = [
    'EJA',  // NetJets
    'VJA',  // VistaJet
    'XOJ',  // XOJet
    'FLX',  // FlexJet
    'LXJ',  // FlexJet (alternative code)
    'WUP',  // Wheels Up
    'HPJ',  // Hop-A-Jet
    'JTL',  // Jet Linx
    'CST',  // CoastAir
    'JRE',  // JetReady
    'TNO',  // Talon Air
    'JSX',  // JSX Air
    'GPD',  // Tradewind Aviation
  ];
  
  return charterPrefixes.some(prefix => clean.startsWith(prefix));
}

/**
 * Format callsign for display
 */
export function formatCallsign(callsign) {
  if (!callsign) return 'Unknown';
  
  const clean = callsign.trim();
  
  // If it matches ICAO format (AAL2341), format nicely
  const match = clean.match(/^([A-Z]{2,3})(\d{1,4})([A-Z]?)$/i);
  if (match) {
    const [, airline, number, suffix] = match;
    return `${airline.toUpperCase()} ${number}${suffix.toUpperCase()}`;
  }
  
  return clean.toUpperCase();
}

/**
 * Get likely airline name from ICAO code
 */
export function getAirlineFromCallsign(callsign) {
  if (!callsign) return null;
  
  const clean = callsign.trim().toUpperCase();
  
  const airlineMap = {
    'AAL': 'American Airlines',
    'DAL': 'Delta Air Lines',
    'UAL': 'United Airlines',
    'SWA': 'Southwest Airlines',
    'JBU': 'JetBlue Airways',
    'FFT': 'Frontier Airlines',
    'NKS': 'Spirit Airlines',
    'ASA': 'Alaska Airlines',
    'HAL': 'Hawaiian Airlines',
    'SKW': 'SkyWest Airlines',
    'ENY': 'Envoy Air',
    'ENV': 'Envoy Air',
    'FDX': 'FedEx',
    'UPS': 'UPS Airlines',
    'ABX': 'ABX Air',
    'GTI': 'Atlas Air',
    'AJT': 'Amerijet International',  // ← ADD THIS
    'BAW': 'British Airways',
    'DLH': 'Lufthansa',
    'AFR': 'Air France',
    'KLM': 'KLM Royal Dutch Airlines',
    'ACA': 'Air Canada',
    'VOI': 'Volaris',
    'VIV': 'VivaAerobus',
    'AMX': 'Aeromexico',
    'JNY': 'JetNetherlands',
    'SVA': 'Riyadh Air',              // ← NEW
    'UAE': 'Emirates',                 // ← NEW
    'AVA': 'Avianca',                  // ← NEW
    'CMP': 'Copa Airlines',            // ← NEW
    'THY': 'Turkish Airlines',         // ← NEW
    'BHS': 'Bahamasair',              // ← NEW
    'LAN': 'LATAM Airlines',          // ← NEW
    'TAM': 'LATAM Airlines',          // ← NEW
    'JTA': 'LATAM Airlines',          // ← NEW
    'ETD': 'Etihad Airways',
    'AAY': 'Allegiant Air',
    'TVI': 'Tropic Ocean Airways',
    'WUP': 'Wheels Up',               // ← NEW (Private)
    'VJA': 'VistaJet',                // ← NEW (Private)
    'EJA': 'NetJets',                 // (Private)
    'SHR': 'Shoreline Aviation',
    'HPJ': 'Hop-A-Jet',
    'JTL': 'Jet Linx',
    'XOJ': 'XOJet',
    'TWY': 'Jet Aviation',
    'FLX': 'FlexJet',
    'LXJ': 'Flexjet',           // ⚠️ Add this (alternative code)
    'CST': 'CoastAir',          // ⚠️ Add this
    'JRE': 'JetReady',          // ⚠️ Add this
    'TNO': 'Talon Air',         // ⚠️ Add this
    'JSX': 'JSX Air',           // ⚠️ Add this
    'GPD': 'Tradewind Aviation',// ⚠️ Add this
    'ASP': 'AirSprint',
    'CKS': 'Kalitta Air',
    'ATN': 'Air Transport International',
    'WWI': 'Western Global Airlines',
  };
  
  // Extract airline code (first 3 letters)
  const code = clean.substring(0, 3);
  return airlineMap[code] || null;
}

/**
 * ========================================
 * IATA ↔ ICAO CALLSIGN CONVERSION
 * ========================================
 */

/**
 * Mapping between IATA (2-letter) and ICAO (3-letter) airline codes
 */
const AIRLINE_CODE_MAP = {
  // US Airlines
  'AA': 'AAL',   // American Airlines
  'UA': 'UAL',   // United Airlines
  'DL': 'DAL',   // Delta Air Lines
  'WN': 'SWA',   // Southwest Airlines
  'B6': 'JBU',   // JetBlue Airways
  'NK': 'NKS',   // Spirit Airlines
  'F9': 'FFT',   // Frontier Airlines
  'AS': 'ASA',   // Alaska Airlines
  'HA': 'HAL',   // Hawaiian Airlines
  'G4': 'AAY',   // Allegiant Air
  
  // US Regional/Cargo
  'OO': 'SKW',   // SkyWest Airlines
  'MQ': 'ENY',   // Envoy Air
  'FX': 'FDX',   // FedEx
  '5X': 'UPS',   // UPS Airlines
  'GB': 'ABX',   // ABX Air
  '5Y': 'GTI',   // Atlas Air
  
  // International
  'BA': 'BAW',   // British Airways
  'LH': 'DLH',   // Lufthansa
  'AF': 'AFR',   // Air France
  'KL': 'KLM',   // KLM
  'AC': 'ACA',   // Air Canada
  'Y4': 'VOI',   // Volaris
  'VB': 'VIV',   // VivaAerobus
  'AM': 'AMX',   // Aeromexico
  'EK': 'UAE',   // Emirates
  'AV': 'AVA',   // Avianca
  'CM': 'CMP',   // Copa Airlines
  'TK': 'THY',   // Turkish Airlines
  'UP': 'BHS',   // Bahamasair
  'LA': 'LAN',   // LATAM Airlines
  'JJ': 'TAM',   // LATAM (Brazil)
  'EY': 'ETD',   // Etihad Airways
};

/**
 * Create reverse mapping (ICAO → IATA)
 */
const REVERSE_AIRLINE_CODE_MAP = Object.fromEntries(
  Object.entries(AIRLINE_CODE_MAP).map(([iata, icao]) => [icao, iata])
);

/**
 * Convert between IATA and ICAO callsign formats
 * Examples:
 *   AA1110 → AAL1110
 *   AAL1110 → AA1110
 *   N738WC → N738WC (no conversion for tail numbers)
 */
export function convertCallsign(callsign, targetFormat = 'ICAO') {
  if (!callsign) return null;
  
  const clean = callsign.trim().toUpperCase();
  
  // If it's a tail number (starts with N), don't convert
  if (clean.startsWith('N')) {
    return clean;
  }
  
  // Try to match airline code pattern
  // Format: AA1110 (IATA) or AAL1110 (ICAO)
  
  if (targetFormat === 'ICAO') {
    // Convert IATA → ICAO
    for (const [iata, icao] of Object.entries(AIRLINE_CODE_MAP)) {
      if (clean.startsWith(iata) && clean.length > iata.length) {
        // Extract flight number (everything after airline code)
        const flightNumber = clean.substring(iata.length);
        return icao + flightNumber;
      }
    }
  } else if (targetFormat === 'IATA') {
    // Convert ICAO → IATA
    for (const [icao, iata] of Object.entries(REVERSE_AIRLINE_CODE_MAP)) {
      if (clean.startsWith(icao) && clean.length > icao.length) {
        // Extract flight number (everything after airline code)
        const flightNumber = clean.substring(icao.length);
        return iata + flightNumber;
      }
    }
  }
  
  // No conversion possible, return original
  return clean;
}

/**
 * Get all possible variants of a callsign (IATA and ICAO)
 * This is useful for searching/matching when you don't know which format is used
 * 
 * Examples:
 *   AA1110 → ['AA1110', 'AAL1110']
 *   AAL1110 → ['AAL1110', 'AA1110']
 *   N738WC → ['N738WC'] (tail numbers have no variants)
 */
export function getCallsignVariants(callsign) {
  if (!callsign) return [];
  
  const clean = callsign.trim().toUpperCase();
  const variants = [clean];
  
  // Try to convert to ICAO
  const icao = convertCallsign(clean, 'ICAO');
  if (icao && icao !== clean) {
    variants.push(icao);
  }
  
  // Try to convert to IATA
  const iata = convertCallsign(clean, 'IATA');
  if (iata && iata !== clean) {
    variants.push(iata);
  }
  
  // Remove duplicates and return
  return [...new Set(variants)];
}

/**
 * Check if a callsign matches another callsign (accounting for IATA/ICAO variants)
 * 
 * Examples:
 *   callsignsMatch('AA1110', 'AAL1110') → true
 *   callsignsMatch('AAL1110', 'AA1110') → true
 *   callsignsMatch('AA1110', 'AA1110') → true
 *   callsignsMatch('N738WC', 'N738WC') → true
 *   callsignsMatch('AA1110', 'UA456') → false
 */
export function callsignsMatch(callsign1, callsign2) {
  if (!callsign1 || !callsign2) return false;
  
  const variants1 = getCallsignVariants(callsign1);
  const variants2 = getCallsignVariants(callsign2);
  
  // Check if any variant of callsign1 matches any variant of callsign2
  return variants1.some(v1 => 
    variants2.some(v2 => v1 === v2)
  );
}
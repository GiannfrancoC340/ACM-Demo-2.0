import express from 'express';
import fs from 'fs/promises';        // ← For async (mkdir, appendFile)
import fsSync from 'fs';              // ← For sync (readdirSync)
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { getCallsignVariants } from './src/Components/callsignHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Enhanced helper function to format filename to better title and metadata
function parseAudioMetadata(filename) {
  // Remove .mp3 extension and flight ID prefix
  // e.g., "flight1-preflight.mp3" -> "preflight"
  // e.g., "flight1-takeoff-clearance.mp3" -> "takeoff clearance"
  const withoutExt = filename.replace(/\.(mp3|wav)$/, '');
  const parts = withoutExt.split('-');
  
  // Remove the flight ID part (e.g., "flight1")
  const titleParts = parts.slice(1);
  
  // Join parts with spaces
  const rawTitle = titleParts.join(' ');
  
  // Mapping of keywords to better titles and descriptions
  const titleMappings = {
    'preflight': {
      title: 'Pre-flight Communications',
      description: 'Ground control and taxi instructions'
    },
    'pre flight': {
      title: 'Pre-flight Communications',
      description: 'Ground control and taxi instructions'
    },
    'takeoff': {
      title: 'Takeoff Clearance',
      description: 'Tower communications for departure'
    },
    'takeoff clearance': {
      title: 'Takeoff Clearance',
      description: 'Tower communications for departure'
    },
    'departure': {
      title: 'Departure Control',
      description: 'Initial climb and route clearance'
    },
    'enroute': {
      title: 'En Route Communications',
      description: 'Air traffic control during flight'
    },
    'en route': {
      title: 'En Route Communications',
      description: 'Air traffic control during flight'
    },
    'approach': {
      title: 'Approach Communications',
      description: 'Descent and approach instructions'
    },
    'landing': {
      title: 'Landing Clearance',
      description: 'Final approach and landing communications'
    },
    'arrival': {
      title: 'Arrival Communications',
      description: 'Approach and landing at destination'
    },
    'ground': {
      title: 'Ground Operations',
      description: 'Ground control and pushback clearance'
    },
    'taxi': {
      title: 'Taxi Instructions',
      description: 'Ground movement and taxi clearance'
    },
    'pushback': {
      title: 'Pushback Clearance',
      description: 'Gate departure and pushback instructions'
    }
  };
  
  // Check if we have a mapping for this audio type
  const lowerTitle = rawTitle.toLowerCase().trim();
  const mapping = titleMappings[lowerTitle];
  
  if (mapping) {
    return mapping;
  }
  
  // Fallback: capitalize each word
  const capitalizedTitle = rawTitle
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    title: capitalizedTitle || 'Recording',
    description: 'Air traffic control communications'
  };
}

// Helper to estimate timestamp based on filename or file creation time
function estimateTimestamp(filename, audioDir) {
  try {
    const filePath = path.join(audioDir, filename);
    const stats = fsSync.statSync(filePath);
    const time = new Date(stats.birthtime);
    
    // Format as "H:MM AM/PM"
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${ampm}`;
  } catch (err) {
    return 'N/A';
  }
}

// Audio playlist endpoint
app.get('/api/playlist', (req, res) => {
  const audioDir = path.join(__dirname, 'public/audio');
  
  fsSync.readdir(audioDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' });
    }
    
    const audioFiles = files.filter(file => 
      file.endsWith('.mp3') || file.endsWith('.wav')
    );
    
    const playlist = audioFiles.map((file, index) => {
      const baseName = file.replace(/\.(mp3|wav)$/, '');
      const transcriptExists = fsSync.existsSync(path.join(audioDir, `${baseName}.txt`));
      
      return {
        id: index + 1,
        title: baseName.replace(/-|_/g, ' '),
        url: `/audio/${file}`,
        transcript: transcriptExists ? `/audio/${baseName}.txt` : null
      };
    });
    
    res.json(playlist);
  });
});

// NEW: Get recording dates for timeline
app.get('/api/recording-dates', (req, res) => {
  const audioDir = path.join(__dirname, 'public', 'audio');
  
  try {
    const files = fsSync.readdirSync(audioDir);
    const audioFiles = files.filter(file => 
      file.endsWith('.mp3') || file.endsWith('.wav')
    );
    
    const recordingDates = audioFiles.map(file => {
      const filePath = path.join(audioDir, file);
      const stats = fsSync.statSync(filePath);
      
      return {
        filename: file,
        date: stats.birthtime, // File creation time
        size: stats.size
      };
    });
    
    res.json(recordingDates);
  } catch (err) {
    console.error('Error reading recording dates:', err);
    res.status(500).json({ error: 'Unable to read recording dates' });
  }
});

// Flight audio endpoint
app.get('/api/flight/:flightId', (req, res) => {
  const flightId = req.params.flightId;
  const audioDir = path.join(__dirname, 'public', 'audio');
  
  try {
    // Normalize flightId: remove hyphens for file matching
    const normalizedFlightId = flightId.replace(/-/g, '');
    
    console.log(`Looking for files starting with: ${normalizedFlightId}`);
    
    // For live flights (format: live-{icao24}), also extract callsign if provided
    let searchTerms = [normalizedFlightId];
    
    // If it's a live flight with query parameter for callsign
    const callsign = req.query.callsign;
    if (callsign) {
      // Get ALL variants of the callsign (IATA and ICAO)
      const callsignVariants = getCallsignVariants(callsign);
      
      // Add all variants to search terms
      callsignVariants.forEach(variant => {
        const normalized = variant.trim().replace(/-/g, '');
        searchTerms.push(normalized);
      });
      
      console.log(`Also searching by callsign variants: ${callsignVariants.join(', ')}`);
    }
    
    // Find all audio files matching this flight
    const files = fsSync.readdirSync(audioDir);
    const flightAudios = files
      .filter(file => {
        if (!(file.endsWith('.mp3') || file.endsWith('.wav'))) {
          return false;
        }
        
        // Check if file starts with any of our search terms (case-insensitive)
        return searchTerms.some(term => 
          file.toUpperCase().startsWith(term.toUpperCase())
        );
      })
      .map((file, index) => {
        const metadata = parseAudioMetadata(file);
        const timestamp = estimateTimestamp(file, audioDir);
        
        return {
          id: index + 1,
          title: metadata.title,
          description: metadata.description,
          audioUrl: `/audio/${file}`,
          duration: "0:00", // Placeholder - could calculate real duration with a library
          timestamp: timestamp
        };
      });
    
    console.log(`Found ${flightAudios.length} audio files for ${flightId}`);
    
    res.json({
      flightId: flightId,
      audioRecordings: flightAudios
    });
  } catch (err) {
    console.error('Error reading audio directory:', err);
    res.status(500).json({ 
      error: 'Unable to read audio files',
      flightId: flightId,
      audioRecordings: []
    });
  }
});

// OpenSky API Proxy with OAuth2 Bearer Token Support
app.get('/api/opensky', async (req, res) => {
  try {
    const { lamin, lamax, lomin, lomax } = req.query;
    
    if (!lamin || !lamax || !lomin || !lomax) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lamin, lamax, lomin, lomax' 
      });
    }
    
    // Check if OAuth2 token was passed from frontend
    const token = req.headers['x-opensky-token'];
    
    console.log(`🛫 Proxying OpenSky request: lat ${lamin}-${lamax}, lon ${lomin}-${lomax}`);
    
    const openSkyUrl = `https://opensky-network.org/api/states/all?` +
      `lamin=${lamin}&lamax=${lamax}&lomin=${lomin}&lomax=${lomax}`;
    
    console.log('🔗 Fetching from:', openSkyUrl);
    
    // Prepare fetch options
    const fetchOptions = {};
    
    // If OAuth2 token provided, add Bearer token
    if (token) {
      fetchOptions.headers = {
        'Authorization': `Bearer ${token}`
      };
      console.log('🔐 Using OAuth2 authenticated request (4,000/day limit)');
    } else {
      console.log('🔓 Using anonymous request (400/day limit)');
    }
    
    const response = await fetch(openSkyUrl, fetchOptions);
    
    if (!response.ok) {
      console.error(`❌ OpenSky API error: ${response.status}`);
      
      if (response.status === 503) {
        return res.status(503).json({ 
          error: 'OpenSky Network is temporarily unavailable',
          message: 'Try again in a few minutes'
        });
      }
      
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Wait before trying again or increase refresh interval'
        });
      }
      
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Authentication failed',
          message: 'Invalid or expired OAuth2 token'
        });
      }
      
      return res.status(response.status).json({ 
        error: `OpenSky API returned status ${response.status}` 
      });
    }
    
    const data = await response.json();
    
    if (token) {
      console.log(`✅ Retrieved ${data.states?.length || 0} aircraft states (OAuth2 authenticated)`);
    } else {
      console.log(`✅ Retrieved ${data.states?.length || 0} aircraft states (anonymous)`);
    }
    
    res.json(data);
    
  } catch (error) {
    console.error('💥 Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy error',
      message: error.message 
    });
  }
});

// NEW: OAuth2 Token Proxy
// OAuth2 Token Proxy
app.post('/api/opensky-token', async (req, res) => {
  try {
    const { client_id, client_secret } = req.body;
    
    if (!client_id || !client_secret) {
      return res.status(400).json({ 
        error: 'Missing client_id or client_secret' 
      });
    }
    
    console.log('🔑 Requesting OAuth2 token from OpenSky...');
    
    // ✅ CORRECT URL (was wrong before!)
    const response = await fetch('https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: client_id,
        client_secret: client_secret,
      }),
    });
    
    if (!response.ok) {
      console.error(`❌ OAuth2 token request failed: ${response.status}`);
      const errorText = await response.text();
      console.error('❌ Full error response:', errorText);
      return res.status(response.status).json({ 
        error: 'Token request failed',
        details: errorText 
      });
    }
    
    const data = await response.json();
    console.log('✅ OAuth2 token obtained, expires in', data.expires_in, 'seconds');
    
    res.json(data);
    
  } catch (error) {
    console.error('💥 OAuth2 token error:', error);
    res.status(500).json({ 
      error: 'Token request error',
      message: error.message 
    });
  }
});

// ✅ Automatic log cleanup - keeps last 3 days, deletes older files
async function cleanupOldLogs() {
  try {
    const logsDir = path.join(__dirname, 'logs', 'detections');
    
    // Check if directory exists
    try {
      await fs.access(logsDir);
    } catch {
      // Directory doesn't exist yet, nothing to clean
      return;
    }

    const files = await fs.readdir(logsDir);
    const now = Date.now();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

    let deletedCount = 0;

    for (const file of files) {
      if (!file.startsWith('detections_') || !file.endsWith('.txt')) {
        continue; // Skip non-detection files
      }

      const filePath = path.join(logsDir, file);
      const stats = await fs.stat(filePath);
      const fileAge = now - stats.mtime.getTime(); // Time since last modified

      // Delete if older than 3 days
      if (fileAge > threeDaysInMs) {
        await fs.unlink(filePath);
        deletedCount++;
        console.log(`🗑️ Deleted old log file: ${file}`);
      }
    }

    if (deletedCount > 0) {
      console.log(`✅ Cleanup complete: Deleted ${deletedCount} old log file(s)`);
    }
  } catch (error) {
    console.error('❌ Error during log cleanup:', error);
  }
}

// Run cleanup every 24 hours (86400000 ms)
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

// Run cleanup immediately on server start
cleanupOldLogs();

// Simple flight detection logging endpoint
app.post('/api/log-detections', async (req, res) => {
  try {
    const { detections } = req.body;

    if (!detections || !Array.isArray(detections)) {
      return res.status(400).json({ error: 'Invalid detections data' });
    }

    const logsDir = path.join(__dirname, 'logs', 'detections');
    await fs.mkdir(logsDir, { recursive: true });

    // ✅ Calculate both from the same 'now' variable
    const now = new Date();

    // Get daily filename
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const logFile = path.join(logsDir, `detections_${today}.txt`);

    // Get 10-minute time window (using same 'now')
    const hour = now.getHours();
    const minute = now.getMinutes();
    const startMinute = Math.floor(minute / 10) * 10;
    const endMinute = startMinute + 10;
    
    const startTime = `${String(hour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
    const endTime = endMinute === 60 
      ? `${String(hour + 1).padStart(2, '0')}:00`
      : `${String(hour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    // ✅ Format section header
    const sectionHeader = `\n========== TIME: ${startTime} - ${endTime} ==========\n`;

    // Format log entries
    const logEntries = detections.map(d => {
      const time = new Date(d.detectedAt).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      return `[${time}] ${d.callsign}`;
    });

    // ✅ Check if this section already exists in the file
    let fileContent = '';
    try {
      fileContent = await fs.readFile(logFile, 'utf8');
    } catch (err) {
      // File doesn't exist yet, that's okay
    }

    // Only add section header if this time window isn't already in the file
    const sectionExists = fileContent.includes(`TIME: ${startTime} - ${endTime}`);
    const contentToAppend = sectionExists 
      ? logEntries.join('\n') + '\n'
      : sectionHeader + logEntries.join('\n') + '\n';

    await fs.appendFile(logFile, contentToAppend, 'utf8');

    console.log(`📝 Logged ${detections.length} flight detections to ${logFile}`);
    res.json({ 
      success: true, 
      logged: detections.length,
      file: logFile 
    });

  } catch (error) {
    console.error('Error logging flight detections:', error);
    res.status(500).json({ error: 'Failed to log detections' });
  }
});

// Alternative: Single detection endpoint (if you prefer logging one at a time)
app.post('/api/log-detection', async (req, res) => {
  try {
    const { callsign, detectedAt } = req.body;

    if (!callsign || !detectedAt) {
      return res.status(400).json({ error: 'Missing callsign or timestamp' });
    }

    const logsDir = path.join(__dirname, 'logs', 'detections');
    await fs.mkdir(logsDir, { recursive: true });

    // ✅ One file per day
    // ✅ Calculate both from the same 'now' variable
    const now = new Date();

    // Get daily filename
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const logFile = path.join(logsDir, `detections_${today}.txt`);

    // Get 10-minute time window (using same 'now')
    const hour = now.getHours();
    const minute = now.getMinutes();
    const startMinute = Math.floor(minute / 10) * 10;
    const endMinute = startMinute + 10;
    
    const startTime = `${String(hour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
    const endTime = endMinute === 60 
      ? `${String(hour + 1).padStart(2, '0')}:00`
      : `${String(hour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    const sectionHeader = `\n========== TIME: ${startTime} - ${endTime} ==========\n`;

    const time = new Date(detectedAt).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Check if section exists
    let fileContent = '';
    try {
      fileContent = await fs.readFile(logFile, 'utf8');
    } catch (err) {
      // File doesn't exist yet
    }

    const sectionExists = fileContent.includes(`TIME: ${startTime} - ${endTime}`);
    const contentToAppend = sectionExists 
      ? `[${time}] ${callsign}\n`
      : sectionHeader + `[${time}] ${callsign}\n`;

    await fs.appendFile(logFile, contentToAppend, 'utf8');

    res.json({ success: true, file: logFile });

  } catch (error) {
    console.error('Error logging flight detection:', error);
    res.status(500).json({ error: 'Failed to log detection' });
  }
});

app.listen(3001, () => {
  console.log('🚀 Server running on http://localhost:3001');
  console.log('📡 Audio API: http://localhost:3001/api/playlist');
  console.log('✈️  OpenSky Proxy: http://localhost:3001/api/opensky');
});
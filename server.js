import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

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
    const stats = fs.statSync(filePath);
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
  
  fs.readdir(audioDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' });
    }
    
    const audioFiles = files.filter(file => 
      file.endsWith('.mp3') || file.endsWith('.wav')
    );
    
    const playlist = audioFiles.map((file, index) => {
      const baseName = file.replace(/\.(mp3|wav)$/, '');
      const transcriptExists = fs.existsSync(path.join(audioDir, `${baseName}.txt`));
      
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
    const files = fs.readdirSync(audioDir);
    const audioFiles = files.filter(file => 
      file.endsWith('.mp3') || file.endsWith('.wav')
    );
    
    const recordingDates = audioFiles.map(file => {
      const filePath = path.join(audioDir, file);
      const stats = fs.statSync(filePath);
      
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
    
    // Find all audio files matching this flight
    const files = fs.readdirSync(audioDir);
    const flightAudios = files
      .filter(file => 
        (file.endsWith('.mp3') || file.endsWith('.wav')) && 
        file.startsWith(normalizedFlightId)
      )
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

app.listen(3001, () => {
  console.log('🚀 Server running on http://localhost:3001');
  console.log('📡 Audio API: http://localhost:3001/api/playlist');
  console.log('✈️  OpenSky Proxy: http://localhost:3001/api/opensky');
});
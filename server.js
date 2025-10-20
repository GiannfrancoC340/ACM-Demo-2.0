import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Enhanced helper function to format filename to better title and metadata
function parseAudioMetadata(filename) {
  // Remove .mp3 extension and flight ID prefix
  // e.g., "flight1-preflight.mp3" -> "preflight"
  // e.g., "flight1-takeoff-clearance.mp3" -> "takeoff clearance"
  const withoutExt = filename.replace('.mp3', '');
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
    
    const mp3Files = files.filter(file => file.endsWith('.mp3'));
    
    const playlist = mp3Files.map((file, index) => {
      const baseName = file.replace('.mp3', '');
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
      .filter(file => file.endsWith('.mp3') && file.startsWith(normalizedFlightId))
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

// NEW: OpenSky API Proxy (to bypass CORS)
app.get('/api/opensky', async (req, res) => {
  try {
    const { lamin, lamax, lomin, lomax } = req.query;
    
    // Validate parameters
    if (!lamin || !lamax || !lomin || !lomax) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lamin, lamax, lomin, lomax' 
      });
    }
    
    console.log(`🛫 Proxying OpenSky request: lat ${lamin}-${lamax}, lon ${lomin}-${lomax}`);
    
    // Build OpenSky API URL
    const openSkyUrl = `https://opensky-network.org/api/states/all?` +
      `lamin=${lamin}&lamax=${lamax}&lomin=${lomin}&lomax=${lomax}`;
    
    console.log('🔗 Fetching from:', openSkyUrl);
    
    // Fetch from OpenSky
    const response = await fetch(openSkyUrl);
    
    if (!response.ok) {
      console.error(`❌ OpenSky API error: ${response.status}`);
      
      // Handle specific error codes
      if (response.status === 503) {
        return res.status(503).json({ 
          error: 'OpenSky Network is temporarily unavailable',
          message: 'The service is down or under maintenance. Try again in a few minutes.'
        });
      } else if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please wait before trying again.'
        });
      }
      
      return res.status(response.status).json({ 
        error: `OpenSky API returned status ${response.status}` 
      });
    }
    
    const data = await response.json();
    console.log(`✅ Retrieved ${data.states?.length || 0} aircraft states`);
    
    // Forward the response to the client
    res.json(data);
    
  } catch (error) {
    console.error('💥 Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy error',
      message: error.message 
    });
  }
});

app.listen(3001, () => {
  console.log('🚀 Server running on http://localhost:3001');
  console.log('📡 Audio API: http://localhost:3001/api/playlist');
  console.log('✈️  OpenSky Proxy: http://localhost:3001/api/opensky');
});
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Helper function to format filename to title
function formatTitle(filename) {
  // Remove .mp3 extension and flight ID prefix
  // e.g., "flight1-preflight.mp3" -> "Preflight"
  // e.g., "flight1-takeoff.mp3" -> "Takeoff"
  const withoutExt = filename.replace('.mp3', '');
  const parts = withoutExt.split('-');
  
  // Remove the flight ID part (e.g., "flight1")
  const titleParts = parts.slice(1);
  
  // Join and capitalize
  const title = titleParts
    .join(' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return title || 'Recording';
}

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

app.get('/api/flight/:flightId', (req, res) => {
  const flightId = req.params.flightId;
  const audioDir = path.join(__dirname, 'public', 'audio');
  
  try {
    // Normalize flightId: remove hyphens for file matching
    // e.g., "flight-1" becomes "flight1"
    const normalizedFlightId = flightId.replace(/-/g, '');
    
    console.log(`Looking for files starting with: ${normalizedFlightId}`);
    
    // Find all audio files matching this flight
    // e.g., flight1-preflight.mp3, flight1-takeoff.mp3
    const files = fs.readdirSync(audioDir);
    const flightAudios = files
      .filter(file => file.endsWith('.mp3') && file.startsWith(normalizedFlightId))
      .map((file, index) => ({
        id: index + 1,
        title: formatTitle(file),
        description: `Recording ${index + 1}`,
        audioUrl: `/audio/${file}`,
        duration: "0:00", // Placeholder
        timestamp: "N/A"   // Placeholder
      }));
    
    console.log(`Found ${flightAudios.length} audio files for ${flightId} (normalized: ${normalizedFlightId})`);
    
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

app.listen(3001, () => {
  console.log('Audio API running on http://localhost:3001');
});
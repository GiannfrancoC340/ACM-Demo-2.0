const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

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

app.listen(3001, () => {
  console.log('Audio API running on http://localhost:3001');
});
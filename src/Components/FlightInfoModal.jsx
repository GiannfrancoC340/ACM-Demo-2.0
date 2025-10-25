// FlightInfoModal.jsx - Modal component for displaying detailed flight information

import { useState, useRef, useEffect } from 'react';
import { flightData } from './maphelpers';
// import './FlightInfo.css';

export default function FlightInfoModal({ flightId, flights, onClose }) {
  // ===== ALL HOOKS MUST BE AT THE TOP - NO EARLY RETURNS BEFORE THIS SECTION =====
  
  // ALL useState declarations
  const [flightDetails, setFlightDetails] = useState(null);
  const [audioRecordings, setAudioRecordings] = useState([]);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedAudio, setSelectedAudio] = useState(0);
  
  // ALL useRef declarations
  const audioRef = useRef(null);

  // ALL useEffect declarations
  
  // 1. Load flight details with Firebase fallback
  useEffect(() => {
    const hardcodedFlight = flightData[flightId];
    
    if (hardcodedFlight) {
      console.log('✅ Using hardcoded flight data for:', flightId);
      setFlightDetails(hardcodedFlight);
    } else {
      // Firebase fallback
      console.log('⚠️ No hardcoded data, checking Firebase...');
      const firebaseFlight = flights.find(f => f.flightId === flightId);
      
      if (firebaseFlight) {
        console.log('✅ Using Firebase flight data for:', flightId);
        setFlightDetails(firebaseFlight);
      } else {
        console.error('❌ No flight data found for:', flightId);
      }
    }
  }, [flightId, flights]);

  // 2. Fetch audio recordings from backend
  useEffect(() => {
    const fetchAudioRecordings = async () => {
      try {
        setLoadingAudio(true);
        console.log('🎧 Fetching audio recordings for:', flightId);
        const response = await fetch(`http://localhost:3001/api/flight/${flightId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch audio recordings');
        }
        
        const data = await response.json();
        console.log('✅ Audio recordings fetched:', data.audioRecordings);
        setAudioRecordings(data.audioRecordings || []);
      } catch (error) {
        console.error('❌ Error fetching audio recordings:', error);
        
        // Fallback: Check if flightDetails has audio recordings
        if (flightDetails?.audioRecordings) {
          console.log('📦 Using audio from flight details fallback');
          setAudioRecordings(flightDetails.audioRecordings);
        } else {
          setAudioRecordings([]);
        }
      } finally {
        setLoadingAudio(false);
      }
    };
    
    if (flightId) {
      fetchAudioRecordings();
    }
  }, [flightId, flightDetails]);

  // 3. Handle play/pause logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    
    // Get current audio URL safely
    const audioUrl = audioRecordings[selectedAudio]?.audioUrl;
    console.log('Current audio URL:', audioUrl);
    console.log('Is playing:', isPlaying);
    
    if (!audioUrl) {
      console.log('No audio URL available');
      return;
    }

    if (isPlaying) {
      console.log('Attempting to play audio...');
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
      });
    } else {
      console.log('Pausing audio...');
      audio.pause();
    }
  }, [isPlaying, audioRecordings, selectedAudio]);

  // 4. Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      console.log('Metadata loaded, duration:', audio.duration);
      setDuration(audio.duration);
    };
    const handleEnded = () => {
      console.log('Audio ended');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // If audio is already loaded, set duration immediately
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRecordings, selectedAudio]);

  // 5. Reset audio when selection changes and load new source
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      
      // Get the new audio URL
      const newAudioUrl = audioRecordings[selectedAudio]?.audioUrl;
      console.log('Loading new audio source:', newAudioUrl);
      
      if (newAudioUrl) {
        audio.src = newAudioUrl;
        audio.load(); // Force the browser to load the new source
        console.log('Audio loaded, src set to:', audio.src);
      }
    }
  }, [selectedAudio, audioRecordings]);

  // ===== END OF HOOKS SECTION - NOW WE CAN DO CONDITIONAL LOGIC =====

  // Early return check - MUST be after all hooks
  if (!flightDetails) {
    return null;
  }

  // Safe to access flightDetails now
  const flight = flightDetails;
  const currentAudio = audioRecordings[selectedAudio] || null;
  
  // Handler functions
  const togglePlayPause = () => {
    console.log('Toggle play/pause clicked');
    console.log('Current audio:', currentAudio);
    
    if (!currentAudio?.audioUrl) {
      console.log('No audio URL - showing alert');
      alert('Audio file not available yet. This is a placeholder for future audio recordings.');
      return;
    }
    
    console.log('Setting isPlaying to:', !isPlaying);
    setIsPlaying(!isPlaying);
  };

  const handleAudioSelect = (index) => {
    console.log('Selecting audio:', index);
    setSelectedAudio(index);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render
  return (
    <div className="flight-modal-overlay" onClick={onClose}>
      <div className="flight-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <div className="flight-info-container">
          <div className="flight-header">
            <h1>{flight.route}</h1>
            <div className="flight-time">{flight.time}</div>
            <div className="flight-status">Status: <span className={`status ${flight.status.includes('Delayed') ? 'delayed' : 'on-time'}`}>{flight.status}</span></div>
          </div>
          
          <div className="flight-details">
            <div className="flight-card">
              <h2>Flight Details</h2>
              <table className="details-table">
                <tbody>
                  <tr>
                    <td>Airline:</td>
                    <td>{flight.airline}</td>
                  </tr>
                  <tr>
                    <td>Flight Number:</td>
                    <td>{flight.flightNumber}</td>
                  </tr>
                  <tr>
                    <td>Aircraft:</td>
                    <td>{flight.aircraft}</td>
                  </tr>
                  <tr>
                    <td>Duration:</td>
                    <td>{flight.duration}</td>
                  </tr>
                  <tr>
                    <td>Distance:</td>
                    <td>{flight.distance}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flight-card">
              <h2>Departure</h2>
              <div className="airport-code">{flight.departureAirport.code}</div>
              <div className="airport-name">{flight.departureAirport.name}</div>
              <div className="airport-location">{flight.departureAirport.city}, {flight.departureAirport.state}</div>
              
              <div className="time-info">
                <div className="time-label">Boarding Time:</div>
                <div className="time-value">{flight.boardingTime}</div>
              </div>
              
              <div className="gate-info">
                <span>Terminal: {flight.terminal}</span>
                <span>Gate: {flight.gate}</span>
              </div>
            </div>
            
            <div className="flight-card">
              <h2>Arrival</h2>
              <div className="airport-code">{flight.arrivalAirport.code}</div>
              <div className="airport-name">{flight.arrivalAirport.name}</div>
              <div className="airport-location">{flight.arrivalAirport.city}, {flight.arrivalAirport.state}</div>
              
              <div className="time-info">
                <div className="time-label">Estimated Arrival:</div>
                <div className="time-value">{flight.arrivalTime}</div>
              </div>
            </div>
          </div>

          {/* Audio Communications Section */}
          <div className="flight-details">
            <div className="flight-card audio-section">
              <h2>🎧 Audio Communications</h2>
              <p className="audio-description">Listen to recorded air traffic control communications for this flight</p>
              
              {loadingAudio ? (
                <p>Loading audio recordings...</p>
              ) : audioRecordings.length > 0 ? (
                <>
                  <div className="audio-recordings-list">
                    <h3>Available Recordings:</h3>
                    {audioRecordings.map((recording, index) => (
                      <div 
                        key={recording.id} 
                        className={`audio-item ${selectedAudio === index ? 'active' : ''}`}
                        onClick={() => handleAudioSelect(index)}
                      >
                        <div className="audio-item-header">
                          <span className="audio-title">{recording.title}</span>
                          <span className="audio-duration">{recording.duration}</span>
                        </div>
                        <div className="audio-item-details">
                          <span className="audio-description-text">{recording.description}</span>
                          <span className="audio-timestamp">Recorded at {recording.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Audio Player */}
                  {currentAudio && (
                    <div className="audio-player">
                      <h3>Now Playing: {currentAudio.title}</h3>
                      
                      {/* Audio element - src set dynamically in useEffect */}
                      <audio 
                        ref={audioRef}
                        style={{ display: 'none' }}
                      />
                      
                      <div className="audio-controls">
                        <button 
                          className="play-pause-btn" 
                          onClick={togglePlayPause}
                          disabled={!currentAudio.audioUrl}
                        >
                          {isPlaying ? '⏸️' : '▶️'}
                        </button>
                        
                        <div className="audio-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                            ></div>
                          </div>
                          <div className="time-display">
                            <span>{formatTime(currentTime)}</span>
                            <span>/</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {!currentAudio.audioUrl && (
                        <div className="audio-placeholder">
                          <p>📡 Audio recording will be available here once uploaded</p>
                          <p>File format: MP3, WAV, or OGG</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="audio-placeholder">
                  <p>📡 No audio recordings available for this flight</p>
                  <p>Add audio files to the <code>public/audio</code> folder with the naming pattern: <code>{flightId}-*.mp3</code></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
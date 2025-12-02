import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './AudioPlayer.css';
import { fetchLiveAircraft } from '../services/openSkyService';
import { convertLiveAircraftToFlight } from './maphelpers';
import { callsignsMatch } from './callsignHelper';

// Flight Details Display Component
function FlightDetailsDisplay({ flightInfo }) {
  if (!flightInfo) {
    return (
      <div className="flight-info-content">
        <p className="flight-info-placeholder">No live flight data for this recording</p>
      </div>
    );
  }

  return (
    <div className="flight-info-content">
      <div className="flight-info-grid">
        {/* Flight Details Column */}
        <div className="flight-info-column">
          <h4 className="flight-info-header">Flight Details</h4>
          <div className="flight-info-row">
            <span className="flight-info-label">Airline:</span>
            <span className="flight-info-value">{flightInfo.airline || 'Private Flight'}</span>
          </div>
          <div className="flight-info-row">
            <span className="flight-info-label">Flight Number:</span>
            <span className="flight-info-value">{flightInfo.flightNumber || 'N/A'}</span>
          </div>
          <div className="flight-info-row">
            <span className="flight-info-label">Aircraft:</span>
            <span className="flight-info-value">{flightInfo.aircraft || 'Unknown'}</span>
          </div>
          <div className="flight-info-row">
            <span className="flight-info-label">Duration:</span>
            <span className="flight-info-value">{flightInfo.duration || 'N/A'}</span>
          </div>
          {flightInfo.distance && (
            <div className="flight-info-row">
              <span className="flight-info-label">Distance:</span>
              <span className="flight-info-value">{flightInfo.distance}</span>
            </div>
          )}
        </div>

        {/* Departure Column */}
        <div className="flight-info-column">
          <h4 className="flight-info-header">Departure</h4>
          <div className="flight-airport-name">{flightInfo.departureAirport?.code || 'UNK'}</div>
          <div className="flight-location">{flightInfo.departureAirport?.name || 'Unknown'}</div>
          {flightInfo.departureAirport?.city && (
            <div className="flight-location">
              {flightInfo.departureAirport.city}
              {flightInfo.departureAirport.state && `, ${flightInfo.departureAirport.state}`}
            </div>
          )}
          {flightInfo.boardingTime && flightInfo.boardingTime !== 'N/A' && (
            <div className="flight-time">
              <span className="flight-time-label">Boarding Time:</span>
              <span className="flight-time-value">{flightInfo.boardingTime}</span>
            </div>
          )}
          {flightInfo.terminal && flightInfo.terminal !== 'Not Available' && (
            <div className="flight-info-small">Terminal: {flightInfo.terminal}</div>
          )}
          {flightInfo.gate && flightInfo.gate !== 'Not Available' && (
            <div className="flight-info-small">Gate: {flightInfo.gate}</div>
          )}
        </div>

        {/* Arrival Column */}
        <div className="flight-info-column">
          <h4 className="flight-info-header">Arrival</h4>
          <div className="flight-airport-name">{flightInfo.arrivalAirport?.code || 'UNK'}</div>
          <div className="flight-location">{flightInfo.arrivalAirport?.name || 'Unknown'}</div>
          {flightInfo.arrivalAirport?.city && (
            <div className="flight-location">
              {flightInfo.arrivalAirport.city}
              {flightInfo.arrivalAirport.state && `, ${flightInfo.arrivalAirport.state}`}
            </div>
          )}
          {flightInfo.arrivalTime && flightInfo.arrivalTime !== 'N/A' && (
            <div className="flight-time">
              <span className="flight-time-label">Estimated Arrival:</span>
              <span className="flight-time-value">{flightInfo.arrivalTime}</span>
            </div>
          )}
        </div>
      </div>
      {flightInfo.status && (
        <div className="flight-status-badge">
          Status: <span className="status-text">{flightInfo.status}</span>
        </div>
      )}
    </div>
  );
}

// Stress Indicator Component - Compact One-Line Display
function StressIndicator({ percentage, error }) {
  if (error) {
    return (
      <div className="stress-indicator-compact">
        <span className="stress-label-compact">Stress Level:</span>
        <span className="stress-value-compact stress-unavailable-text">Not Available</span>
      </div>
    );
  }
  
  if (percentage === null || percentage === undefined) {
    return (
      <div className="stress-indicator-compact">
        <span className="stress-label-compact">Stress Level:</span>
        <span className="stress-value-compact stress-unavailable-text">No Data</span>
      </div>
    );
  }
  
  // Determine color based on percentage
  let colorClass = 'stress-low-text'; // green
  if (percentage >= 60) {
    colorClass = 'stress-high-text'; // red
  } else if (percentage >= 30) {
    colorClass = 'stress-medium-text'; // yellow
  }
  
  return (
    <div className="stress-indicator-compact">
      <span className="stress-label-compact">Stress Level:</span>
      <span className={`stress-value-compact ${colorClass}`}>{percentage.toFixed(1)}%</span>
    </div>
  );
}

export default function AudioPlayer() {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState([]);
  const [filteredPlaylist, setFilteredPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // null = show all
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [recordingsByDate, setRecordingsByDate] = useState({});
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'alphabetical'
  const [timelineDays, setTimelineDays] = useState(14); // Default to 14 days

  useEffect(() => {
    const fetchPlaylist = () => {
      fetch('http://localhost:3001/api/playlist')
        .then(res => {
          if (!res.ok) {
            throw new Error('Backend server is offline');
          }
          return res.json();
        })
        .then(data => {
          // Sort by newest first (reverse chronological)
          const sortedData = [...data].sort((a, b) => {
            // Extract timestamp from filename or use title
            const getTimestamp = (item) => {
              const match = item.url.match(/(\d+)/);
              return match ? parseInt(match[1]) : 0;
            };
            return getTimestamp(b) - getTimestamp(a);
          });
          
          setPlaylist(sortedData);
          setLoading(false);
          setBackendError(false);
          
          // Process dates for timeline - use ref to get current value
          processRecordingDates(sortedData, timelineDaysRef.current);
        })
        .catch(err => {
          console.error('Error loading playlist:', err);
          setBackendError(true);
          setLoading(false);
        });
    };
    
    fetchPlaylist();
    const interval = setInterval(fetchPlaylist, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Process recording dates and group by day
  const processRecordingDates = async (data, days) => {
    console.log('processRecordingDates called with days:', days);
    try {
      const response = await fetch('http://localhost:3001/api/recording-dates');
      const dateData = await response.json();
      
      // Group recordings by date
      const grouped = {};
      dateData.forEach(item => {
        const date = new Date(item.date).toDateString();
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(item.filename);
      });
      
      setRecordingsByDate(grouped);
      
      // Set date range (past N days to today based on timelineDays)
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      
      console.log('Setting date range:', { start, end, days });
      setDateRange({ start, end });
      
    } catch (error) {
      console.error('Error fetching recording dates:', error);
      // Fallback: use current dates
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      setDateRange({ start, end });
    }
  };

  // Filter and sort playlist based on selected date and sort order
  useEffect(() => {
    let filtered;
    if (!selectedDate) {
      filtered = [...playlist];
    } else {
      filtered = playlist.filter(track => {
        const trackDate = recordingsByDate[selectedDate]?.includes(track.url.split('/').pop());
        return trackDate;
      });
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'newest') {
        const getTimestamp = (item) => {
          const match = item.url.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        };
        return getTimestamp(b) - getTimestamp(a);
      } else if (sortOrder === 'oldest') {
        const getTimestamp = (item) => {
          const match = item.url.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        };
        return getTimestamp(a) - getTimestamp(b);
      } else if (sortOrder === 'alphabetical') {
        return a.title.localeCompare(b.title);
      } else if (sortOrder === 'alphabetical reverse') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });
    
    setFilteredPlaylist(sorted);
  }, [selectedDate, playlist, recordingsByDate, sortOrder]);
  
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcriptText, setTranscriptText] = useState('');
  const [stressData, setStressData] = useState({});
  const [flightInfo, setFlightInfo] = useState(null);
  const audioRef = useRef(null);
  const timelineRef = useRef(null);
  const timelineDaysRef = useRef(14); // Ref to track current timeline days for interval

  // Extract flight ID from audio filename
  const extractFlightId = (audioUrl) => {
    if (!audioUrl) return null;
    const filename = audioUrl.split('/').pop(); // Get filename from URL
    const baseName = filename.replace(/\.(mp3|wav)$/i, ''); // Remove extension
    
    // Extract flight identifier from filename
    // Patterns: "N738WC...", "LXJ449...", "AAL1234...", etc.
    const match = baseName.match(/^([A-Z0-9]+)/i);
    return match ? match[1] : null;
  };

  // Calculate distance from BCT airport
  const calculateDistanceFromBCT = (lat, lng) => {
    const BCT_LAT = 26.3785;
    const BCT_LNG = -80.1077;
    const R = 6371; // Earth's radius in km
    
    const dLat = (lat - BCT_LAT) * Math.PI / 180;
    const dLng = (lng - BCT_LNG) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(BCT_LAT * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  useEffect(() => {
    const loadTranscript = async () => {
      const currentTranscript = filteredPlaylist[currentTrack]?.transcript;
      if (currentTranscript) {
        try {
          const response = await fetch(currentTranscript);
          const text = await response.text();
          setTranscriptText(text);
        } catch (error) {
          console.error('Error loading transcript:', error);
          setTranscriptText('Transcript not available.');
        }
      } else {
        setTranscriptText('No transcript available for this recording.');
      }
    };
    
    const loadStressData = async () => {
      const currentAudioUrl = filteredPlaylist[currentTrack]?.url;
      if (currentAudioUrl) {
        try {
          // Replace audio extension with .txt for stress detection file
          const stressUrl = currentAudioUrl.replace(/\.(mp3|wav)$/i, '_stress.txt');
          const response = await fetch(stressUrl);
          const text = await response.text();
          
          // Parse stress percentage from file (expecting format like "Stress: 45%")
          const match = text.match(/(\d+\.?\d*)%/);
          if (match) {
            const percentage = parseFloat(match[1]);
            setStressData({ percentage, raw: text });
          } else {
            setStressData({ percentage: null, raw: text });
          }
        } catch (error) {
          console.error('Error loading stress data:', error);
          setStressData({ percentage: null, error: 'Stress data not available' });
        }
      }
    };

    const loadFlightInfo = async () => {
      const currentAudioUrl = filteredPlaylist[currentTrack]?.url;
      const flightId = extractFlightId(currentAudioUrl);
      
      if (flightId) {
        try {
          console.log(`🔍 Looking for live flight data for: ${flightId}`);
          
          // Fetch live aircraft near BCT
          const liveData = await fetchLiveAircraft(50); // 50km radius
          
          if (liveData && liveData.aircraft) {
            // Try to find matching aircraft by callsign (with IATA/ICAO variants) or ICAO24
            const matchedAircraft = liveData.aircraft.find(plane => {
              const icao24 = plane.icao24?.trim().toUpperCase();
              const searchId = flightId.toUpperCase();
              
              // Check ICAO24 match first (for tail numbers)
              if (icao24 === searchId) {
                return true;
              }
              
              // Check callsign with flexible IATA/ICAO matching
              if (plane.callsign && callsignsMatch(flightId, plane.callsign)) {
                return true;
              }
              
              return false;
            });
            
            if (matchedAircraft) {
              console.log(`✅ Found matching aircraft:`, matchedAircraft);
              
              // Determine if departing or arriving based on distance/heading
              const distance = parseFloat(matchedAircraft.latitude && matchedAircraft.longitude 
                ? calculateDistanceFromBCT(matchedAircraft.latitude, matchedAircraft.longitude) 
                : 999);
              
              const isDeparting = distance < 10; // Within 10km = likely departing
              
              // Convert to full flight details using your existing helper
              const flightDetails = await convertLiveAircraftToFlight(
                matchedAircraft,
                isDeparting ? 'departing' : 'arriving',
                true // enrichWithAPI
              );
              
              console.log(`✈️ Flight details enriched:`, flightDetails);
              setFlightInfo(flightDetails);
            } else {
              console.log(`❌ No matching aircraft found for ${flightId}`);
              setFlightInfo(null);
            }
          } else {
            console.log(`❌ No live aircraft data available`);
            setFlightInfo(null);
          }
        } catch (error) {
          console.error('Error loading flight info:', error);
          setFlightInfo(null);
        }
      } else {
        setFlightInfo(null);
      }
    };
    
    if (filteredPlaylist.length > 0) {
      loadTranscript();
      loadStressData();
      loadFlightInfo();
    }
  }, [currentTrack, filteredPlaylist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentTrack < filteredPlaylist.length - 1) {
        setCurrentTrack(currentTrack + 1);
      } else {
        setIsPlaying(false);
        setCurrentTrack(0);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, filteredPlaylist.length]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTrackSelect = (index) => {
    setCurrentTrack(index);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (currentTrack > 0) {
      setCurrentTrack(currentTrack - 1);
    }
  };

  const handleNext = () => {
    if (currentTrack < filteredPlaylist.length - 1) {
      setCurrentTrack(currentTrack + 1);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  // Generate array of dates for timeline
  const generateTimelineDates = () => {
    if (!dateRange.start || !dateRange.end) return [];
    
    const dates = [];
    const current = new Date(dateRange.start);
    
    while (current <= dateRange.end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const timelineDates = generateTimelineDates();

  // Update date range when timelineDays changes
  useEffect(() => {
    console.log('timelineDays changed to:', timelineDays);
    timelineDaysRef.current = timelineDays; // Update ref
    if (playlist.length > 0) {
      processRecordingDates(playlist, timelineDays);
    }
  }, [timelineDays]);

  // Auto-scroll timeline to show most recent dates (only on initial load or when days change)
  useEffect(() => {
    if (timelineRef.current && timelineDates.length > 0) {
      // Scroll to the far right to show newest dates
      timelineRef.current.scrollLeft = timelineRef.current.scrollWidth;
    }
  }, [timelineDays, playlist.length]); // Only trigger when timeline days or initial playlist loads

  // Backend Error State
  if (backendError) {
    return (
      <div className="audio-player-page">
        {/* Blurred Map Background */}
        <div className="audio-map-background">
          <MapContainer
            center={[26.3683, -80.1289]} // BCT airport coordinates
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>
        </div>

        {/* Fixed Navbar */}
        <nav className="audio-navbar">
          <div className="navbar-content">
            <div className="navbar-left">
              <h1 className="navbar-title">ACM</h1>
              <div className="navbar-divider"></div>
              <Link to="/map" className="navbar-btn">
                ← Back to Map
              </Link>
              <button className="navbar-btn" onClick={() => navigate('/settings')}>
                ⚙️ Settings
              </button>
            </div>
          </div>
        </nav>

        <div className="audio-player-container">
          <h1 className="audio-player-title">Audio Player</h1>
          
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Backend Server Offline</h2>
            <p>Unable to connect to the audio server. Please make sure the backend is running.</p>
            <div className="error-details">
              <p><strong>To start the server:</strong></p>
              <code>node server.js</code>
            </div>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="audio-player-page">
        {/* Blurred Map Background */}
        <div className="audio-map-background">
          <MapContainer
            center={[26.3683, -80.1289]} // BCT airport coordinates
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>
        </div>

        {/* Fixed Navbar */}
        <nav className="audio-navbar">
          <div className="navbar-content">
            <div className="navbar-left">
              <h1 className="navbar-title">ACM</h1>
              <div className="navbar-divider"></div>
              <Link to="/map" className="navbar-btn">
                ← Back to Map
              </Link>
              <button className="navbar-btn" onClick={() => navigate('/settings')}>
                ⚙️ Settings
              </button>
            </div>
          </div>
        </nav>

        <div className="audio-player-container">
          <h1 className="audio-player-title">Audio Player</h1>
          
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading playlist...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty Playlist State
  if (playlist.length === 0) {
    return (
      <div className="audio-player-page">
        {/* Blurred Map Background */}
        <div className="audio-map-background">
          <MapContainer
            center={[26.3683, -80.1289]} // BCT airport coordinates
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>
        </div>

        {/* Fixed Navbar */}
        <nav className="audio-navbar">
          <div className="navbar-content">
            <div className="navbar-left">
              <h1 className="navbar-title">ACM</h1>
              <div className="navbar-divider"></div>
              <Link to="/map" className="navbar-btn">
                ← Back to Map
              </Link>
              <button className="navbar-btn" onClick={() => navigate('/settings')}>
                ⚙️ Settings
              </button>
            </div>
          </div>
        </nav>

        <div className="audio-player-container">
          <h1 className="audio-player-title">Audio Player</h1>
          
          <div className="empty-state">
            <div className="empty-icon">🎵</div>
            <h2>No Audio Files Found</h2>
            <p>Your playlist is empty. Add some audio files to get started!</p>
            <div className="empty-instructions">
              <p><strong>To add audio files:</strong></p>
              <ol>
                <li>Place .mp3 or .WAV files in the <code>public/audio</code> folder</li>
                <li>Optionally add .txt transcripts with matching filenames</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="audio-player-page">
      {/* Blurred Map Background */}
      <div className="audio-map-background">
        <MapContainer
          center={[26.3683, -80.1289]} // BCT airport coordinates
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
      </div>

      {/* Fixed Navbar */}
      <nav className="audio-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <h1 className="navbar-title">ACM</h1>
            <div className="navbar-divider"></div>
            <Link to="/map" className="navbar-btn">
              ← Back to Map
            </Link>
            <button className="navbar-btn" onClick={() => navigate('/settings')}>
              ⚙️ Settings
            </button>
          </div>
        </div>
      </nav>

      <div className="audio-player-container">
        <h1 className="audio-player-title">Audio Player</h1>
        
        {/* Split Panel Layout */}
        <div className="split-panel-container">
          {/* Left Panel: Timeline & Playlist */}
          <div className="left-panel">
            {/* Timeline Filter */}
            <div className="timeline-filter-card">
          <div className="timeline-header">
            <div className="timeline-title-group">
              <h3 className="timeline-title">📅 Recording Timeline</h3>
              <select 
                value={timelineDays} 
                onChange={(e) => setTimelineDays(parseInt(e.target.value))}
                className="timeline-days-select"
              >
                <option value={7}>Past 7 Days</option>
                <option value={14}>Past 14 Days</option>
                <option value={21}>Past 21 Days</option>
                <option value={28}>Past 28 Days</option>
                <option value={35}>Past 35 Days</option>
              </select>
            </div>
            {selectedDate && (
              <button onClick={clearDateFilter} className="clear-filter-btn">
                Clear Filter
              </button>
            )}
          </div>
          
          <div className="timeline-container" ref={timelineRef}>
            <div className="timeline-scroll">
              {timelineDates.map((date, index) => {
                const dateStr = date.toDateString();
                const hasRecordings = recordingsByDate[dateStr]?.length > 0;
                const isSelected = dateStr === selectedDate;
                
                return (
                  <div 
                    key={index} 
                    className={`timeline-tick ${hasRecordings ? 'has-recordings' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => hasRecordings && handleDateSelect(dateStr)}
                    title={`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${hasRecordings ? ` - ${recordingsByDate[dateStr].length} recording(s)` : ''}`}
                  >
                    <div className="tick-mark"></div>
                    {hasRecordings && (
                      <div className="recording-indicator">
                        <span className="recording-count">{recordingsByDate[dateStr].length}</span>
                      </div>
                    )}
                    {(index % 5 === 0 || hasRecordings) && (
                      <div className="tick-label">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {selectedDate && (
            <div className="filter-status">
              Showing recordings from: <strong>{new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
              {' '}({filteredPlaylist.length} recording{filteredPlaylist.length !== 1 ? 's' : ''})
            </div>
          )}

        {/* Playlist Section - Same Card */}
        <div className="playlist-section">
          <div className="playlist-header">
            <h3 className="playlist-title">
              Playlist 
              {selectedDate && ` - ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </h3>
            <div className="sort-controls">
              <label htmlFor="sort-select" className="sort-label">Sort:</label>
              <select 
                id="sort-select"
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">A-Z</option>
                <option value="alphabetical reverse">Z-A</option>
              </select>
            </div>
          </div>
          <div className="playlist-items">
            {filteredPlaylist.length === 0 ? (
              <div className="empty-filter-message">
                <p>No recordings found for this date.</p>
                <button onClick={clearDateFilter} className="clear-filter-btn">
                  Show All Recordings
                </button>
              </div>
            ) : (
              filteredPlaylist.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackSelect(index)}
                  className={`playlist-item ${currentTrack === index ? 'active' : ''}`}
                >
                  <div className="playlist-item-content">
                    <div className="playlist-item-info">
                      <span className="track-number">#{index + 1}</span>
                      <span className="track-title">{track.title}</span>
                    </div>
                    {currentTrack === index && isPlaying && (
                      <div className="playing-indicator">
                        <div className="playing-bar"></div>
                        <div className="playing-bar"></div>
                        <div className="playing-bar"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </div> {/* End timeline-filter-card (combined with playlist) */}
          </div> {/* End left-panel */}

        <audio ref={audioRef} src={filteredPlaylist[currentTrack]?.url} />

          {/* Right Panel: Player Controls, Live Flight Details & Stress Analysis */}
          <div className="right-panel">
            {/* Combined Player Card - Now Playing + Flight Details + Stress Analysis */}
            <div className="combined-player-card">
              {/* Now Playing Section */}
              <div className="now-playing-section">
                <h2 className="now-playing-title">Now Playing</h2>
                <p className="current-track-title">
                  {filteredPlaylist[currentTrack]?.title}
                </p>

                {/* Progress Bar */}
                <div className="progress-container">
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleSeek}
              className="progress-bar"
            />
            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="controls-container">
            <button
              onClick={handlePrevious}
              disabled={currentTrack === 0}
              className="control-btn"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 12L18 6V18L11 12Z" fill="currentColor"/>
                <path d="M6 12L13 6V18L6 12Z" fill="currentColor"/>
                <path d="M1 12L8 6V18L1 12Z" fill="currentColor"/>
              </svg>
            </button>

            <button
              onClick={togglePlayPause}
              className="play-pause-btn"
            >
              {isPlaying ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 5H10V19H6V5Z" fill="currentColor"/>
                  <path d="M14 5H18V19H14V5Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentTrack === filteredPlaylist.length - 1}
              className="control-btn"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 12L6 18V6L13 12Z" fill="currentColor"/>
                <path d="M18 12L11 18V6L18 12Z" fill="currentColor"/>
                <path d="M23 12L16 18V6L23 12Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Live Flight Details Section - Shows if audio has corresponding flight */}
        <div className="flight-details-section">
          <div className="section-divider"></div>
          <h3 className="flight-details-title">✈️ Live Flight Details</h3>
          <FlightDetailsDisplay flightInfo={flightInfo} />
        </div>

        {/* Stress Analysis Section */}
        <div className="stress-analysis-section">
          <div className="section-divider"></div>
          <h3 className="stress-title">📊 Stress Analysis</h3>
          <div className="stress-content">
            <StressIndicator 
              percentage={stressData.percentage} 
              error={stressData.error} 
            />
          </div>
        </div>
            </div> {/* End combined-player-card */}
          </div> {/* End right-panel */}
        </div> {/* End split-panel-container */}
      </div> {/* End audio-player-container */}
      
      {/* Transcript Section - Full Width Outside Container */}
      <div className="transcript-card">
        <h3 className="transcript-title">📝 Transcript</h3>
        <div className="transcript-content">
          <div className="transcript-text">
            {transcriptText ? (
              transcriptText.split('\n').map((line, index) => (
                line.trim() ? <p key={index}>{line}</p> : <div key={index} className="line-break"></div>
              ))
            ) : (
              <p>Loading transcript...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';

export default function AudioPlayer() {
  const [playlist] = useState([
    // Add your MP3 files here - place them in /public/audio/ folder
    { 
      id: 1, 
      title: "Flight Recording 1", 
      url: "/audio/recording1.mp3",
      transcript: "/audio/recording1.txt"
    },
    { 
      id: 2, 
      title: "Flight Recording 2", 
      url: "/audio/recording2.mp3",
      transcript: "/audio/recording2.txt"
    },
    { 
      id: 3, 
      title: "Flight Recording 3", 
      url: "/audio/recording3.mp3",
      transcript: "/audio/recording3.txt"
    },
    // Add more files as needed
  ]);
  
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcriptText, setTranscriptText] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const loadTranscript = async () => {
      const currentTranscript = playlist[currentTrack]?.transcript;
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
    
    loadTranscript();
  }, [currentTrack, playlist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentTrack < playlist.length - 1) {
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
  }, [currentTrack, playlist.length]);

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
    if (currentTrack < playlist.length - 1) {
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

  return (
    <div className="audio-player-page">
      <div className="audio-player-container">
        <h1 className="audio-player-title">Audio Player</h1>
        
        <audio ref={audioRef} src={playlist[currentTrack]?.url} />

        {/* Now Playing Card */}
        <div className="now-playing-card">
          <h2 className="now-playing-title">Now Playing</h2>
          <p className="current-track-title">
            {playlist[currentTrack]?.title}
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
                ⏮️
            </button>

            <button
                onClick={togglePlayPause}
                className="play-pause-btn"
            >
                {isPlaying ? '⏸️' : '▶️'}
            </button>

            <button
                onClick={handleNext}
                disabled={currentTrack === playlist.length - 1}
                className="control-btn"
            >
                ⏭️
            </button>
            </div>
        </div>

        {/* Playlist */}
        <div className="playlist-card">
          <h3 className="playlist-title">Playlist</h3>
          <div className="playlist-items">
            {playlist.map((track, index) => (
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
            ))}
          </div>
        </div>

        {/* Transcript Section */}
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
    </div>
  );
}
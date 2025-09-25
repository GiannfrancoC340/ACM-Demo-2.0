import { useState, useRef, useEffect } from 'react';

export default function AudioPlayer() {
  const [playlist] = useState([
    // Add your MP3 files here - place them in /public/audio/ folder
    { id: 1, title: "Flight Recording 1", url: "/audio/recording1.mp3" },
    { id: 2, title: "Flight Recording 2", url: "/audio/recording2.mp3" },
    { id: 3, title: "Flight Recording 3", url: "/audio/recording3.mp3" },
    // Add more files as needed
  ]);
  
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Audio Player</h1>
        
        {/* Audio element */}
        <audio
          ref={audioRef}
          src={playlist[currentTrack]?.url}
        />

        {/* Now Playing Card */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Now Playing
          </h2>
          <p className="text-xl text-center mb-6 text-gray-300">
            {playlist[currentTrack]?.title}
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handlePrevious}
              disabled={currentTrack === 0}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            <button
              onClick={togglePlayPause}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition"
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentTrack === playlist.length - 1}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 18h2V6h-2zm-11-7l8.5-6v12z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Playlist */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
          <h3 className="text-xl font-semibold mb-4">Playlist</h3>
          <div className="space-y-2">
            {playlist.map((track, index) => (
              <div
                key={track.id}
                onClick={() => handleTrackSelect(index)}
                className={`p-4 rounded-lg cursor-pointer transition ${
                  currentTrack === index
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">#{index + 1}</span>
                    <span className="font-medium">{track.title}</span>
                  </div>
                  {currentTrack === index && isPlaying && (
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-white animate-pulse"></div>
                      <div className="w-1 h-4 bg-white animate-pulse delay-75"></div>
                      <div className="w-1 h-4 bg-white animate-pulse delay-150"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
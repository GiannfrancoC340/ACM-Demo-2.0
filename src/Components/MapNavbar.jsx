// src/components/MapNavbar.jsx
import { Link } from 'react-router-dom';

export default function MapNavbar({
  showLiveAircraft,
  setShowLiveAircraft,
  showRadius,
  setShowRadius,
  searchRadius,
  setSearchRadius,
  apiCallCount,
  positionDelay,
  setPositionDelay
}) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      background: 'white',
      padding: '12px 20px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '15px',
      alignItems: 'center',
      justifyContent: 'flex-start',  // Changed from flex-start to space-between
      flexWrap: 'nowrap',
      borderBottom: '1px solid #e0e0e0',
      overflowX: 'auto',  // Allow horizontal scroll if needed (rare)
    }}>
      {/* Left section - Brand + Links */}
      <div style={{
        display: 'flex',
        gap: '15px',  // Reduced from 20px
        alignItems: 'center',
        flexWrap: 'nowrap',
        flexShrink: 0
      }}>
        {/* Brand section */}
        <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#e04141',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }}>
            ✈️ ACM
        </div>
        
        <div style={{
            height: '30px',
            width: '1px',
            backgroundColor: '#e0e0e0'
        }}></div>

        {/* Audio Recordings Link */}
        <Link 
          to="/audio" 
          style={{
            padding: '10px 20px',
            backgroundColor: '#e04141',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#c63030'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#e04141'}
        >
          🎧 Audio
        </Link>

        {/* Settings Link */}
        <Link 
          to="/settings" 
          style={{
            padding: '10px 20px',
            backgroundColor: '#4285f4',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#3367d6'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4285f4'}
        >
          ⚙️ Settings
        </Link>
      </div>

      <div style={{
        height: '30px',
        width: '1px',
        backgroundColor: '#e0e0e0',
        flexShrink: 0
      }}></div>

      {/* Middle section - Controls */}
      <div style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'nowrap',
        minWidth: 0
      }}>
        {/* Live Aircraft Toggle */}
        <button
          onClick={() => setShowLiveAircraft(!showLiveAircraft)}
          style={{
            padding: '10px 15px',
            backgroundColor: showLiveAircraft ? '#10b981' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          ✈️ Live: {showLiveAircraft ? 'ON' : 'OFF'}
        </button>

        {/* Show Radius Checkbox */}
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          fontSize: '0.9rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          <input
            type="checkbox"
            checked={showRadius}
            onChange={(e) => setShowRadius(e.target.checked)}
          />
          Show Radius
        </label>

        {/* Search Radius Slider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          minWidth: '160px',
          flexShrink: 1
        }}>
          <label style={{ 
            fontSize: '0.9rem', 
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            Radius: {searchRadius} km
          </label>
          <input
            type="range"
            min="10"
            max="150"
            step="10"
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            style={{ width: '120px' }}
          />
        </div>
      </div>

      {/* Right section - Status indicators */}
      <div style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'nowrap',
        flexShrink: 0
      }}>
        {/* Delay Status Indicator - Now on the right! */}
        {showLiveAircraft && (
          <div style={{ 
            padding: '8px 16px',
            backgroundColor: positionDelay > 0 ? '#fff3cd' : '#d1fae5',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            border: `2px solid ${positionDelay > 0 ? '#f59e0b' : '#10b981'}`,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            justifyContent: 'flex-start'
          }}>
            <span style={{ fontSize: '1rem' }}>
              {positionDelay > 0 ? '🕐' : '🔴'}
            </span>
            <span>
              {positionDelay > 0 
                ? `DELAYED (${positionDelay} min)` 
                : 'LIVE'
              }
            </span>
          </div>
        )}

        {/* API Counter */}
        <div style={{ 
            padding: '8px 16px', 
            backgroundColor: apiCallCount >= 95 ? '#fee2e2' : apiCallCount >= 80 ? '#fff3cd' : '#f0f9ff',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            border: `2px solid ${apiCallCount >= 95 ? '#ef4444' : apiCallCount >= 80 ? '#f59e0b' : '#3b82f6'}`,
            whiteSpace: 'nowrap',
            flexShrink: 0
        }}>
            {apiCallCount >= 95 ? '🚨' : apiCallCount >= 80 ? '⚠️' : '📊'} API: {apiCallCount}/100
        </div>
      </div>
    </div>
  );
}
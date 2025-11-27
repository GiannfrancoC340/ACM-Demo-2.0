import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    refreshInterval: 30,
    mapStyle: 'standard',
    positionDelay: 3,  // NEW: Add position delay setting (default 3 minutes)
    showTrails: true
  });
  const [savedSettings, setSavedSettings] = useState(null); // Track last saved state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Get username from Firebase auth AND load saved settings
  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.email) {
      const emailUsername = user.email.split('@')[0];
      setUsername(emailUsername);
      setUserEmail(user.email);
    }

    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsed
        }));
        setSavedSettings(parsed); // Store the saved baseline
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    } else {
      // No saved settings, use defaults as baseline
      setSavedSettings(settings);
    }
  }, []);

  // Detect unsaved changes
  useEffect(() => {
    if (savedSettings) {
      const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);
      setHasUnsavedChanges(hasChanges);
    }
  }, [settings, savedSettings]);

  // Protect against browser back button and mouse navigation buttons
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        return '';
      }
    };

    const handlePopState = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        // Push state back to keep user on settings page
        window.history.pushState(null, '', window.location.pathname);
        setShowUnsavedWarning(true);
        setPendingNavigation(-1); // Special value to indicate browser back
      }
    };

    // Add extra history entry to intercept back navigation
    if (hasUnsavedChanges) {
      window.history.pushState(null, '', window.location.pathname);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSavedSettings(settings); // Update the baseline
    setHasUnsavedChanges(false);
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    const defaultSettings = {
      notifications: true,
      refreshInterval: 30,
      mapStyle: 'standard',
      positionDelay: 3,
      showTrails: true
    };
    setSettings(defaultSettings);
    setSavedSettings(defaultSettings); // Update baseline
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
    setHasUnsavedChanges(false);
    alert('Settings reset to defaults!');
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
      setPendingNavigation('/map');
    } else {
      navigate('/map');
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedWarning(false);
    setHasUnsavedChanges(false); // Clear the flag to allow navigation
    if (pendingNavigation === -1) {
      // Browser back button was used
      window.history.back();
    } else if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleSaveAndNavigate = () => {
    handleSave();
    setShowUnsavedWarning(false);
    if (pendingNavigation === -1) {
      // Browser back button was used
      window.history.back();
    } else if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedWarning(false);
    setPendingNavigation(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error logging out. Please try again.');
    }
  };

  const handleConnectWhatsApp = () => {
    // TODO: Implement WhatsApp connection flow
    alert('WhatsApp notifications coming soon! This will allow you to receive flight alerts via WhatsApp.');
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <h1>Settings</h1>
        </div>

        <div className="settings-content">
          {/* Welcome Section */}
          {username && (
            <div className="welcome-section">
              <h2>👋 Welcome back, {username}!</h2>
              <p className="welcome-message">{userEmail}</p>
            </div>
          )}

          <div className="settings-section">
            <h2>General</h2>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Enable Notifications</label>
                <p className="setting-description">Receive alerts for flight updates</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h2>Map Settings</h2>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Refresh Interval</label>
                <p className="setting-description">Time between automatic updates (seconds)</p>
              </div>
              <select
                className="setting-select"
                value={settings.refreshInterval}
                onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
              >
                <option value="10">10 seconds</option>
                <option value="20">20 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="90">1.5 minutes</option>
                <option value="120">2 minutes</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>Map Style</label>
                <p className="setting-description">Choose map appearance</p>
              </div>
              <select
                className="setting-select"
                value={settings.mapStyle}
                onChange={(e) => handleSettingChange('mapStyle', e.target.value)}
              >
                <option value="standard">Standard</option>
                <option value="satellite">Satellite</option>
                <option value="dark">Dark</option>
                <option value="terrain">Terrain</option>
              </select>
            </div>
          </div>

          {/* NEW: Audio Sync Settings Section */}
          <div className="settings-section">
            <h2>🎧 Audio Synchronization</h2>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Position Delay: {settings.positionDelay} minutes</label>
                <p className="setting-description">
                  {settings.positionDelay === 0 
                    ? '🔴 Real-time mode - Shows current aircraft positions' 
                    : `🕐 Delayed mode - Shows positions from ${settings.positionDelay} minute${settings.positionDelay !== 1 ? 's' : ''} ago for audio transcription sync`
                  }
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px',
                minWidth: '250px'
              }}>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={settings.positionDelay}
                  onChange={(e) => handleSettingChange('positionDelay', parseFloat(e.target.value))}
                  style={{ 
                    flex: 1,
                    minWidth: '150px'
                  }}
                />
                <span style={{
                  minWidth: '60px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  backgroundColor: settings.positionDelay > 0 ? '#fff3cd' : '#d1fae5',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}>
                  {settings.positionDelay} min
                </span>
              </div>
            </div>

            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1e40af' }}>
                ℹ️ What is Position Delay?
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                Position delay synchronizes aircraft positions with audio transcription processing time. 
                When set to 3 minutes, the map shows where aircraft were 3 minutes ago, matching when 
                the audio was recorded and transcribed.
              </p>
            </div>
          </div>

          <div className="settings-section">
            <h2>Display</h2>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Show Aircraft Trails</label>
                <p className="setting-description">Display flight path history on the map</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.showTrails}
                  onChange={(e) => handleSettingChange('showTrails', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Account Section - Only shows if user is logged in */}
          {username && (
            <div className="settings-section">
              <h2>Account</h2>
              <div className="account-actions">
                <button
                  className="whatsapp-connect-button"
                  onClick={handleConnectWhatsApp}
                >
                  💬 Connect WhatsApp
                </button>

                <button className="logout-button" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            </div>
          )}

          <div className="settings-section">
            <h2>About</h2>
            <div className="about-info">
              <p><strong>App Version:</strong> 1.0.0</p>
              <p><strong>Build:</strong> 2025.11.22</p>
              <p><strong>Developer:</strong> ACM Team</p>
            </div>
          </div>

          <div className="settings-section">
            <h2>Thanks</h2>
            <div className="thanks-info">
              <p>I want to thank the following people for helping out on this project:</p>
              {/* <p>Joshua Castro-Munoz for demo testing the project</p>
              <p>Lorem ipsum</p> */}
            </div>
          </div>

          <div className="settings-actions">
            <button 
              className={`save-button ${hasUnsavedChanges ? 'has-changes' : ''}`}
              onClick={handleSave}
            >
              💾 Save Settings {hasUnsavedChanges && '•'}
            </button>
            <button className="reset-button" onClick={handleReset}>
              🔄 Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>⚠️ Unsaved Changes</h2>
            <p>You have unsaved changes. What would you like to do?</p>
            <div className="modal-buttons">
              <button className="modal-save-button" onClick={handleSaveAndNavigate}>
                💾 Save & Leave
              </button>
              <button className="modal-discard-button" onClick={handleDiscardChanges}>
                🗑️ Discard Changes
              </button>
              <button className="modal-cancel-button" onClick={handleCancelNavigation}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
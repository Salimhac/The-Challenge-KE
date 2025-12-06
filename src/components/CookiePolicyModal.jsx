import { useEffect } from 'react';
import './CookiePolicyModal.css';

const CookiePolicyModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAcceptAll = () => {
    // Set all cookie preferences to accepted
    localStorage.setItem('cookiePreferences', JSON.stringify({
      essential: true,
      functional: true,
      analytics: true,
      marketing: false,
      dateAccepted: new Date().toISOString()
    }));
    onClose();
  };

  const handleSettings = () => {
    // Open detailed cookie settings
    alert('Detailed cookie settings panel would open here');
  };

  const handleEssentialOnly = () => {
    // Set only essential cookies
    localStorage.setItem('cookiePreferences', JSON.stringify({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      dateAccepted: new Date().toISOString()
    }));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cookie-modal-overlay" onClick={onClose}>
      <div className="cookie-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="cookie-modal-close" onClick={onClose}>×</button>
        
        <div className="cookie-header">
          <h2 className="cookie-title">Cookie Policy</h2>
          <p className="cookie-subtitle">
            We use cookies to enhance your browsing experience and analyze our traffic
          </p>
        </div>
        
        <div className="cookie-body">
          <div className="cookie-section">
            <div className="cookie-icon-title">
              <span className="section-icon">🍪</span>
              <h3 className="section-title">What Are Cookies?</h3>
            </div>
            <p className="cookie-description">
              Cookies are small text files stored on your device when you visit our website. 
              They help us remember your preferences, improve your experience, and understand 
              how our platform is being used.
            </p>
          </div>
          
          <div className="cookie-section">
            <h3 className="section-title">
              <span className="section-icon">🔧</span>
              Types of Cookies We Use
            </h3>
            
            <div className="cookie-types-grid">
              <div className="cookie-type essential">
                <div className="cookie-type-header">
                  <span className="cookie-type-icon">🔐</span>
                  <h4 className="cookie-type-title">Essential Cookies</h4>
                  <span className="cookie-required">Required</span>
                </div>
                <p className="cookie-type-desc">Required for the website to function. Cannot be disabled.</p>
                <ul className="cookie-type-list">
                  <li><span className="list-bullet">✓</span> Authentication (keep you logged in)</li>
                  <li><span className="list-bullet">✓</span> Security (protect against attacks)</li>
                  <li><span className="list-bullet">✓</span> Session management</li>
                </ul>
              </div>
              
              <div className="cookie-type functional">
                <div className="cookie-type-header">
                  <span className="cookie-type-icon">⚙️</span>
                  <h4 className="cookie-type-title">Functional Cookies</h4>
                </div>
                <p className="cookie-type-desc">Remember your preferences and settings for a better experience.</p>
                <ul className="cookie-type-list">
                  <li><span className="list-bullet">⚙️</span> Language preferences</li>
                  <li><span className="list-bullet">⚙️</span> Theme settings (dark/light mode)</li>
                  <li><span className="list-bullet">⚙️</span> Volume preferences for videos</li>
                </ul>
              </div>
              
              <div className="cookie-type analytics">
                <div className="cookie-type-header">
                  <span className="cookie-type-icon">📊</span>
                  <h4 className="cookie-type-title">Analytics Cookies</h4>
                </div>
                <p className="cookie-type-desc">Help us understand how visitors use our platform to improve it.</p>
                <ul className="cookie-type-list">
                  <li><span className="list-bullet">📈</span> Page view tracking</li>
                  <li><span className="list-bullet">📈</span> Feature usage statistics</li>
                  <li><span className="list-bullet">📈</span> Performance monitoring</li>
                </ul>
              </div>
              
              <div className="cookie-type marketing">
                <div className="cookie-type-header">
                  <span className="cookie-type-icon">🎯</span>
                  <h4 className="cookie-type-title">Marketing Cookies</h4>
                </div>
                <p className="cookie-type-desc">Help us show relevant content and measure ad effectiveness.</p>
                <ul className="cookie-type-list">
                  <li><span className="list-bullet">📢</span> Ad personalization</li>
                  <li><span className="list-bullet">📢</span> Campaign measurement</li>
                  <li><span className="list-bullet">📢</span> Retargeting</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="cookie-section">
            <h3 className="section-title">
              <span className="section-icon">🔒</span>
              Cookie Duration
            </h3>
            <div className="cookie-duration-info">
              <div className="duration-item">
                <span className="duration-label">Session Cookies:</span>
                <span className="duration-value">Deleted when you close browser</span>
              </div>
              <div className="duration-item">
                <span className="duration-label">Persistent Cookies:</span>
                <span className="duration-value">Expire after 30 days</span>
              </div>
            </div>
          </div>
          
          <div className="cookie-section">
            <h3 className="section-title">
              <span className="section-icon">⚙️</span>
              Managing Cookies
            </h3>
            <p className="cookie-description">
              You can control cookies through your browser settings. Here's how:
            </p>
            
            <div className="browser-instructions">
              <div className="browser-item">
                <h4 className="browser-name">🌐 Google Chrome</h4>
                <p className="browser-steps">Settings → Privacy and Security → Cookies and other site data</p>
              </div>
              
              <div className="browser-item">
                <h4 className="browser-name">🦊 Mozilla Firefox</h4>
                <p className="browser-steps">Options → Privacy & Security → Cookies and Site Data</p>
              </div>
              
              <div className="browser-item">
                <h4 className="browser-name">🍎 Safari</h4>
                <p className="browser-steps">Preferences → Privacy → Cookies and website data</p>
              </div>
            </div>
          </div>
          
          <div className="cookie-section">
            <h3 className="section-title">
              <span className="section-icon">📊</span>
              Third-Party Services
            </h3>
            <p className="cookie-description">
              We work with trusted partners who may also set cookies:
            </p>
            <div className="third-party-list">
              <div className="third-party-item">
                <span className="third-party-icon">🛡️</span>
                <span className="third-party-name">Supabase</span>
                <span className="third-party-desc">Authentication & Database</span>
              </div>
              <div className="third-party-item">
                <span className="third-party-icon">📹</span>
                <span className="third-party-name">TikTok/Instagram</span>
                <span className="third-party-desc">Video Embedding</span>
              </div>
              <div className="third-party-item">
                <span className="third-party-icon">📈</span>
                <span className="third-party-name">Google Analytics</span>
                <span className="third-party-desc">Website Analytics</span>
              </div>
            </div>
          </div>
          
          <div className="cookie-section">
            <h3 className="section-title">
              <span className="section-icon">📝</span>
              Your Privacy Rights
            </h3>
            <p className="cookie-description">
              You have the right to:
            </p>
            <ul className="privacy-rights-list">
              <li><span className="right-icon">✅</span> Access your personal data</li>
              <li><span className="right-icon">✅</span> Correct inaccurate data</li>
              <li><span className="right-icon">✅</span> Delete your data</li>
              <li><span className="right-icon">✅</span> Object to data processing</li>
              <li><span className="right-icon">✅</span> Withdraw consent at any time</li>
            </ul>
          </div>
          
          <div className="cookie-section">
            <h3 className="section-title">
              <span className="section-icon">📅</span>
              Policy Updates
            </h3>
            <p className="cookie-description">
              We may update this Cookie Policy periodically. The "Last Updated" date at the 
              bottom will reflect when changes were made. Continued use of our platform 
              constitutes acceptance of updated policies.
            </p>
          </div>
        </div>
        
        <div className="cookie-footer">
          <div className="cookie-buttons">
            <button className="cookie-accept-button" onClick={handleAcceptAll}>
              <span className="button-icon">✅</span>
              Accept All Cookies
            </button>
            <button className="cookie-essential-button" onClick={handleEssentialOnly}>
              <span className="button-icon">🔐</span>
              Essential Cookies Only
            </button>
            <button className="cookie-settings-button" onClick={handleSettings}>
              <span className="button-icon">⚙️</span>
              Detailed Cookie Settings
            </button>
          </div>
          
          <div className="cookie-consent-info">
            <p className="consent-text">
              By clicking "Accept All Cookies", you consent to our use of all cookie types as 
              described above. You can change your preferences at any time via the Cookie Settings.
            </p>
            <p className="last-updated">
              Last Updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyModal;
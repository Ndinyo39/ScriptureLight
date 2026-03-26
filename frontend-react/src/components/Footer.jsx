import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = ({ stats }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const installedHandler = () => {
      setDeferredPrompt(null);
      setInstalled(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/Logo.png" alt="Logo" />
              <h3>ScriptureLight</h3>
            </div>
            <p className="footer-tagline">
              A faith-based platform for Bible study, spiritual growth, and community.
            </p>
          </div>
          
          <div className="footer-links">
            <h4>Explore</h4>
            <nav>
              <Link to="/bible">Read Bible</Link>
              <Link to="/community">Library & Groups</Link>
              <Link to="/testimonies">Testimonies</Link>
            </nav>
          </div>
          
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <div className="contact-info">
              <span className="phone">📞 0795459080 / 0752 787 123</span>
              <a href="mailto:douglasndinyo5@gmail.com" className="email">📧 douglasndinyo5@gmail.com</a>
            </div>
          </div>

          <div className="footer-download">
            <h4>Get the App</h4>
            <p className="footer-app-desc">Install ScriptureLight on your device for a faster, offline-ready experience.</p>
            {installed ? (
              <div className="pwa-installed-badge" id="footer-app-installed">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                App Installed ✓
              </div>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="footer-install-btn"
                id="footer-pwa-install-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M5 20h14v-2H5v2zm7-18l-7 7h4v6h6v-6h4l-7-7z"/></svg>
                Install App
              </button>
            ) : (
              <div className="pwa-unavailable" id="footer-app-unavailable">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                Open in Chrome or Edge to install
              </div>
            )}
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-stats">
            Join {(stats?.users || 0).toLocaleString()}+ believers growing in faith with ScriptureLight 🙏
          </p>
          <p className="footer-copyright">© 2026 ScriptureLight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

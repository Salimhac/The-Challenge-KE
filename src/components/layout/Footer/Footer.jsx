import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Footer.module.css';
import CommunityGuidelinesModal from '../../CommunityGuidelinesModal';
import CookiePolicyModal from '../../CookiePolicyModal';

const Footer = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const currentYear = new Date().getFullYear();

  const campuses = [
    'University of Nairobi',
    'Kenyatta University',
    'Strathmore University',
    'Technical University of Kenya',
    'Mount Kenya University',
    'United States International University Africa'
  ];

  const estates = [
    'Kilimani',
    'Kileleshwa',
    'Lavington',
    'Westlands',
    'South B',
    'South C',
    'Buruburu'
  ];

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleLegalNavigation = (path) => {
    navigate(path);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🇰🇪</span>
              <span className={styles.logoText}>Kenya Campus Challenge</span>
            </div>
            <p className={styles.tagline}>
              Connecting Kenyan youth through creativity, competition, and community.
            </p>
            <div className={styles.socialLinks}>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.socialLink}
                aria-label="Follow us on TikTok"
              >
                <span className={styles.socialIcon}>🎵</span>
                <span className={styles.socialText}>TikTok</span>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.socialLink}
                aria-label="Follow us on Instagram"
              >
                <span className={styles.socialIcon}>📷</span>
                <span className={styles.socialText}>Instagram</span>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.socialLink}
                aria-label="Follow us on Twitter"
              >
                <span className={styles.socialIcon}>🐦</span>
                <span className={styles.socialText}>Twitter</span>
              </a>
            </div>
          </div>

          <div className={styles.linksSection}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Platform</h4>
              <button onClick={() => navigate('/')} className={styles.link}>
                Home
              </button>
              <button onClick={() => navigate('/entries')} className={styles.link}>
                View Entries
              </button>
              <button onClick={() => navigate('/leaderboard')} className={styles.link}>
                Leaderboard
              </button>
              <button onClick={() => navigate('/upload')} className={styles.link}>
                Submit Entry
              </button>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Campuses</h4>
              <div className={styles.locationList}>
                {campuses.slice(0, 4).map((campus) => (
                  <span key={campus} className={styles.locationTag}>{campus}</span>
                ))}
              </div>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Estates</h4>
              <div className={styles.locationList}>
                {estates.slice(0, 4).map((estate) => (
                  <span key={estate} className={styles.locationTag}>{estate}</span>
                ))}
              </div>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Legal</h4>
              <button 
                onClick={() => handleLegalNavigation('/legal/terms')}
                className={styles.link}
              >
                Terms of Service
              </button>
              <button 
                onClick={() => handleLegalNavigation('/legal/privacy')}
                className={styles.link}
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => openModal('community-guidelines')}
                className={styles.link}
              >
                Community Guidelines
              </button>
              <button 
                onClick={() => openModal('cookie-policy')}
                className={styles.link}
              >
                Cookie Policy
              </button>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bottomSection}>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📧</span>
              <span className={styles.contactText}>ramadhansalimiu@gmail.com</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📍</span>
              <span className={styles.contactText}>Nairobi, Kenya</span>
            </div>
          </div>

          <div className={styles.copyright}>
            <p className={styles.copyrightText}>
              © {currentYear} Kenya Campus Challenge. All rights reserved.
            </p>
            <p className={styles.copyrightSubtext}>
              For the Kenyan youth community.
            </p>
          </div>

          <div className={styles.ctaSection}>
            <button 
              onClick={() => navigate('/upload')} 
              className={styles.ctaButton}
            >
              Join the Challenge
            </button>
            <button 
              className={styles.backToTop} 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              ↑ Back to Top
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CommunityGuidelinesModal 
        isOpen={activeModal === 'community-guidelines'} 
        onClose={closeModal} 
      />
      
      <CookiePolicyModal 
        isOpen={activeModal === 'cookie-policy'} 
        onClose={closeModal} 
      />
    </footer>
  );
};

export default Footer;
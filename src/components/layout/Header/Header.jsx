import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../../../hooks/useAuth';

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
    setMenuOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMenuOpen(false);
    setShowUserMenu(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleUserButtonClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleUserButtonBlur = () => {
    setTimeout(() => setShowUserMenu(false), 200);
  };

  const isAdmin = user?.email === 'admin@example.com';

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo Section */}
        <button onClick={handleLogoClick} className={styles.logo}>
          <span className={styles.logoIcon}>🇰🇪</span>
          <span className={styles.logoText}>KenyaChallenge</span>
        </button>

        {/* Mobile Menu Button */}
        <button 
          className={styles.menuButton}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={styles.menuIcon}>
            {menuOpen ? '✕' : '☰'}
          </span>
        </button>

        {/* Navigation Menu */}
        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          <button
            onClick={() => handleNavClick('/')}
            className={styles.navLink}
          >
            🏠 Home
          </button>
          <button
            onClick={() => handleNavClick('/entries')}
            className={styles.navLink}
          >
            📱 Entries Feed
          </button>
          <button
            onClick={() => handleNavClick('/leaderboard')}
            className={styles.navLink}
          >
            🏆 Leaderboard
          </button>
          {user && (
            <button
              onClick={() => handleNavClick('/upload')}
              className={styles.navLink}
            >
              ⬆️ Upload
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => handleNavClick('/admin')}
              className={`${styles.navLink} ${styles.adminLink}`}
            >
              ⚙️ Admin
            </button>
          )}
        </nav>

        {/* User Authentication Section */}
        <div className={styles.authSection}>
          {user ? (
            <div className={styles.userMenu}>
              <button 
                className={styles.userButton}
                onClick={handleUserButtonClick}
                onBlur={handleUserButtonBlur}
                aria-expanded={showUserMenu}
                aria-label="User menu"
              >
                <div className={styles.userAvatar}>
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className={styles.userName}>
                  {user.user_metadata?.nickname || 
                   user.email?.split('@')[0] || 
                   'User'}
                </span>
                <span className={styles.chevron}>
                  {showUserMenu ? '▲' : '▼'}
                </span>
              </button>
              
              {showUserMenu && (
                <div className={styles.dropdown}>
                  <div className={styles.userInfo}>
                    <div className={styles.userEmail}>
                      {user.email}
                    </div>
                    <div className={styles.userStatus}>
                      {isAdmin ? '👑 Admin' : '👤 Member'}
                    </div>
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <button 
                    onClick={() => handleNavClick('/my-profile')} 
                    className={styles.dropdownItem}
                  >
                    <span className={styles.dropdownIcon}>👤</span>
                    <span className={styles.dropdownText}>My Profile</span>
                  </button>
                  <button 
                    onClick={() => handleNavClick('/my-entries')} 
                    className={styles.dropdownItem}
                  >
                    <span className={styles.dropdownIcon}>🎬</span>
                    <span className={styles.dropdownText}>My Entries</span>
                  </button>
                  {isAdmin && (
                    <>
                      <div className={styles.dropdownDivider}></div>
                      <button 
                        onClick={() => handleNavClick('/admin')} 
                        className={styles.dropdownItem}
                      >
                        <span className={styles.dropdownIcon}>👑</span>
                        <span className={styles.dropdownText}>Admin Panel</span>
                      </button>
                    </>
                  )}
                  <div className={styles.dropdownDivider}></div>
                  <button 
                    onClick={handleSignOut} 
                    className={`${styles.dropdownItem} ${styles.signOut}`}
                  >
                    <span className={styles.dropdownIcon}>🚪</span>
                    <span className={styles.dropdownText}>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => handleNavClick('/auth')} 
              className={styles.loginButton}
            >
              <span className={styles.loginIcon}>🔐</span>
              <span className={styles.loginText}>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get initials from user name or default to "BC"
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'BC';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="Profile" className="profile-avatar" />
        ) : (
          <div className="profile-initials">{getInitials()}</div>
        )}
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </Link>
          <button className="dropdown-item" onClick={onLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  const notificationsRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Hamburger Menu Button (Mobile Only) */}
        {isAuthenticated && (
          <button
            className="hamburger-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}

        {/* Logo/Brand */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="brand">
          <Logo className="logo-car-svg" />
          <span className="brand-name">Budget CAR</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="top-actions desktop-nav" aria-label="Main navigation">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={isActiveLink('/dashboard') ? 'active' : ''}
              >
                Dashboard
              </Link>
              <Link
                to="/track-expense"
                className={isActiveLink('/track-expense') ? 'active' : ''}
              >
                Track Expense
              </Link>
              <Link
                to="/track-income"
                className={isActiveLink('/track-income') ? 'active' : ''}
              >
                Track Income
              </Link>

              {/* Notifications Icon */}
              <div className="notification-dropdown" ref={notificationsRef}>
                <button
                  className="notification-button"
                  aria-label="Notifications"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  aria-expanded={notificationsOpen}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {notifications > 0 && (
                    <span className="notification-badge">{notifications}</span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="notification-panel">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                    </div>
                    <div className="notification-content">
                      <div className="coming-soon-message">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <h4>Coming Soon!</h4>
                        <p>Notifications feature will be available soon. You'll receive alerts for budget goals, expense reminders, and more.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <ProfileDropdown user={user} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <Link to="/login">Log In</Link>
              <Link to="/register" className="btn primary">Sign Up</Link>
            </>
          )}
        </nav>

        {/* Mobile Right Side (Notifications + Profile) */}
        {isAuthenticated && (
          <div className="mobile-right-actions">
            {/* Notifications Icon */}
            <div className="notification-dropdown" ref={notificationsRef}>
              <button
                className="notification-button"
                aria-label="Notifications"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-expanded={notificationsOpen}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {notifications > 0 && (
                  <span className="notification-badge">{notifications}</span>
                )}
              </button>

              {notificationsOpen && (
                <div className="notification-panel">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                  </div>
                  <div className="notification-content">
                    <div className="coming-soon-message">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <h4>Coming Soon!</h4>
                      <p>Notifications feature will be available soon. You'll receive alerts for budget goals, expense reminders, and more.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ProfileDropdown user={user} onLogout={handleLogout} />
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isAuthenticated && mobileMenuOpen && (
        <>
          <div
            className="mobile-menu-overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav className="mobile-menu" aria-label="Mobile navigation">
            <Link
              to="/dashboard"
              className={`mobile-menu-item ${isActiveLink('/dashboard') ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </Link>
            <Link
              to="/track-expense"
              className={`mobile-menu-item ${isActiveLink('/track-expense') ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Track Expense
            </Link>
            <Link
              to="/track-income"
              className={`mobile-menu-item ${isActiveLink('/track-income') ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Track Income
            </Link>
            <Link
              to="/profile"
              className={`mobile-menu-item ${isActiveLink('/profile') ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}

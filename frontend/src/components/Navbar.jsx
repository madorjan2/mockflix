import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo" data-testid="logo-link">
            MockFlix
          </Link>

          <div className="navbar-links">
            <Link to="/" className="nav-link" data-testid="home-link">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/watchlist" className="nav-link" data-testid="watchlist-link">
                  Watchlist
                </Link>
                <Link to="/history" className="nav-link" data-testid="history-link">
                  History
                </Link>
              </>
            )}
          </div>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="nav-link" data-testid="profile-link">
                  {user?.username || 'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                  data-testid="logout-button"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" data-testid="login-link">
                  Login
                </Link>
                <Link to="/register" className="btn-primary" data-testid="register-link">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

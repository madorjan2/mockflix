import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Profile.css';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('watchlist');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [isAuthenticated]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [watchlistRes, historyRes] = await Promise.all([
        api.getWatchlist(),
        api.getHistory(),
      ]);
      setWatchlist(watchlistRes.data || []);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      await api.removeFromWatchlist(movieId);
      setWatchlist(watchlist.filter((movie) => movie.id !== movieId));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page" data-testid="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar" data-testid="profile-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <h1 className="profile-name" data-testid="profile-username">
              {user?.username}
            </h1>
            <p className="profile-email" data-testid="profile-email">
              {user?.email}
            </p>
            <p className="profile-tier" data-testid="profile-tier">
              Subscription: <span className="tier-badge">{user?.subscription_tier || 'free'}</span>
            </p>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
            data-testid="watchlist-tab"
            aria-pressed={activeTab === 'watchlist'}
          >
            Watchlist ({watchlist.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            data-testid="history-tab"
            aria-pressed={activeTab === 'history'}
          >
            Watch History ({history.length})
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'watchlist' && (
            <div className="movies-list" data-testid="watchlist-content">
              {watchlist.length === 0 ? (
                <p className="empty-message">Your watchlist is empty</p>
              ) : (
                <div className="movie-grid">
                  {watchlist.map((movie) => (
                    <div key={movie.id} className="movie-item" data-testid={`watchlist-movie-${movie.id}`}>
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      />
                      <div className="movie-item-info">
                        <h3>{movie.title}</h3>
                        <div className="movie-item-meta">
                          <span>{movie.release_year}</span>
                          <span>⭐ {movie.rating?.toFixed(1)}</span>
                        </div>
                        <button
                          className="remove-button"
                          onClick={() => handleRemoveFromWatchlist(movie.id)}
                          data-testid={`remove-watchlist-${movie.id}`}
                          aria-label="Remove from watchlist"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="movies-list" data-testid="history-content">
              {history.length === 0 ? (
                <p className="empty-message">No watch history yet</p>
              ) : (
                <div className="movie-grid">
                  {history.map((item) => (
                    <div key={item.id} className="movie-item" data-testid={`history-movie-${item.id}`}>
                      <img
                        src={item.poster_url}
                        alt={item.title}
                        onClick={() => navigate(`/movie/${item.id}`)}
                      />
                      <div className="movie-item-info">
                        <h3>{item.title}</h3>
                        <div className="movie-item-meta">
                          <span>{item.release_year}</span>
                          <span>⭐ {item.rating?.toFixed(1)}</span>
                        </div>
                        <p className="watch-date">
                          Watched: {new Date(item.watched_at).toLocaleDateString()}
                        </p>
                        {item.completed && <span className="completed-badge">Completed</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

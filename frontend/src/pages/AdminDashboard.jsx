import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    poster_url: '',
    backdrop_url: '',
    release_year: new Date().getFullYear(),
    rating: 0,
    genres: '',
    runtime: 0,
    youtube_video_id: ''
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const response = await api.getUsers();
        setUsers(response.data || []);
      } else if (activeTab === 'movies') {
        const response = await api.getMovies({ limit: 1000 }); // Get all movies for admin
        setMovies(response.data?.movies || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
        alert('Admin access required');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [activeTab]);

  const handleBanUser = async (userId) => {
    if (!confirm('Are you sure you want to ban this user?')) return;
    try {
      await api.banUser(userId);
      loadData();
    } catch (err) {
      alert('Failed to ban user: ' + err.message);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await api.unbanUser(userId);
      loadData();
    } catch (err) {
      alert('Failed to unban user: ' + err.message);
    }
  };

  const handlePromoteUser = async (userId) => {
    if (!confirm('Promote this user to admin?')) return;
    try {
      await api.promoteUser(userId);
      loadData();
    } catch (err) {
      alert('Failed to promote user: ' + err.message);
    }
  };

  const handleDemoteUser = async (userId) => {
    if (!confirm('Demote this admin to regular user?')) return;
    try {
      await api.demoteUser(userId);
      loadData();
    } catch (err) {
      alert('Failed to demote user: ' + err.message);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!confirm('Are you sure you want to delete this movie? This cannot be undone.')) return;
    try {
      await api.deleteMovie(movieId);
      alert('Movie deleted successfully');
      // Refresh page or reload movies
      window.location.reload();
    } catch (err) {
      alert('Failed to delete movie: ' + err.message);
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const movieData = {
        ...newMovie,
        genres: newMovie.genres.split(',').map(g => g.trim()).filter(g => g)
      };
      await api.addMovie(movieData);
      alert('Movie added successfully!');
      setShowAddMovie(false);
      setNewMovie({
        title: '',
        description: '',
        poster_url: '',
        backdrop_url: '',
        release_year: new Date().getFullYear(),
        rating: 0,
        genres: '',
        runtime: 0,
        youtube_video_id: ''
      });
      // Optionally reload or navigate
    } catch (err) {
      alert('Failed to add movie: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard" data-testid="admin-dashboard">
      <div className="container">
        <h1 className="admin-title">
          🛡️ Admin Dashboard
        </h1>

        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            data-testid="users-tab"
          >
            👥 User Management
          </button>
          <button
            className={`tab-button ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
            data-testid="movies-tab"
          >
            🎬 Movie Management
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'users' && (
            <div className="users-management" data-testid="users-management">
              <h2>Registered Users ({users.length})</h2>
              <div className="users-table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Subscription</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} data-testid={`user-row-${u.id}`}>
                        <td>{u.id}</td>
                        <td>{u.email}</td>
                        <td>{u.username}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role === 'admin' ? '🛡️ Admin' : 'User'}
                          </span>
                        </td>
                        <td>
                          <span className={`tier-badge ${u.subscription_tier}`}>
                            {u.subscription_tier === 'premium' ? '⭐ Premium' : 'Free'}
                          </span>
                        </td>
                        <td>
                          {u.is_banned ? (
                            <span className="status-badge banned">🚫 Banned</span>
                          ) : (
                            <span className="status-badge active">✅ Active</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {u.id !== user.id && (
                              <>
                                {u.is_banned ? (
                                  <button
                                    className="btn-small btn-success"
                                    onClick={() => handleUnbanUser(u.id)}
                                    data-testid={`unban-${u.id}`}
                                  >
                                    Unban
                                  </button>
                                ) : u.role !== 'admin' && (
                                  <button
                                    className="btn-small btn-danger"
                                    onClick={() => handleBanUser(u.id)}
                                    data-testid={`ban-${u.id}`}
                                  >
                                    Ban
                                  </button>
                                )}
                                {u.role === 'admin' ? (
                                  <button
                                    className="btn-small btn-secondary"
                                    onClick={() => handleDemoteUser(u.id)}
                                    data-testid={`demote-${u.id}`}
                                  >
                                    Demote
                                  </button>
                                ) : (
                                  <button
                                    className="btn-small btn-primary"
                                    onClick={() => handlePromoteUser(u.id)}
                                    data-testid={`promote-${u.id}`}
                                  >
                                    Promote to Admin
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'movies' && (
            <div className="movies-management" data-testid="movies-management">
              <div className="movies-header">
                <h2>Movie Catalog ({movies.length})</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddMovie(true)}
                  data-testid="add-movie-btn"
                >
                  ➕ Add New Movie
                </button>
              </div>
              <div className="movies-table-wrapper">
                <table className="movies-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Poster</th>
                      <th>Title</th>
                      <th>Year</th>
                      <th>Rating</th>
                      <th>Genres</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((movie) => (
                      <tr key={movie.id} data-testid={`movie-row-${movie.id}`}>
                        <td>{movie.id}</td>
                        <td>
                          {movie.poster_url && (
                            <img 
                              src={movie.poster_url} 
                              alt={movie.title}
                              className="movie-thumbnail"
                            />
                          )}
                        </td>
                        <td>{movie.title}</td>
                        <td>{movie.release_year}</td>
                        <td>⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'}</td>
                        <td>
                          {Array.isArray(movie.genres) 
                            ? movie.genres.slice(0, 2).join(', ')
                            : typeof movie.genres === 'string'
                            ? movie.genres.split(',').slice(0, 2).join(', ')
                            : 'N/A'
                          }
                          {(Array.isArray(movie.genres) && movie.genres.length > 2) && '...'}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-small btn-danger"
                              onClick={() => handleDeleteMovie(movie.id)}
                              data-testid={`delete-movie-${movie.id}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Add Movie Modal */}
        {showAddMovie && (
          <div className="modal-overlay" onClick={() => setShowAddMovie(false)}>
            <div className="modal add-movie-modal" onClick={(e) => e.stopPropagation()} data-testid="add-movie-modal">
              <h2>Add New Movie</h2>
              <form onSubmit={handleAddMovie} className="add-movie-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    required
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                    data-testid="movie-title-input"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows="4"
                    value={newMovie.description}
                    onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                    data-testid="movie-description-input"
                  />
                </div>
                <div className="form-group">
                  <label>Poster URL</label>
                  <input
                    type="url"
                    value={newMovie.poster_url}
                    onChange={(e) => setNewMovie({...newMovie, poster_url: e.target.value})}
                    data-testid="movie-poster-input"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Release Year</label>
                    <input
                      type="number"
                      value={newMovie.release_year}
                      onChange={(e) => setNewMovie({...newMovie, release_year: parseInt(e.target.value)})}
                      data-testid="movie-year-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Rating (0-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={newMovie.rating}
                      onChange={(e) => setNewMovie({...newMovie, rating: parseFloat(e.target.value)})}
                      data-testid="movie-rating-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Runtime (minutes)</label>
                    <input
                      type="number"
                      value={newMovie.runtime}
                      onChange={(e) => setNewMovie({...newMovie, runtime: parseInt(e.target.value)})}
                      data-testid="movie-runtime-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Genres (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Action, Drama, Thriller"
                    value={newMovie.genres}
                    onChange={(e) => setNewMovie({...newMovie, genres: e.target.value})}
                    data-testid="movie-genres-input"
                  />
                </div>
                <div className="form-group">
                  <label>YouTube Video ID</label>
                  <input
                    type="text"
                    placeholder="dQw4w9WgXcQ"
                    value={newMovie.youtube_video_id}
                    onChange={(e) => setNewMovie({...newMovie, youtube_video_id: e.target.value})}
                    data-testid="movie-youtube-input"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddMovie(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    data-testid="submit-movie"
                  >
                    Add Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

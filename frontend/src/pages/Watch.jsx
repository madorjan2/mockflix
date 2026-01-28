import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Watch.css';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMovie();
    if (isAuthenticated) {
      addToHistory();
    }
  }, [id]);

  const loadMovie = async () => {
    try {
      const response = await api.getMovie(id);
      setMovie(response.data);
    } catch (err) {
      setError('Failed to load movie');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = async () => {
    try {
      await api.addToHistory(id);
    } catch (err) {
      console.error('Failed to add to history:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading player...</div>;
  }

  if (error || !movie) {
    return (
      <div className="container">
        <div className="error-message">{error || 'Movie not found'}</div>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  const youtubeUrl = `https://www.youtube.com/embed/${movie.youtube_video_id}?autoplay=1&rel=0`;

  return (
    <div className="watch-page" data-testid="watch-page">
      <div className="player-container">
        <iframe
          src={youtubeUrl}
          title={movie.title}
          className="video-player"
          data-testid="video-player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="container">
        <div className="watch-info">
          <button
            onClick={() => navigate(`/movie/${id}`)}
            className="back-button"
            data-testid="back-to-details-button"
            aria-label="Back to movie details"
          >
            ← Back to Details
          </button>
          <h1 className="watch-title" data-testid="watch-title">
            {movie.title}
          </h1>
          <p className="watch-description">{movie.description}</p>
        </div>
      </div>
    </div>
  );
};

export default Watch;

import React from 'react';
import { Link } from 'react-router-dom';
import './MovieCard.css';

const MovieCard = ({ movie, onWatchlistToggle, isInWatchlist = false }) => {
  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWatchlistToggle) {
      onWatchlistToggle(movie.id);
    }
  };

  return (
    <div className="movie-card" data-testid={`movie-card-${movie.id}`}>
      <Link to={`/movie/${movie.id}`} className="movie-card-link">
        <div className="movie-card-poster">
          <img
            src={movie.poster_url}
            alt={`${movie.title} poster`}
            loading="lazy"
          />
          <div className="movie-card-overlay">
            <button
              className="play-button"
              data-testid={`play-button-${movie.id}`}
              aria-label={`Play ${movie.title}`}
            >
              ▶ Play
            </button>
          </div>
        </div>
        <div className="movie-card-info">
          <h3 className="movie-card-title" data-testid="movie-title">
            {movie.title}
          </h3>
          <div className="movie-card-meta">
            <span className="movie-year" data-testid="movie-year">
              {movie.release_year}
            </span>
            <span className="movie-rating" data-testid="movie-rating">
              ⭐ {movie.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          {movie.genres && Array.isArray(movie.genres) && (
            <div className="movie-card-genres">
              {movie.genres.slice(0, 3).map((genre) => (
                <span key={genre} className="genre-tag">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      {onWatchlistToggle && (
        <button
          className={`watchlist-button ${isInWatchlist ? 'in-watchlist' : ''}`}
          onClick={handleWatchlistClick}
          data-testid={`watchlist-button-${movie.id}`}
          data-in-watchlist={isInWatchlist}
          aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          aria-pressed={isInWatchlist}
        >
          {isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
        </button>
      )}
    </div>
  );
};

export default MovieCard;

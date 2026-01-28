import React from 'react';
import MovieCard from './MovieCard';
import './MovieGrid.css';

const MovieGrid = ({ movies, onWatchlistToggle, watchlistIds = [] }) => {
  if (!movies || movies.length === 0) {
    return (
      <div className="no-movies" data-testid="no-movies-message">
        <p>No movies found</p>
      </div>
    );
  }

  return (
    <div className="movie-grid" data-testid="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onWatchlistToggle={onWatchlistToggle}
          isInWatchlist={watchlistIds.includes(movie.id)}
        />
      ))}
    </div>
  );
};

export default MovieGrid;

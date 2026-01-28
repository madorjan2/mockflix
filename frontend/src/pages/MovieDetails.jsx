import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import MovieGrid from '../components/MovieGrid';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    loadMovieDetails();
  }, [id]);

  const loadMovieDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [movieRes, similarRes] = await Promise.all([
        api.getMovie(id),
        api.getSimilarMovies(id),
      ]);

      setMovie(movieRes.data);
      setSimilarMovies(similarRes.data || []);

      // Load reviews (works for both authenticated and unauthenticated users)
      try {
        const reviewsRes = await api.getReviews(id);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        // Reviews endpoint might require auth, handle gracefully
        setReviews([]);
      }

      if (isAuthenticated) {
        try {
          const ratingRes = await api.getUserRating(id);
          setUserRating(ratingRes.data?.rating);
        } catch (err) {
          // User hasn't rated yet
        }

        try {
          const watchlistRes = await api.getWatchlist();
          setIsInWatchlist(watchlistRes.data.some((item) => item.id === parseInt(id)));
        } catch (err) {
          console.error('Failed to check watchlist:', err);
        }
      }
    } catch (err) {
      setError('Failed to load movie details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = async () => {
    if (isAuthenticated) {
      try {
        await api.addToHistory(id);
      } catch (err) {
        console.error('Failed to add to history:', err);
      }
    }
    navigate(`/watch/${id}`);
  };

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) return;

    try {
      if (isInWatchlist) {
        await api.removeFromWatchlist(id);
        setIsInWatchlist(false);
      } else {
        await api.addToWatchlist(id);
        setIsInWatchlist(true);
      }
    } catch (err) {
      console.error('Watchlist toggle failed:', err);
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated) return;

    try {
      await api.rateMovie(id, rating);
      setUserRating(rating);
      loadMovieDetails();
    } catch (err) {
      console.error('Rating failed:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !reviewText.trim()) return;

    try {
      await api.createReview(id, {
        rating: reviewRating,
        review_text: reviewText,
      });
      setReviewText('');
      setReviewRating(5);
      loadMovieDetails();
    } catch (err) {
      console.error('Review submission failed:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading movie details...</div>;
  }

  if (error || !movie) {
    return (
      <div className="container">
        <div className="error-message">{error || 'Movie not found'}</div>
      </div>
    );
  }

  const genres = Array.isArray(movie.genres) ? movie.genres : [];

  return (
    <div className="movie-details-page" data-testid="movie-details-page">
      <div
        className="movie-backdrop"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), var(--bg-dark)), url(${movie.backdrop_url})`,
        }}
      >
        <div className="container">
          <div className="movie-header">
            <img
              src={movie.poster_url}
              alt={`${movie.title} poster`}
              className="movie-poster"
              data-testid="movie-poster"
            />
            <div className="movie-info">
              <h1 className="movie-title" data-testid="movie-title">
                {movie.title}
              </h1>
              <div className="movie-meta">
                <span data-testid="movie-year">{movie.release_year}</span>
                <span data-testid="movie-runtime">{movie.runtime} min</span>
                <span data-testid="movie-rating">⭐ {movie.rating?.toFixed(1)}</span>
              </div>
              <div className="movie-genres">
                {genres.map((genre) => (
                  <span key={genre} className="genre-badge">
                    {genre}
                  </span>
                ))}
              </div>
              <p className="movie-description" data-testid="movie-description">
                {movie.description}
              </p>
              <div className="movie-actions">
                <button
                  className="btn-watch"
                  onClick={handleWatch}
                  data-testid="watch-button"
                  aria-label="Watch movie"
                >
                  ▶ Watch Now
                </button>
                {isAuthenticated && (
                  <button
                    className={`btn-watchlist ${isInWatchlist ? 'active' : ''}`}
                    onClick={handleWatchlistToggle}
                    data-testid="watchlist-toggle-button"
                    data-in-watchlist={isInWatchlist}
                    aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                    aria-pressed={isInWatchlist}
                  >
                    {isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
                  </button>
                )}
              </div>

              {isAuthenticated && (
                <div className="user-rating" data-testid="user-rating-section">
                  <h3>Your Rating:</h3>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`star-button ${userRating >= star ? 'filled' : ''}`}
                        onClick={() => handleRating(star)}
                        data-testid={`rating-star-${star}`}
                        aria-label={`Rate ${star} stars`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="reviews-section">
          <h2 className="section-title">Reviews</h2>

          {isAuthenticated && (
            <form
              className="review-form"
              onSubmit={handleReviewSubmit}
              data-testid="review-form"
            >
              <div className="form-group">
                <label htmlFor="review-rating">Rating</label>
                <select
                  id="review-rating"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseInt(e.target.value))}
                  data-testid="review-rating-select"
                  aria-label="Review rating"
                >
                  {[1, 2, 3, 4, 5].map((val) => (
                    <option key={val} value={val}>
                      {val} Star{val > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="review-text">Your Review</label>
                <textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review..."
                  rows="4"
                  data-testid="review-text-input"
                  aria-label="Review text"
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                data-testid="review-submit-button"
              >
                Submit Review
              </button>
            </form>
          )}

          <div className="reviews-list" data-testid="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-card" data-testid={`review-${review.id}`}>
                  <div className="review-header">
                    <span className="review-author">{review.username}</span>
                    <span className="review-rating">⭐ {review.rating}</span>
                  </div>
                  <p className="review-text">{review.review_text}</p>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {similarMovies.length > 0 && (
          <section className="similar-section">
            <h2 className="section-title">Similar Movies</h2>
            <MovieGrid movies={similarMovies} />
          </section>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;

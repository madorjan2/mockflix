import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import MovieGrid from '../components/MovieGrid';
import './Home.css';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ sortBy: 'rating' });
  const [watchlistIds, setWatchlistIds] = useState([]);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadMovies();
    if (isAuthenticated) {
      loadWatchlist();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      loadMovies();
    }
  }, [filters, searchQuery]);

  const loadMovies = async () => {
    setLoading(true);
    setError('');
    try {
      const [moviesRes, trendingRes] = await Promise.all([
        api.getMovies(filters),
        searchQuery ? Promise.resolve({ data: [] }) : api.getTrendingMovies(),
      ]);
      setMovies(moviesRes.data.movies || []);
      setTrendingMovies(trendingRes.data || []);
    } catch (err) {
      setError('Failed to load movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadMovies();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.searchMovies(searchQuery);
      setMovies(response.data.movies || []);
      setTrendingMovies([]);
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWatchlist = async () => {
    try {
      const response = await api.getWatchlist();
      setWatchlistIds(response.data.map((item) => item.id));
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    }
  };

  const handleWatchlistToggle = async (movieId) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      if (watchlistIds.includes(movieId)) {
        await api.removeFromWatchlist(movieId);
        setWatchlistIds(watchlistIds.filter((id) => id !== movieId));
      } else {
        await api.addToWatchlist(movieId);
        setWatchlistIds([...watchlistIds, movieId]);
      }
    } catch (err) {
      console.error('Watchlist toggle failed:', err);
    }
  };

  return (
    <div className="home-page" data-testid="home-page">
      <div className="container">
        <div className="hero-section">
          <h1 className="hero-title">Welcome to MockFlix</h1>
          <p className="hero-subtitle">
            Unlimited movies, TV shows, and more.
          </p>
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search for movies..."
          />
        </div>

        <FilterPanel filters={filters} onFilterChange={setFilters} />

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading" data-testid="loading-indicator">
            Loading movies...
          </div>
        ) : (
          <>
            {trendingMovies.length > 0 && !searchQuery && (
              <section className="movie-section">
                <h2 className="section-title">Trending Now</h2>
                <MovieGrid
                  movies={trendingMovies}
                  onWatchlistToggle={isAuthenticated ? handleWatchlistToggle : null}
                  watchlistIds={watchlistIds}
                />
              </section>
            )}

            <section className="movie-section">
              <h2 className="section-title">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Movies'}
              </h2>
              <MovieGrid
                movies={movies}
                onWatchlistToggle={isAuthenticated ? handleWatchlistToggle : null}
                watchlistIds={watchlistIds}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

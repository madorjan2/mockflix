import React from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange }) => {
  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
    'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
    'Thriller', 'War', 'Western'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const sortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'year', label: 'Year' },
    { value: 'title', label: 'Title' }
  ];

  return (
    <div className="filter-panel" data-testid="filter-panel">
      <div className="filter-group">
        <label htmlFor="genre-filter" className="filter-label">
          Genre
        </label>
        <select
          id="genre-filter"
          className="filter-select"
          value={filters.genre || ''}
          onChange={(e) => onFilterChange({ ...filters, genre: e.target.value })}
          data-testid="genre-filter"
          aria-label="Filter by genre"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="year-filter" className="filter-label">
          Year
        </label>
        <select
          id="year-filter"
          className="filter-select"
          value={filters.year || ''}
          onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
          data-testid="year-filter"
          aria-label="Filter by year"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sort-filter" className="filter-label">
          Sort By
        </label>
        <select
          id="sort-filter"
          className="filter-select"
          value={filters.sortBy || 'rating'}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
          data-testid="sort-filter"
          aria-label="Sort by"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {(filters.genre || filters.year || filters.sortBy !== 'rating') && (
        <button
          className="clear-filters-button"
          onClick={() => onFilterChange({ sortBy: 'rating' })}
          data-testid="clear-filters-button"
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterPanel;

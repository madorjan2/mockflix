import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'Search movies...' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} data-testid="search-form">
      <input
        type="text"
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        data-testid="search-input"
        aria-label="Search movies"
      />
      {query && (
        <button
          type="button"
          className="clear-button"
          onClick={handleClear}
          data-testid="clear-search-button"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
      <button
        type="submit"
        className="search-button"
        data-testid="search-submit-button"
        aria-label="Submit search"
      >
        🔍
      </button>
    </form>
  );
};

export default SearchBar;

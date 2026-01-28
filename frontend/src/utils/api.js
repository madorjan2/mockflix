const API_BASE_URL = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.data?.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    this.setToken(null);
    return this.request('/auth/logout', { method: 'POST' });
  }

  async upgradeToPremiun() {
    return this.request('/auth/upgrade', { method: 'POST' });
  }

  async downgradeToFree() {
    return this.request('/auth/downgrade', { method: 'POST' });
  }

  // Admin endpoints
  async getUsers() {
    return this.request('/users');
  }

  async banUser(userId) {
    return this.request(`/users/${userId}/ban`, { method: 'PUT' });
  }

  async unbanUser(userId) {
    return this.request(`/users/${userId}/unban`, { method: 'PUT' });
  }

  async promoteUser(userId) {
    return this.request(`/users/${userId}/promote`, { method: 'PUT' });
  }

  async demoteUser(userId) {
    return this.request(`/users/${userId}/demote`, { method: 'PUT' });
  }

  async addMovie(movieData) {
    return this.request('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  }

  async updateMovie(movieId, movieData) {
    return this.request(`/movies/${movieId}`, {
      method: 'PUT',
      body: JSON.stringify(movieData),
    });
  }

  async deleteMovie(movieId) {
    return this.request(`/movies/${movieId}`, {
      method: 'DELETE',
    });
  }

  // Movies endpoints
  async getMovies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/movies?${queryString}`);
  }

  async getMovie(id) {
    return this.request(`/movies/${id}`);
  }

  async searchMovies(query) {
    return this.request(`/movies/search?q=${encodeURIComponent(query)}`);
  }

  async getTrendingMovies() {
    return this.request('/movies/trending');
  }

  async getSimilarMovies(id) {
    return this.request(`/movies/${id}/similar`);
  }

  // Reviews endpoints
  async getReviews(movieId) {
    return this.request(`/movies/${movieId}/reviews`);
  }

  async createReview(movieId, reviewData) {
    return this.request(`/movies/${movieId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(reviewId, reviewData) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Ratings endpoints
  async rateMovie(movieId, rating) {
    return this.request(`/movies/${movieId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }

  async getUserRating(movieId) {
    return this.request(`/movies/${movieId}/rating`);
  }

  async deleteRating(movieId) {
    return this.request(`/movies/${movieId}/rating`, {
      method: 'DELETE',
    });
  }

  // Watchlist endpoints
  async getWatchlist() {
    return this.request('/watchlist');
  }

  async addToWatchlist(movieId) {
    return this.request(`/watchlist/${movieId}`, {
      method: 'POST',
    });
  }

  async removeFromWatchlist(movieId) {
    return this.request(`/watchlist/${movieId}`, {
      method: 'DELETE',
    });
  }

  // History endpoints
  async getHistory() {
    return this.request('/history');
  }

  async addToHistory(movieId) {
    return this.request(`/history/${movieId}`, {
      method: 'POST',
    });
  }

  async updateProgress(movieId, progressSeconds, completed = false) {
    return this.request(`/history/${movieId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress_seconds: progressSeconds, completed }),
    });
  }
}

export default new ApiClient();

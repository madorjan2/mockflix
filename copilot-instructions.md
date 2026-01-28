# MockFlix Streaming Platform Test Automation App - Copilot Instructions

## Project Overview
This is a dummy streaming platform application (similar to Netflix/IMDb) built specifically for showcasing automation testing scenarios. The app should be locally runnable, simple to set up, and rich in testable scenarios for both API and UI testing.

## Core Principles
- **Universal Understanding**: Everyone knows how streaming platforms work - keep it intuitive
- **Testing-First Design**: Every feature should be designed with test scenarios in mind
- **Locally Runnable**: No external dependencies except for initial data seeding
- **Simple but Realistic**: Modern patterns without unnecessary complexity

## Tech Stack

### Backend
- **Framework**: Express.js
- **Database**: SQLite with sql.js
- **Language**: Node.js (JavaScript)
- **Key Libraries**:
  - cors (for API access)
  - express (REST API)
  - sql.js (pure JavaScript SQLite - no native dependencies)
  - dotenv (configuration)
  - bcryptjs (password hashing)
  - jsonwebtoken (JWT authentication)

### Frontend
- **Framework**: React with Vite
- **Language**: JavaScript
- **Styling**: Your choice (Tailwind, CSS Modules, or plain CSS)
- **Video Player**: YouTube embeds (iframes)

### Data Source
- **TMDB API** for movie metadata (titles, posters, descriptions, ratings)
- Seed 100-200 movies locally as JSON
- Map each movie to a YouTube video (can reuse same videos)

## Application Features

### Core Functionality
1. **Browse Movies**
   - Grid/list view of movies
   - Movie cards with poster, title, rating, year
   - Pagination or infinite scroll

2. **Search & Filters**
   - Search by title
   - Filter by genre, year, rating
   - Sort options (rating, year, title)

3. **Movie Details**
   - Full movie information page
   - Watch button (opens player)
   - Reviews and ratings section
   - Cast and crew info

4. **Video Player**
   - YouTube iframe embed
   - Full `/watch/:movieId` route
   - Player controls (handled by YouTube)
   - Watch progress tracking

5. **User Features**
   - User registration and login
   - Watchlist (add/remove movies)
   - Watch history
   - User reviews and ratings

6. **User Profile**
   - View/edit profile information
   - View watchlist
   - View watch history
   - Subscription tier (free/premium)

## API Endpoints Design

### Authentication
- `POST /api/auth/register` - Create new user (201, 400, 409)
- `POST /api/auth/login` - Login user (200, 401, 422)
- `POST /api/auth/logout` - Logout user (200, 401)
- `GET /api/auth/me` - Get current user (200, 401)

### Movies
- `GET /api/movies` - List movies with pagination/filters (200, 400)
- `GET /api/movies/:id` - Get movie details (200, 404)
- `GET /api/movies/search?q=term` - Search movies (200, 400)
- `GET /api/movies/trending` - Get trending movies (200)
- `GET /api/movies/:id/similar` - Get similar movies (200, 404)

### Reviews
- `GET /api/movies/:id/reviews` - Get movie reviews (200, 404)
- `POST /api/movies/:id/reviews` - Create review (201, 400, 401, 409)
- `PUT /api/reviews/:id` - Update review (200, 400, 401, 403, 404)
- `DELETE /api/reviews/:id` - Delete review (204, 401, 403, 404)

### Ratings
- `POST /api/movies/:id/rating` - Rate movie (201, 400, 401)
- `GET /api/movies/:id/rating` - Get user's rating (200, 401, 404)
- `DELETE /api/movies/:id/rating` - Remove rating (204, 401, 404)

### Watchlist
- `GET /api/watchlist` - Get user's watchlist (200, 401)
- `POST /api/watchlist/:movieId` - Add to watchlist (201, 401, 409)
- `DELETE /api/watchlist/:movieId` - Remove from watchlist (204, 401, 404)

### Watch History
- `GET /api/history` - Get watch history (200, 401)
- `POST /api/history/:movieId` - Add to history (201, 401)
- `PUT /api/history/:movieId/progress` - Update watch progress (200, 401, 404)

### Admin (Optional)
- `POST /api/admin/movies` - Add movie (201, 401, 403)
- `PUT /api/admin/movies/:id` - Update movie (200, 401, 403, 404)
- `DELETE /api/admin/movies/:id` - Delete movie (204, 401, 403, 404)

### Network/Error Simulation Endpoints
- `GET /api/test/slow?delay=ms` - Simulate slow response (200)
- `GET /api/test/timeout` - Simulate timeout (503)
- `GET /api/test/error/:code` - Return specific status code (any)
- `GET /api/test/rate-limit` - Trigger rate limiting (429)

## Testing Scenarios to Enable

### API Testing Scenarios
- ✅ Various HTTP status codes (200, 201, 400, 401, 403, 404, 409, 422, 429, 500, 503)
- ✅ Authentication and authorization flows
- ✅ CRUD operations
- ✅ Search and filtering with query parameters
- ✅ Pagination
- ✅ Data validation errors
- ✅ Conflict scenarios (duplicate reviews, etc.)
- ✅ Rate limiting
- ✅ Network conditions (slow, timeout, intermittent)
- ✅ Request/response headers validation
- ✅ JSON schema validation

### UI Testing Scenarios
- ✅ Form interactions (registration, login, search, reviews)
- ✅ Navigation flows (browse → details → watch)
- ✅ Dynamic content updates (watchlist, ratings)
- ✅ Modal dialogs and popups
- ✅ Loading states and spinners
- ✅ Error messages and validation
- ✅ Responsive elements (filters, dropdowns)
- ✅ Iframe handling (YouTube player)
- ✅ Infinite scroll or pagination
- ✅ Session persistence
- ✅ Dark/light mode (optional but nice)

## Code Quality Guidelines

### Testability Best Practices
1. **Always add explicit test attributes**:
   ```jsx
   <button data-testid="add-to-watchlist-btn" aria-label="Add to watchlist">
     Add to Watchlist
   </button>
   ```

2. **Use semantic HTML**:
   ```jsx
   <nav aria-label="Main navigation">
   <button type="submit">
   <input type="email" name="email">
   ```

3. **Provide multiple locator strategies**:
   - `data-testid` for unique elements
   - ARIA labels for accessibility
   - Text content for user-facing elements
   - Role-based selectors (button, link, heading)

4. **Avoid framework-specific classes for important elements**:
   ```jsx
   // Bad
   <div className="css-xyz123-MuiBox">
   
   // Good
   <div className="movie-card" data-testid="movie-card-123">
   ```

5. **Make state changes observable**:
   ```jsx
   <button 
     data-testid="watchlist-btn"
     data-in-watchlist={isInWatchlist}
     aria-pressed={isInWatchlist}
   >
   ```

### API Design Patterns
- Use consistent response formats:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Success message"
  }
  ```
- Always include proper error responses:
  ```json
  {
    "success": false,
    "error": "Error type",
    "message": "Human readable message",
    "details": { ... }
  }
  ```
- Use meaningful HTTP status codes
- Include rate limit headers where appropriate
- Version your API (`/api/v1/...`) for future extensibility

### Database Schema Suggestions

**Users Table**:
- id, email, password_hash, username, created_at, subscription_tier

**Movies Table**:
- id, tmdb_id, title, description, poster_url, release_year, rating, genres, youtube_video_id

**Reviews Table**:
- id, user_id, movie_id, rating, review_text, created_at, updated_at

**Watchlist Table**:
- id, user_id, movie_id, added_at

**Watch_History Table**:
- id, user_id, movie_id, watched_at, progress_seconds, completed

## Project Structure Suggestion

```
streaming-platform/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── movies.js
│   │   │   ├── reviews.js
│   │   │   ├── watchlist.js
│   │   │   └── test.js (network simulation)
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimit.js
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   ├── seed.js
│   │   │   └── connection.js
│   │   └── server.js
│   ├── data/
│   │   └── movies.json (seeded TMDB data)
│   ├── database.db (SQLite file)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MovieCard.jsx
│   │   │   ├── MovieGrid.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   └── VideoPlayer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── Watch.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Profile.jsx
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── scripts/
│   └── seed-tmdb-data.js (one-time TMDB fetch)
│
└── README.md
```

## Implementation Status

### ✅ Completed: Backend API
- Full REST API with 25+ endpoints
- JWT authentication and authorization
- SQLite database with sql.js (cross-platform)
- Database seeding with sample data (5 users, 20 movies)
- Rate limiting and error handling
- Network simulation endpoints for testing
- **Swagger documentation at http://localhost:3000/api-docs**

### 🚧 To Be Implemented: Frontend
- React application with Vite
- All UI components and pages
- Integration with backend API
- User authentication flow
- Movie browsing and details
- Search and filtering
- Watchlist and history features
- Video player integration

## Setup Instructions

1. **Install dependencies**: `npm install` in both backend and frontend
2. **Seed database**: `cd backend && npm run seed`
3. **Start backend**: `cd backend && npm run dev` (port 3000)
4. **Start frontend**: `cd frontend && npm run dev` (port 5173) - when implemented
5. **Access API docs**: http://localhost:3000/api-docs
6. **Access app**: http://localhost:5173 - when frontend is ready

## Additional Notes

- Using **sql.js** (pure JavaScript SQLite) for cross-platform compatibility - no native build tools required on Windows
- Using **bcryptjs** instead of bcrypt for the same reason - works everywhere without compilation
- Keep the UI clean but don't obsess over design - focus is on testability
- Add loading states everywhere (great for testing!)
- Include error boundaries in React
- Add a simple auth mechanism (JWT or session, keep it simple)
- Mock the payment/subscription flow (don't need real payment processing)
- Consider adding a `/api/reset` endpoint to reset database state between test runs
- Add sample users in seed data (test@example.com, admin@example.com)

## What NOT to Do

- Don't add real video streaming/encoding
- Don't overcomplicate authentication (no OAuth, just simple JWT/session)
- Don't add real payment processing
- Don't worry about production deployment
- Don't add unnecessary features - keep scope tight
- Don't use overly complex state management (Context API is enough)

## Remember

This app exists to showcase testing patterns. Every feature should be designed with "how will I test this?" in mind. Prioritize test-friendly code over clever abstractions.
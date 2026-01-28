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
- **Styling**: Plain CSS with CSS Modules
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
- `POST /api/auth/upgrade` - Upgrade to premium (200, 401, 409) - Mock upgrade
- `POST /api/auth/downgrade` - Downgrade to free (200, 401, 409) - Mock downgrade

### Movies
- `GET /api/movies` - List movies with pagination/filters (200, 400)
- `POST /api/movies` - Add new movie (admin only) (201, 400, 403)
- `GET /api/movies/:id` - Get movie details (200, 404)
- `PUT /api/movies/:id` - Update movie (admin only) (200, 403, 404)
- `DELETE /api/movies/:id` - Delete movie (admin only) (204, 403, 404)
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

### Users (Admin Only)
- `GET /api/users` - List all users (200, 403)
- `PUT /api/users/:id/ban` - Ban user (200, 403, 404)
- `PUT /api/users/:id/unban` - Unban user (200, 403, 404)
- `PUT /api/users/:id/promote` - Promote to admin (200, 403, 404, 409)
- `PUT /api/users/:id/demote` - Demote from admin (200, 403, 404, 409)

### Database Reset (Admin Only)
- `POST /api/seed/reset` - Reset entire database to default (200, 403, 500)
- `POST /api/seed/reset-users` - Reset only users table (200, 403, 500)
- `POST /api/seed/reset-movies` - Reset only movies table (200, 403, 500)

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
- ⚠️ Rate limiting (disabled by default for testing, code available if needed)
- ✅ Network conditions (slow, timeout, intermittent)
- ✅ Request/response headers validation
- ✅ JSON schema validation
- ✅ Subscription tier changes (upgrade/downgrade)
- ✅ Admin role-based access control
- ✅ User banning/unbanning flows
- ✅ User promotion/demotion
- ✅ Database reset operations (full/partial)

### UI Testing Scenarios
- ✅ Form interactions (registration, login, search, reviews)
- ✅ Navigation flows (browse → details → watch)
- ✅ Dynamic content updates (watchlist, ratings)
- ✅ Modal dialogs and popups (subscription upgrade/downgrade)
- ✅ Loading states and spinners
- ✅ Error messages and validation
- ✅ Responsive elements (filters, dropdowns)
- ✅ Iframe handling (YouTube player)
- ✅ Pagination (grid-based)
- ✅ Session persistence (JWT in localStorage)
- ✅ Protected routes (authentication required)
- ✅ Subscription tier indicators (premium badges, stars)
- ✅ Mock payment flow (upgrade/downgrade)
- ✅ Admin dashboard access (role-based routing)
- ✅ Admin user management table (ban/unban/promote/demote)
- ✅ Admin movie management table (view/add/delete)
- ✅ Database reset buttons (users only/movies only/full reset)
- ✅ Confirmation dialogs for destructive actions

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
- id, email, password_hash, username, created_at, subscription_tier, role, is_banned

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

### ✅ Completed: Full-Stack Application with Admin Dashboard

**Backend:**
- Full REST API with 40+ endpoints
- JWT authentication and authorization
- Role-based access control (user/admin)
- Admin endpoints for user management (ban/unban/promote/demote)
- Admin endpoints for movie CRUD operations
- Database reset endpoints (full/users only/movies only)
- User banning system (403 on login)
- SQLite database with sql.js (cross-platform)
- Database seeding with sample data (5 users, 20 movies)
- Error handling and network simulation endpoints
- Rate limiting code available but disabled (test-friendly)
- Subscription tier management (upgrade/downgrade)
- **Swagger documentation at http://localhost:3000/api-docs**

**Frontend:**
- React 18 application with Vite
- 30+ component and page files
- Complete integration with backend API
- User authentication flow (login/register)
- Movie browsing, search, and filtering
- Movie details with reviews and ratings
- YouTube video player integration (/watch route)
- Watchlist and watch history
- Profile page with subscription management
- **Admin dashboard** (`/admin` route) with:
  - User Management tab:
    - Table showing all users with role, subscription, status
    - Ban/Unban buttons (cannot ban admins)
    - Promote/Demote buttons (cannot demote self)
    - Reset Users button (resets to 5 defaults)
    - Reset All button (full database reset)
  - Movie Management tab:
    - Table showing all movies with posters, details
    - Add Movie modal with complete form
    - Delete Movie button for each movie
    - Reset Movies button (resets to 20 defaults)
    - Reset All button (full database reset)
- Role-based UI rendering (admin-only sections)
- Premium tier indicators (badges, stars, shimmer effects)
- Modal dialogs for subscription and admin actions
- Test-friendly attributes throughout (data-testid, aria-labels)
- AuthContext for state management

## Setup Instructions

1. **Install dependencies**: `npm install` in both backend and frontend folders
2. **Seed database**: `cd backend && npm run seed`
3. **Start backend**: `cd backend && npm run dev` (port 3000)
4. **Start frontend**: `cd frontend && npm run dev` (port 5173)
5. **Access app**: http://localhost:5173
6. **Access API docs**: http://localhost:3000/api-docs

## Test Accounts

- **Free User**: test@example.com / password123
- **Admin**: admin@example.com / admin123 (premium tier)
- **Premium User**: premium@example.com / premium123
- **Free User**: john.doe@example.com / john123
- **Premium User**: jane.smith@example.com / jane123

The admin account has full access to the admin dashboard for user management and movie operations!

## Additional Notes

- Using **sql.js** (pure JavaScript SQLite) for cross-platform compatibility - no native build tools required on Windows
- Using **bcryptjs** instead of bcrypt for the same reason - works everywhere without compilation
- **Rate limiting is DISABLED** by default - inappropriate for test automation. Code exists in middleware but is commented out in server.js
- Backend returns **genres as arrays** (parsed from JSON in database) - frontend expects arrays, not CSV strings
- **AuthContext** manages user state across the React app
- **JWT tokens** stored in localStorage, included in Authorization headers, contain user role
- **Reviews endpoint** returns 401 when not authenticated - frontend handles this gracefully
- **Subscription management** is fully functional but mock (no real payments)
- **Admin role** system with requireAdmin middleware - admins cannot be banned
- **User banning** prevents login (403 Forbidden response)
- **Admin dashboard** accessible at /admin route - shows user and movie management tables
- **Database reset functionality** with three options:
  - POST /api/seed/reset - Full reset (runs complete seed script)
  - POST /api/seed/reset-users - Users only (preserves movies)
  - POST /api/seed/reset-movies - Movies only (preserves users)
- All components include **data-testid** attributes for automation testing
- **Premium indicators** appear in navbar and profile page (gold badges, stars, shimmer animations)
- Sample users in seed data span both free/premium tiers and user/admin roles
- Database automatically resets when running `npm run seed`
- **Admin authentication chain**: authenticateToken → requireAdmin → endpoint handler
- Movie creation defaults to rating 0 if not specified (will appear at bottom when sorted by rating)

## What NOT to Do

- Don't add real video streaming/encoding
- Don't overcomplicate authentication (no OAuth, just simple JWT/session)
- Don't add real payment processing
- Don't worry about production deployment
- Don't add unnecessary features - keep scope tight
- Don't use overly complex state management (Context API is enough)

## Remember

This app exists to showcase testing patterns. Every feature should be designed with "how will I test this?" in mind. Prioritize test-friendly code over clever abstractions.
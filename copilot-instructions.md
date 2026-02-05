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
- Seed 20 movies locally as JSON (real movie data from popular films)
- Map each movie to a YouTube video (trailers/clips)

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
- id, email, password_hash, username, subscription_tier, role, is_banned, created_at

**Movies Table**:
- id, tmdb_id, title, description, poster_url, backdrop_url, release_year, rating, vote_count, genres (JSON), runtime, youtube_video_id, created_at

**Reviews Table**:
- id, user_id, movie_id, rating, review_text, created_at, updated_at

**Watchlist Table**:
- id, user_id, movie_id, added_at

**Watch_History Table**:
- id, user_id, movie_id, watched_at, progress_seconds, completed

## Project Structure Suggestion

```
mockflix/
├── backend/
│   ├── src/
│   │   ├── routes/              # 8 route files, 36 total endpoints
│   │   │   ├── auth.js          # Authentication (6 endpoints)
│   │   │   ├── movies.js        # Movie catalog (8 endpoints)
│   │   │   ├── reviews.js       # Reviews & ratings (4 endpoints)
│   │   │   ├── watchlist.js     # Watchlist management (3 endpoints)
│   │   │   ├── history.js       # Watch history (3 endpoints)
│   │   │   ├── seed.js          # Database reset (3 endpoints)
│   │   │   ├── test.js          # Network simulation (4 endpoints)
│   │   │   └── users.js         # User management (5 endpoints)
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verification & role checks
│   │   │   ├── errorHandler.js  # Global error handling
│   │   │   └── rateLimit.js     # Rate limiting (disabled by default)
│   │   ├── db/
│   │   │   ├── schema.sql       # Database schema
│   │   │   ├── seed.js          # Data seeding script
│   │   │   └── connection.js    # sql.js wrapper
│   │   └── server.js            # Main Express server + Swagger setup
│   ├── data/
│   │   └── movies.json          # 20 movies from TMDB
│   ├── database.db              # SQLite database file (auto-generated)
│   ├── .env                     # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # 5 reusable components
│   │   │   ├── FilterPanel.jsx & .css
│   │   │   ├── MovieCard.jsx & .css
│   │   │   ├── MovieGrid.jsx & .css
│   │   │   ├── Navbar.jsx & .css
│   │   │   └── SearchBar.jsx & .css
│   │   ├── pages/               # 8 page components
│   │   │   ├── AdminDashboard.jsx & .css  # Admin-only page
│   │   │   ├── Home.jsx & .css
│   │   │   ├── MovieDetails.jsx & .css
│   │   │   ├── Profile.jsx & .css
│   │   │   ├── Watch.jsx & .css
│   │   │   ├── Login.jsx        # Uses Auth.css
│   │   │   ├── Register.jsx     # Uses Auth.css
│   │   │   └── Auth.css         # Shared auth page styles
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   ├── utils/
│   │   │   └── api.js           # Centralized API client
│   │   ├── App.jsx              # Main app with routing
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── copilot-instructions.md      # Project guidelines & Copilot context
├── README.md                    # Main documentation
├── start.bat                    # Windows quick start
└── start.sh                     # Linux/Mac quick start
```

## Implementation Status

### ✅ Completed: Full-Stack Application with Admin Dashboard

**Backend:**
- Full REST API with 36 endpoints organized across 8 route files
- JWT authentication and authorization (7-day token expiry)
- Role-based access control (user/admin)
- Admin endpoints for user management (ban/unban/promote/demote)
- Admin endpoints for movie CRUD operations
- Database reset endpoints (full/users only/movies only)
- User banning system (403 on login for banned users)
- SQLite database with sql.js (pure JavaScript, cross-platform)
- Database seeding with sample data (5 test users, 20 popular movies)
- Error handling and network simulation endpoints for testing
- Rate limiting code available but disabled by default (test-friendly)
- Subscription tier management (mock upgrade/downgrade)
- **Interactive Swagger/OpenAPI documentation at http://localhost:3000/api-docs**
- Health check endpoint at http://localhost:3000/health

**Frontend:**
- React 18 application with Vite build tool
- 15 component and page files (8 pages, 5 components, 2 utility files)
- Complete integration with backend API via centralized API client
- User authentication flow (login/register with validation)
- Movie browsing with grid layout, search, and multi-filter support
- Movie details page with reviews, ratings, and watchlist integration
- YouTube video player integration (dedicated /watch/:id route with iframe embed)
- Watchlist management (add/remove with visual feedback)
- Watch history tracking with progress persistence
- Profile page with subscription tier management (upgrade/downgrade modals)
- **Admin dashboard** (`/admin` route, admin-only access) with tabs:
  - User Management tab:
    - Table displaying all users (email, username, role, subscription, banned status)
    - Ban/Unban buttons (admins cannot be banned)
    - Promote/Demote buttons (cannot demote yourself)
    - Reset Users button (resets to 5 default accounts, preserves movies)
    - Reset All button (full database reset with confirmation)
  - Movie Management tab:
    - Table showing all movies (poster, title, year, rating, genres)
    - Add Movie modal with validation (title, description, URLs, year, rating, genres, runtime, YouTube ID)
    - Delete Movie button for each entry
    - Reset Movies button (resets to 20 default movies, preserves users)
    - Reset All button (full database reset with confirmation)
- Role-based UI rendering (admin nav link, protected routes)
- Premium tier visual indicators (gold badges, star icons, shimmer animations)
- Modal dialogs for subscriptions, movie operations, and destructive actions
- Test-friendly attributes throughout (data-testid, aria-labels, semantic HTML)
- AuthContext for centralized authentication state management
- React Router for client-side navigation with protected routes

## Setup Instructions

1. **Install dependencies**: `npm install` in both backend and frontend folders
2. **Seed database**: `cd backend && npm run seed`
3. **Start backend**: `cd backend && npm run dev` (port 3000)
4. **Start frontend**: `cd frontend && npm run dev` (port 5173)
5. **Access app**: http://localhost:5173
6. **Access API docs**: http://localhost:3000/api-docs

## Test Accounts

The database is seeded with 5 test accounts covering different roles and subscription tiers:

| Email | Password | Role | Subscription | Notes |
|-------|----------|------|--------------|-------|
| test@example.com | password123 | user | free | Standard test user |
| admin@example.com | admin123 | admin | premium | Full admin access to dashboard |
| premium@example.com | premium123 | user | premium | Premium user for tier testing |
| john.doe@example.com | john123 | user | free | Additional test user |
| jane.smith@example.com | jane123 | user | premium | Additional premium user |

The admin account (admin@example.com) has full access to:
- User management (ban/unban/promote/demote)
- Movie CRUD operations (add/edit/delete)
- Database reset operations (users/movies/all)

## Additional Notes

### Technical Implementation Details
- Using **sql.js** (pure JavaScript SQLite) for cross-platform compatibility - no native build tools or C++ compilation required on Windows
- Using **bcryptjs** instead of bcrypt for the same reason - works everywhere without native dependencies
- **Rate limiting is DISABLED** by default in server.js - code exists in middleware but commented out for test automation friendliness
- Backend stores genres as JSON strings in SQLite, parses to arrays in API responses - frontend expects arrays
- Database file persists at `backend/database.db` and auto-saves after modifications

### Authentication & Authorization
- **AuthContext** manages user state across the React application
- **JWT tokens** are:
  - Stored in localStorage (`mockflix_token`)
  - Valid for 7 days from creation
  - Included in Authorization headers as `Bearer <token>`
  - Contain user ID, email, role, and subscription tier
- **Reviews endpoint** returns 401 when not authenticated - frontend gracefully handles by showing login prompt
- **Admin authentication chain**: authenticateToken middleware → requireAdmin middleware → endpoint handler
- Admins cannot be banned (business logic validation)
- Cannot demote yourself as admin (prevents lockout)

### Subscription & User Management
- **Subscription management** is fully functional but mock (no Stripe/payment integration)
- **User banning system**: Banned users receive 403 Forbidden on login attempts
- **Admin dashboard** accessible at /admin route (redirects non-admins to home)
- **Database reset functionality** with three granular options:
  - `POST /api/seed/reset` - Full reset (drops all tables, recreates schema, seeds everything)
  - `POST /api/seed/reset-users` - Users only (preserves all movies and their data)
  - `POST /api/seed/reset-movies` - Movies only (preserves all users and their data)
- Running `npm run seed` manually performs full database reset

### Frontend Implementation
- All interactive components include **data-testid** attributes for E2E test automation
- **Premium indicators** appear in navbar and profile page (gold/yellow badges, star icons, shimmer CSS animations)
- Sample users in seed data cover both free/premium tiers and user/admin roles
- Protected routes redirect unauthenticated users to login page
- Movie creation via admin panel defaults to rating 0 if not specified

### API Design
- Consistent response format: `{ success: boolean, data: any, message: string }`
- Error responses include: `{ success: false, error: string, message: string, details?: any }`
- Swagger documentation auto-generated from JSDoc comments in route files
- All endpoints return appropriate HTTP status codes (200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500, 503)

## What NOT to Do

- Don't add real video streaming/encoding
- Don't overcomplicate authentication (no OAuth, just simple JWT/session)
- Don't add real payment processing
- Don't worry about production deployment
- Don't add unnecessary features - keep scope tight
- Don't use overly complex state management (Context API is enough)

## Remember

This app exists to showcase testing patterns. Every feature should be designed with "how will I test this?" in mind. Prioritize test-friendly code over clever abstractions.
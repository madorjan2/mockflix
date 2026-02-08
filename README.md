# MockFlix - Streaming Platform Test Automation App

> [!WARNING]
> This app is 100% vibe coded, I have literally added 0 lines to it manually.

A dummy streaming platform (Netflix/IMDb-style) built specifically for showcasing automation testing scenarios. Features a complete REST API with interactive Swagger documentation and a modern React frontend. Designed to be test-friendly with comprehensive endpoints, diverse HTTP status codes, and explicit test attributes throughout the UI.

**Perfect for learning and demonstrating:**
- API test automation (REST, authentication, CRUD operations)
- UI test automation (E2E testing with Playwright, Selenium, Cypress)
- Manual testing scenarios
- Test framework development and examples

## Tech Stack

### Backend
- **Express.js** - REST API framework
- **SQLite with sql.js** - Pure JavaScript database (no native dependencies)
- **JWT Authentication** - Secure token-based auth
- **Swagger** - Interactive API documentation
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **JavaScript** - Programming language

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. **Clone and navigate to project:**
   ```bash
   cd mockflix
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Seed Database:**
   ```bash
   cd ../backend
   npm run seed
   ```

### Running the Application

**Quick Start (One Command):**

- **Windows:** Double-click `start.bat` or run in terminal:
  ```bash
  start.bat
  ```

- **Linux/Mac:** Run in terminal:
  ```bash
  chmod +x start.sh  # First time only
  ./start.sh
  ```

This will start both backend and frontend servers in separate terminal windows.

**Manual Start:**

1. **Start Backend (Port 3000):**
   ```bash
   cd backend
   npm run dev
   # or: node src/server.js
   ```

2. **Start Frontend (Port 5173):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - API Documentation: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

## Project Structure

```
mockflix/
├── backend/
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   │   ├── auth.js       # Authentication (6 endpoints)
│   │   │   ├── movies.js     # Movie catalog (8 endpoints)
│   │   │   ├── reviews.js    # Reviews & ratings (4 endpoints)
│   │   │   ├── watchlist.js  # Watchlist management (3 endpoints)
│   │   │   ├── history.js    # Watch history (3 endpoints)
│   │   │   ├── seed.js       # Database reset (3 endpoints)
│   │   │   ├── test.js       # Network simulation (4 endpoints)
│   │   │   └── users.js      # User management (5 endpoints)
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.js       # JWT authentication
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimit.js
│   │   ├── db/              # Database layer
│   │   │   ├── schema.sql   # Database schema
│   │   │   ├── connection.js # sql.js wrapper
│   │   │   └── seed.js      # Data seeding
│   │   └── server.js        # Main server
│   ├── data/
│   │   └── movies.json      # Movie metadata
│   ├── database.db          # SQLite database file
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/                # React app
│   ├── src/
│   │   ├── components/      # Reusable components (5 files)
│   │   │   ├── FilterPanel.jsx & .css
│   │   │   ├── MovieCard.jsx & .css
│   │   │   ├── MovieGrid.jsx & .css
│   │   │   ├── Navbar.jsx & .css
│   │   │   └── SearchBar.jsx & .css
│   │   ├── pages/          # Route pages (8 files)
│   │   │   ├── AdminDashboard.jsx & .css
│   │   │   ├── Home.jsx & .css
│   │   │   ├── MovieDetails.jsx & .css
│   │   │   ├── Profile.jsx & .css
│   │   │   ├── Watch.jsx & .css
│   │   │   ├── Login.jsx (uses Auth.css)
│   │   │   └── Register.jsx (uses Auth.css)
│   │   ├── context/        # React context
│   │   │   └── AuthContext.jsx
│   │   ├── utils/          # Utilities
│   │   │   └── api.js      # Centralized API client
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── copilot-instructions.md  # Project guidelines & Copilot context
├── README.md                # This file
├── start.bat                # Windows quick start script
└── start.sh                 # Linux/Mac quick start script
```

## API Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/upgrade` - Upgrade to premium (mock)
- `POST /api/auth/downgrade` - Downgrade to free (mock)

### Movies
- `GET /api/movies` - List movies (pagination, filters)
- `POST /api/movies` - Add new movie (admin only)
- `GET /api/movies/:id` - Get movie details
- `PUT /api/movies/:id` - Update movie (admin only)
- `DELETE /api/movies/:id` - Delete movie (admin only)
- `GET /api/movies/search?q=term` - Search movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/:id/similar` - Get similar movies

### Reviews
- `GET /api/movies/:id/reviews` - Get movie reviews
- `POST /api/movies/:id/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Watchlist
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist/:movieId` - Add to watchlist
- `DELETE /api/watchlist/:movieId` - Remove from watchlist

### Watch History
- `GET /api/history` - Get watch history
- `POST /api/history/:movieId` - Add to history
- `PUT /api/history/:movieId/progress` - Update progress

### Users (Admin Only)
- `GET /api/users` - List all users
- `PUT /api/users/:id/ban` - Ban a user
- `PUT /api/users/:id/unban` - Unban a user
- `PUT /api/users/:id/promote` - Promote user to admin
- `PUT /api/users/:id/demote` - Demote admin to user

### Database Reset (Admin Only)
- `POST /api/seed/reset` - Reset entire database to default state
- `POST /api/seed/reset-users` - Reset only users to default (5 users)
- `POST /api/seed/reset-movies` - Reset only movies to default (20 movies)

### Testing/Simulation
- `GET /api/test/slow?delay=ms` - Simulate slow response
- `GET /api/test/timeout` - Simulate timeout
- `GET /api/test/error/:code` - Return specific status code
- `GET /api/test/rate-limit` - Trigger rate limiting

**Full API documentation available at:** http://localhost:3000/api-docs

## Sample Data

### Test Accounts

The database is seeded with 5 test accounts:

| Email | Password | Role | Subscription | Use Case |
|-------|----------|------|--------------|----------|
| test@example.com | password123 | user | free | Basic user testing |
| admin@example.com | admin123 | admin | premium | Admin dashboard access |
| premium@example.com | premium123 | user | premium | Premium features testing |
| john.doe@example.com | john123 | user | free | Multi-user scenarios |
| jane.smith@example.com | jane123 | user | premium | Multi-user scenarios |

**Admin Access:** Login with `admin@example.com` to access the full admin dashboard at `/admin`

### Movies
- **20 popular movies** seeded from TMDB data
- Includes: Fight Club, Inception, The Godfather, The Dark Knight, Pulp Fiction, Forrest Gump, The Matrix, and more
- Complete metadata: posters, backdrops, descriptions, ratings, genres, runtime
- Each movie linked to YouTube trailer/clip via video ID
- **Sample data included:**
  - 10 user reviews across various movies
  - 9 watchlist entries
  - 8 watch history entries with progress tracking

## Features

### Backend
- ✅ **Full REST API with 36 endpoints** across 8 route modules
- ✅ **Interactive Swagger/OpenAPI documentation** at `/api-docs`
- ✅ **JWT authentication & authorization** (7-day token expiry)
- ✅ **Role-based access control** (user/admin roles)
- ✅ **Admin user management** (ban/unban/promote/demote operations)
- ✅ **Admin movie management** (add/edit/delete CRUD operations)
- ✅ **Granular database reset endpoints** (full/users only/movies only)
- ✅ **User banning system** (banned users receive 403 on login)
- ✅ **Subscription tier management** (free/premium with mock upgrade/downgrade)
- ✅ **Comprehensive error handling** with consistent response formats
- ✅ **Network simulation endpoints** for testing edge cases
- ✅ **Pagination and filtering** on movie listings
- ✅ **CRUD operations** for all resources (movies, reviews, watchlist, history)
- ✅ **Cross-platform SQLite** using sql.js (no native dependencies)
- ✅ **Health check endpoint** at `/health`
- ⚠️ **Rate limiting disabled** (code available but commented out for test automation)

### Frontend
- ✅ **Browse and search movies** with real-time filtering
- ✅ **Multi-criteria filters** (genre, year, rating)
- ✅ **User reviews and ratings** with CRUD operations
- ✅ **Watchlist management** with add/remove functionality
- ✅ **Watch history tracking** with progress persistence
- ✅ **YouTube video player** integration (iframe embeds)
- ✅ **Authentication UI** (login/register with validation)
- ✅ **Profile page** with subscription tier management
- ✅ **Premium tier indicators** (badges, stars, shimmer effects)
- ✅ **Admin dashboard** with dual-tab interface:
  - **Users tab**: View all users, ban/unban, promote/demote, reset users, reset all
  - **Movies tab**: View all movies, add new, delete existing, reset movies, reset all
- ✅ **Role-based UI** (admin-only navigation and routes)
- ✅ **Test-friendly attributes** (data-testid, aria-labels, semantic HTML)
- ✅ **Modal dialogs** for subscriptions and admin actions
- ✅ **Protected routes** with authentication guards
- ✅ **Responsive design** with CSS modules

## Testing Features

This application is specifically designed for testing scenarios:

### API Testing
- Various HTTP status codes (200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500, 503)
- Authentication and authorization flows
- CRUD operations
- Search and filtering
- Pagination
- Data validation errors
- Conflict scenarios
- Rate limiting
- Network conditions (slow, timeout)

### UI Testing
- ✅ Form interactions (login, register, review forms)
- ✅ Navigation flows (browse → details → watch)
- ✅ Dynamic content updates (watchlist, ratings, reviews)
- ✅ Modal dialogs (upgrade/downgrade subscription)
- ✅ Loading states and spinners
- ✅ Error messages and validation
- ✅ Responsive elements (filters, dropdowns)
- ✅ Iframe handling (YouTube player)
- ✅ Session persistence (JWT tokens)
- ✅ Subscription tier switching (mock payments)
- ✅ Protected routes (authentication required)

## Development

### Resetting Database
```bash
cd backend
npm run seed
```

### Environment Variables
Edit `backend/.env`:
```env
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
DATABASE_PATH=./database.db
```

### Hot Reload
The backend uses Node's `--watch` flag for automatic restarts during development.

## Architecture Notes

### Backend Architecture
- **sql.js** used for cross-platform SQLite compatibility (pure JavaScript, no native build tools required on Windows)
- **bcryptjs** instead of bcrypt (same reason - works everywhere without compilation)
- **JWT tokens** expire after 7 days, stored in localStorage, include user role and subscription tier
- **Rate limiting** code exists in middleware but is disabled by default for test automation
- **Database** auto-saves to disk (`backend/database.db`) after modifications
- **Swagger** documentation auto-generated from JSDoc annotations in route files
- **Consistent API responses**:
  - Success: `{ success: true, data: {...}, message: "..." }`
  - Error: `{ success: false, error: "ErrorType", message: "...", details: {...} }`

### Frontend Architecture
- **React 18** with modern hooks (useState, useEffect, useContext)
- **Vite** for fast development with HMR (Hot Module Replacement)
- **React Router v6** for client-side routing with protected routes
- **AuthContext** for centralized authentication state management
- **Centralized API client** (`utils/api.js`) with automatic JWT token injection
- **CSS Modules** for component-scoped styling
- **No state management library** needed (Context API sufficient for this scope)

### Security & Authorization
- **Subscription tiers:** 'free' and 'premium' (mock upgrade/downgrade, no real payment processing)
- **User roles:** 'user' and 'admin' (enforced via middleware and UI guards)
- **Admin restrictions:**
  - Admins cannot be banned
  - Admins cannot demote themselves
  - All admin endpoints require `authenticateToken` → `requireAdmin` middleware chain
- **Banned users** receive 403 Forbidden response on login attempts

### Database Schema
- **5 tables:** users, movies, reviews, watchlist, watch_history
- **Foreign keys** with CASCADE delete for data integrity
- **Unique constraints** on user-movie relationships (one review per user per movie)
- **Indexes** on commonly queried fields (user_id, movie_id, rating, release_year)
- **JSON storage** for movie genres (stored as TEXT, parsed as arrays in API)

## HTTP Status Codes

- **200** - Success
- **201** - Created
- **204** - No Content
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **422** - Unprocessable Entity
- **429** - Too Many Requests
- **500** - Internal Server Error
- **503** - Service Unavailable

## License

MIT

## Admin Dashboard

### Accessing Admin Dashboard

1. Login with admin account: `admin@example.com` / `admin123`
2. Click on the **🛡️ Admin** link in the navigation bar
3. Access two management tabs: Users and Movies

### User Management Features

- **View all registered users** with email, username, role, subscription tier, and status
- **Ban/Unban users** - Banned users cannot log in (403 Forbidden)
- **Promote to Admin** - Grant admin privileges to regular users
- **Demote from Admin** - Remove admin privileges (cannot demote yourself)
- **Reset Users** - Reset user table to 5 default accounts (preserves movies)
- **Reset All** - Complete database reset (users + movies + all data)

**Note:** Admin users cannot be banned.

### Movie Management Features

- **View all movies** with poster, title, year, rating, genres
- **Add new movies** - Form with fields for:
  - Title, Description, Poster URL, Backdrop URL
  - Release Year, Rating (0-10), Runtime
  - Genres (comma-separated)
  - YouTube Video ID
- **Delete movies** - Remove movies from the catalog
- **Reset Movies** - Reset movie table to 20 default movies (preserves users)
- **Reset All** - Complete database reset (users + movies + all data)

### Database Reset Options

Three reset buttons available in the admin dashboard:

1. **Reset Users** (🔄 yellow button)
   - Clears: users, reviews, watchlists, watch history
   - Preserves: all movies
   - Restores: 5 default test accounts

2. **Reset Movies** (🔄 yellow button)
   - Clears: movies, reviews, watchlists, watch history
   - Preserves: all users
   - Restores: 20 default movies

3. **Reset All** (🔄 red button)
   - Clears: everything
   - Restores: 5 default users + 20 default movies
   - Note: You will need to log in again after this

### API Endpoints for Admin

**User Management:**
```bash
GET    /api/users              # List all users
PUT    /api/users/:id/ban      # Ban a user
PUT    /api/users/:id/unban    # Unban a user
PUT    /api/users/:id/promote  # Promote to admin
PUT    /api/users/:id/demote   # Demote from admin
```

**Movie Management:**
```bash
POST   /api/movies             # Add new movie
PUT    /api/movies/:id         # Update movie
DELETE /api/movies/:id         # Delete movie
```

**Database Reset:**
```bash
POST   /api/seed/reset         # Reset entire database
POST   /api/seed/reset-users   # Reset only users
POST   /api/seed/reset-movies  # Reset only movies
```

All admin endpoints require:
- Valid JWT token in Authorization header
- User role must be 'admin'
- Returns 401 if not authenticated
- Returns 403 if not admin

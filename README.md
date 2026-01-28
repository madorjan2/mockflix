# MockFlix - Streaming Platform Test Automation App

A dummy streaming platform (Netflix-style) built for showcasing automation testing scenarios. Features a complete REST API with Swagger documentation and a React frontend.

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
│   │   │   ├── auth.js       # Authentication
│   │   │   ├── movies.js     # Movie catalog
│   │   │   ├── reviews.js    # Reviews & ratings
│   │   │   ├── watchlist.js  # Watchlist management
│   │   │   ├── history.js    # Watch history
│   │   │   └── test.js       # Network simulation
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
│   │   ├── components/      # Reusable components
│   │   │   ├── MovieCard.jsx
│   │   │   ├── MovieGrid.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/          # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── Watch.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/        # React context
│   │   │   └── AuthContext.jsx
│   │   ├── utils/          # Utilities
│   │   │   └── api.js
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
│
├── copilot-instructions.md  # Project guidelines
└── README.md
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
```
test@example.com / password123 (Free, User)
admin@example.com / admin123 (Premium, Admin)
premium@example.com / premium123 (Premium, User)
john.doe@example.com / john123 (Free, User)
jane.smith@example.com / jane123 (Premium, User)
```

### Movies
- 20 popular movies seeded (Fight Club, Inception, The Godfather, etc.)
- Complete with posters, descriptions, ratings, genres, YouTube video IDs
- Sample reviews, watchlists, and watch history

## Features

### Backend
- ✅ Full REST API with 35+ endpoints
- ✅ JWT authentication & authorization
- ✅ Role-based access control (user/admin)
- ✅ Admin user management (ban/unban/promote/demote)
- ✅ Admin movie management (add/edit/delete)
- ✅ User banning system
- ✅ Subscription management (upgrade/downgrade)
- ✅ Database reset endpoints (full/users only/movies only)
- ✅ Comprehensive error handling
- ✅ Network simulation endpoints
- ✅ Interactive Swagger documentation
- ✅ Pagination and filtering
- ✅ CRUD operations for all resources
- ✅ Cross-platform SQLite (sql.js)
- ⚠️ Rate limiting disabled (test automation friendly)

### Frontend
- ✅ Browse and search movies
- ✅ Filter by genre, year, rating
- ✅ User reviews and ratings
- ✅ Watchlist management
- ✅ Watch history tracking
- ✅ YouTube video player integration
- ✅ User authentication UI (login/register)
- ✅ Profile page with subscription management
- ✅ Premium tier indicators and badges
- ✅ Admin dashboard with three reset options:
  - Reset Users Only (preserves movies)
  - Reset Movies Only (preserves users)
  - Reset All (full database reset)
- ✅ Admin user management table (ban/unban/promote/demote)
- ✅ Admin movie management table (view/add/delete)
- ✅ Role-based UI (admin-only sections)
- ✅ Test-friendly attributes (data-testid, aria-labels)

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

- **sql.js** used for cross-platform compatibility (no native build tools required on Windows)
- **bcryptjs** instead of bcrypt for same reason
- **JWT tokens** expire after 7 days, include user role
- **Rate limiting** disabled for test automation (code available but commented out)
- **Database** is saved to disk automatically after modifications
- **Swagger** annotations embedded in route files
- **Subscription tiers** are 'free' and 'premium' (mock upgrade/downgrade, no real payments)
- **User roles** are 'user' and 'admin' (role-based access control)
- **Admin features** include user management (ban/unban/promote) and movie CRUD operations

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

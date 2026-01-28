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
   - Frontend: http://localhost:5173 (when implemented)
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
├── frontend/                # React app (to be implemented)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
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

### Movies
- `GET /api/movies` - List movies (pagination, filters)
- `GET /api/movies/:id` - Get movie details
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

### Testing/Simulation
- `GET /api/test/slow?delay=ms` - Simulate slow response
- `GET /api/test/timeout` - Simulate timeout
- `GET /api/test/error/:code` - Return specific status code
- `GET /api/test/rate-limit` - Trigger rate limiting

**Full API documentation available at:** http://localhost:3000/api-docs

## Sample Data

### Test Accounts
```
test@example.com / password123 (Free)
admin@example.com / admin123 (Premium)
premium@example.com / premium123 (Premium)
john.doe@example.com / john123 (Free)
jane.smith@example.com / jane123 (Premium)
```

### Movies
- 20 popular movies seeded (Fight Club, Inception, The Godfather, etc.)
- Complete with posters, descriptions, ratings, genres, YouTube video IDs
- Sample reviews, watchlists, and watch history

## Features

### Backend (Completed)
- ✅ Full REST API with 25+ endpoints
- ✅ JWT authentication & authorization
- ✅ Rate limiting (global + endpoint-specific)
- ✅ Comprehensive error handling
- ✅ Network simulation endpoints
- ✅ Interactive Swagger documentation
- ✅ Pagination and filtering
- ✅ CRUD operations for all resources
- ✅ Cross-platform SQLite (sql.js)

### Frontend (To Be Implemented)
- 🎬 Browse and search movies
- 🔍 Filter by genre, year, rating
- ⭐ User reviews and ratings
- 📝 Watchlist management
- 📊 Watch history tracking
- 🎥 YouTube video player integration
- 👤 User authentication UI
- 🧪 Test-friendly attributes

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

### UI Testing (When Frontend Implemented)
- Form interactions
- Navigation flows
- Dynamic content updates
- Modal dialogs
- Loading states
- Error messages
- Responsive elements
- Iframe handling
- Session persistence

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
- **JWT tokens** expire after 7 days
- **Rate limiting** is IP-based with in-memory storage
- **Database** is saved to disk automatically after modifications
- **Swagger** annotations embedded in route files

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

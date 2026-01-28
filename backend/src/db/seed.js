import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { initDatabase, run, closeDatabase } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Initialize database
    await initDatabase();

    // Seed users
    console.log('👤 Seeding users...');
    const users = [
      {
        email: 'test@example.com',
        username: 'TestUser',
        password: 'password123',
        subscription_tier: 'free',
        role: 'user'
      },
      {
        email: 'admin@example.com',
        username: 'Admin',
        password: 'admin123',
        subscription_tier: 'premium',
        role: 'admin'
      },
      {
        email: 'premium@example.com',
        username: 'PremiumUser',
        password: 'premium123',
        subscription_tier: 'premium',
        role: 'user'
      },
      {
        email: 'john.doe@example.com',
        username: 'JohnDoe',
        password: 'john123',
        subscription_tier: 'free',
        role: 'user'
      },
      {
        email: 'jane.smith@example.com',
        username: 'JaneSmith',
        password: 'jane123',
        subscription_tier: 'premium',
        role: 'user'
      }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      run(
        'INSERT INTO users (email, username, password_hash, subscription_tier, role) VALUES (?, ?, ?, ?, ?)',
        [user.email, user.username, hashedPassword, user.subscription_tier, user.role]
      );
      console.log(`  ✅ Created user: ${user.email} (${user.subscription_tier}, ${user.role})`);
    }

    // Seed movies
    console.log('\n🎬 Seeding movies...');
    const moviesPath = path.join(process.cwd(), 'data', 'movies.json');
    const moviesData = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));

    for (const movie of moviesData) {
      run(
        `INSERT INTO movies (tmdb_id, title, description, poster_url, backdrop_url, 
         release_year, rating, genres, runtime, youtube_video_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          movie.tmdb_id,
          movie.title,
          movie.description,
          movie.poster_url,
          movie.backdrop_url,
          movie.release_year,
          movie.rating,
          JSON.stringify(movie.genres),
          movie.runtime,
          movie.youtube_video_id
        ]
      );
    }
    console.log(`  ✅ Created ${moviesData.length} movies`);

    // Seed some sample reviews
    console.log('\n⭐ Seeding sample reviews...');
    const reviews = [
      { user_id: 1, movie_id: 1, rating: 9, review_text: 'Absolutely mind-blowing! A masterpiece of modern cinema.' },
      { user_id: 2, movie_id: 1, rating: 10, review_text: 'One of the best films ever made. The ending still gives me chills.' },
      { user_id: 3, movie_id: 2, rating: 8, review_text: 'Tom Hanks delivers an incredible performance. Very moving.' },
      { user_id: 1, movie_id: 3, rating: 10, review_text: 'The greatest film of all time. Perfect in every way.' },
      { user_id: 4, movie_id: 3, rating: 9, review_text: 'A timeless classic. Morgan Freeman and Tim Robbins are brilliant.' },
      { user_id: 2, movie_id: 7, rating: 9, review_text: 'Heath Ledger\'s Joker is unforgettable. RIP.' },
      { user_id: 5, movie_id: 7, rating: 10, review_text: 'The best superhero movie ever made. Period.' },
      { user_id: 3, movie_id: 15, rating: 8, review_text: 'Nolan at his best. Complex but incredibly rewarding.' },
      { user_id: 4, movie_id: 10, rating: 9, review_text: 'A brilliant social commentary wrapped in a thriller.' },
      { user_id: 5, movie_id: 11, rating: 10, review_text: 'Studio Ghibli magic at its finest. Beautiful and enchanting.' }
    ];

    for (const review of reviews) {
      run(
        'INSERT INTO reviews (user_id, movie_id, rating, review_text) VALUES (?, ?, ?, ?)',
        [review.user_id, review.movie_id, review.rating, review.review_text]
      );
    }
    console.log(`  ✅ Created ${reviews.length} reviews`);

    // Seed some watchlists
    console.log('\n📝 Seeding watchlists...');
    const watchlistItems = [
      { user_id: 1, movie_id: 5 },
      { user_id: 1, movie_id: 6 },
      { user_id: 1, movie_id: 8 },
      { user_id: 2, movie_id: 4 },
      { user_id: 2, movie_id: 9 },
      { user_id: 3, movie_id: 12 },
      { user_id: 3, movie_id: 13 },
      { user_id: 4, movie_id: 14 },
      { user_id: 5, movie_id: 15 }
    ];

    for (const item of watchlistItems) {
      run(
        'INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)',
        [item.user_id, item.movie_id]
      );
    }
    console.log(`  ✅ Created ${watchlistItems.length} watchlist entries`);

    // Seed some watch history
    console.log('\n📺 Seeding watch history...');
    const historyItems = [
      { user_id: 1, movie_id: 1, progress_seconds: 8340, completed: 1 },
      { user_id: 1, movie_id: 2, progress_seconds: 5200, completed: 0 },
      { user_id: 2, movie_id: 7, progress_seconds: 9120, completed: 1 },
      { user_id: 3, movie_id: 3, progress_seconds: 8520, completed: 1 },
      { user_id: 4, movie_id: 10, progress_seconds: 7920, completed: 1 },
      { user_id: 5, movie_id: 11, progress_seconds: 7500, completed: 1 }
    ];

    for (const item of historyItems) {
      run(
        'INSERT INTO watch_history (user_id, movie_id, progress_seconds, completed) VALUES (?, ?, ?, ?)',
        [item.user_id, item.movie_id, item.progress_seconds, item.completed]
      );
    }
    console.log(`  ✅ Created ${historyItems.length} watch history entries`);

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${moviesData.length} movies created`);
    console.log(`   - ${reviews.length} reviews created`);
    console.log(`   - ${watchlistItems.length} watchlist items created`);
    console.log(`   - ${historyItems.length} watch history items created\n`);

    console.log('🔐 Test Accounts:');
    console.log('   - test@example.com / password123 (Free)');
    console.log('   - admin@example.com / admin123 (Premium)');
    console.log('   - premium@example.com / premium123 (Premium)\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

// Run if called directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  seed();
}

export default seed;

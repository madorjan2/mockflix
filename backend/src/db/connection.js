import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;
let SQL = null;

/**
 * Initialize the database connection
 * @returns {Promise<Object>} Database instance
 */
export async function initDatabase() {
  if (db) {
    return db;
  }

  // Initialize sql.js
  SQL = await initSqlJs();

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.db');
  
  // Check if database file exists
  if (fs.existsSync(dbPath)) {
    // Load existing database
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('📁 Database loaded from:', dbPath);
  } else {
    // Create new database
    db = new SQL.Database();
    console.log('📁 New database created');
    
    // Load and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('✅ Database schema initialized');
    
    // Save the database
    saveDatabase();
  }

  return db;
}

/**
 * Save the database to disk
 */
export function saveDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.db');
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

/**
 * Get the database instance
 * @returns {Object} Database instance
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Execute a query and return results
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Array} Query results
 */
export function query(sql, params = []) {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  
  return results;
}

/**
 * Execute a query and return the first result
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object|null} First result or null
 */
export function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute a query that modifies data (INSERT, UPDATE, DELETE)
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Result info with lastID and changes
 */
export function run(sql, params = []) {
  const db = getDatabase();
  
  // Use prepared statement for parameterized queries
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  
  // Get last insert ID and changes
  const lastIDResult = db.exec("SELECT last_insert_rowid() as id");
  const lastID = lastIDResult[0]?.values[0][0] || null;
  const changes = db.getRowsModified();
  
  // Auto-save after modifications
  saveDatabase();
  
  return { lastID, changes };
}

/**
 * Reload the database from disk (useful after external modifications)
 */
export async function reloadDatabase() {
  if (db) {
    db.close();
    db = null;
  }
  
  await initDatabase();
  console.log('🔄 Database reloaded from disk');
}

/**
 * Close the database connection
 */
export function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
    console.log('📁 Database closed');
  }
}

/**
 * Reset the database (drop all tables and recreate schema)
 */
export async function resetDatabase() {
  if (!db) {
    await initDatabase();
  }

  // Drop all tables
  db.exec(`
    DROP TABLE IF EXISTS watch_history;
    DROP TABLE IF EXISTS watchlist;
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS movies;
    DROP TABLE IF EXISTS users;
  `);

  // Recreate schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  saveDatabase();
  console.log('🔄 Database reset successfully');
}

// Graceful shutdown handlers
let shutdownInProgress = false;

function gracefulShutdown(signal) {
  if (shutdownInProgress) return;
  shutdownInProgress = true;
  
  console.log(`\n${signal} received. Shutting down gracefully...`);
  closeDatabase();
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

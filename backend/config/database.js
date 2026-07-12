require('dotenv').config();
const { Sequelize } = require('sequelize');

/**
 * Resolves database config from environment variables.
 * Supports two naming conventions:
 *   - Standard:  DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_DIALECT
 *   - Railway:   MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT
 *
 * Railway values take priority when present.
 */
const dbName     = process.env.MYSQLDATABASE || process.env.DB_NAME;
const dbUser     = process.env.MYSQLUSER     || process.env.DB_USER;
const dbPassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
const dbHost     = process.env.MYSQLHOST     || process.env.DB_HOST     || 'localhost';
const dbPort     = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10);
const dbDialect  = process.env.DB_DIALECT    || 'mysql';

if (!dbName || !dbUser || dbPassword === undefined) {
  console.error(
    '[Database] Missing required environment variables. ' +
    'Set DB_NAME, DB_USER, DB_PASSWORD (or their MYSQL* equivalents).'
  );
  process.exit(1);
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host:    dbHost,
  port:    dbPort,
  dialect: dbDialect,
  logging: false,

  dialectOptions: {
    // Required for Railway's internal MySQL — keeps connections alive
    connectTimeout: 30000,
  },

  pool: {
    max:     10,
    min:     0,
    acquire: 30000,  // ms to wait before throwing an error if no connection is available
    idle:    10000,  // ms a connection can be idle before being released
  },
});

/**
 * Test the connection and log the result.
 * Called from server.js — errors are handled there.
 */
sequelize.authenticate()
  .then(() => {
    console.log(`[Database] Connected to "${dbName}" on ${dbHost}:${dbPort}`);
  })
  .catch(err => {
    console.error('[Database] Connection failed:', err.message);
  });

module.exports = sequelize;

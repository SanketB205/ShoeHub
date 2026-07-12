require('dotenv').config();
const { Sequelize } = require('sequelize');

/**
 * Connection priority (highest → lowest):
 *
 * 1. MYSQL_PUBLIC_URL  — single connection string (e.g. mysql://user:pass@host:port/db)
 *    Railway provides this as "Public URL" in the MySQL service Connect tab.
 *    Works from both local machines and Railway deployments.
 *
 * 2. MYSQL* variables  — Railway's auto-injected internal vars (MYSQLHOST, etc.)
 *    Only reachable from within Railway's private network.
 *
 * 3. DB_* variables    — standard individual vars for any environment.
 */

let sequelize;

const MYSQL_PUBLIC_URL = process.env.MYSQL_PUBLIC_URL;

if (MYSQL_PUBLIC_URL) {
  // ── Option 1: single connection string ───────────────────────
  sequelize = new Sequelize(MYSQL_PUBLIC_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: { connectTimeout: 30000 },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  });

  console.log('[Database] Using MYSQL_PUBLIC_URL');

} else {
  // ── Option 2 / 3: individual variables ───────────────────────
  const dbName     = process.env.MYSQLDATABASE || process.env.DB_NAME;
  const dbUser     = process.env.MYSQLUSER     || process.env.DB_USER;
  const dbPassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
  const dbHost     = process.env.MYSQLHOST     || process.env.DB_HOST || 'localhost';
  const dbPort     = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10);

  if (!dbName || !dbUser || dbPassword === undefined) {
    console.error(
      '[Database] Missing credentials. Set MYSQL_PUBLIC_URL ' +
      'or DB_NAME / DB_USER / DB_PASSWORD (or MYSQL* equivalents).'
    );
    process.exit(1);
  }

  console.log(`[Database] Connecting to "${dbName}" on ${dbHost}:${dbPort}`);

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host:    dbHost,
    port:    dbPort,
    dialect: 'mysql',
    logging: false,
    dialectOptions: { connectTimeout: 30000 },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  });
}

module.exports = sequelize;

const mysql = require('mysql2/promise');
const env = require('./environment');

const pool = mysql.createPool({
  host: env.MYSQL.host,
  port: env.MYSQL.port,
  user: env.MYSQL.user,
  password: env.MYSQL.password,
  database: env.MYSQL.database,
  waitForConnections: env.MYSQL.waitForConnections,
  connectionLimit: env.MYSQL.connectionLimit,
  queueLimit: env.MYSQL.queueLimit
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Connected Successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

// Keep-alive heartbeat (SELECT 1 every 30s)
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (e) {
    console.error('DB heartbeat failed:', e.message);
  }
}, 30000);

module.exports = pool;

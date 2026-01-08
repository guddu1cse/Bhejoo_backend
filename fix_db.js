const mysql = require('mysql2/promise');
const env = require('./src/config/environment');

const dbConfig = {
    host: env.MYSQL.host,
    port: env.MYSQL.port,
    user: env.MYSQL.user,
    password: env.MYSQL.password,
    database: env.MYSQL.database,
};

async function fixSchema() {
    let connection;
    try {
        console.log('Connecting to database with config:', { ...dbConfig, password: '***' });
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        // Check users table definition
        const [rows] = await connection.execute("SHOW COLUMNS FROM users LIKE 'role'");
        console.log('Current role column definition:', rows[0].Type);

        console.log('Altering users table...');

        // We update to include 'Delivery Man' explicitely.
        // Also including 'delivery_man' just in case to avoid truncation if that was passed.
        await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('user', 'admin', 'Delivery Man', 'delivery_man') DEFAULT 'user'
    `);

        console.log('Schema updated successfully.');

        const [rows2] = await connection.execute("SHOW COLUMNS FROM users LIKE 'role'");
        console.log('New role column definition:', rows2[0].Type);

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixSchema();

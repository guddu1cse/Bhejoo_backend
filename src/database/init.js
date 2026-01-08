const fs = require('fs');
const path = require('path');
const pool = require('../config/mysql');
const logger = require('../utils/logger');

/**
 * Initialize MySQL database schema at runtime using init.sql.
 * - Creates database, tables, and indexes if they don't exist.
 * - Safe to run multiple times (ignores \"already exists\" errors).
 */
async function initializeDatabase() {
    const sqlPath = path.join(__dirname, 'init.sql');

    if (!fs.existsSync(sqlPath)) {
        logger.warn('Database init file not found', { sqlPath });
        return;
    }

    logger.info('Starting database initialization', { sqlPath });

    const rawSql = fs.readFileSync(sqlPath, 'utf8');

    // Remove Windows line endings and split into individual statements
    const statements = rawSql
        .replace(/\r\n/g, '\n')
        .split(';\n')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
            await pool.query(stmt);
            logger.debug('Executed DB init statement', {
                index: i,
                snippet: stmt.substring(0, 80)
            });
        } catch (error) {
            // Ignore \"already exists\" errors for tables/indexes so we can run this on every startup
            const ignorableCodes = new Set([
                'ER_TABLE_EXISTS_ERROR', // table exists
                'ER_DUP_KEYNAME', // index exists
                'ER_DB_CREATE_EXISTS' // db exists
            ]);

            if (ignorableCodes.has(error.code)) {
                logger.debug('Ignored DB init error (already exists)', {
                    index: i,
                    code: error.code,
                    message: error.message
                });
                continue;
            }

            logger.error('DB init statement failed', {
                index: i,
                code: error.code,
                message: error.message,
                snippet: stmt.substring(0, 120)
            });

            // Re-throw to fail fast on real schema issues
            throw error;
        }
    }

    logger.info('Database initialization completed successfully');
}

module.exports = initializeDatabase;


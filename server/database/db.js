import pkg from 'pg';
const { Pool } = pkg;

let pool;

export function initDB() {
    pool = new Pool({
        user: process.env.DB_USER || 'tokobuku_user',
        password: process.env.DB_PASSWORD || 'tokobuku_password',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'tokobuku_db'
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
    });

    return pool;
}

export function getDB() {
    return pool;
}

export async function query(text, params) {
    try {
        console.log('[DB] Executing query:', text.substring(0, 100) + '...');
        const result = await pool.query(text, params);
        console.log('[DB] Query success, rows returned:', result.rows.length);
        return result;
    } catch (error) {
        console.error('[DB] Query error:', error.message);
        console.error('[DB] Query text:', text);
        console.error('[DB] Query params:', params);
        throw error;
    }
}

export async function closeDB() {
    if (pool) {
        await pool.end();
        console.log('Database connection closed');
    }
}

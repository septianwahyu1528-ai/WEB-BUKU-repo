import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres' // connect to default postgres db
});

async function listDatabases() {
    try {
        console.log('🔍 Daftar semua databases:\n');
        
        const result = await pool.query(`
            SELECT datname as database, pg_size_pretty(pg_database_size(pg_database.datname)) as size
            FROM pg_database
            WHERE datname NOT IN ('template0', 'template1')
            ORDER BY datname
        `);
        
        result.rows.forEach(row => {
            console.log(`• ${row.database.padEnd(25)} (${row.size})`);
        });
        
        console.log('\n💡 Pastikan Anda terhubung ke database: tokobuku_db');
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

listDatabases();

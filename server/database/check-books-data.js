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
    database: 'Toko_Buku'
});

async function checkBooksData() {
    try {
        console.log('Checking books table data...\n');
        
        // Get raw data
        const result = await pool.query('SELECT id, title, price FROM books LIMIT 3');
        
        result.rows.forEach(row => {
            console.log(`ID: ${row.id}, Title: ${row.title}`);
            console.log(`  Price (raw): ${row.price}`);
            console.log(`  Price type: ${typeof row.price}`);
            console.log(`  Price value: "${row.price}"`);
            console.log();
        });
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

checkBooksData();

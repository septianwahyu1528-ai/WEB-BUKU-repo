import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function checkBothDatabases() {
    console.log('🔍 Comparing books data in both databases\n');
    
    for (const dbName of ['tokobuku_db', 'Toko_Buku']) {
        const pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: dbName
        });
        
        try {
            console.log(`📍 Database: ${dbName}`);
            
            const result = await pool.query('SELECT id, title, price FROM books LIMIT 1');
            
            if (result.rows.length > 0) {
                const row = result.rows[0];
                console.log(`   Title: ${row.title}`);
                console.log(`   Price (raw): "${row.price}"`);
                console.log(`   Price type: ${typeof row.price}`);
            }
            
            // Check column definition
            const colResult = await pool.query(`
                SELECT data_type FROM information_schema.columns 
                WHERE table_name = 'books' AND column_name = 'price'
            `);
            
            if (colResult.rows.length > 0) {
                console.log(`   Price column type: ${colResult.rows[0].data_type}`);
            }
            
            console.log();
            
        } catch (err) {
            console.error(`   Error: ${err.message}`);
        } finally {
            await pool.end();
        }
    }
    
    process.exit(0);
}

checkBothDatabases();

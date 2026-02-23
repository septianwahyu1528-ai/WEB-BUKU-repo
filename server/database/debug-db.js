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
    database: process.env.DB_NAME || 'tokobuku_db'
});

async function debugDatabase() {
    try {
        console.log('🔍 DEBUG DATABASE\n');
        
        // 1. Check current database
        const dbResult = await pool.query('SELECT current_database() as db');
        console.log(`📍 Current Database: ${dbResult.rows[0].db}\n`);
        
        // 2. Check current schema
        const schemaResult = await pool.query('SELECT current_schema() as schema');
        console.log(`📍 Current Schema: ${schemaResult.rows[0].schema}\n`);
        
        // 3. List all tables
        console.log('📋 Tables in public schema:');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        tablesResult.rows.forEach(row => {
            console.log(`   • ${row.table_name}`);
        });
        
        // 4. Check books table columns
        console.log('\n📚 Columns in books table:');
        const columnsResult = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'books' AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        
        if (columnsResult.rows.length === 0) {
            console.log('❌ BOOKS TABLE NOT FOUND IN PUBLIC SCHEMA!');
        } else {
            columnsResult.rows.forEach((col) => {
                console.log(`   • ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
            });
        }
        
        // 5. Try the exact query that's failing
        console.log('\n🧪 Test query yang error:');
        try {
            const testQuery = await pool.query(
                'SELECT id, title, author, price, image, rating, stock, description, isbn, publisher, publication_date, category FROM books LIMIT 1'
            );
            console.log('✅ Query berhasil!');
            console.log('   Data:', JSON.stringify(testQuery.rows[0], null, 2));
        } catch (err) {
            console.log('❌ Query gagal:', err.message);
        }
        
        // 6. Check for other schemas with books table
        console.log('\n🔎 Searching for books table in all schemas:');
        const allTablesResult = await pool.query(`
            SELECT table_schema, table_name
            FROM information_schema.tables 
            WHERE table_name = 'books'
        `);
        
        if (allTablesResult.rows.length === 0) {
            console.log('❌ Books table tidak ditemukan di database apapun!');
        } else {
            allTablesResult.rows.forEach(row => {
                console.log(`   • ${row.table_schema}.${row.table_name}`);
            });
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

debugDatabase();

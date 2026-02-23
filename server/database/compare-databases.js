import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function checkDatabase(dbName) {
    const pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: dbName
    });

    try {
        console.log(`\n📍 Checking database: ${dbName}`);
        console.log('─'.repeat(50));
        
        const columnsResult = await pool.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'books' AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        
        if (columnsResult.rows.length === 0) {
            console.log('❌ Books table tidak ada atau kosong');
            return;
        }
        
        const columns = columnsResult.rows.map(r => r.column_name);
        console.log('Columns:', columns.join(', '));
        
        const hasISBN = columns.includes('isbn');
        console.log(`Status ISBN: ${hasISBN ? '✅ Ada' : '❌ Tidak ada'}`);
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

async function compareDatabases() {
    console.log('🔍 Perbandingan struktur database\n');
    await checkDatabase('tokobuku_db');
    await checkDatabase('Toko_Buku');
    
    console.log('\n⚠️ Jika pgAdmin Anda terhubung ke "Toko_Buku", itu adalah masalahnya!');
    console.log('💡 Gunakan database "tokobuku_db" yang memiliki semua kolom dengan benar.');
    
    process.exit(0);
}

compareDatabases();

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

async function verifyBooks() {
    try {
        console.log('🔍 Verifikasi struktur tabel books...\n');
        
        // Get columns info
        const columnsResult = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'books'
            ORDER BY ordinal_position
        `);
        
        console.log('✅ Kolom-kolom di tabel books:');
        console.log('─'.repeat(60));
        columnsResult.rows.forEach((col, i) => {
            const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
            console.log(`${i + 1}. ${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${nullable}`);
        });
        
        console.log('\n📊 Test query SELECT...');
        const booksResult = await pool.query(
            'SELECT id, title, author, price, isbn, publisher, publication_date, category FROM books LIMIT 5'
        );
        
        console.log(`✅ Query berhasil! Ditemukan ${booksResult.rows.length} buku\n`);
        
        if (booksResult.rows.length > 0) {
            console.log('Sample data:');
            booksResult.rows.forEach((book, i) => {
                console.log(`\n${i + 1}. ${book.title}`);
                console.log(`   Author: ${book.author}`);
                console.log(`   ISBN: ${book.isbn || '(tidak ada)'}`);
                console.log(`   Publisher: ${book.publisher || '(tidak ada)'}`);
                console.log(`   Category: ${book.category || '(tidak ada)'}`);
                console.log(`   Price: Rp${book.price}`);
            });
        } else {
            console.log('⚠️ Belum ada data buku. Silakan tambahkan buku melalui API /api/books');
        }
        
        console.log('\n✅ Verifikasi selesai! Database siap digunakan.');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('\nStack:', err.stack);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

verifyBooks();

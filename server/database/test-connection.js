import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log('📌 Konfigurasi .env yang terdeteksi:');
console.log(`   DB_USER: ${process.env.DB_USER}`);
console.log(`   DB_HOST: ${process.env.DB_HOST}`);
console.log(`   DB_PORT: ${process.env.DB_PORT}`);
console.log(`   DB_NAME: ${process.env.DB_NAME}\n`);

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'tokobuku_db'
});

async function testConnection() {
    try {
        console.log(`🔄 Mencoba terhubung ke database: ${process.env.DB_NAME}...\n`);
        
        // Test connection
        const connResult = await pool.query('SELECT current_database() as db');
        console.log(`✅ Koneksi berhasil ke: ${connResult.rows[0].db}\n`);
        
        // Test the problematic query
        console.log('🧪 Testing query dengan kolom isbn...');
        const testResult = await pool.query(
            'SELECT id, title, isbn, publisher, category FROM books LIMIT 1'
        );
        
        console.log('✅ Query berhasil!\n');
        
        if (testResult.rows.length > 0) {
            const book = testResult.rows[0];
            console.log('📚 Sample data dari database:');
            console.log(`   ID: ${book.id}`);
            console.log(`   Title: ${book.title}`);
            console.log(`   ISBN: ${book.isbn || '(null)'}`);
            console.log(`   Publisher: ${book.publisher || '(null)'}`);
            console.log(`   Category: ${book.category || '(null)'}`);
        }
        
        console.log('\n✅ Database sudah bekerja dengan baik! Tidak ada error kolom isbn.');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.log('\n💡 Solusi:');
        if (err.message.includes('does not exist')) {
            console.log('   Database tidak ditemukan. Cek DB_NAME di .env');
        } else if (err.message.includes('column')) {
            console.log('   Kolom masih belum ada. Jalankan script fix-toko-buku.js lagi');
        }
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testConnection();

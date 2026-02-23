import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function checkOrdersTable(dbName) {
    const pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: dbName
    });

    try {
        console.log(`\n📍 Database: ${dbName}`);
        console.log('─'.repeat(60));
        
        const columnsResult = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        
        if (columnsResult.rows.length === 0) {
            console.log('❌ Orders table tidak ada');
            return [];
        }
        
        console.log('Columns:');
        columnsResult.rows.forEach(col => {
            console.log(`   • ${col.column_name}`);
        });
        
        return columnsResult.rows.map(r => r.column_name);
        
    } catch (err) {
        console.error('Error:', err.message);
        return [];
    } finally {
        await pool.end();
    }
}

async function compareOrdersTable() {
    console.log('🔍 Perbandingan struktur tabel ORDERS\n');
    
    const expectedColumns = [
        'id', 'customer_id', 'order_date', 'total_amount', 'status', 'payment_method', 'notes', 'updated_at'
    ];
    
    const tokoBukuCols = await checkOrdersTable('tokobuku_db');
    const tokoBookCols = await checkOrdersTable('Toko_Buku');
    
    console.log('\n📋 Kolom yang seharusnya ada:');
    expectedColumns.forEach(col => {
        console.log(`   • ${col}`);
    });
    
    console.log('\n⚠️ Kolom yang hilang di Toko_Buku:');
    const missingInTokoBook = expectedColumns.filter(col => !tokoBookCols.includes(col));
    if (missingInTokoBook.length === 0) {
        console.log('   ✅ Tidak ada yang hilang');
    } else {
        missingInTokoBook.forEach(col => {
            console.log(`   ❌ ${col}`);
        });
    }
    
    process.exit(0);
}

compareOrdersTable();

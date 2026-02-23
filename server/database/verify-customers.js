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

async function verifyCustomersFix() {
    try {
        console.log('🔍 Verifikasi tabel customers di Toko_Buku...\n');
        
        // List all columns
        const columnsResult = await pool.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'customers' AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        
        console.log('✅ Kolom-kolom sekarang:');
        columnsResult.rows.forEach(col => {
            console.log(`   • ${col.column_name}`);
        });
        
        // Test the INSERT query that was failing
        console.log('\n🧪 Testing INSERT query...');
        const result = await pool.query(`
            INSERT INTO customers (name, email, phone, address, city, postal_code, country, total_purchase, total_orders, is_active, updated_at)
            VALUES ('Test Customer', 'test@example.com', '081234567890', 'Jalan Test 123', 'Jakarta', '12345', 'Indonesia', 0, 0, true, NOW())
            RETURNING id
        `);
        
        console.log(`✅ INSERT query berhasil! ID: ${result.rows[0].id}`);
        
        // Delete test data
        await pool.query('DELETE FROM customers WHERE id = $1', [result.rows[0].id]);
        
        console.log('\n✅ Tabel customers sudah siap digunakan!');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

verifyCustomersFix();

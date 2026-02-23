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

async function verifyOrdersFix() {
    try {
        console.log('🔍 Verifikasi tabel orders di Toko_Buku...\n');
        
        // List all columns
        const columnsResult = await pool.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        
        console.log('✅ Kolom-kolom sekarang:');
        columnsResult.rows.forEach(col => {
            console.log(`   • ${col.column_name}`);
        });
        
        // Test the INSERT query that was failing
        console.log('\n🧪 Testing INSERT query...');
        
        // First, get a customer_id or create one
        const customerResult = await pool.query(
            'SELECT id FROM customers LIMIT 1'
        );
        
        let customerId;
        if (customerResult.rows.length > 0) {
            customerId = customerResult.rows[0].id;
        } else {
            // Create a test customer
            const newCustomer = await pool.query(`
                INSERT INTO customers (name, email, phone, address)
                VALUES ('Test', 'test@test.com', '081234567890', 'Test Address')
                RETURNING id
            `);
            customerId = newCustomer.rows[0].id;
        }
        
        // Now test the INSERT
        const result = await pool.query(`
            INSERT INTO orders (customer_id, total_amount, status, payment_method, notes, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id
        `, [customerId, 150000, 'pending', 'credit_card', 'Test order']);
        
        console.log(`✅ INSERT query berhasil! Order ID: ${result.rows[0].id}`);
        
        // Delete test data
        await pool.query('DELETE FROM orders WHERE id = $1', [result.rows[0].id]);
        
        console.log('\n✅ Tabel orders sudah siap digunakan!');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

verifyOrdersFix();

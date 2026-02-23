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

async function insertSamplePurchaseHistory() {
    try {
        console.log('🔄 Menginsersi sample purchase_history dengan order_id yang benar...\n');
        
        // Get all orders
        const ordersResult = await pool.query('SELECT id FROM orders ORDER BY id');
        const orderIds = ordersResult.rows.map(r => r.id);
        
        console.log(`📋 Order IDs: ${orderIds.join(', ')}\n`);
        
        // Sample data structure (customer_id, book_id, quantity, price, total, order_index)
        const sampleData = [
            { customer_id: 1, book_id: 1, quantity: 2, price: 85000, total: 170000, order_index: 0 },
            { customer_id: 1, book_id: 2, quantity: 3, price: 79000, total: 237000, order_index: 1 },
            { customer_id: 2, book_id: 3, quantity: 1, price: 75000, total: 75000, order_index: 2 },
            { customer_id: 2, book_id: 4, quantity: 1, price: 85000, total: 85000, order_index: 2 },
            { customer_id: 3, book_id: 5, quantity: 2, price: 95000, total: 190000, order_index: 3 },
            { customer_id: 3, book_id: 6, quantity: 1, price: 65000, total: 65000, order_index: 3 },
            { customer_id: 3, book_id: 7, quantity: 2, price: 95000, total: 190000, order_index: 4 },
            { customer_id: 3, book_id: 1, quantity: 1, price: 85000, total: 85000, order_index: 4 },
            { customer_id: 4, book_id: 8, quantity: 1, price: 88000, total: 88000, order_index: 5 },
            { customer_id: 4, book_id: 2, quantity: 1, price: 79000, total: 79000, order_index: 5 },
            { customer_id: 5, book_id: 9, quantity: 1, price: 92000, total: 92000, order_index: 6 },
            { customer_id: 5, book_id: 10, quantity: 1, price: 78000, total: 78000, order_index: 6 }
        ];
        
        // Clear existing data
        await pool.query('DELETE FROM purchase_history');
        console.log('✅ Purchase history lama dihapus\n');
        
        // Insert new data
        let insertedCount = 0;
        for (const item of sampleData) {
            const orderId = item.order_index < orderIds.length ? orderIds[item.order_index] : null;
            
            await pool.query(
                'INSERT INTO purchase_history (customer_id, book_id, quantity, price, total, order_id) VALUES ($1, $2, $3, $4, $5, $6)',
                [item.customer_id, item.book_id, item.quantity, item.price, item.total, orderId]
            );
            insertedCount++;
        }
        
        console.log(`✅ ${insertedCount} purchase history records berhasil diinsert\n`);
        
        // Verify
        const verifyResult = await pool.query('SELECT COUNT(*) as count FROM purchase_history');
        console.log(`📊 Total purchase_history sekarang: ${verifyResult.rows[0].count}`);
        
        // Show sample
        const sampleResult = await pool.query(
            'SELECT id, customer_id, book_id, price, total FROM purchase_history LIMIT 5'
        );
        console.log('\n📋 Sample data purchase_history:');
        sampleResult.rows.forEach(row => {
            console.log(`   • Record ${row.id}: Customer ${row.customer_id}, Book ${row.book_id}, Price ${row.price}, Total ${row.total}`);
        });
        
        console.log('\n✅ Sample purchase_history berhasil diinsert!');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

insertSamplePurchaseHistory();

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

async function insertSampleOrderItems() {
    try {
        console.log('🔄 Menginsersi sample order_items dengan order_id yang benar...\n');
        
        // Get all orders
        const ordersResult = await pool.query('SELECT id FROM orders ORDER BY id');
        const orderIds = ordersResult.rows.map(r => r.id);
        
        if (orderIds.length === 0) {
            console.log('❌ Tidak ada orders. Buat orders terlebih dahulu.');
            process.exit(1);
        }
        
        console.log(`📋 Order IDs yang ditemukan: ${orderIds.join(', ')}`);
        console.log(`   Mapping: order[0] akan pakai order_id=${orderIds[0]}, order[1] akan pakai order_id=${orderIds[1]}, dst\n`);
        
        // Sample data structure (index-based)
        const sampleItems = [
            { order_index: 0, book_id: 1, quantity: 2, unit_price: 85000, subtotal: 170000 },
            { order_index: 1, book_id: 2, quantity: 3, unit_price: 79000, subtotal: 237000 },
            { order_index: 2, book_id: 3, quantity: 1, unit_price: 75000, subtotal: 75000 },
            { order_index: 2, book_id: 4, quantity: 1, unit_price: 85000, subtotal: 85000 },
            { order_index: 3, book_id: 5, quantity: 2, unit_price: 95000, subtotal: 190000 },
            { order_index: 3, book_id: 6, quantity: 1, unit_price: 65000, subtotal: 65000 },
            { order_index: 4, book_id: 7, quantity: 2, unit_price: 95000, subtotal: 190000 },
            { order_index: 4, book_id: 1, quantity: 1, unit_price: 85000, subtotal: 85000 },
            { order_index: 5, book_id: 8, quantity: 1, unit_price: 88000, subtotal: 88000 },
            { order_index: 5, book_id: 2, quantity: 1, unit_price: 79000, subtotal: 79000 },
            { order_index: 6, book_id: 9, quantity: 1, unit_price: 92000, subtotal: 92000 },
            { order_index: 6, book_id: 10, quantity: 1, unit_price: 78000, subtotal: 78000 }
        ];
        
        // Clear existing data first
        await pool.query('DELETE FROM order_items');
        console.log('✅ Order items lama dihapus\n');
        
        // Insert new data
        let insertedCount = 0;
        for (const item of sampleItems) {
            if (item.order_index < orderIds.length) {
                const orderId = orderIds[item.order_index];
                await pool.query(
                    'INSERT INTO order_items (order_id, book_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)',
                    [orderId, item.book_id, item.quantity, item.unit_price, item.subtotal]
                );
                insertedCount++;
            }
        }
        
        console.log(`✅ ${insertedCount} order items berhasil diinsert\n`);
        
        // Verify
        const verifyResult = await pool.query('SELECT COUNT(*) as count FROM order_items');
        console.log(`📊 Total order_items sekarang: ${verifyResult.rows[0].count}`);
        
        // Show sample
        const sampleResult = await pool.query(
            'SELECT id, order_id, book_id, quantity, subtotal FROM order_items LIMIT 5'
        );
        console.log('\n📋 Sample data order_items:');
        sampleResult.rows.forEach(row => {
            console.log(`   • Item ${row.id}: Order ${row.order_id}, Book ${row.book_id}, Qty ${row.quantity}, Subtotal ${row.subtotal}`);
        });
        
        console.log('\n✅ Sample order_items berhasil diinsert!');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

insertSampleOrderItems();

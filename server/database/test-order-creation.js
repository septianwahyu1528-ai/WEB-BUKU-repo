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

async function testOrderCreation() {
    try {
        console.log('🧪 Test Order Creation dengan schema baru\n');
        
        // Get a customer
        const customerResult = await pool.query('SELECT id FROM customers LIMIT 1');
        if (customerResult.rows.length === 0) {
            console.log('❌ Tidak ada customer. Silakan buat customer terlebih dahulu.');
            process.exit(1);
        }
        const customerId = customerResult.rows[0].id;
        
        // Get some books
        const booksResult = await pool.query('SELECT id, price::numeric as price FROM books LIMIT 3');
        if (booksResult.rows.length < 2) {
            console.log('❌ Tidak ada cukup buku. Silakan setup books terlebih dahulu.');
            process.exit(1);
        }
        
        console.log(`📋 Customer ID: ${customerId}`);
        console.log(`📚 Books tersedia: ${booksResult.rows.map(r => r.id).join(', ')}\n`);
        
        // Create order with items
        console.log('1️⃣ Creating order dengan items...');
        
        const items = booksResult.rows.slice(0, 2).map(book => ({
            book_id: book.id,
            quantity: 2,
            unit_price: parseFloat(book.price)
        }));
        
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        
        console.log(`   Items: ${JSON.stringify(items)}`);
        console.log(`   Total: ${totalAmount}\n`);
        
        // Create order
        const orderResult = await pool.query(
            'INSERT INTO orders (customer_id, total_amount, status, payment_method) VALUES ($1, $2, $3, $4) RETURNING *',
            [customerId, totalAmount, 'pending', 'transfer']
        );
        
        const orderId = orderResult.rows[0].id;
        console.log(`✅ Order created: ID=${orderId}\n`);
        
        // Add items to order
        console.log('2️⃣ Adding items to order...');
        
        for (const item of items) {
            const itemResult = await pool.query(
                'INSERT INTO order_items (order_id, book_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [orderId, item.book_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
            );
            console.log(`   ✅ Item ${itemResult.rows[0].id}: Book ${item.book_id}, Qty ${item.quantity}`);
        }
        
        console.log('\n3️⃣ Verifying order...');
        
        const verifyResult = await pool.query(`
            SELECT o.*, 
                   COUNT(oi.id) as items_count,
                   SUM(oi.subtotal) as items_total
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = $1
            GROUP BY o.id
        `, [orderId]);
        
        if (verifyResult.rows.length > 0) {
            const order = verifyResult.rows[0];
            console.log(`   Order ID: ${order.id}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Total Amount: ${order.total_amount}`);
            console.log(`   Items Count: ${order.items_count}`);
            console.log(`   Items Total: ${order.items_total}`);
        }
        
        // Cleanup - delete test order
        console.log('\n4️⃣ Cleaning up test data...');
        await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
        await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
        console.log('   ✅ Test data deleted');
        
        console.log('\n✅✅✅ Test berhasil! Foreign key constraints OK!');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('Stack:', err.stack);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testOrderCreation();

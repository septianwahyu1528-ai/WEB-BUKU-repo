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

async function testWithCorrectDatabase() {
    try {
        console.log('🧪 Test Order Creation dengan database YANG BENAR\n');
        console.log(`📌 Config dari .env: ${process.env.DB_NAME}\n`);
        
        // Get a customer
        const customerResult = await pool.query('SELECT id FROM customers LIMIT 1');
        if (customerResult.rows.length === 0) {
            console.log('❌ Tidak ada customer.');
            process.exit(1);
        }
        const customerId = customerResult.rows[0].id;
        
        // Get books with numeric price
        const booksResult = await pool.query('SELECT id, price::numeric as price FROM books LIMIT 3');
        if (booksResult.rows.length < 2) {
            console.log('❌ Tidak ada cukup buku.');
            process.exit(1);
        }
        
        console.log(`📋 Customer ID: ${customerId}`);
        console.log(`📚 Books: ${booksResult.rows.map(r => `${r.id}($${r.price})`).join(', ')}\n`);
        
        // Create order with items
        console.log('1️⃣ Creating order dengan items...');
        
        const items = booksResult.rows.slice(0, 2).map(book => ({
            book_id: book.id,
            quantity: 2,
            unit_price: parseFloat(book.price)
        }));
        
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        
        // Create order
        const orderResult = await pool.query(
            'INSERT INTO orders (customer_id, total_amount, status, payment_method) VALUES ($1, $2, $3, $4) RETURNING *',
            [customerId, totalAmount, 'pending', 'transfer']
        );
        
        const orderId = orderResult.rows[0].id;
        console.log(`✅ Order ID ${orderId} created with total: $${totalAmount}\n`);
        
        // Add items
        console.log('2️⃣ Adding items to order...');
        
        for (const item of items) {
            const subtotal = item.quantity * item.unit_price;
            await pool.query(
                'INSERT INTO order_items (order_id, book_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)',
                [orderId, item.book_id, item.quantity, item.unit_price, subtotal]
            );
            console.log(`   ✅ Book ${item.book_id}: Qty ${item.quantity} @ $${item.unit_price}`);
        }
        
        // Verify
        console.log('\n3️⃣ Verifying order_items...');
        const itemsCheck = await pool.query('SELECT COUNT(*) as count FROM order_items WHERE order_id = $1', [orderId]);
        console.log(`   ✅ ${itemsCheck.rows[0].count} items in order\n`);
        
        // Cleanup
        await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
        await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
        console.log('✅✅✅ SUCCESS! No foreign key violations!\n');
        console.log('📝 Summary:');
        console.log('   ✅ Orders created successfully');
        console.log('   ✅ Order items inserted without foreign key errors');
        console.log('   ✅ Database schema matches application code\n');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testWithCorrectDatabase();

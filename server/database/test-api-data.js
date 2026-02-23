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

async function testDataAPI() {
    try {
        console.log('🔍 Checking Database Data\n');
        
        // Check customers
        console.log('👥 CUSTOMERS:');
        const customersResult = await pool.query('SELECT * FROM customers');
        console.log(`   Total: ${customersResult.rows.length}`);
        if (customersResult.rows.length > 0) {
            customersResult.rows.slice(0, 3).forEach(c => {
                console.log(`   • ${c.name} (${c.email})`);
            });
            if (customersResult.rows.length > 3) {
                console.log(`   ... and ${customersResult.rows.length - 3} more`);
            }
        }
        
        // Check orders
        console.log('\n📋 ORDERS:');
        const ordersResult = await pool.query('SELECT * FROM orders');
        console.log(`   Total: ${ordersResult.rows.length}`);
        if (ordersResult.rows.length > 0) {
            ordersResult.rows.slice(0, 3).forEach(o => {
                console.log(`   • Order #${o.id} - Customer ${o.customer_id} - Rp${o.total_amount}`);
            });
            if (ordersResult.rows.length > 3) {
                console.log(`   ... and ${ordersResult.rows.length - 3} more`);
            }
        }
        
        // Check users for login
        console.log('\n👤 USERS (for login):');
        const usersResult = await pool.query('SELECT id, email, name, role FROM users');
        console.log(`   Total: ${usersResult.rows.length}`);
        if (usersResult.rows.length > 0) {
            usersResult.rows.forEach(u => {
                console.log(`   • ${u.email} (${u.name}) - ${u.role}`);
            });
        } else {
            console.log('   ❌ No users found! Need to create user first.');
        }
        
        // Check books
        console.log('\n📚 BOOKS:');
        const booksResult = await pool.query('SELECT id, title, price, stock FROM books LIMIT 5');
        console.log(`   Total: ${booksResult.rows.length}`);
        booksResult.rows.forEach(b => {
            console.log(`   • ${b.title} - Rp${b.price} (Stock: ${b.stock})`);
        });
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testDataAPI();

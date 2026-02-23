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

async function testDirectly() {
    try {
        console.log('🔍 Direct Database Query (Simulating API)\n');
        
        // Simulate GET /api/customers
        console.log('1️⃣ GET /api/customers:');
        const customersResult = await pool.query('SELECT * FROM customers ORDER BY id');
        console.log(`   ✅ Status: 200 OK`);
        console.log(`   Data: ${customersResult.rows.length} customers\n`);
        if (customersResult.rows.length > 0) {
            customersResult.rows.forEach(c => {
                console.log(`   • ${c.name} (${c.email})`);
            });
        }
        
        // Simulate GET /api/orders  
        console.log('\n2️⃣ GET /api/orders:');
        const ordersResult = await pool.query('SELECT * FROM orders ORDER BY id DESC');
        console.log(`   ✅ Status: 200 OK`);
        console.log(`   Data: ${ordersResult.rows.length} orders\n`);
        if (ordersResult.rows.length > 0) {
            ordersResult.rows.slice(0, 3).forEach(o => {
                console.log(`   • Order #${o.id} - Customer ${o.customer_id} - Rp${o.total_amount}`);
            });
        }
        
        // Check if there's an issue with authentication
        console.log('\n3️⃣ Testing Authentication:');
        const userResult = await pool.query('SELECT email, password FROM users LIMIT 1');
        if (userResult.rows.length > 0) {
            const testUser = userResult.rows[0];
            console.log(`   Sample login: ${testUser.email} / ${testUser.password}`);
            console.log('   ✅ User exists in database');
        }
        
        // Summary
        console.log('\n📋 Summary:');
        console.log(`   ✅ Database connected and working`);
        console.log(`   ✅ ${customersResult.rows.length} customers in database`);
        console.log(`   ✅ ${ordersResult.rows.length} orders in database`);
        console.log('\n💡 If data not showing in browser:');
        console.log('   1. Make sure server is running on localhost:5000');
        console.log('   2. Open Developer Console (F12) and check for CORS errors');
        console.log('   3. Make sure you are logged in first');
        console.log('   4. Check Network tab to see API responses');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testDirectly();

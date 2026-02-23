#!/usr/bin/env node
import pkg from 'pg';
const { Pool } = pkg;

async function verifyDatabase() {
    console.log('\n📊 DATABASE VERIFICATION REPORT\n');
    console.log('='.repeat(60));

    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'tokobuku_db'
    });

    try {
        const client = await pool.connect();

        // 1. Count data
        console.log('\n📈 DATA SUMMARY:');
        console.log('-'.repeat(60));
        
        const counts = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as users,
                (SELECT COUNT(*) FROM books) as books,
                (SELECT COUNT(*) FROM customers) as customers,
                (SELECT COUNT(*) FROM orders) as orders,
                (SELECT COUNT(*) FROM order_items) as order_items,
                (SELECT COUNT(*) FROM purchase_history) as purchase_history
        `);
        
        const data = counts.rows[0];
        console.log(`  👥 Users: ${data.users}`);
        console.log(`  📚 Books: ${data.books}`);
        console.log(`  🛍️  Customers: ${data.customers}`);
        console.log(`  📦 Orders: ${data.orders}`);
        console.log(`  🧾 Order Items: ${data.order_items}`);
        console.log(`  📋 Purchase History: ${data.purchase_history}`);

        // 2. Sample users
        console.log('\n👥 USERS:');
        console.log('-'.repeat(60));
        const users = await client.query('SELECT id, name, email, role FROM users ORDER BY id');
        users.rows.forEach(u => {
            console.log(`  ${u.id}. ${u.name} (${u.email}) - ${u.role}`);
        });

        // 3. Sample books
        console.log('\n📚 BOOKS:');
        console.log('-'.repeat(60));
        const books = await client.query('SELECT id, title, author, price, stock FROM books ORDER BY id LIMIT 5');
        books.rows.forEach(b => {
            console.log(`  ${b.id}. ${b.title} by ${b.author} - Rp ${b.price.toLocaleString('id-ID')} (Stock: ${b.stock})`);
        });
        if (data.books > 5) {
            console.log(`  ... and ${data.books - 5} more books`);
        }

        // 4. Sample customers
        console.log('\n🛍️  CUSTOMERS:');
        console.log('-'.repeat(60));
        const customers = await client.query('SELECT id, name, email, city, total_purchase FROM customers ORDER BY id');
        customers.rows.forEach(c => {
            console.log(`  ${c.id}. ${c.name} (${c.city}) - Total: Rp ${c.total_purchase.toLocaleString('id-ID')}`);
        });

        // 5. Orders with total
        console.log('\n📦 ORDERS:');
        console.log('-'.repeat(60));
        const orders = await client.query(`
            SELECT o.id, c.name, o.total_amount, o.status, COUNT(oi.id) as items
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id, c.name, o.total_amount, o.status
            ORDER BY o.id
        `);
        orders.rows.forEach(o => {
            console.log(`  ${o.id}. ${o.name} - Rp ${o.total_amount.toLocaleString('id-ID')} (${o.items} items) - ${o.status}`);
        });

        // 6. Database stats
        console.log('\n🔍 TABLE STATISTICS:');
        console.log('-'.repeat(60));
        const tables = await client.query(`
            SELECT table_name, 
                   (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        tables.rows.forEach(t => {
            console.log(`  • ${t.table_name} (${t.column_count} columns)`);
        });

        // 7. Constraints check
        console.log('\n🔒 CONSTRAINTS:');
        console.log('-'.repeat(60));
        const constraints = await client.query(`
            SELECT constraint_name, table_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_schema = 'public'
            ORDER BY table_name, constraint_name
        `);
        
        let lastTable = '';
        constraints.rows.forEach(c => {
            if (c.table_name !== lastTable) {
                console.log(`  ${c.table_name}:`);
                lastTable = c.table_name;
            }
            console.log(`    - ${c.constraint_name} (${c.constraint_type})`);
        });

        await client.release();
        console.log('\n' + '='.repeat(60));
        console.log('✅ Database verification complete!\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

verifyDatabase();

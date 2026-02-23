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

async function diagnoseForeignKeyIssue() {
    try {
        console.log('🔍 Diagnosa Foreign Key Issue\n');
        
        // Check orders table
        console.log('📋 Data di tabel ORDERS:');
        const ordersResult = await pool.query('SELECT id, customer_id, total_amount FROM orders');
        console.log(`   Total records: ${ordersResult.rows.length}`);
        if (ordersResult.rows.length > 0) {
            ordersResult.rows.forEach(row => {
                console.log(`   • Order ID: ${row.id}, Customer: ${row.customer_id}, Amount: ${row.total_amount}`);
            });
        } else {
            console.log('   (Tidak ada data)');
        }
        
        // Check order_items table
        console.log('\n📋 Data di tabel ORDER_ITEMS:');
        try {
            const itemsResult = await pool.query('SELECT id, order_id, book_id, quantity FROM order_items');
            console.log(`   Total records: ${itemsResult.rows.length}`);
            if (itemsResult.rows.length > 0) {
                itemsResult.rows.forEach(row => {
                    console.log(`   • Item ID: ${row.id}, Order: ${row.order_id}, Book: ${row.book_id}, Qty: ${row.quantity}`);
                });
            } else {
                console.log('   (Tidak ada data)');
            }
        } catch (err) {
            console.log('   Error:', err.message);
        }
        
        // Check for orphaned order_items
        console.log('\n⚠️ Mencari orphaned order_items (order_id tidak ada di orders)...');
        try {
            const orphanedResult = await pool.query(`
                SELECT oi.id, oi.order_id, oi.book_id
                FROM order_items oi
                LEFT JOIN orders o ON oi.order_id = o.id
                WHERE o.id IS NULL
            `);
            
            if (orphanedResult.rows.length > 0) {
                console.log(`❌ Ditemukan ${orphanedResult.rows.length} orphaned records:`);
                orphanedResult.rows.forEach(row => {
                    console.log(`   • Order Item ID: ${row.id}, Order ID: ${row.order_id}`);
                });
            } else {
                console.log('✅ Tidak ada orphaned records');
            }
        } catch (err) {
            console.log('Error:', err.message);
        }
        
        // Check constraint details
        console.log('\n🔐 Foreign Key Constraint Details:');
        const constraintResult = await pool.query(`
            SELECT 
                constraint_name,
                table_name,
                column_name,
                foreign_table_name,
                foreign_column_name
            FROM information_schema.key_column_usage
            WHERE table_name IN ('order_items', 'orders')
            AND foreign_column_name IS NOT NULL
        `);
        
        constraintResult.rows.forEach(row => {
            console.log(`   • ${row.constraint_name}:`);
            console.log(`     ${row.table_name}.${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`);
        });
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

diagnoseForeignKeyIssue();

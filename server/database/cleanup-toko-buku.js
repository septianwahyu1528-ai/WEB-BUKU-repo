import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function cleanupTokoBook() {
    const pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: 'Toko_Buku'
    });

    try {
        console.log('🔍 Diagnosa dan Cleanup Database Toko_Buku\n');
        
        // Check orders
        console.log('1️⃣ Checking orders table...');
        const ordersResult = await pool.query('SELECT id FROM orders ORDER BY id');
        console.log(`   Total orders: ${ordersResult.rows.length}`);
        if (ordersResult.rows.length > 0) {
            console.log(`   Order IDs: ${ordersResult.rows.map(r => r.id).join(', ')}`);
        }
        
        // Check for orphaned order_items
        console.log('\n2️⃣ Checking for orphaned order_items...');
        const orphanedResult = await pool.query(`
            SELECT DISTINCT oi.order_id
            FROM order_items oi
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE o.id IS NULL
        `);
        
        if (orphanedResult.rows.length > 0) {
            console.log(`   ❌ Found orphaned order_items with order_ids: ${orphanedResult.rows.map(r => r.order_id).join(', ')}`);
            
            console.log('\n3️⃣ Deleting orphaned order_items...');
            for (const row of orphanedResult.rows) {
                await pool.query('DELETE FROM order_items WHERE order_id = $1', [row.order_id]);
                console.log(`   ✅ Deleted order_items with order_id=${row.order_id}`);
            }
        } else {
            console.log('   ✅ No orphaned order_items found');
        }
        
        // Check purchase_history
        console.log('\n4️⃣ Checking for orphaned purchase_history records...');
        const orphanedHistResult = await pool.query(`
            SELECT DISTINCT ph.order_id
            FROM purchase_history ph
            WHERE ph.order_id IS NOT NULL
            AND ph.order_id NOT IN (SELECT id FROM orders)
        `);
        
        if (orphanedHistResult.rows.length > 0) {
            console.log(`   ❌ Found orphaned records with order_ids: ${orphanedHistResult.rows.map(r => r.order_id).join(', ')}`);
            
            console.log('\n5️⃣ Cleaning up purchase_history...');
            for (const row of orphanedHistResult.rows) {
                await pool.query('UPDATE purchase_history SET order_id = NULL WHERE order_id = $1', [row.order_id]);
                console.log(`   ✅ Cleared order_id=${row.order_id} from purchase_history`);
            }
        } else {
            console.log('   ✅ No orphaned purchase_history records');
        }
        
        // Verify
        console.log('\n6️⃣ Final verification...');
        const finalOrphaned = await pool.query(`
            SELECT COUNT(*) as count
            FROM order_items oi
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE o.id IS NULL
        `);
        
        if (finalOrphaned.rows[0].count === 0) {
            console.log('   ✅ No more orphaned records!');
            console.log('\n✅✅✅ Database cleanup complete!');
        } else {
            console.log(`   ❌ Still ${finalOrphaned.rows[0].count} orphaned records`);
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

cleanupTokoBook();

import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool, Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function syncDatabases() {
    const config = {
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
    };
    
    try {
        console.log('🔄 Syncing Toko_Buku with tokobuku_db\n');
        
        const client = new Client({ ...config, database: 'postgres' });
        await client.connect();
        
        // Drop old database
        console.log('1️⃣ Dropping old Toko_Buku...');
        await client.query(`DROP DATABASE IF EXISTS "Toko_Buku" WITH (FORCE);`);
        console.log('✅ Dropped\n');
        
        // Create from template
        console.log('2️⃣ Creating Toko_Buku from tokobuku_db template...');
        await client.query(`CREATE DATABASE "Toko_Buku" TEMPLATE tokobuku_db;`);
        console.log('✅ Created\n');
        
        await client.end();
        
        // Verify
        console.log('3️⃣ Verifying databases...');
        
        for (const dbName of ['tokobuku_db', 'Toko_Buku']) {
            const pool = new Pool({ ...config, database: dbName });
            
            const ordersCount = await pool.query('SELECT COUNT(*) as count FROM orders');
            const itemsCount = await pool.query('SELECT COUNT(*) as count FROM order_items');
            const booksCount = await pool.query('SELECT COUNT(*) as count FROM books');
            
            console.log(`\n${dbName}:`);
            console.log(`   Books: ${booksCount.rows[0].count}`);
            console.log(`   Orders: ${ordersCount.rows[0].count}`);  
            console.log(`   Order Items: ${itemsCount.rows[0].count}`);
            
            // Check for orphaned
            const orphanedCheck = await pool.query(`
                SELECT COUNT(*) as count
                FROM order_items oi
                LEFT JOIN orders o ON oi.order_id = o.id
                WHERE o.id IS NULL
            `);
            console.log(`   Orphaned Items: ${orphanedCheck.rows[0].count}`);
            
            await pool.end();
        }
        
        console.log('\n✅✅✅ Databases synced! Both are now identical.');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

syncDatabases();
